import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreAccessPolicy } from './entities/store-access-policy.entity';
import { UpdateAccessPolicyDto } from './dto/update-access-policy.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class StoreAccessPolicyService {
  constructor(
    @InjectRepository(StoreAccessPolicy)
    private readonly policyRepo: Repository<StoreAccessPolicy>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findByStoreId(storeId: string): Promise<StoreAccessPolicy> {
    const policy = await this.policyRepo.findOne({ where: { storeId } });
    if (!policy) {
      return this.policyRepo.create({ storeId });
    }
    return policy;
  }

  async upsert(
    storeId: string,
    dto: UpdateAccessPolicyDto,
    actorUserId?: string,
    ip?: string,
  ): Promise<StoreAccessPolicy> {
    const existing = await this.policyRepo.findOne({ where: { storeId } });
    const oldValue = existing ? { ...existing } : null;

    const data: Partial<StoreAccessPolicy> = {};
    if (dto.accessBlockedUntil !== undefined) {
      data.accessBlockedUntil = dto.accessBlockedUntil ? new Date(dto.accessBlockedUntil) : null;
    }
    if (dto.autoReactivateAt !== undefined) {
      data.autoReactivateAt = dto.autoReactivateAt ? new Date(dto.autoReactivateAt) : null;
    }
    if (dto.customSuspendMessage !== undefined) {
      data.customSuspendMessage = dto.customSuspendMessage || null;
    }
    if (dto.supportContact !== undefined) {
      data.supportContact = dto.supportContact || null;
    }

    const saved = existing
      ? await this.policyRepo.save({ ...existing, ...data })
      : await this.policyRepo.save(this.policyRepo.create({ storeId, ...data }));

    await this.auditLogsService.recordAudit(
      storeId,
      actorUserId,
      'store_access_policy_updated',
      'StoreAccessPolicy',
      saved.id,
      oldValue,
      { ...saved },
      ip,
    );

    return saved;
  }
}