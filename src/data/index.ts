import tablesJson from './tables.json';
import seedTrajJson from './seed_trajectories.json';
import konfigJson from './konfigurasi.json';
import type {
  AblasiRow,
  CaseCardRow,
  CollusionEvalRow,
  CrewLatencyRow,
  CrewTop3Row,
  FalseAlarmSourceRow,
  FeatureImportanceRow,
  GradeEvalRow,
  KamusDataRow,
  LocalShapRow,
  PaperFigureItem,
  PrAucScenarioRow,
  ResidualSourceRow,
  Robustness20SeedRow,
  SeedTrajectoryPoint,
  SeedTripRow,
  SensitivityRow,
  SigmaRecallRow,
  ThresholdCompareRow,
  TierEvalRow,
} from '../types/nadi';

export const configNadi = konfigJson;
export const tablesData = tablesJson;

export const caseCardsTop = tablesJson.kartu_kasus_prioritas_investigator as CaseCardRow[];
export const localShapCases = tablesJson.alasan_prediksi_lokal as LocalShapRow[];
export const featureImportance = tablesJson.feature_importance_global as FeatureImportanceRow[];
export const kamusData = tablesJson.kamus_data as KamusDataRow[];
export const tierEval = tablesJson.evaluasi_akurasi_per_tier_kartu_kasus as TierEvalRow[];
export const robustness20Seed = tablesJson.robustness_trip_20_seed as Robustness20SeedRow[];
export const seed42Metrics = tablesJson.metrik_trip_seed_utama as SeedTripRow[];
export const prAucScenarios = tablesJson.pr_auc_skenario_dasar_vs_sulit as PrAucScenarioRow[];
export const ablasiTier = tablesJson.ablasi_tingkat_data as AblasiRow[];
export const sensitivityGenerator = tablesJson.sensitivitas_parameter_generator as SensitivityRow[];
export const gradeEval = tablesJson.recall_dan_fa_menurut_grade as GradeEvalRow[];
export const falseAlarmSources = tablesJson.false_alarm_menurut_sumber as FalseAlarmSourceRow[];
export const residualSources = tablesJson.ringkasan_sumber_residual as ResidualSourceRow[];
export const collusionEval = tablesJson.evaluasi_metode_kolusi_pasangan as CollusionEvalRow[];
export const thresholdCompare = tablesJson.tabel_ambang_batas_pembanding as ThresholdCompareRow[];
export const sigmaRecall = tablesJson.recall_menurut_rentang_sigma as SigmaRecallRow[];
export const crewLatency = tablesJson.evaluasi_latensi_deteksi_crew as CrewLatencyRow[];
export const crewTop3 = tablesJson.evaluasi_level_crew_top3 as CrewTop3Row[];

export const scorecardNadi = tablesJson.scorecard_kinerja_nadi as {
  dimensi_evaluasi: string;
  pembanding: string;
  sistem_nadi: string;
  'selisih_berpasangan_[ci95]': string;
  p_wilcoxon: number | string;
}[];

export const causeValidationMatrix = tablesJson.validasi_dugaan_sebab_vs_modus as Record<
  string,
  string | number
>[];

export const pairedTestsTrip = tablesJson.uji_berpasangan_trip as {
  pembanding: string;
  metrik: string;
  selisih_rata: number;
  ci95_bawah: number;
  ci95_atas: number;
  p_wilcoxon: number;
}[];

export const cekRealisme = tablesJson.cek_realisme as { pemeriksaan: string; nilai: number }[];
export const vcfAstmTable = tablesJson.tabel_vcf_astm as {
  suhu_C: number;
  VCF_E10: number;
  VCF_E20: number;
  VCF_E50: number;
}[];
export const temporalSplit = tablesJson.ringkasan_partisi_temporal as {
  split: string;
  trip: number;
  anomali: number;
  prevalensi: number;
  hari_awal: number;
  hari_akhir: number;
}[];
export const hotspotSummary = tablesJson.ringkasan_klaster_hotspot as {
  in_hotspot: number;
  jumlah_trip: number;
  prevalensi: number;
}[];
export const metodeArsitektur = tablesJson.rancangan_metode_pemodelan as {
  metode: string;
  peran_arsitektur: string;
  mekanisme_kerja: string;
}[];

export const seedTrajectoriesDasar = seedTrajJson.dasar as SeedTrajectoryPoint[];
export const seedTrajectoriesSulit = seedTrajJson.sulit as SeedTrajectoryPoint[];
export const seedAblasi = seedTrajJson.ablasi as {
  seed: number;
  tier1_pr_auc: number;
  tier12_pr_auc: number;
  tier1_recall: number;
  tier12_recall: number;
}[];

