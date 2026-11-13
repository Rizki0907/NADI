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
  Database,
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
import { EditorialHeader, Reveal } from '../ui/MotionPrimitives';
import { PulseTriageDiagram } from '../visuals/PulseTriageDiagram';

interface OverviewViewProps {
  scenario: ScenarioMode;
  onChangeScenario: (s: ScenarioMode) => void;
  onNavigate: (tab: NavTabId) => void;
}

const NADI_STAGES = [
  {
    step: '01',
    title: 'Simulasi Transisi Etanol & Kasus Pembanding Nyata',
    plain: 'Membentuk 49.508 perjalanan (3 Terminal, 120 SPBU, 150 Kru, 100 Truk, 180 hari)',
    detail:
      'Komposisi produk E10 (50%), E20 (35%), dan uji tekanan E50 (15%). Simulasi tidak hanya menyuntikkan 4 modus anomali (M1 bongkar besar, M2 curian mikro berulang, M3 deviasi rute, M4 kolusi kru–SPBU), tetapi juga kasus pembanding wajar seperti bias ATG (8% SPBU), bias meter truk (8% truk), drift terminal (s.d. 0,30%), dan kontaminasi air E50 (4% pengiriman E50).',
    metric: '144.560 Liter total volume curian sintetis (seed 42)',
    target: 'physics-graph' as NavTabId,
    icon: Flame,
  },
  {
    step: '02',
    title: 'Rekonsiliasi Fisika ASTM D1250 15°C & Koreksi Bias Bertingkat',
    plain: 'Menghapus ilusi susut akibat beda suhu dan kesalahan alat ukur lokal',
    detail:
      'Volume muat (N(32;3²)°C) dan volume terima (N(30;3²)°C) diselaraskan ke 15 °C memakai eksponensial VCF sesuai kelas etanol (α E10=0,00095; E20=0,00098; E50=0,00110 °C⁻¹). Selanjutnya, residual dikurangi median kausal per SPBU (min 5 observasi), per terminal (min 10 observasi), dan bias historis truk.',
    metric: 'Korelasi terhadap bias ATG SPBU anjlok dari r = 0,933 → 0,104',
    target: 'physics-graph' as NavTabId,
    icon: Scale,
  },
  {
    step: '03',
    title: '29 Indikator Perilaku, Riwayat CUSUM/EWMA & Graf Relasional',
    plain: 'Menjaring pencurian kecil berulang & komplotan yang lolos dari ambang volume',
    detail:
      'Karena 12,6% anomali berukuran < 1σ dan 45,7% trip wajar justru melewati 0,2%, NADI mengekstrak 29 fitur kausal bebas bocor masa depan: interaksi residual × log(durasi berhenti) (inter_z_stop, gain 14,9%), deviasi rute GPS (13,3%), CUSUM k=0,25 & EWMA kru, klaster stop liar DBSCAN (eps=0,06), serta excess_crew pasangan kru–SPBU.',
    metric: 'Selisih uji pemotongan temporal hari ke-100 = 0,000 (Zero Leakage)',
    target: 'physics-graph' as NavTabId,
    icon: GitBranch,
  },
  {
    step: '04',
    title: 'Kebijakan Triase Hibrida B_plus + Replay Umpan Balik Investigator',
    plain: 'Belajar dari hasil audit tertunda (3 hari) dengan kuota ketat 5%/hari',
    detail:
      'Menggabungkan 75% peringkat model supervised LightGBM terkalibrasi (B_plus) dan 25% detektor semi-supervised IF_AAD untuk tetap peka pada aktor baru. Setiap hari, label audit terbuka dengan penundaan 3 hari dan model dilatih ulang mingguan menggunakan pembobotan sampel audit acak vs bertarget.',
    metric: 'PR AUC 0,732 (Dasar) · 0,402 (Sulit) vs adj-z 0,430 / 0,079',
    target: 'benchmarks' as NavTabId,
    icon: Activity,
  },
  {
    step: '05',
    title: 'Kartu Kasus Berjenjang + Atribusi TreeSHAP untuk Investigator',
    plain: 'Keputusan tetap di tangan manusia, dilengkapi dugaan sebab & saran aksi',
    detail:
      'Skor harian dipetakan menjadi Tier 1 Segera (Top 5% kuota — presisi 56,5%, menjaring 68,1% anomali), Tier 2 Prioritas (5–20% — kumulatif 83,9%), dan Tier 3 Pantau. Setiap kartu menyertakan 3 faktor pendorong numerik TreeSHAP eksak dan dugaan modus operasional.',
    metric: '12 dari 12 kartu teratas terbukti anomali nyata (7 kasus oleh Kru C071)',
    target: 'cases' as NavTabId,
    icon: ShieldCheck,
  },
];

