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
  BookOpen,
  Calculator,
  Compass,
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

const LITERATURE_GAPS = [
  {
    code: 'CELAH 01',
    title: 'Sensor Tangki Terpisah Tanpa Neraca Massa Rantai',
    desc: 'Pendekatan berbasis perangkat keras sensor memantau volume tangki kendaraan secara terpisah, sehingga tidak merekonsiliasi selisih volume lintas Terminal–Mobil Tangki–SPBU.',
  },
  {
    code: 'CELAH 02',
    title: 'Detektor Umum Tanpa Model Susut Wajar',
    desc: 'Algoritma anomali umum mencampuradukkan derau alat ukur (OIML R 117-1) dan bias lokal ATG/truk dengan sinyal pencurian, menghasilkan banjir alarm palsu.',
  },
  {
    code: 'CELAH 03',
    title: 'Kendala Kuota Audit & Label Tertunda Belum Dimodelkan',
    desc: 'Di lapangan, investigator hanya mampu memeriksa sebagian kecil trip per hari (5%) dan hasil verifikasi baru terbuka beberapa hari kemudian (delay +3 hari).',
  },
  {
    code: 'CELAH 04',
    title: 'Ketidakpastian Campuran Etanol Belum Eksplisit',
    desc: 'Transisi E5 (Sem II 2026) menuju E10/E20 meningkatkan koefisien muai termal serta risiko pemisahan fase air–etanol yang memperlebar ruang kamuflase susut mikro.',
  },
];

