import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowRight,
  Calculator,
  ChevronRight,
  Compass,
  FileWarning,
  Flame,
  GitBranch,
  Layers,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { prAucScenarios, robustness20Seed, tablesData, vcfAstmTable } from '../../data';
import type { NavTabId } from '../../types/nadi';
import { cn } from '../../utils/cn';
import { extractMean, formatNumberId } from '../../utils/format';
import {
  computePhysicsReconciliation,
  type EthanolGrade,
  type ScenarioMode,
} from '../../utils/physics';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Badge } from '../ui/Badge';
import { PulseTriageDiagram } from '../visuals/PulseTriageDiagram';

interface OverviewViewProps {
  scenario: ScenarioMode;
  onChangeScenario: (s: ScenarioMode) => void;
  onNavigate: (tab: NavTabId) => void;
}

const LITERATURE_GAPS = [
  {
    code: 'CELAH 01',
    title: 'Sensor Tangki Terpisah Tanpa Neraca Massa Rantai',
    desc: 'Pendekatan berbasis perangkat keras sensor memantau volume tangki kendaraan secara terpisah, sehingga tidak merekonsiliasi selisih volume lintas Terminal–Mobil Tangki–SPBU.',
  },
  {
    code: 'CELAH 02',
    title: 'Detektor Umum Tanpa Model Susut Wajar Fisika',
    desc: 'Algoritma anomali umum mencampuradukkan derau alat ukur (OIML R 117-1) dan bias lokal ATG/truk dengan sinyal pencurian, memicu banjir alarm palsu.',
  },
  {
    code: 'CELAH 03',
    title: 'Kendala Kuota Audit & Label Tertunda Belum Dimodelkan',
    desc: 'Investigator hanya mampu memeriksa 5% trip paling berisiko per hari dan hasil verifikasi baru terbuka t+3 hari dengan kemungkinan 20% kesalahan deteksi lapangan.',
  },
  {
    code: 'CELAH 04',
    title: 'Belum Ada Graf Bipartit Kru–SPBU & Penjelasan Lokal',
    desc: 'Kolusi antar-aktor terorganisir, ketergantungan etanol E10–E50 terhadap suhu/air, serta ketiadaan Kartu Kasus numerik berorientasi keputusan.',
  },
];

const NADI_STAGES = [
  {
    step: '01',
    short: 'Lingkungan & Modus',
    title: 'Simulator Realistis 49.508 Trip (4 Modus + Bias + E10/E20/E50)',
    detail:
      'Memodelkan 3 Terminal, 120 SPBU, 150 Kru, dan 100 Mobil Tangki selama 180 hari. Menanamkan 4 modus penyimpangan sintetis (M1 hotspot/deviasi rute, M2 pencurian mikro berulang, M3 penyimpangan langsung/bias ATG, dan M4 kolusi pasangan kru–SPBU), kontaminasi air-etanol E50, serta 9 aktor baru pada periode uji.',
    metric: '1.086 perjalanan anomali · 144.560 Liter curian sintetis (Seed 42)',
    target: 'physics-graph' as NavTabId,
    icon: Flame,
  },
  {
    step: '02',
    short: 'Koreksi ASTM 15°C',
    title: 'Rekonsiliasi Termal ASTM D1250 & Pengurangan Bias Bertingkat',
    detail:
      'Volume muat (N(32;3²)°C) & terima (N(30;3²)°C) dikonversi ke 15 °C dengan α produk etanol (E10=0,00095; E20=0,00098; E50=0,00110 °C⁻¹). Selanjutnya, residual dikurangi secara kausal memakai median historis SPBU (min 5), terminal (min 10), dan truk sebelum keberangkatan t.',
    metric: 'Korelasi residual vs bias ATG turun dari r = 0,933 menjadi r = 0,104',
    target: 'physics-graph' as NavTabId,
    icon: Scale,
  },
  {
    step: '03',
    short: '29 Fitur & Graf',
    title: 'Indikator Perilaku, CUSUM/EWMA Kru, DBSCAN & Graf Bipartit',
    detail:
      'Karena 12,6% anomali berukuran < 1σ dan hanya 58,5% melewati p95 wajar, NADI merangkai 29 fitur kausal: inter_z_stop (14,9% gain), route_dev_ratio (11,5%), CUSUM (k=0,25) & EWMA kru, klaster stop liar DBSCAN mingguan (eps=0,06, min 12), dan excess_crew pasangan kru–SPBU.',
    metric: 'Uji kausalitas hari ke-100: selisih maks 29 fitur = 0,0000',
    target: 'physics-graph' as NavTabId,
    icon: GitBranch,
  },
  {
    step: '04',
    short: 'Hibrida B_plus 75/25',
    title: 'Pembelajaran Aktif Mingguan B_plus (75%) + IF_AAD (25%)',
    detail:
      'Setiap hari t, label audit hari t−3 dibuka (20% terlewat & 1% salah positif). Model LightGBM terkalibrasi dilatih ulang tiap 7 hari bila ada ≥ 80 label baru. Kuota harian 5% menggabungkan 75% B_plus dan 25% Isolation Forest Adaptif (IF_AAD) guna menjaga sensitivitas terhadap aktor baru.',
    metric: 'PR AUC 0,732 (Dasar) · 0,402 (Sulit) vs adj-z 0,430 / 0,079',
    target: 'benchmarks' as NavTabId,
    icon: Activity,
  },
  {
    step: '05',
    short: 'Kartu Kasus SHAP',
    title: 'Triase Tiga Tingkat, Dugaan Sebab & Atribusi TreeSHAP Eksak',
    detail:
      'Skor harian dipetakan ke Tier 1 Segera (5% teratas), Tier 2 Prioritas (5–20%), dan Tier 3 Pantau. Aturan berurutan menyusun dugaan sebab + rekomendasi audit fisik disertai 3 pendorong numerik TreeSHAP sebagai alat bantu investigator (Human-in-the-Loop).',
    metric: 'Top 12 Kartu Kasus Uji: 100% terbukti anomali · 7 kasus Kru C071',
    target: 'cases' as NavTabId,
    icon: ShieldCheck,
  },
];

