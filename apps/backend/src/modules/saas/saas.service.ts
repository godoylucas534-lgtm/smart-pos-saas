import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StoreSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from './entities/store-subscription.entity';
import { PLAN_FEATURES, SaasFeature } from './saas.constants';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class SaasService {
  constructor(
    @InjectRepository(StoreSubscription)
    private readonly subscriptionRepo: Repository<StoreSubscription>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async ensureTrialForStore(storeId: string): Promise<StoreSubscription> {
    const existing = await this.subscriptionRepo.findOne({ where: { storeId } });
    if (existing) return existing;

    const trialDays = Number(process.env.SAAS_TRIAL_DAYS || 14);
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const created = this.subscriptionRepo.create({
      storeId,
      plan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.TRIAL,
      trialEndsAt,
      currentPeriodEndsAt: trialEndsAt,
      graceEndsAt: null,
      suspendedAt: null,
      cancelledAt: null,
    });
    return this.subscriptionRepo.save(created);
  }

  async getByStoreIdOrFail(storeId: string): Promise<StoreSubscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { storeId } });
    if (!subscription) {
      throw new NotFoundException('Suscripción SaaS no encontrada para la tienda.');
    }
    return subscription;
  }

  getFeaturesForPlan(plan: SubscriptionPlan): SaasFeature[] {
    return PLAN_FEATURES[plan] || [];
  }

  isFeatureEnabled(plan: SubscriptionPlan, feature: SaasFeature): boolean {
    return this.getFeaturesForPlan(plan).includes(feature);
  }

  async listTenants() {
    return this.subscriptionRepo
      .createQueryBuilder('s')
      .leftJoin('store_access_policy', 'p', 'p."storeId" = s."storeId"')
      .leftJoin('stores', 'st', 'st.id = s."storeId"')
      .select([
        's.id as "subscriptionId"',
        's."storeId" as "storeId"',
        'st.name as "storeName"',
        'st.slug as "storeSlug"',
        's.plan as "plan"',
        's.status as "status"',
        's."trialEndsAt" as "trialEndsAt"',
        's."currentPeriodEndsAt" as "currentPeriodEndsAt"',
        's."graceEndsAt" as "graceEndsAt"',
        's."suspendedAt" as "suspendedAt"',
        's."cancelledAt" as "cancelledAt"',
        'p."accessBlockedUntil" as "accessBlockedUntil"',
        'p."autoReactivateAt" as "autoReactivateAt"',
        'p."customSuspendMessage" as "customSuspendMessage"',
        'p."supportContact" as "supportContact"',
      ])
      .orderBy('st.name', 'ASC')
      .getRawMany();
  }

  async suspend(storeId: string, actorUserId?: string, ip?: string): Promise<StoreSubscription> {
    const subscription = await this.getByStoreIdOrFail(storeId);
    const oldStatus = subscription.status;
    subscription.status = SubscriptionStatus.SUSPENDED;
    subscription.suspendedAt = new Date();
    const saved = await this.subscriptionRepo.save(subscription);
    await this.auditLogsService.recordAudit(
      storeId,
      actorUserId,
      'saas_tenant_suspended',
      'StoreSubscription',
      saved.id,
      { status: oldStatus },
      { status: saved.status, suspendedAt: saved.suspendedAt },
      ip,
    );
    return saved;
  }

  async reactivate(storeId: string, actorUserId?: string, ip?: string): Promise<StoreSubscription> {
    const subscription = await this.getByStoreIdOrFail(storeId);
    const oldStatus = subscription.status;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.suspendedAt = null;
    if (!subscription.currentPeriodEndsAt) {
      subscription.currentPeriodEndsAt = new Date();
    }
    const saved = await this.subscriptionRepo.save(subscription);
    await this.auditLogsService.recordAudit(
      storeId,
      actorUserId,
      'saas_tenant_reactivated',
      'StoreSubscription',
      saved.id,
      { status: oldStatus },
      { status: saved.status, suspendedAt: saved.suspendedAt },
      ip,
    );
    return saved;
  }
}
