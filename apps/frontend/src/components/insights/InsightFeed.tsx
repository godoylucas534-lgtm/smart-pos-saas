import { Link } from 'react-router-dom';
import type { OperationalInsight } from '@/features/insights/types';

const levelStyles: Record<OperationalInsight['level'], { border: string; bg: string }> = {
  info: { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  success: { border: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  danger: { border: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
};

export default function InsightFeed({ insights, title = 'Insights operativos' }: { insights: OperationalInsight[]; title?: string }) {
  return (
    <section className="ui-card">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="space-y-2">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-lg border p-3"
            style={{ borderColor: levelStyles[insight.level].border, background: levelStyles[insight.level].bg }}
          >
            <p className="text-sm font-semibold">{insight.title}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{insight.description}</p>
            {insight.ctaLabel && insight.ctaTo && (
              <Link to={insight.ctaTo} className="inline-block text-xs mt-2 font-semibold" style={{ color: 'var(--primary)' }}>
                {insight.ctaLabel}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