export const PAPER_FIGURES: PaperFigureItem[] = [
  {
    id: 'fig-vcf',
    file: 'eda_efek_suhu_vcf.png',
    title: 'Koreksi Suhu ASTM D1250 ke 15 °C (VCF E10/E20/E50)',
    caption: 'Memperlihatkan efek ekspansi termal sebelum dan sesudah konversi V15 pada berbagai suhu muat/terima.',
    category: 'Fisika & EDA',
  },
  {
    id: 'fig-koreksi',
    file: 'eda_dampak_koreksi.png',
    title: 'Dampak Koreksi Bias Lokal SPBU & Terminal',
    caption: 'Menurunkan korelasi residual terhadap bias ATG SPBU dari r = 0,933 menjadi r = 0,104.',
    category: 'Fisika & EDA',
  },
  {
    id: 'fig-dekomp',
    file: 'eda_dekomposisi_residual.png',
    title: 'Dekomposisi Komponen Residual Susut',
    caption: 'Pemisahan penguapan, holdup, bias truk/ATG, pengaruh air E50, serta penyimpangan anomali.',
    category: 'Fisika & EDA',
  },
  {
    id: 'fig-prevalensi',
    file: 'eda_volume_prevalensi.png',
    title: 'Dinamika Volume & Prevalensi Anomali 180 Hari',
    caption: '49.508 trip lintas partisi Latih (1–108), Validasi (109–144), dan Uji (145–180) dengan aktor baru.',
    category: 'Fisika & EDA',
  },
  {
    id: 'fig-stop',
    file: 'eda_peta_stop.png',
    title: 'Klaster Spasial Stop Tak Terdaftar (DBSCAN)',
    caption: 'Prevalensi anomali di dalam klaster hotspot mencapai 18,5% berbanding 1,5% di luar hotspot.',
    category: 'Fisika & EDA',
  },
  {
    id: 'fig-eval-trip',
    file: 'eval_trip_utama.png',
    title: 'Perbandingan 6 Metode pada Seed Utama (Seed 42)',
    caption: 'PR AUC, Recall@5%, dan Volume Curian Terjaring antara B_plus, B_graph, IF_AAD, IF, adj-z, dan z.',
    category: 'Kinerja Model',
  },
  {
    id: 'fig-pr',
    file: 'trip_kurva_pr.png',
    title: 'Kurva Precision-Recall Periode Uji',
    caption: 'B_plus mendominasi pada seluruh rentang recall tanpa membengkakkan alarm palsu harian.',
    category: 'Kinerja Model',
  },
  {
    id: 'fig-cap',
    file: 'eval_kapasitas_vs_volume.png',
    title: 'Kurva Kapasitas Audit vs Volume Curian Terjaring',
    caption: 'Kuota 5%/hari menjaring 81,3% volume pada seed utama (84,4% rata-rata 20 seed).',
    category: 'Kinerja Model',
  },
  {
    id: 'fig-fi',
    file: 'model_feature_importance.png',
    title: 'Kontribusi Fitur Global LightGBM (Gain Split)',
    caption: 'inter_z_stop (14,9%), deviasi_rute_km (13,3%), dan crew_resid_std (8,1%) mendominasi pemisahan.',
    category: 'Kinerja Model',
  },
  {
    id: 'fig-ablasi',
    file: 'ablasi_tingkat_data.png',
    title: 'Ablasi Tingkat Kesiapan Data (Tier 1 -> 1+2 -> 1+2+3)',
    caption: 'Integrasi Tier 2 (telematika + riwayat kru) memberi lonjakan PR AUC terbesar (+0,161).',
    category: 'Kinerja Model',
  },
  {
    id: 'fig-bipartit',
    file: 'kg_bipartit_komunitas.png',
    title: 'Struktur Graf Bipartit Kru–SPBU & Komunitas Terminal',
    caption: 'Visualisasi jejaring relasi pengiriman untuk mendeteksi kolusi M4 berulang.',
    category: 'Graf & Ketahanan',
  },
  {
    id: 'fig-pasangan',
    file: 'kg_prediksi_pasangan.png',
    title: 'Peringkat Pasangan Kolusi: Excess Crew vs Skor Pasangan',
    caption: 'Statistik excess_crew meraih Precision@20 = 75,0% (15 dari 20 pasangan kolusi nyata).',
    category: 'Graf & Ketahanan',
  },
  {
    id: 'fig-multiseed',
    file: 'robustness_trip_multi_seed.png',
    title: 'Stabilitas 20 Replikasi Acak (Seed 42–61)',
    caption: 'B_plus konsisten unggul di seluruh 20 replikasi dengan selang kepercayaan 95% yang sempit.',
    category: 'Graf & Ketahanan',
  },
  {
    id: 'fig-sensitivitas',
    file: 'robustness_sensitivitas_dan_skenario.png',
    title: 'Uji Tekanan Skenario Sulit & Sensitivitas Parameter',
    caption: 'Di skenario sulit, B_plus menjaga PR AUC 0,402 (55% dari dasar), sedang adj-z jatuh ke 0,079 (18%).',
    category: 'Graf & Ketahanan',
  },
];