export function OverviewView({
  scenario,
  onChangeScenario,
  onNavigate,
}: OverviewViewProps) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [openGapIdx, setOpenGapIdx] = useState<number>(0);

  // Interactive Custody-Transfer Physics State
  const [grade, setGrade] = useState<EthanolGrade>('E20');
  const [vLoad, setVLoad] = useState(20000);
  const [vRecv, setVRecv] = useState(19860);
  const [tLoad, setTLoad] = useState(32);
  const [tRecv, setTRecv] = useState(31);
  const [localBias, setLocalBias] = useState(0.02);

  const physicsResult = useMemo(
    () =>
      computePhysicsReconciliation({
        grade,
        scenario,
        vLoadLiters: vLoad,
        vRecvLiters: vRecv,
        tLoadC: tLoad,
        tRecvC: tRecv,
        localBiasPct: localBias,
      }),
    [grade, scenario, vLoad, vRecv, tLoad, tRecv, localBias]
  );

  const headlineMetrics = useMemo(() => {
    const bp20 = robustness20Seed.find((r) => r.model === 'B_plus');
    const adj20 = robustness20Seed.find((r) => r.model === 'baseline (adj-z-score)');
    const hardBp = prAucScenarios.find((h) => h.model === 'B_plus');
    const hardAdj = prAucScenarios.find((h) => h.model === 'baseline (adj-z-score)');

    return {
      prAucDasar: extractMean(bp20?.PR_AUC ?? '0.732'),
      prAucAdjDasar: extractMean(adj20?.PR_AUC ?? '0.430'),
      prAucSulit: extractMean(hardBp?.skenario_sulit ?? '0.402'),
      prAucAdjSulit: extractMean(hardAdj?.skenario_sulit ?? '0.079'),
      volCaptured: extractMean(bp20?.vol_rec ?? '0.844') * 100,
      volCapturedAdj: extractMean(adj20?.vol_rec ?? '0.659') * 100,
      faPerDay: extractMean(bp20?.FA_per_hari ?? '7.46'),
      faPerDayAdj: extractMean(adj20?.FA_per_hari ?? '9.34'),
    };
  }, []);

  const uncertaintyRows = tablesData.anggaran_ketidakpastian as {
    komponen: string;
    u_persen_1sigma: number;
  }[];

  const activeStage = NADI_STAGES[activeStageIdx];

  return (
    <div className="w-full">
      {/* SECTION 1: TELEMETRY SIGNAL TICKER + FORENSIC WORKBENCH HERO */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 space-y-6">
          {/* Unified 4-Readout Telemetry Strip */}
          <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)]">
            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  PR AUC · Dasar (20 Seed)
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-blue)]">
                  0,<AnimatedCounter value={Math.round(headlineMetrics.prAucDasar * 1000)} />
                </p>
                <p className="text-[10.5px] text-[var(--text-secondary)]">
                  vs adj-z {formatNumberId(headlineMetrics.prAucAdjDasar, 3)}
                </p>
              </div>
              <Badge variant="blue">+0,302</Badge>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  PR AUC · Skenario Sulit
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-red)]">
                  0,<AnimatedCounter value={Math.round(headlineMetrics.prAucSulit * 1000)} />
                </p>
                <p className="text-[10.5px] text-[var(--text-secondary)]">
                  vs adj-z {formatNumberId(headlineMetrics.prAucAdjSulit, 3)}
                </p>
              </div>
              <Badge variant="red">5,1× Baseline</Badge>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Volume Curian Terjaring @5%
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-green)]">
                  <AnimatedCounter value={headlineMetrics.volCaptured} decimals={1} />%
                </p>
                <p className="text-[10.5px] text-[var(--text-secondary)]">
                  vs adj-z {formatNumberId(headlineMetrics.volCapturedAdj, 1)}%
                </p>
              </div>
              <Badge variant="green">+18,5 pp</Badge>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Alarm Palsu Harian
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)]">
                  <AnimatedCounter value={headlineMetrics.faPerDay} decimals={2} />
                </p>
                <p className="text-[10.5px] text-[var(--text-secondary)]">
                  vs adj-z {formatNumberId(headlineMetrics.faPerDayAdj, 2)}/hr
                </p>
              </div>
              <Badge variant="neutral">−1,88/hr</Badge>
            </div>
          </div>

          {/* Asymmetric Chronicle (5 cols) + Calibrated Telemetry Schematic Canvas (7 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
            {/* LEFT: Incident Chronology & Interactive Literature Gap Accordion */}
            <div className="xl:col-span-5 space-y-5">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="blue">IKMS PT Pertamina Patra Niaga 2026</Badge>
                  <Badge variant={scenario === 'sulit' ? 'red' : 'green'}>
                    {scenario === 'sulit'
                      ? 'Skenario Sulit · σ 0,559% (5eb161c3)'
                      : 'Skenario Dasar · σ 0,280% (83a4a949)'}
                  </Badge>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                  Memisahkan <span className="text-[var(--accent-blue)]">Susut Wajar Fisika</span>{' '}
                  dari <span className="text-[var(--accent-red)]">Anomali Berisiko</span> dalam
                  Distribusi Etanol
                </h1>
              </div>

              {/* Continuous Vertical Chronology Rail */}
              <div className="relative pl-5 border-l-2 border-[var(--border-strong)] space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                <div className="relative">
                  <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] ring-4 ring-[var(--bg-surface)]" />
                  <p className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                    Mandat Bioetanol 2026–2028
                  </p>
                  <p className="mt-0.5">
                    Melalui <strong>Kepmen ESDM No. 113.K/EK.05/MEM.E/2026</strong>, pencampuran E5
                    wajib mulai semester II 2026 (menuju E10 paling lambat 2028). Pada skala konsumsi
                    Pertamax ~9 juta kL/tahun (@Rp15.950/L ≈ Rp144 T), kesalahan takar 0,5% setara
                    ±Rp720 M/tahun.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-red)] ring-4 ring-[var(--bg-surface)]" />
                  <p className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--accent-red)]">
                    Insiden Tuban (Apr 2026) &amp; Sumut–Medan (Jul 2026)
                  </p>
                  <p className="mt-0.5">
                    Dugaan kecurangan awak mobil tangki di <strong>FT Tuban</strong> memicu PHK dan
                    mogok kerja yang mengancam pasokan; antrean <strong>Sumut &amp; Medan</strong>{' '}
                    juga dipicu laporan penyimpangan pengemudi, bukan defisit stok. Audit menuntut
                    pembuktian objektif sebelum sanksi dijatuhkan.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] ring-4 ring-[var(--bg-surface)]" />
                  <p className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--accent-green)]">
                    Mengapa Selisih Volume Selalu Abu-abu?
                  </p>
                  <p className="mt-0.5">
                    Penguapan, <em>holdup</em> pipa, ekspansi termal ΔT, derau meter OIML R 117-1
                    (±0,3%), dan bias ATG SPBU menimbun pencurian mikro di bawah radar ambang batas
                    statis.
                  </p>
                </div>
              </div>

              {/* Compact Interactive Literature Gaps Accordion */}
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] overflow-hidden">
                <div className="px-3.5 py-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] flex items-center justify-between">
                  <span className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileWarning className="w-3.5 h-3.5 text-[var(--accent-red)]" />
                    Empat Celah Riset yang Dijawab NADI
                  </span>
                  <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                    Klik untuk detail
                  </span>
                </div>
                <div className="divide-y divide-[var(--border-hairline)]">
                  {LITERATURE_GAPS.map((g, i) => {
                    const isOpen = openGapIdx === i;
                    return (
                      <div key={g.code} className="bg-[var(--bg-surface)]">
                        <button
                          onClick={() => setOpenGapIdx(i)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[var(--bg-canvas)] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono-num text-[10px] font-bold text-[var(--accent-blue)] shrink-0">
                              {g.code}
                            </span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                              {g.title}
                            </span>
                          </div>
                          <ChevronRight
                            className={cn(
                              'w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-transform',
                              isOpen && 'rotate-90 text-[var(--accent-blue)]'
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3 text-[11.5px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-canvas)]/60">
                            {g.desc}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Calibrated Metrology Graph-Paper Schematic + Synchronized Stage Dock */}
            <div className="xl:col-span-7 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] overflow-hidden">
              {/* Instrument Console Header Bar */}
              <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-rail)] text-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono-num text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">SKEMA PIPA INTELIJEN NADI v2.1</span>
                  <span className="text-slate-400 hidden sm:inline">
                    · Replay Tertunda t−3 Hari
                  </span>
                </div>
                <span className="font-mono-num text-[10.5px] text-sky-300">
                  Hash: {scenario === 'sulit' ? '5eb161c3 (Sulit)' : '83a4a949 (Dasar)'}
                </span>
              </div>

              {/* Calibrated Telemetry Grid Canvas */}
              <div className="p-4 sm:p-5 bg-telemetry-grid border-b border-[var(--border-hairline)]">
                <PulseTriageDiagram scenario={scenario} />
              </div>

              {/* Synchronized 5-Stage Horizontal Selector + Inspection Box */}
              <div className="p-4 sm:p-5 bg-[var(--bg-surface)] space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {NADI_STAGES.map((st, idx) => {
                    const Icon = st.icon;
                    const active = idx === activeStageIdx;
                    return (
                      <button
                        key={st.step}
                        onClick={() => setActiveStageIdx(idx)}
                        className={cn(
                          'px-2.5 py-2 rounded-md border text-left transition-all',
                          active
                            ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-xs'
                            : 'bg-[var(--bg-canvas)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              'font-mono-num text-[10px] font-bold',
                              active ? 'text-sky-100' : 'text-[var(--accent-blue)]'
                            )}
                          >
                            {st.step}
                          </span>
                          <Icon className="w-3.5 h-3.5 opacity-80" />
                        </div>
                        <p className="font-sub text-[11px] font-semibold leading-tight truncate">
                          {st.short}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Active Stage Inspection Panel */}
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-blue)] text-white">
                        TAHAP {activeStage.step}
                      </span>
                      <h3 className="font-display text-base font-bold text-[var(--text-primary)] truncate">
                        {activeStage.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeStage.detail}
                    </p>
                    <p className="font-mono-num text-[11px] font-semibold text-[var(--accent-green)]">
                      {activeStage.metric}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(activeStage.target)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-[var(--accent-blue)] text-xs font-sub font-semibold text-[var(--accent-blue)] transition-colors"
                  >
                    Buka Modul <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: UNIFIED METROLOGY CALIBRATION RACK (ASTM D1250 + OIML R 117-1) */}
      <section className="py-9 lg:py-11 bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <p className="font-sub text-[10.5px] uppercase tracking-[0.14em] text-[var(--accent-blue)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Meja Kalibrasi Serah-Terima Custody Transfer · ASTM D1250 &amp; OIML R 117-1
              </p>
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                Simulator Normalisasi Suhu 15 °C &amp; Pemisahan Bias Lokal SPBU
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-sub">
              {(['dasar', 'sulit'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => onChangeScenario(sc)}
                  className={cn(
                    'px-3 py-1.5 rounded border transition-colors font-semibold',
                    scenario === sc
                      ? sc === 'sulit'
                        ? 'bg-[var(--accent-red)] text-white border-[var(--accent-red)]'
                        : 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                  )}
                >
                  {sc === 'dasar' ? 'σ Dasar (0,280%)' : 'σ Sulit (0,559%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Single Framed Lab Instrument Panel */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-[var(--border-hairline)]">
            {/* LEFT INSTRUMENT PANE: Sliders & Digital Slip */}
            <div className="xl:col-span-7 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Calculator className="w-4 h-4 text-[var(--accent-blue)]" />
                  [INST-ASTM-01] Parameter Kompartemen &amp; Suhu Serah-Terima
                </span>

                <div className="flex items-center gap-1 font-sub text-[11px]">
                  {(['E10', 'E20', 'E50'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={cn(
                        'px-2.5 py-1 rounded border transition-colors',
                        grade === g
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] font-semibold'
                          : 'bg-[var(--bg-canvas)] border-[var(--border-hairline)] text-[var(--text-muted)]'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Volume Muat Terminal (V_load)</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatNumberId(vLoad)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8000}
                    max={32000}
                    step={500}
                    value={vLoad}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setVLoad(next);
                      if (vRecv > next) setVRecv(next);
                    }}
                    className="w-full accent-[var(--accent-blue)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Volume Terima SPBU (V_recv)</span>
                    <span className="font-bold text-[var(--accent-blue)]">
                      {formatNumberId(vRecv)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={7500}
                    max={vLoad}
                    step={10}
                    value={vRecv}
                    onChange={(e) => setVRecv(Number(e.target.value))}
                    className="w-full accent-[var(--accent-blue)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Suhu Muat (T_load)</span>
                    <span className="font-bold text-[var(--accent-red)]">{tLoad} °C</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={45}
                    step={0.5}
                    value={tLoad}
                    onChange={(e) => setTLoad(Number(e.target.value))}
                    className="w-full accent-[var(--accent-red)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Suhu Terima (T_recv)</span>
                    <span className="font-bold text-[var(--accent-teal)]">{tRecv} °C</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={45}
                    step={0.5}
                    value={tRecv}
                    onChange={(e) => setTRecv(Number(e.target.value))}
                    className="w-full accent-[var(--accent-teal)]"
                  />
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">
                      Koreksi Bias Historis Lokal SPBU + Terminal + Truk (Pers. 8–10)
                    </span>
                    <span className="font-bold text-[var(--accent-green)]">
                      +{formatNumberId(localBias, 2)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.3}
                    max={0.6}
                    step={0.01}
                    value={localBias}
                    onChange={(e) => setLocalBias(Number(e.target.value))}
                    className="w-full accent-[var(--accent-green)]"
                  />
                </label>
              </div>

              {/* Custody Slip Readout Ledger */}
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] divide-y divide-[var(--border-hairline)]">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
                  <div className="p-3">
                    <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                      Selisih Mentah
                    </p>
                    <p className="font-mono-num text-base font-bold text-[var(--text-primary)] mt-0.5">
                      {formatNumberId(physicsResult.rawDiffLiters, 0)} L
                    </p>
                    <p className="text-[10.5px] font-mono-num text-[var(--text-muted)]">
                      {formatNumberId(physicsResult.rawDiffPct, 3)}%
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                      Residual V15
                    </p>
                    <p className="font-mono-num text-base font-bold text-[var(--accent-blue)] mt-0.5">
                      {formatNumberId(physicsResult.reconciledDiffPct, 3)}%
                    </p>
                    <p className="text-[10.5px] font-mono-num text-[var(--text-muted)]">
                      {formatNumberId(physicsResult.reconciledDiffLiters, 0)} L @15°C
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                      Residual Bersih
                    </p>
                    <p className="font-mono-num text-base font-bold text-[var(--accent-green)] mt-0.5">
                      {formatNumberId(physicsResult.residualAfterBiasPct, 3)}%
                    </p>
                    <p className="text-[10.5px] font-mono-num text-[var(--text-muted)]">
                      σ_{grade} = {formatNumberId(physicsResult.sigmaPct, 3)}%
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                      Skor z_adj
                    </p>
                    <p
                      className={cn(
                        'font-mono-num text-base font-bold mt-0.5',
                        physicsResult.verdictSeverity === 'alert'
                          ? 'text-[var(--accent-red)]'
                          : physicsResult.verdictSeverity === 'watch'
                            ? 'text-[var(--accent-amber)]'
                            : 'text-[var(--accent-green)]'
                      )}
                    >
                      {formatNumberId(physicsResult.zAdj, 2)}σ
                    </p>
                    <p className="text-[10.5px] font-mono-num text-[var(--text-muted)]">
                      z_raw {formatNumberId(physicsResult.zRaw, 2)}σ
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'px-4 py-2.5 text-xs font-sub flex flex-wrap items-center justify-between gap-2',
                    physicsResult.verdictSeverity === 'alert'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      : physicsResult.verdictSeverity === 'watch'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  )}
                >
                  <span>
                    <strong>Putusan Metrologi:</strong> {physicsResult.verdictLabel}
                  </span>
                  <span className="font-mono-num text-[11px]">
                    VCF_load={physicsResult.vcfLoad.toFixed(4)} · VCF_recv=
                    {physicsResult.vcfRecv.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT INSTRUMENT PANE: ASTM VCF Curve & Uncertainty Quadrature Budget */}
            <div className="xl:col-span-5 p-5 sm:p-6 bg-[var(--bg-canvas)]/50 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Kurva Faktor Koreksi Volume ASTM D1250
                  </p>
                  <Badge variant="neutral">r vs suhu → −0,0002</Badge>
                </div>
                <div className="h-[195px] w-full rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vcfAstmTable} margin={{ top: 6, right: 12, left: -8, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                      <XAxis
                        dataKey="suhu_C"
                        tickFormatter={(v) => `${v}°C`}
                        tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }}
                      />
                      <YAxis
                        domain={[0.96, 1]}
                        tickFormatter={(v) => v.toFixed(3)}
                        tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-strong)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10.5px' }} />
                      <Line
                        type="monotone"
                        dataKey="VCF_E10"
                        name="E10 (0,00095)"
                        stroke="#0369a1"
                        strokeWidth={2}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="VCF_E20"
                        name="E20 (0,00098)"
                        stroke="#15803d"
                        strokeWidth={2}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="VCF_E50"
                        name="E50 (0,00110)"
                        stroke="#e11d48"
                        strokeWidth={2}
                        dot={{ r: 2.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Anggaran Ketidakpastian Kuadratur OIML R 117-1 (1σ Dasar)
                </p>
                <div className="rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] divide-y divide-[var(--border-hairline)] text-xs">
                  {uncertaintyRows.map((u) => {
                    const isTotal = u.komponen.toLowerCase().includes('gabungan');
                    return (
                      <div
                        key={u.komponen}
                        className={cn(
                          'px-3 py-1.5 flex items-center justify-between',
                          isTotal && 'bg-sky-500/[0.06]'
                        )}
                      >
                        <span
                          className={cn(
                            isTotal
                              ? 'font-semibold text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)]'
                          )}
                        >
                          {u.komponen}
                        </span>
                        <span
                          className={cn(
                            'font-mono-num',
                            isTotal
                              ? 'font-bold text-[var(--accent-blue)]'
                              : 'text-[var(--text-muted)]'
                          )}
                        >
                          ±{formatNumberId(u.u_persen_1sigma, 3)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed flex items-start gap-1.5 pt-1">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                  <span>
                    Selisih wajar termal pada suhu 40 °C E50 dapat tampak ~2,77% sebelum koreksi
                    V15; NADI menyaring efek termal dahulu agar tuduhan tidak salah sasaran.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
