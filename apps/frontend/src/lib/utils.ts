export function formatCurrencyPYG(value: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatStockInt(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const num = Number(normalized);
  if (!Number.isFinite(num)) return '0';
  return String(Math.trunc(num));
}
