import { SubscriptionPlan } from './entities/store-subscription.entity';

export enum SaasFeature {
  CREDITS = 'credits',
  REPORTS = 'reports',
  MULTI_USER = 'multi_user',
}

export const PLAN_FEATURES: Record<SubscriptionPlan, SaasFeature[]> = {
  [SubscriptionPlan.BASIC]: [],
  [SubscriptionPlan.PRO]: [SaasFeature.CREDITS, SaasFeature.REPORTS],
  [SubscriptionPlan.ENTERPRISE]: [
    SaasFeature.CREDITS,
    SaasFeature.REPORTS,
    SaasFeature.MULTI_USER,
  ],
};