const PHYSICS_PRESETS = [
  {
    label: 'Trip Wajar Siang Panas (ΔT = 6 °C)',
    grade: 'E10' as EthanolGrade,
    vLoad: 20000,
    vRecv: 19885,
    tLoad: 35,
    tRecv: 29,
    localBias: 0.05,
  },
  {
    label: 'Pencurian Mikro M2 (120 L ≈ Rp1,9 Juta)',
    grade: 'E20' as EthanolGrade,
    vLoad: 20000,
    vRecv: 19860,
    tLoad: 32,
    tRecv: 31,
    localBias: 0.02,
  },
  {
    label: 'E50 Bias ATG + Pengaruh Air (0,62%)',
    grade: 'E50' as EthanolGrade,
    vLoad: 20000,
    vRecv: 19810,
    tLoad: 33,
    tRecv: 30,
    localBias: 0.35,
  },
];

export function OverviewView({ scenario, onChangeScenario, onNavigate }: OverviewViewProps) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  // Interactive Physics Mass-Balance Simulator State
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
    const z20 = robustness20Seed.find((r) => r.model === 'baseline (z-score)');
    const hardBp = prAucScenarios.find((r) => r.model === 'B_plus');
    const hardAdj = prAucScenarios.find((r) => r.model === 'baseline (adj-z-score)');

    return {
      prAucDasar: extractMean(bp20?.PR_AUC ?? '0.732'),
      prAucAdjDasar: extractMean(adj20?.PR_AUC ?? '0.430'),
      prAucZDasar: extractMean(z20?.PR_AUC ?? '0.362'),
      prAucSulit: extractMean(hardBp?.skenario_sulit ?? '0.402'),
      prAucAdjSulit: extractMean(hardAdj?.skenario_sulit ?? '0.079'),
      recallBp: extractMean(bp20?.R ?? '0.745') * 100,
      volRecBp: extractMean(bp20?.vol_rec ?? '0.844') * 100,
      faDropPct:
        ((extractMean(adj20?.FA_per_hari ?? '9.339') -
          extractMean(bp20?.FA_per_hari ?? '7.461')) /
          extractMean(adj20?.FA_per_hari ?? '9.339')) *
        100,
    };
  }, []);

  const uncertaintyRows = tablesData.anggaran_ketidakpastian as {
    komponen: string;
    u_persen_1sigma: number;
  }[];

  const activeStage = NADI_STAGES[activeStageIdx];

  return (
    <div className="w-full">
      {/* BAND 1: EXECUTIVE FRAMING & CALIBRATION CONSOLE HERO */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-9 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blue">IKMS PT Pertamina Patra Niaga 2026</Badge>
                <Badge variant={scenario === 'sulit' ? 'red' : 'green'}>
                  {scenario === 'sulit'
                    ? 'Skenario Sulit (σ = 0,559% · 5eb161c3)'
                    : 'Skenario Dasar (σ = 0,280% · 83a4a949)'}
                </Badge>
                <Badge variant="neutral">20 Replikasi Seed 42–61</Badge>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]">
                Memisahkan <span className="text-[var(--accent-blue)]">Susut Wajar Fisika</span>{' '}
                dari <span className="text-[var(--accent-red)]">Anomali Berisiko</span> di Era Bensin Etanol
              </h1>

              <p className="text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                Insiden dugaan kecurangan awak mobil tangki di{' '}
                <strong className="text-[var(--text-primary)]">Fuel Terminal Tuban (April 2026)</strong>{' '}
                dan gangguan distribusi di{' '}
                <strong className="text-[var(--text-primary)]">Sumatera Utara (Juli 2026)</strong>{' '}
                menegaskan perlunya dasar pembuktian objektif. Padahal, ketidakpastian meter OIML R 117-1
                (±0,3%), ekspansi suhu, penguapan, dan transisi bioetanol{' '}
                <strong className="text-[var(--text-primary)]">E5/E10/E20</strong> membuat{' '}
                <span className="font-mono-num font-semibold">45,7%</span> trip jujur melebihi selisih{' '}
                <span className="font-mono-num">0,2%</span>—sementara pencurian kecil 120 L (0,6% ≈
                Rp1,9 juta/trip) tersamar dari ambang tetap.
              </p>

              {/* Key Performance Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-hairline)]">
                <div className="py-2">
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    PR AUC ({scenario === 'sulit' ? 'Sulit' : 'Dasar'})
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-[var(--accent-blue)] mt-1">
                    <AnimatedCounter
                      value={scenario === 'sulit' ? headlineMetrics.prAucSulit : headlineMetrics.prAucDasar}
                      decimals={3}
                    />
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    vs adj-z{' '}
                    <span className="font-mono-num">
                      {scenario === 'sulit'
                        ? formatNumberId(headlineMetrics.prAucAdjSulit, 3)
                        : formatNumberId(headlineMetrics.prAucAdjDasar, 3)}
                    </span>
                  </p>
                </div>

                <div className="py-2 sm:border-l sm:border-[var(--border-hairline)] sm:pl-3">
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Recall @ Kuota 5%
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-[var(--accent-green)] mt-1">
                    <AnimatedCounter value={headlineMetrics.recallBp} decimals={1} suffix="%" />
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    vs adj-z <span className="font-mono-num">51,1%</span>
                  </p>
                </div>

                <div className="py-2 sm:border-l sm:border-[var(--border-hairline)] sm:pl-3">
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Volume Terjaring
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                    <AnimatedCounter value={headlineMetrics.volRecBp} decimals={1} suffix="%" />
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    vs adj-z <span className="font-mono-num">65,9%</span> (+18,5 pp)
                  </p>
                </div>

                <div className="py-2 sm:border-l sm:border-[var(--border-hairline)] sm:pl-3">
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Alarm Palsu Turun
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-[var(--accent-red)] mt-1">
                    −<AnimatedCounter value={headlineMetrics.faDropPct} decimals={1} suffix="%" />
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    <span className="font-mono-num">9,34 → 7,46</span> per hari
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('cases')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent-blue)] text-white text-xs font-sub font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Buka Kartu Kasus &amp; TreeSHAP
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('benchmarks')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-sub font-semibold hover:border-[var(--accent-blue)] transition-colors"
                >
                  Lihat Uji Ketahanan 20 Seed
                </button>
                <button
                  onClick={() => onChangeScenario(scenario === 'dasar' ? 'sulit' : 'dasar')}
                  className="text-xs font-sub text-[var(--accent-red)] hover:underline ml-auto sm:ml-0"
                >
                  Uji Stress Skenario {scenario === 'dasar' ? 'Sulit →' : 'Dasar →'}
                </button>
              </div>
            </div>

            {/* Right Interactive Architecture Pulse Schematic */}
            <div className="lg:col-span-5">
              <PulseTriageDiagram scenario={scenario} />
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: DARK SPOTLIGHT — 5-STAGE KNOWLEDGE & PHYSICS ARCHITECTURE */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-spotlight)] text-[var(--text-on-spotlight)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-11 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="space-y-2 max-w-2xl">
              <p className="text-[11px] font-sub uppercase tracking-[0.16em] text-sky-400">
                Arsitektur Neraca Aliran Distribusi Intelligence (NADI)
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Lima Tahapan Terpadu: Dari Fisika Metrologi hingga Kartu Kasus Investigator
              </h2>
            </div>
            <p className="text-xs font-sub text-slate-400 max-w-sm">
              Alat triase dan pendukung keputusan, bukan vonis otomatis. Keputusan akhir tetap berada
              pada investigator manusia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Step Selector List */}
            <div className="lg:col-span-5 space-y-2">
              {NADI_STAGES.map((st, idx) => {
                const Icon = st.icon;
                const active = idx === activeStageIdx;
                return (
                  <button
                    key={st.step}
                    onClick={() => setActiveStageIdx(idx)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 rounded-md border transition-all flex items-start gap-3',
                      active
                        ? 'bg-white/10 border-sky-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono-num text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5',
                        active ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-300'
                      )}
                    >
                      {st.step}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm leading-snug flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{st.title}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.plain}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Inspector */}
            <div className="lg:col-span-7 rounded-lg border border-white/15 bg-black/25 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sub text-xs uppercase tracking-widest text-emerald-400">
                    Tahap {activeStage.step} dari 05
                  </span>
                  <Database className="w-4 h-4 text-sky-400 opacity-75" />
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {activeStage.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">{activeStage.detail}</p>
              </div>

              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-sub uppercase tracking-wider text-slate-400">
                    Bukti Kuantitatif Paper
                  </p>
                  <p className="font-mono-num text-sm font-semibold text-sky-300 mt-0.5">
                    {activeStage.metric}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(activeStage.target)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-white text-slate-950 text-xs font-sub font-semibold hover:bg-sky-100 transition-colors shrink-0 self-start sm:self-auto"
                >
                  Eksplorasi Data Tahap Ini
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 3: INTERACTIVE PHYSICS MASS-BALANCE & ASTM D1250 15°C LAB */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-11 lg:py-14 space-y-8">
          <Reveal>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <EditorialHeader
                eyebrow="Laboratorium Rekonsiliasi Fisika Interaktif (Persamaan 2–10)"
                title="Uji Bagaimana Suhu 15 °C & Bias Alat Mengubah Keputusan Triase"
                description="Buktikan sendiri mengapa perbandingan volume mentah sering menjebak investigator: pergeseran suhu 6 °C tampak seperti selisih susut ratusan liter, sementara sesudah koreksi VCF ASTM D1250 dan bias lokal, skor z_adj kembali proporsional."
              />

              <div className="flex flex-wrap gap-1.5">
                {PHYSICS_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setGrade(p.grade);
                      setVLoad(p.vLoad);
                      setVRecv(p.vRecv);
                      setTLoad(p.tLoad);
                      setTRecv(p.tRecv);
                      setLocalBias(p.localBias);
                    }}
                    className="px-2.5 py-1.5 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[11px] font-sub text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Simulator Controls & Output */}
            <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Calculator className="w-4 h-4 text-[var(--accent-blue)]" />
                  Kalkulator Neraca V15 &amp; Anggaran Ketidakpastian
                </span>
                <div className="flex items-center gap-1">
                  {(['E10', 'E20', 'E50'] as EthanolGrade[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-sub font-semibold border transition-colors',
                        grade === g
                          ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)]'
                          : 'border-[var(--border-hairline)] text-[var(--text-muted)]'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Volume Muat Terminal (L)</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatNumberId(vLoad)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={16000}
                    max={24000}
                    step={100}
                    value={vLoad}
                    onChange={(e) => setVLoad(Number(e.target.value))}
                    className="w-full accent-[var(--accent-blue)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Volume Terima SPBU (L)</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatNumberId(vRecv)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15500}
                    max={24000}
                    step={20}
                    value={vRecv}
                    onChange={(e) => setVRecv(Number(e.target.value))}
                    className="w-full accent-[var(--accent-blue)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Suhu Muat T_load (°C)</span>
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
                    <span className="text-[var(--text-muted)]">Suhu Terima T_recv (°C)</span>
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
                      Koreksi Bias Lokal Gabungan SPBU + Terminal + Truk (%)
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">
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

              {/* Computed Output Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--border-hairline)]">
                <div>
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Selisih Mentah
                  </p>
                  <p className="font-mono-num text-base font-bold text-[var(--text-primary)]">
                    {formatNumberId(physicsResult.rawDiffLiters, 0)} L
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    ({formatNumberId(physicsResult.rawDiffPct, 3)}%)
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Residual 15 °C
                  </p>
                  <p className="font-mono-num text-base font-bold text-[var(--accent-blue)]">
                    {formatNumberId(physicsResult.reconciledDiffPct, 3)}%
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    {formatNumberId(physicsResult.reconciledDiffLiters, 0)} L @15°C
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Residual Bersih (resid_adj)
                  </p>
                  <p className="font-mono-num text-base font-bold text-[var(--accent-green)]">
                    {formatNumberId(physicsResult.residualAfterBiasPct, 3)}%
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    σ_{grade} = {formatNumberId(physicsResult.sigmaPct, 3)}%
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Skor z_adj
                  </p>
                  <p
                    className={cn(
                      'font-mono-num text-base font-bold',
                      physicsResult.verdictSeverity === 'alert'
                        ? 'text-[var(--accent-red)]'
                        : physicsResult.verdictSeverity === 'watch'
                          ? 'text-[var(--accent-amber)]'
                          : 'text-[var(--accent-green)]'
                    )}
                  >
                    {formatNumberId(physicsResult.zAdj, 2)}σ
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    z_raw: {formatNumberId(physicsResult.zRaw, 2)}σ
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  'px-3.5 py-2.5 rounded border text-xs font-sub flex items-center justify-between gap-3',
                  physicsResult.verdictSeverity === 'alert'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    : physicsResult.verdictSeverity === 'watch'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                )}
              >
                <span>{physicsResult.verdictLabel}</span>
                <span className="font-mono-num shrink-0">
                  VCF_load={physicsResult.vcfLoad.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Right Column: VCF Curve E10/E20/E50 + OIML Budget */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                      Kurva Ekspansi Termal ASTM D1250
                    </p>
                    <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                      Penurunan VCF pada Suhu Tinggi (E50 Lebih Curam)
                    </h3>
                  </div>
                </div>
                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vcfAstmTable} margin={{ top: 6, right: 12, left: -8, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                      <XAxis
                        dataKey="suhu_C"
                        tickFormatter={(v) => `${v}°C`}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <YAxis
                        domain={[0.96, 1]}
                        tickFormatter={(v) => v.toFixed(3)}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-strong)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="VCF_E10"
                        name="E10 (α=0,00095)"
                        stroke="#0057a3"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="VCF_E20"
                        name="E20 (α=0,00098)"
                        stroke="#0f8a4b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="VCF_E50"
                        name="E50 (α=0,00110)"
                        stroke="#d11a2a"
                        strokeWidth={2.2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Anggaran Ketidakpastian Kuadratur (1σ — Skenario Dasar)
                </p>
                <div className="divide-y divide-[var(--border-hairline)] text-xs">
                  {uncertaintyRows.map((u) => {
                    const isTotal = u.komponen.toLowerCase().includes('gabungan');
                    return (
                      <div key={u.komponen} className="py-1.5 flex items-center justify-between">
                        <span
                          className={cn(
                            isTotal ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          )}
                        >
                          {u.komponen}
                        </span>
                        <span
                          className={cn(
                            'font-mono-num',
                            isTotal ? 'font-bold text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'
                          )}
                        >
                          ±{formatNumberId(u.u_persen_1sigma, 3)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-[11px] text-[var(--text-muted)] leading-relaxed flex items-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                  <span>
                    Pada skenario sulit, setiap komponen ketidakpastian digandakan menjadi{' '}
                    <strong className="font-mono-num text-[var(--text-primary)]">
                      σ_gabungan = 0,559%
                    </strong>{' '}
                    (E50 dikali pengali noise 1,4×).
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

