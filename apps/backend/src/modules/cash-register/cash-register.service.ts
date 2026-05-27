import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CashRegister, CashRegisterStatus } from './entities/cash-register.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectRepository(CashRegister) private cashRepo: Repository<CashRegister>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getActive(storeId: string, cashierId: string) {
    return this.cashRepo.findOne({
      where: { storeId, cashierId, status: CashRegisterStatus.OPEN },
      relations: ['cashier'],
    });
  }

  async getActiveByStore(storeId: string) {
    return this.cashRepo.findOne({
      where: { storeId, status: CashRegisterStatus.OPEN },
      relations: ['cashier'],
      order: { createdAt: 'DESC' },
    });
  }

  async open(storeId: string, cashierId: string, openingAmount: number, notes?: string) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager
        .getRepository(CashRegister)
        .createQueryBuilder('cr')
        .setLock('pessimistic_write')
        .where('cr.storeId = :storeId', { storeId })
        .andWhere('cr.cashierId = :cashierId', { cashierId })
        .andWhere('cr.status = :status', { status: CashRegisterStatus.OPEN })
        .getOne();

      if (existing) throw new BadRequestException('Ya tienes una caja abierta.');

      const cashRegister = manager.create(CashRegister, {
        storeId, cashierId, openingAmount, notes,
        status: CashRegisterStatus.OPEN,
      });
      const saved = await manager.save(CashRegister, cashRegister);
      await this.auditLogsService.recordAudit(
        storeId,
        cashierId,
        'cash_register_opened',
        'CashRegister',
        saved.id,
        null,
        { openingAmount: Number(saved.openingAmount), status: saved.status },
      );
      return saved;
    });
  }

  async close(storeId: string, cashierId: string, closingAmount: number, notes?: string) {
    return this.dataSource.transaction(async (manager) => {
      let cashRegister = await manager
        .getRepository(CashRegister)
        .createQueryBuilder('cr')
        .setLock('pessimistic_write')
        .where('cr.storeId = :storeId', { storeId })
        .andWhere('cr.cashierId = :cashierId', { cashierId })
        .andWhere('cr.status = :status', { status: CashRegisterStatus.OPEN })
        .getOne();

      if (!cashRegister) {
        cashRegister = await manager
          .getRepository(CashRegister)
          .createQueryBuilder('cr')
          .setLock('pessimistic_write')
          .where('cr.storeId = :storeId', { storeId })
          .andWhere('cr.status = :status', { status: CashRegisterStatus.OPEN })
          .orderBy('cr.createdAt', 'DESC')
          .getOne();
      }
      if (!cashRegister) throw new NotFoundException('No tienes una caja abierta.');

      const result = await manager.query(`
        SELECT COALESCE(SUM(total), 0) as cash_sales
        FROM sales
        WHERE "storeId" = $1
        AND "cashierId" = $2
        AND "paymentMethod" = 'cash'
        AND status = 'completed'
        AND "createdAt" >= $3
      `, [storeId, cashRegister.cashierId, cashRegister.createdAt]);

      const cashSales = Number(result[0]?.cash_sales || 0);
      const expectedAmount = Number(cashRegister.openingAmount) + cashSales;
      const difference = closingAmount - expectedAmount;

      cashRegister.status = CashRegisterStatus.CLOSED;
      cashRegister.closingAmount = closingAmount;
      cashRegister.expectedAmount = expectedAmount;
      cashRegister.difference = difference;
      cashRegister.notes = notes;
      cashRegister.closedAt = new Date();

      const saved = await manager.save(CashRegister, cashRegister);
      await this.auditLogsService.recordAudit(
        storeId,
        cashierId,
        'cash_register_closed',
        'CashRegister',
        saved.id,
        {
          status: CashRegisterStatus.OPEN,
          openingAmount: Number(saved.openingAmount),
        },
        {
          status: CashRegisterStatus.CLOSED,
          closingAmount: Number(saved.closingAmount || 0),
          expectedAmount: Number(saved.expectedAmount || 0),
          difference: Number(saved.difference || 0),
        },
      );
      return saved;
    });
  }

  async getHistory(storeId: string, page = 1, limit = 20) {
    const [items, total] = await this.cashRepo.findAndCount({
      where: { storeId },
      relations: ['cashier'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, pagination: { total, page, limit } };
  }
}
