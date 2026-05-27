import { SetMetadata } from '@nestjs/common';
import { SaasFeature } from './saas.constants';

export const SAAS_FEATURE_KEY = 'saas_feature';
export const SAAS_MUTATION_KEY = 'saas_mutation';

export const RequireSaasFeature = (feature: SaasFeature) =>
  SetMetadata(SAAS_FEATURE_KEY, feature);

export const SaasWriteOperation = () => SetMetadata(SAAS_MUTATION_KEY, true);