const NADI_STAGES = [
  {
    step: '01',
    title: 'Simulasi Terkontrol Transisi Etanol & Kasus Pembanding',
    plain: '49.508 perjalanan (3 Terminal, 120 SPBU, 150 Kru, 100 Truk, 180 hari)',
    detail:
      'Membangkitkan pengiriman berdistribusi Poisson (rerata 2,3 trip/SPBU/hari, 16–24 kL) dengan bauran E10 (50%), E20 (35%), dan skenario uji tekanan E50 (15%). Simulasi menyuntikkan empat modus penyimpangan (M1–M4) sekaligus kasus pembanding jujur: bias ATG (8% SPBU, ±0,30–0,60%), bias meter truk (8% truk, ±0,20–0,50%), drift terminal hingga 0,30%, air E50 (4% trip), serta 10 kru decoy yang sering berhenti istirahat.',
    metric: '1.086 perjalanan anomali · Total curian sintetis 144.560 Liter (Seed 42)',
    target: 'physics-graph' as NavTabId,
    icon: Flame,
  },
  {
    step: '02',
    title: 'Rekonsiliasi Fisika ASTM D1250 15°C & Koreksi Bias Bertingkat',
    plain: 'Memisahkan muai termal & karakter kalibrasi alat sebelum menilai kejanggalan',
    detail:
      'Volume muat (N(32;3²)°C) dan terima (N(30;3²)°C) dikoreksi ke suhu acuan 15 °C menggunakan pendekatan eksponensial VCF sesuai kelas produk (α E10=0,00095; E20=0,00098; E50=0,00110 °C⁻¹). Selanjutnya, residual dibersihkan secara kausal memakai median historis SPBU (min 5 observasi), median terminal (min 10), dan rerata z-score truk sebelumnya.',
    metric: 'Korelasi residual vs bias ATG anjlok dari r = 0,933 menjadi r = 0,104',
    target: 'physics-graph' as NavTabId,
    icon: Scale,
  },
  {
    step: '03',
    title: '29 Indikator Perilaku, Riwayat Kru CUSUM/EWMA & Graf Kolusi',
    plain: 'Menangkap pola akumulasi mikro berulang & komplotan kru–SPBU',
    detail:
      'Karena 12,6% anomali berukuran < 1σ dan hanya 58,5% yang melewati persentil ke-95 trip wajar, NADI merangkai 29 indikator kausal: interaksi z_adj dengan log(durasi berhenti) (inter_z_stop, kontributor nomor 1), deviasi rute GPS, CUSUM (k=0,25) & EWMA kru, klaster stop liar DBSCAN (eps=0,06, min 12 titik), dan metrik kelebihan residual pasangan kru–SPBU (excess_crew).',
    metric: 'Verifikasi kausalitas hari ke-100: selisih maks 29 fitur = 0,000 (Zero Leakage)',
    target: 'physics-graph' as NavTabId,
    icon: GitBranch,
  },
  {
    step: '04',
    title: 'Model Hibrida B_plus (75%) + IF_AAD (25%) & Umpan Balik Tertunda',
    plain: 'Pembelajaran aktif mingguan dari hasil investigasi berderau (+3 hari)',
    detail:
      'Setiap hari t, label hasil audit dari hari t−3 dibuka (dengan asumsi galat realistis: 20% anomali terlewat & 1% salah positif). Model dilatih ulang tiap 7 hari bila tersedia ≥ 80 label. Kuota harian 5% diisi oleh campuran 75% peringkat LightGBM terkalibrasi (B_plus) dan 25% Isolation Forest Adaptif (IF_AAD) agar sistem tetap waspada terhadap pelaku baru.',
    metric: 'PR AUC 0,732 (Dasar) · 0,402 (Sulit) dibanding adj-z 0,430 / 0,079',
    target: 'benchmarks' as NavTabId,
    icon: Activity,
  },
  {
    step: '05',
    title: 'Kartu Kasus Triase Tiga Tingkat & Penjelasan TreeSHAP Eksak',
    plain: 'Menghasilkan dugaan sebab & 3 faktor numerik pendorong, bukan vonis otomatis',
    detail:
      'Skor harian dikelompokkan menjadi Tier 1 Segera (5% teratas sesuai kapasitas audit), Tier 2 Prioritas (5–20%), dan Tier 3 Pantau. Aturan berurutan menghasilkan dugaan modus (hotspot/tak terdaftar, kolusi, CUSUM mikro, selisih tinggi/ATG, akumulasi umum) disertai rekomendasi inspeksi serta 3 atribut TreeSHAP eksak per perjalanan.',
    metric: 'Top 12 Kartu Kasus Uji: 100% terbukti anomali · 7 kasus oleh Kru C071',
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
    const hardBp = prAucScenarios.find((r) => r.model === 'B_plus');
    const hardAdj = prAucScenarios.find((r) => r.model === 'baseline (adj-z-score)');

    return {
      prAucDasar: extractMean(bp20?.PR_AUC ?? '0.732'),
      prAucAdjDasar: extractMean(adj20?.PR_AUC ?? '0.430'),
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
      {/* WORKSPACE HEADER: EXECUTIVE NARRATIVE + LIVE SCHEMATIC */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Narrative & Context Column */}
          <div className="xl:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">IKMS PT Pertamina Patra Niaga 2026</Badge>
              <Badge variant={scenario === 'sulit' ? 'red' : 'green'}>
                {scenario === 'sulit'
                  ? 'Skenario Sulit · σ 0,559% (5eb161c3)'
                  : 'Skenario Dasar · σ 0,280% (83a4a949)'}
              </Badge>
              <Badge variant="neutral">Arsip Replikasi v2.1 · 20 Seed</Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]">
              Memisahkan <span className="text-[var(--accent-blue)]">Susut Wajar Fisika</span> dari{' '}
              <span className="text-[var(--accent-red)]">Anomali Berisiko</span> dalam Rantai
              Distribusi Bensin Etanol
            </h1>

            <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p>
                Pemerintah melalui <strong>Kepmen ESDM Nomor 113.K/EK.05/MEM.E/2026</strong>{' '}
                mewajibkan pencampuran bioetanol 5% (E5) pada bensin nonsubsidi mulai semester II 2026
                dan menargetkan mandatori E10 paling lambat 2028. Bagi{' '}
                <strong>PT Pertamina Patra Niaga</strong>, perubahan produk ini terjadi tepat di
                tengah tantangan akuntabilitas pengiriman dari Terminal, Mobil Tangki, hingga SPBU.
              </p>
              <p>
                Pada <strong>April 2026</strong>, dugaan kecurangan awak mobil tangki di{' '}
                <strong>Fuel Terminal BBM Tuban</strong> berujung pemutusan hubungan kerja dan
                memicu aksi mogok yang mengancam distribusi wilayah. Pada <strong>Juli 2026</strong>,
                antrean panjang di <strong>Sumatera Utara dan Medan</strong> juga dipicu laporan
                kecurangan pengemudi—bukan kekosongan stok. Insiden ini menuntut dasar pembuktian
                yang objektif agar sanksi dan audit tidak jatuh secara reaktif atau keliru sasaran.
              </p>
              <p className="border-l-2 border-[var(--accent-blue)] pl-3.5 text-xs sm:text-[13px] bg-[var(--bg-canvas)] py-2.5 pr-3 rounded-r">
                <strong className="text-[var(--text-primary)]">Mengapa Angka Susut Selalu Abu-abu?</strong>{' '}
                Secara fisik, penguapan hidrokarbon, sisa di pipa (<em>holdup</em>), muai suhu, dan
                ketidakpastian meter dinamis OIML R 117-1 (kelas 0,3 = ±0,3%) menyebabkan{' '}
                <strong className="font-mono-num">45,7%</strong> pengiriman jujur melampaui selisih{' '}
                <span className="font-mono-num">0,2%</span>. Sebaliknya, pencurian{' '}
                <span className="font-mono-num">120 liter</span> dari muatan 20 kL hanya{' '}
                <span className="font-mono-num">0,6%</span> (bernilai{' '}
                <strong>~Rp1,9 juta</strong> @ Rp15.950/L Pertamax), dan pada skala 9 juta kL/tahun
                Pertamax series (~Rp144 triliun), susut mikro{' '}
                <span className="font-mono-num">0,015%</span> saja sudah setara sensitivitas{' '}
                <strong>~Rp22 miliar/tahun</strong>.
              </p>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-hairline)]">
              <div className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  PR AUC ({scenario === 'sulit' ? 'Sulit' : 'Dasar'})
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-blue)] mt-1">
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

              <div className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Recall @ Kuota 5%
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-green)] mt-1">
                  <AnimatedCounter value={headlineMetrics.recallBp} decimals={1} suffix="%" />
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  vs adj-z <span className="font-mono-num">51,1%</span>
                </p>
              </div>

              <div className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Volume Terjaring
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)] mt-1">
                  <AnimatedCounter value={headlineMetrics.volRecBp} decimals={1} suffix="%" />
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  vs <span className="font-mono-num">65,9%</span> (+18,5 pp)
                </p>
              </div>

              <div className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Alarm Palsu Turun
                </p>
                <p className="font-mono-num text-2xl font-bold text-[var(--accent-red)] mt-1">
                  −<AnimatedCounter value={headlineMetrics.faDropPct} decimals={1} suffix="%" />
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  <span className="font-mono-num">9,34 → 7,46</span>/hari
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('cases')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent-blue)] text-white text-xs font-sub font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
              >
                Periksa Kartu Kasus &amp; TreeSHAP
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('benchmarks')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-sub font-semibold hover:border-[var(--accent-blue)] transition-colors"
              >
                Eksplorasi Uji 20 Replikasi
              </button>
              <button
                onClick={() => onChangeScenario(scenario === 'dasar' ? 'sulit' : 'dasar')}
                className="text-xs font-sub text-[var(--accent-red)] hover:underline"
              >
                Simulasi {scenario === 'dasar' ? 'Skenario Sulit →' : 'Skenario Dasar →'}
              </button>
            </div>
          </div>

          {/* Right Schematic + 4 Literature Gaps */}
          <div className="xl:col-span-5 space-y-4">
            <PulseTriageDiagram scenario={scenario} />

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  <Compass className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                  Empat Celah Literatur yang Ditutup NADI
                </span>
                <span className="font-mono-num text-[10px] text-[var(--text-muted)]">Bagian 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                {LITERATURE_GAPS.map((g) => (
                  <div
                    key={g.code}
                    className="p-2.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs space-y-0.5"
                  >
                    <p className="font-sub font-bold text-[11px] text-[var(--accent-blue)]">
                      {g.code} · {g.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 5-STAGE MANUSCRIPT & ARCHITECTURE INSPECTOR */}
      <section className="px-4 sm:px-6 lg:px-8 py-9 border-b border-[var(--border-hairline)] bg-[var(--bg-spotlight)] text-[var(--text-on-spotlight)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-[10.5px] font-sub uppercase tracking-[0.16em] text-sky-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Alur Penelitian &amp; Kodifikasi Pengetahuan (Gambar 1 Paper)
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Dari Pengukuran NGS–SmartMT–ATG Menjadi Triase Keputusan Investigator
            </h2>
          </div>
          <p className="text-xs font-sub text-slate-400 max-w-sm">
            Pilih tahapan 01–05 di sebelah kiri untuk membaca rincian mekanisme dan validasinya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-5 space-y-2">
            {NADI_STAGES.map((st, idx) => {
              const Icon = st.icon;
              const active = idx === activeStageIdx;
              return (
                <button
                  key={st.step}
                  onClick={() => setActiveStageIdx(idx)}
                  className={cn(
                    'w-full text-left px-3.5 py-3 rounded-md border transition-all flex items-start gap-3',
                    active
                      ? 'bg-white/10 border-sky-400 text-white'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                  )}
                >
                  <span
                    className={cn(
                      'font-mono-num text-[11px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5',
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
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{st.plain}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 rounded-lg border border-white/15 bg-black/25 p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sub text-xs uppercase tracking-widest text-emerald-400">
                  Tahap {activeStage.step} · Mekanisme Sistem
                </span>
                <Database className="w-4 h-4 text-sky-400 opacity-75" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeStage.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">{activeStage.detail}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-slate-400">
                  Capaian Terukur Paper
                </p>
                <p className="font-mono-num text-sm font-semibold text-sky-300 mt-0.5">
                  {activeStage.metric}
                </p>
              </div>
              <button
                onClick={() => onNavigate(activeStage.target)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-white text-slate-950 text-xs font-sub font-semibold hover:bg-sky-100 transition-colors shrink-0 self-start sm:self-auto"
              >
                Buka Modul Data Terkait
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE PHYSICS MASS-BALANCE & VCF 15°C LAB */}
      <section className="px-4 sm:px-6 lg:px-8 py-9 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-6">
        <Reveal>
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <EditorialHeader
              eyebrow="Bagian 2.3 · Laboratorium Rekonsiliasi Fisika ASTM D1250"
              title="Uji Bagaimana Koreksi Suhu 15 °C & Bias Alat Mengubah Skor Risiko"
              description="Volume cairan hidrokarbon dan bioetanol memuai saat panas di terminal lalu menyusut ketika dingin saat bongkar di SPBU. Tanpa faktor koreksi volume (VCF) ke 15 °C dan pengurangan bias historis lokal, pengiriman jujur di hari panas mudah terhitung sebagai susut berlebih."
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Interactive Controls */}
          <div className="xl:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Calculator className="w-4 h-4 text-[var(--accent-blue)]" />
                Simulator Neraca Muat–Terima (Persamaan 4–10)
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
                    Estimasi Bias Lokal Gabungan SPBU + Terminal + Truk (%)
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
                  Residual @15 °C
                </p>
                <p className="font-mono-num text-base font-bold text-[var(--accent-blue)]">
                  {formatNumberId(physicsResult.reconciledDiffPct, 3)}%
                </p>
                <p className="text-[11px] font-mono-num text-[var(--text-muted)]">
                  {formatNumberId(physicsResult.reconciledDiffLiters, 0)} L
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

          {/* Right Column: VCF Curve + OIML Uncertainty Budget + Narrative */}
          <div className="xl:col-span-5 space-y-5">
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Kurva Faktor Koreksi Volume ASTM D1250 (Tabel Paper)
                </p>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                  Sensitivitas Ekspansi Termal Campuran Etanol E10–E50
                </h3>
              </div>
              <div className="h-[200px] w-full">
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
                    <Line type="monotone" dataKey="VCF_E10" name="E10 (0,00095)" stroke="#0369a1" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="VCF_E20" name="E20 (0,00098)" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="VCF_E50" name="E50 (0,00110)" stroke="#e11d48" strokeWidth={2.2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Pada suhu 40 °C, 1 liter muatan E50 hanya setara <strong>0,9723 L</strong> pada 15 °C
                (susut termal ~2,77% bila langsung dibandingkan dingin). Koreksi VCF menekan korelasi
                residual dengan suhu menjadi mendekati nol (<code>r = −0,0002</code>).
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-2.5">
              <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Anggaran Ketidakpastian Kuadratur OIML R 117-1 (1σ Dasar)
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
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed flex items-start gap-1.5 pt-1">
                <Layers className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0 mt-0.5" />
                <span>
                  Bila selisih volume masih setara ketidakpastian alat, NADI mencegah penyelidikan
                  prematur—lalu menggandeng indikator perilaku &amp; riwayat kru untuk membongkar
                  pencurian berulang di bawah radar 1σ.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
