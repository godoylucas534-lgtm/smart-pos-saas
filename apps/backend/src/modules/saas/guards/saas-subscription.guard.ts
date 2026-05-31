import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../entities/store-subscription.entity';
import { StoreAccessPolicy } from '../entities/store-access-policy.entity';
import { SAAS_FEATURE_KEY, SAAS_MUTATION_KEY } from '../saas.decorators';
import { SaasFeature } from '../saas.constants';
import { SaasService } from '../saas.service';

@Injectable()
export class SaasSubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly saasService: SaasService,
    @InjectRepository(StoreSubscription)
    private readonly subscriptionRepo: Repository<StoreSubscription>,
    @InjectRepository(StoreAccessPolicy)
    private readonly policyRepo: Repository<StoreAccessPolicy>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const storeId = request.user?.storeId ?? request.storeId;
    const role = request.user?.role ?? request.userRole;

    if (!storeId || role === 'super_admin') return true;

    const subscription = await this.subscriptionRepo.findOne({ where: { storeId } });
    if (!subscription) return true;

    const policy = await this.policyRepo.findOne({ where: { storeId } });
    const now = new Date();

    if (
      subscription.status === SubscriptionStatus.SUSPENDED &&
      policy?.autoReactivateAt &&
      now >= new Date(policy.autoReactivateAt)
    ) {
      const reactivated = await this.saasService.reactivate(storeId, undefined, request.ip);
      subscription.status = reactivated.status;
      subscription.suspendedAt = reactivated.suspendedAt;
    }

    const mutationProtected = this.reflector.getAllAndOverride<boolean | undefined>(
      SAAS_MUTATION_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

    if (isMutation && mutationProtected) {
      if (policy?.accessBlockedUntil && now < new Date(policy.accessBlockedUntil)) {
        throw new ForbiddenException({
          code: 'ACCESS_RESTRICTED',
          message: policy.customSuspendMessage || 'El acceso a esta cuenta esta restringido temporalmente.',
          supportContact: policy.supportContact || null,
          blockedUntil: policy.accessBlockedUntil,
        });
      }

      if (subscription.status === SubscriptionStatus.SUSPENDED) {
        const message =
          policy?.customSuspendMessage ||
          'Tu suscripcion esta suspendida. Contacta a soporte para reactivar.';
        throw new ForbiddenException({
          code: 'ACCESS_RESTRICTED',
          message,
          supportContact: policy?.supportContact || null,
          status: subscription.status,
        });
      }
    }

    const requiredFeature = this.reflector.getAllAndOverride<SaasFeature | undefined>(
      SAAS_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredFeature) {
      const enabled = this.saasService.isFeatureEnabled(subscription.plan, requiredFeature);
      if (!enabled) {
        throw new ForbiddenException({
          code: 'SAAS_FEATURE_NOT_AVAILABLE',
          message: `La funcionalidad "${requiredFeature}" no esta disponible en tu plan.`,
          plan: subscription.plan,
          status: subscription.status,
        });
      }
    }

    request.saas = {
      plan: subscription.plan,
      status: subscription.status,
      features: this.saasService.getFeaturesForPlan(subscription.plan),
    };
    return true;
  }
}
