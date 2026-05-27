export type InsightLevel = 'info' | 'success' | 'warning' | 'danger';

export interface OperationalInsight {
  id: string;
  level: InsightLevel;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
}

