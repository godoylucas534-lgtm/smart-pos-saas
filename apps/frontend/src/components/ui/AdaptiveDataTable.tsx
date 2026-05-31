import { type ReactNode } from 'react';
import { PageEmpty, PageLoading } from './PageState';

type Density = 'compact' | 'comfortable';

export interface DataColumn<T> {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
}

interface AdaptiveDataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  density?: Density;
  stickyHeader?: boolean;
  rowKey: (row: T, index: number) => string;
}

export default function AdaptiveDataTable<T>({
  columns,
  rows,
  loading = false,
  emptyMessage = 'Sin datos disponibles.',
  density = 'comfortable',
  stickyHeader = true,
  rowKey,
}: AdaptiveDataTableProps<T>) {
  const cellPadding = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  if (loading) {
    return <PageLoading message="Cargando..." />;
  }

  if (rows.length === 0) {
    return <PageEmpty message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''} style={{ background: 'var(--surface)' }}>
          <tr style={{ color: 'var(--text-muted)' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${cellPadding} text-xs uppercase tracking-wide ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                }`}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className="transition-colors hover:bg-[var(--surface-hover)]"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${cellPadding} ${
                    column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
