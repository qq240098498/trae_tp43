export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const pct = value * 100;
  return formatNumber(pct, digits) + '%';
}

export function formatPercentChange(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const pct = value * 100;
  const prefix = pct > 0 ? '+' : '';
  const abs = Math.abs(pct);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${prefix}${pct < 0 ? '-' : ''}${formatted}%`;
}

export function formatTimes(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return formatNumber(value, digits) + ' 倍';
}

export function formatTurns(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return formatNumber(value, digits) + ' 次';
}

export function formatDays(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return formatNumber(value, digits) + ' 天';
}

export function safeDiv(numerator: number, denominator: number): number | null {
  if (!denominator || denominator === 0) return null;
  return numerator / denominator;
}

export function avg(a: number, b: number): number {
  return (a + b) / 2;
}

export function changeRate(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null;
  return (current - previous) / previous;
}

export function changeAmount(current: number, previous: number): number {
  return current - previous;
}
