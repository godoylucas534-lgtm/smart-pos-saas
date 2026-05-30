import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleItem, SaleStatus, PaymentMethod } from './entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { CashRegister, CashRegisterStatus } from '../cash-register/entities/cash-register.entity';
import { CreditAccountsService } from '../credit-accounts/credit-accounts.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { StockMovementType } from '../stock-movements/entities/stock-movement.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CustomersService } from '../customers/customers.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly creditAccountsService: CreditAccountsService,
    private readonly stockMovementsService: StockMovementsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly customersService: CustomersService,
  ) {}

  async create(storeId: string, cashierId: string, dto: CreateSaleDto): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [storeId]);
      const activeCashRegister = await manager
        .getRepository(CashRegister)
        .createQueryBuilder('cr')
        .setLock('pessimistic_read')
        .where('cr.storeId = :storeId', { storeId })
        .andWhere('cr.cashierId = :cashierId', { cashierId })
        .andWhere('cr.status = :status', { status: CashRegisterStatus.OPEN })
        .getOne();
      if (!activeCashRegister) {
        throw new BadRequestException('Debe abrir caja antes de cobrar.');
      }

      let subtotal = 0;
      let taxAmount = 0;
      const saleItems: Partial<SaleItem>[] = [];

      for (const itemDto of dto.items) {
        const product = await manager
          .getRepository(Product)
          .createQueryBuilder('p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id: itemDto.productId })
          .andWhere('p.storeId = :storeId', { storeId })
          .getOne();
        if (!product) throw new NotFoundException('Producto no encontrado');

        if (product.trackStock) {
          const previousStock = Number(product.stock);
          const newStock = previousStock - Number(itemDto.quantity);
          if (newStock < 0) throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
          await manager.update(Product, product.id, { stock: newStock });
          await this.stockMovementsService.createMovement(
            {
              productId: product.id,
              storeId,
              type: StockMovementType.SALE,
              quantity: -Number(itemDto.quantity),
              previousStock,
              newStock,
              reference: dto.reference || 'sale',
            },
            manager,
          );
        }

        const unitPrice = itemDto.unitPrice ?? product.salePrice;
        const lineTotal = Math.round(unitPrice * itemDto.quantity);
        const lineTax = Math.round(lineTotal * (product.taxRate / 100));
        subtotal += lineTotal;
        taxAmount += lineTax;

        saleItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: itemDto.quantity,
          unitPrice,
          taxRate: product.taxRate,
          discountAmount: 0,
          lineTotal,
        });
      }

      const total = subtotal + taxAmount - Number(dto.discountAmount || 0);
      const paymentMethod = dto.paymentMethod ?? PaymentMethod.CASH;
      if (paymentMethod === PaymentMethod.CREDIT && !dto.customerId) {
        throw new BadRequestException('Las ventas fiadas requieren cliente.');
      }
      const amountPaid = paymentMethod === PaymentMethod.CREDIT ? 0 : (dto.amountPaid ?? total);
      const changeAmount = paymentMethod === PaymentMethod.CASH ? Math.max(0, amountPaid - total) : 0;

      const [counterResult] = await manager.query(
        `
          WITH last_receipt AS (
            SELECT COALESCE(
              MAX(
                CASE
                  WHEN "receiptNumber" ~ '^[0-9]+$' THEN "receiptNumber"::bigint
                  ELSE NULL
                END
              ),
              0
            ) AS max_receipt
            FROM sales
            WHERE "storeId" = $1
          )
          INSERT INTO "store_counters" ("storeId", "counterName", "currentValue")
          VALUES ($1::uuid, 'sale_receipt', (SELECT max_receipt + 1 FROM last_receipt))
          ON CONFLICT ("storeId", "counterName")
          DO UPDATE SET "currentValue" = "store_counters"."currentValue" + 1,
                        "updatedAt" = NOW()
          RETURNING "currentValue"
        `,
        [storeId],
      );
      const receiptNumber = String(counterResult.currentValue).padStart(8, '0');

      const sale = manager.create(Sale, {
        storeId,
        cashierId,
        customerId: dto.customerId,
        receiptNumber,
        status: SaleStatus.COMPLETED,
        paymentMethod,
        subtotal,
        taxAmount,
        discountAmount: Number(dto.discountAmount || 0),
        total,
        amountPaid,
        changeAmount,
        notes: dto.notes,
        items: saleItems as SaleItem[],
      });

      const savedSale = await manager.save(Sale, sale);
      await this.auditLogsService.recordAudit(
        storeId,
        cashierId,
        'sale_created',
        'Sale',
        savedSale.id,
        null,
        {
          total,
          paymentMethod,
          customerId: dto.customerId,
          itemCount: dto.items.length,
        },
      );

      if (paymentMethod === PaymentMethod.CREDIT && dto.customerId) {
        await this.creditAccountsService.addDebt(storeId, dto.customerId, total, manager);
      }
      if (dto.customerId) {
        await this.customersService.updateStats(storeId, dto.customerId, total, { manager });
      }

      return (await manager.findOne(Sale, { where: { id: savedSale.id }, relations: ['items', 'customer', 'cashier'] })) || savedSale;
    });
  }

  async cancel(storeId: string, saleId: string, userId?: string, ip?: string): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(Sale, { where: { id: saleId, storeId }, relations: ['items'] });
      if (!sale) throw new NotFoundException('Venta no encontrada.');
      if (sale.status !== SaleStatus.COMPLETED) throw new BadRequestException('Solo se pueden anular ventas completadas.');

      for (const item of sale.items) {
        const product = await manager.findOne(Product, { where: { id: item.productId, storeId } });
        if (product && product.trackStock) {
          const previousStock = Number(product.stock);
          const newStock = previousStock + Number(item.quantity);
          await manager.update(Product, product.id, { stock: newStock });
          await this.stockMovementsService.createMovement({
            productId: product.id, storeId, type: StockMovementType.CANCELLATION,
            quantity: Number(item.quantity), previousStock, newStock, reference: `cancel:${sale.receiptNumber}`,
          }, manager);
        }
      }

      sale.status = SaleStatus.CANCELLED;
      const saved = await manager.save(Sale, sale);
      await this.auditLogsService.recordAudit(storeId, userId, 'sale_cancellation', 'Sale', sale.id, null, { status: SaleStatus.CANCELLED }, ip);
      return saved;
    });
  }

  async findAll(storeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const qb = this.saleRepo.createQueryBuilder('s').leftJoinAndSelect('s.customer', 'customer').leftJoinAndSelect('s.cashier', 'cashier').where('s.storeId = :storeId', { storeId });
    if (query.dateFrom && query.dateTo) qb.andWhere('s.createdAt BETWEEN :dateFrom AND :dateTo', { dateFrom: query.dateFrom, dateTo: query.dateTo });
    const [items, total] = await qb.orderBy('s.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, pagination: { total, page, limit } };
  }

  async findOne(storeId: string, id: string) {
    const sale = await this.saleRepo.findOne({ where: { id, storeId }, relations: ['items', 'customer', 'cashier'] });
    if (!sale) throw new NotFoundException('Venta no encontrada.');
    return sale;
  }

  async getDailySummary(storeId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999);

    const sales = await this.saleRepo.createQueryBuilder('s')
      .select(['COUNT(*) FILTER (WHERE s.status = \'completed\') AS "totalSales"', 'COALESCE(SUM(s.total) FILTER (WHERE s.status = \'completed\'), 0) AS "totalRevenue"', 'COALESCE(SUM(s.taxAmount) FILTER (WHERE s.status = \'completed\'), 0) AS "totalTax"'])
      .where('s.storeId = :storeId AND s.createdAt BETWEEN :start AND :end', { storeId, start, end }).getRawOne();

    return { date: targetDate.toISOString().split('T')[0], totalSales: parseInt(sales.totalSales || '0', 10), totalRevenue: parseInt(sales.totalRevenue || '0', 10), totalTax: parseInt(sales.totalTax || '0', 10) };
  }

  async getHourlyStats(storeId: string, date?: string) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);

    return this.saleRepo.createQueryBuilder('s')
      .select(['EXTRACT(HOUR FROM s.createdAt) as hour', 'COALESCE(SUM(s.total), 0) as total'])
      .where('s.storeId = :storeId', { storeId })
      .andWhere('s.status = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('hour').orderBy('hour', 'ASC').getRawMany();
  }

  async getTopProducts(storeId: string, date?: string) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);

    return this.saleItemRepo.createQueryBuilder('si')
      .innerJoin('si.sale', 's')
      .select(['si.productId as "productId"', 'si.productName as "productName"', 'SUM(si.quantity) as quantity'])
      .where('s.storeId = :storeId', { storeId })
      .andWhere('s.status = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('si.productId, si.productName')
      .orderBy('quantity', 'DESC').limit(5).getRawMany();
  }
}
