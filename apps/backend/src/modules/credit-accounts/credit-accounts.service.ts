import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, MoreThan } from 'typeorm';
import { CreditAccount } from './entities/credit-account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CreditAccountsService {
  constructor(
    @InjectRepository(CreditAccount) private readonly repo: Repository<CreditAccount>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async addDebt(storeId: string, customerId: string, amount: number, manager?: any) {
    const accountRepo = manager ? manager.getRepository(CreditAccount) : this.repo;
    let account = await accountRepo.findOne({ where: { storeId, customerId } });

    if (!account) {
      account = accountRepo.create({ storeId, customerId, balance: 0 });
    }

    account.balance = Number(account.balance) + Number(amount);
    return accountRepo.save(account);
  }

  async pay(storeId: string, customerId: string, amount: number, userId?: string, ip?: string) {
    if (amount <= 0) throw new BadRequestException('El monto del pago debe ser mayor a 0.');

    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, { where: { id: customerId, storeId } });
      if (!customer) throw new NotFoundException('Cliente no encontrado.');

      const account = await manager
        .getRepository(CreditAccount)
        .createQueryBuilder('ca')
        .setLock('pessimistic_write')
        .where('ca.storeId = :storeId', { storeId })
        .andWhere('ca.customerId = :customerId', { customerId })
        .getOne();

      if (!account) throw new NotFoundException('El cliente no tiene saldo pendiente.');
      if (Number(account.balance) <= 0) throw new BadRequestException('El saldo pendiente ya es 0.');

      const previousBalance = Number(account.balance);
      account.balance = Math.max(0, previousBalance - Number(amount));
      account.lastPaymentAt = new Date();

      const saved = await manager.save(CreditAccount, account);
      await this.auditLogsService.recordAudit(
        storeId,
        userId,
        'credit_payment',
        'CreditAccount',
        saved.id,
        { balance: previousBalance },
        { balance: Number(saved.balance), paidAmount: Number(amount), customerId },
        ip,
      );
      return saved;
    });
  }

  async listPending(storeId: string) {
    const pending = await this.repo.find({
      where: { storeId, balance: MoreThan(0) },
      order: { balance: 'DESC' },
    });
    if (pending.length === 0) return [];

    const customerIds = pending.map((a) => a.customerId);
    const customers = await this.customerRepo.find({
      where: { storeId, id: In(customerIds) },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return pending.map((a) => {
      const c = customerMap.get(a.customerId);
      return {
        id: a.id,
        customerId: a.customerId,
        balance: Number(a.balance),
        lastPaymentAt: a.lastPaymentAt,
        firstName: c?.firstName || '',
        lastName: c?.lastName || '',
        phone: c?.phone || '',
        document: c?.document || '',
      };
    });
  }
}
