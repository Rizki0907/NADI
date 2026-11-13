export type EthanolGrade = 'E10' | 'E20' | 'E50';
export type ScenarioMode = 'dasar' | 'sulit';

export const ALPHA_BY_GRADE: Record<EthanolGrade, number> = {
  E10: 0.00095,
  E20: 0.00098,
  E50: 0.0011,
};

export const UNCERTAINTY_COMPONENTS: Record<
  ScenarioMode,
  { atg: number; meter: number; suhu: number; densitas: number; gabungan: number; traceProb: number; sizeMult: number }
> = {
  dasar: {
    atg: 0.2,
    meter: 0.15,
    suhu: 0.1,
    densitas: 0.075,
    gabungan: 0.2795,
    traceProb: 0.9,
    sizeMult: 1.5,
  },
  sulit: {
    atg: 0.4,
    meter: 0.3,
    suhu: 0.2,
    densitas: 0.15,
    gabungan: 0.559,
    traceProb: 0.55,
    sizeMult: 1.0,
  },
};

export interface PhysicsCalcResult {
  vcfLoad: number;
  vcfRecv: number;
  v15Load: number;
  v15Recv: number;
  rawDiffLiters: number;
  rawDiffPct: number;
  reconciledDiffLiters: number;
  reconciledDiffPct: number;
  residualAfterBiasPct: number;
  sigmaPct: number;
  zRaw: number;
  zAdj: number;
  verdictLabel: string;
  verdictSeverity: 'safe' | 'watch' | 'alert';
}

export function computePhysicsReconciliation(params: {
  grade: EthanolGrade;
  scenario: ScenarioMode;
  vLoadLiters: number;
  vRecvLiters: number;
  tLoadC: number;
  tRecvC: number;
  localBiasPct: number;
}): PhysicsCalcResult {
  const { grade, scenario, vLoadLiters, vRecvLiters, tLoadC, tRecvC, localBiasPct } = params;
  const alpha = ALPHA_BY_GRADE[grade];
  const vcfLoad = Math.exp(-alpha * (tLoadC - 15));
  const vcfRecv = Math.exp(-alpha * (tRecvC - 15));

  const v15Load = vLoadLiters * vcfLoad;
  const v15Recv = vRecvLiters * vcfRecv;

  const rawDiffLiters = vLoadLiters - vRecvLiters;
  const rawDiffPct = vLoadLiters > 0 ? (rawDiffLiters / vLoadLiters) * 100 : 0;

  const reconciledDiffLiters = v15Load - v15Recv;
  const reconciledDiffPct = v15Load > 0 ? (reconciledDiffLiters / v15Load) * 100 : 0;
  const residualAfterBiasPct = reconciledDiffPct - localBiasPct;

  const baseSigma = UNCERTAINTY_COMPONENTS[scenario].gabungan;
  const sigmaPct = grade === 'E50' ? baseSigma * 1.4 : baseSigma;

  const zRaw = sigmaPct > 0 ? reconciledDiffPct / sigmaPct : 0;
  const zAdj = sigmaPct > 0 ? residualAfterBiasPct / sigmaPct : 0;

  let verdictLabel = 'Dalam Pita Ketidakpastian Alat (Susut Wajar)';
  let verdictSeverity: 'safe' | 'watch' | 'alert' = 'safe';

  if (Math.abs(zAdj) >= 2.0) {
    verdictLabel = 'Deviasi Signifikan (≥ 2,0σ) — Perlu Triase Tier 1 + Cek Telematika';
    verdictSeverity = 'alert';
  } else if (Math.abs(zAdj) >= 1.0) {
    verdictLabel = 'Zona Abu-abu (1,0σ–2,0σ) — Riwayat Kru CUSUM & Stop Menentukan';
    verdictSeverity = 'watch';
  }

  return {
    vcfLoad,
    vcfRecv,
    v15Load,
    v15Recv,
    rawDiffLiters,
    rawDiffPct,
    reconciledDiffLiters,
    reconciledDiffPct,
    residualAfterBiasPct,
    sigmaPct,
    zRaw,
    zAdj,
    verdictLabel,
    verdictSeverity,
  };
}

