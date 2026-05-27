import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async recordAudit(
    storeId: string | undefined,
    userId: string | undefined,
    action: string,
    entity?: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
    ip?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepo.create({
      storeId,
      userId,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      ip,
    });
    return this.auditLogRepo.save(auditLog);
  }

  async findByStore(storeId: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
