export function formatNumberId(val: number, decimals = 0): string {
  if (!Number.isFinite(val)) return '—';
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPctId(ratioOrPct: number, isRatio = true, decimals = 1): string {
  if (!Number.isFinite(ratioOrPct)) return '—';
  const pct = isRatio ? ratioOrPct * 100 : ratioOrPct;
  return `${formatNumberId(pct, decimals)}%`;
}

export function formatRpJuta(rupiah: number): string {
  if (!Number.isFinite(rupiah)) return '—';
  return `Rp${formatNumberId(rupiah / 1e6, 1)} Juta`;
}

export function extractMean(statStr: string): number {
  const m = String(statStr).match(/[-+]?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

export function extractSd(statStr: string): number {
  const m = String(statStr).match(/±\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

