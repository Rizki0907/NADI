export type NavTabId =
  | 'overview'
  | 'cases'
  | 'physics-graph'
  | 'benchmarks'
  | 'impact-team';

export interface CaseCardRow {
  trip_id: number;
  day: number;
  terminal_id: string;
  spbu_id: string;
  crew_id: string;
  ethanol_grade: 'E10' | 'E20' | 'E50';
  skor_prob: number;
  tier: string;
  dugaan_sebab: string;
  rekomendasi: string;
  label: number;
}

export interface LocalShapRow {
  trip_id: number;
  crew_id: string;
  modus: 'M1' | 'M2' | 'M3' | 'M4';
  skor_prob: number;
  kontributor_utama: string;
}

export interface FeatureImportanceRow {
  fitur: string;
  gain: number;
  split: number;
  gain_relatif: number;
}

export interface KamusDataRow {
  kode: string;
  fitur: string;
  satuan: string;
  tier: string;
  sumber_di_lapangan: string;
}

export interface TierEvalRow {
  tier: string;
  total_trip: number;
  kasus_terbukti: number;
  presisi_anomali: number;
  persen_trip: number;
  recall_tier: number;
  recall_kumulatif: number;
}

export interface Robustness20SeedRow {
  model: string;
  PR_AUC: string;
  P: string;
  R: string;
  F1: string;
  vol_rec: string;
  R_baru: string;
  R_lama: string;
  FA_per_hari: string;
}

export interface SeedTripRow {
  model: string;
  P: number;
  R: number;
  F1: number;
  PR_AUC: number;
  ROC_AUC: number;
  vol_rec: number;
  R_baru: number;
  R_lama: number;
  n_baru: number;
  FA_per_hari: number;
}

export interface PrAucScenarioRow {
  model: string;
  skenario_dasar: string;
  skenario_sulit: string;
}

export interface AblasiRow {
  set_data: string;
  PR_AUC: string;
  R: string;
  vol_rec: string;
  R_baru: string;
}

export interface SensitivityRow {
  varian: string;
  PR_AUC_Bplus: string;
  PR_AUC_Bgraph: string;
  PR_AUC_base_adj: string;
  selisih_Bplus_vs_base: string;
  R_Bplus: string;
}

export interface GradeEvalRow {
  grade: 'E10' | 'E20' | 'E50';
  n_anomali: number;
  recall: number;
  ci_bawah: number;
  ci_atas: number;
  tingkat_fa: number;
}

export interface FalseAlarmSourceRow {
  sumber: string;
  false_alarm: number;
  trip_wajar: number;
  tingkat_fa: number;
  lift_vs_wajar_biasa: number;
}

export interface ResidualSourceRow {
  sumber: string;
  size: number;
  mean: number;
  median: number;
}

export interface CollusionEvalRow {
  metode: string;
  AP: number;
  AUC: number;
  P_at_k: number;
  AP_per_terminal: number;
  n_kandidat: number;
  n_kolusi: number;
}

export interface ThresholdCompareRow {
  ambang: number;
  f1_val: number;
  trip_ditandai: number;
  persen_trip_ditandai: number;
  presisi: number;
  recall: number;
  f1: number;
}

export interface SigmaRecallRow {
  rentang_sigma: string;
  jumlah_trip: number;
  'baseline (z-score)': number;
  'baseline (adj-z-score)': number;
  IF: number;
  IF_AAD: number;
  B_graph: number;
  B_plus: number;
}

export interface CrewLatencyRow {
  model: string;
  n_aktor: number;
  terdeteksi: number;
  median_hari: number;
  dalam_14_hari: number;
  presisi_alarm: number;
}

export interface CrewTop3Row {
  model: string;
  agg: string;
  AUC: number;
  AP: number;
  P_k: number;
}

export interface SeedTrajectoryPoint {
  seed: number;
  prevalensi: number;
  b_plus_pr_auc: number;
  b_graph_pr_auc: number;
  if_aad_pr_auc: number;
  if_pure_pr_auc: number;
  adj_z_pr_auc: number;
  z_score_pr_auc: number;
  b_plus_recall: number;
  adj_z_recall: number;
  b_plus_vol_rec: number;
  adj_z_vol_rec: number;
  b_plus_fa_hari: number;
  adj_z_fa_hari: number;
}

export interface PaperFigureItem {
  id: string;
  file: string;
  title: string;
  caption: string;
  category: 'Fisika & EDA' | 'Kinerja Model' | 'Graf & Ketahanan';
}

