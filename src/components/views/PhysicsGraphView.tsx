import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarClock,
  CheckCircle2,
  Expand,
  FileSpreadsheet,
  FlaskConical,
  GitBranch,
  Images,
  Network,
  Radar,
  ShieldAlert,
} from 'lucide-react';
import {
  cekRealisme,
  collusionEval,
  featureImportance,
  hotspotSummary,
  kamusData,
  PAPER_FIGURES,
  residualSources,
  tablesData,
  temporalSplit,
} from '../../data';
import type { KamusDataRow, PaperFigureItem } from '../../types/nadi';
import { cn } from '../../utils/cn';
import { formatNumberId } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { FigureLightbox } from '../ui/FigureLightbox';

type LabSubTab = 'physics' | 'graph' | 'figures';

export function PhysicsGraphView() {
  const [subTab, setSubTab] = useState<LabSubTab>('physics');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Tier 1' | 'Tier 2' | 'Tier 3'>('ALL');
  const [figCategory, setFigCategory] = useState<'ALL' | PaperFigureItem['category']>('ALL');
  const [activeFigure, setActiveFigure] = useState<PaperFigureItem | null>(null);

  const filteredKamus = useMemo(() => {
    if (tierFilter === 'ALL') return kamusData;
    return kamusData.filter((d) => d.tier === tierFilter);
  }, [tierFilter]);

  const filteredFigs = useMemo(() => {
    if (figCategory === 'ALL') return PAPER_FIGURES;
    return PAPER_FIGURES.filter((f) => f.category === figCategory);
  }, [figCategory]);

  const causalCheckCount = useMemo(() => {
    const row = (tablesData.uji_kausalitas_fitur as Record<string, number>[])[0] ?? {};
    const vals = Object.values(row);
    const maxLeak = vals.length ? Math.max(...vals.map((v) => Math.abs(v))) : 0;
    return { featureCount: vals.length, maxLeak };
  }, []);

  const collusionClusters = useMemo(
    () =>
      (tablesData.ringkasan_struktur_kolusi as {
        pasangan: number;
        crew: number;
        spbu: number;
        kuat_rata: number;
        skala_rata: number;
      }[]) ?? [],
    []
  );

  const kamusCols: ColumnDef<KamusDataRow>[] = [
    {
      key: 'kode',
      header: 'Kode',
      sortValue: (r) => r.kode,
      render: (r) => <span className="font-mono-num font-bold text-[var(--accent-blue)]">{r.kode}</span>,
    },
    {
      key: 'fitur',
      header: 'Indikator / Fitur Rekayasa',
      sortValue: (r) => r.fitur,
      render: (r) => <span className="font-mono-num font-semibold text-[var(--text-primary)]">{r.fitur}</span>,
    },
    {
      key: 'tier',
      header: 'Tier',
      align: 'center',
      sortValue: (r) => r.tier,
      render: (r) => (
        <Badge
          variant={r.tier === 'Tier 1' ? 'blue' : r.tier === 'Tier 2' ? 'green' : 'teal'}
        >
          {r.tier}
        </Badge>
      ),
    },
    {
      key: 'satuan',
      header: 'Satuan',
      render: (r) => <span className="font-mono-num text-[var(--text-muted)]">{r.satuan}</span>,
    },
    {
      key: 'sumber',
      header: 'Sumber Operasional Pertamina Patra Niaga',
      render: (r) => <span className="text-xs text-[var(--text-secondary)]">{r.sumber_di_lapangan}</span>,
    },
  ];

  const hotspotOutside = hotspotSummary.find((h) => h.in_hotspot === 0);
  const hotspotInside = hotspotSummary.find((h) => h.in_hotspot === 1);

  return (
    <div className="w-full">
      {/* DARK-SLATE LABORATORY SUB-CONSOLE SWITCHER */}
      <section className="bg-[var(--bg-rail)] text-slate-100 border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <p className="font-mono-num text-[10.5px] uppercase tracking-[0.16em] text-sky-400">
                Laboratorium Verifikasi RQ1 · Bagian 2.4 &amp; 3.1–3.2 Paper NADI
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Dekomposisi Residual, Kausalitas 29 Fitur &amp; Graf Kolusi Bipartit
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Menjelaskan bagaimana koreksi termal, pengurangan bias lokal, klaster stop DBSCAN, dan{' '}
                <code className="font-mono-num text-sky-300">excess_crew</code> memisahkan susut
                etanol wajar dari aktivitas menyimpang tanpa kebocoran informasi masa depan.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-900/70 p-1 rounded-lg border border-slate-700/80 shrink-0 text-xs font-sub">
              <button
                onClick={() => setSubTab('physics')}
                className={cn(
                  'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors',
                  subTab === 'physics'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Dekomposisi &amp; Kausalitas
              </button>
              <button
                onClick={() => setSubTab('graph')}
                className={cn(
                  'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors',
                  subTab === 'graph'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <Network className="w-3.5 h-3.5" />
                29 Fitur, Kamus &amp; Graf
              </button>
              <button
                onClick={() => setSubTab('figures')}
                className={cn(
                  'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors',
                  subTab === 'figures'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <Images className="w-3.5 h-3.5" />
                Arsip 20 Figur ({PAPER_FIGURES.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE SUB-VIEW CONTENT */}
      <section className="py-8 lg:py-10 bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {subTab === 'physics' && (
            <>
              {/* 3-Step Horizontal Equation Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
                <div className="p-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] border-t-2 border-t-[var(--accent-blue)] space-y-1.5">
                  <p className="font-mono-num text-[10px] font-bold text-[var(--accent-blue)]">
                    LANGKAH 01 · PERSAMAAN (1–6)
                  </p>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                    Normalisasi Suhu ASTM D1250 15 °C
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Menghapus bias muai ΔT antar-terminal dan SPBU. Sisa selisih terdiri atas
                    penguapan <em>flash</em>, sisa pipa tangki (<em>holdup</em>), serta derau alat
                    ukur OIML σ = 0,280%.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] border-t-2 border-t-[var(--accent-green)] space-y-1.5">
                  <p className="font-mono-num text-[10px] font-bold text-[var(--accent-green)]">
                    LANGKAH 02 · PERSAMAAN (8–10)
                  </p>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                    Pengurangan Bias Kausal Bertingkat
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Memakai median historis SPBU (min 5), median terminal (min 10), dan rerata truk
                    sebelum waktu <em>t</em>. Menekan korelasi residual dengan bias tangki ATG
                    SPBU dari <strong>r = 0,933 → 0,104</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] border-t-2 border-t-[var(--accent-red)] space-y-1.5">
                  <p className="font-mono-num text-[10px] font-bold text-[var(--accent-red)]">
                    LANGKAH 03 · PEMISAHAN E50 &amp; ANOMALI
                  </p>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                    Menjebak False Alarm Air-Etanol E50
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Hanya <strong>58,5%</strong> trip curang melampaui p95 perjalanan wajar,
                    sementara kontaminasi air E50 mencatat median residual{' '}
                    <strong className="font-mono-num">0,616%</strong>—membutuhkan konteks fitur
                    perilaku agar tak tertukar dengan pencurian.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Residual Histogram + 180-day Temporal Bar */}
                <div className="lg:col-span-7 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                        Median Residual Menurut Sumber Fenomena (%)
                      </p>
                      <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                        Air Etanol E50 (0,616%) Menyerupai Besaran Anomali Mikro
                      </h3>
                    </div>
                    <Badge variant="amber">41,5% Anomali &lt; p95 Wajar</Badge>
                  </div>

                  <div className="h-[255px] w-full bg-telemetry-grid rounded border border-[var(--border-hairline)] p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={residualSources}
                        margin={{ top: 8, right: 16, left: -6, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                        <XAxis
                          dataKey="sumber"
                          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                        />
                        <YAxis
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        />
                        <Tooltip
                          formatter={(val: number) => `${formatNumberId(val, 3)}%`}
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-strong)',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="median" name="Median Residual (%)" radius={[4, 4, 0, 0]}>
                          {residualSources.map((entry) => (
                            <Cell
                              key={entry.sumber}
                              fill={
                                entry.sumber === 'anomali'
                                  ? '#e11d48'
                                  : entry.sumber === 'air etanol'
                                    ? '#b45309'
                                    : '#0369a1'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Proportional 180-Day Temporal Horizon Bar */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between text-[10.5px] font-sub text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                        <CalendarClock className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                        Garis Waktu Partisi Berurutan 180 Hari (49.508 Trip · Non-Shuffled)
                      </span>
                      <span>Aktor Baru Terus Muncul di Uji</span>
                    </div>

                    <div className="flex h-3 rounded-full overflow-hidden border border-[var(--border-hairline)]">
                      <div className="w-[60%] bg-[var(--accent-blue)]" title="Latih: Hari 1–108 (60%)" />
                      <div className="w-[20%] bg-[var(--accent-amber)]" title="Validasi: Hari 109–144 (20%)" />
                      <div className="w-[20%] bg-[var(--accent-red)]" title="Uji: Hari 145–180 (20%)" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {temporalSplit.map((sp) => (
                        <div
                          key={sp.split}
                          className="p-2.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                        >
                          <div className="flex justify-between font-sub text-[10px]">
                            <strong className="uppercase text-[var(--accent-blue)]">
                              {sp.split === 'train'
                                ? 'Latih (60%)'
                                : sp.split === 'val'
                                  ? 'Validasi (20%)'
                                  : 'Uji (20%)'}
                            </strong>
                            <span className="font-mono-num text-[var(--text-muted)]">
                              Hr {sp.hari_awal}–{sp.hari_akhir}
                            </span>
                          </div>
                          <p className="font-mono-num font-bold text-[var(--text-primary)] mt-0.5">
                            {formatNumberId(sp.trip)} trip · {sp.anomali} anomali
                          </p>
                          <p className="font-mono-num text-[10px] text-[var(--text-muted)]">
                            Prevalensi {formatNumberId(sp.prevalensi * 100, 2)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Realism & Day-100 Zero Leakage Proof Ledger */}
                <div className="lg:col-span-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                      Register Audit Realisme &amp; Uji Bebas Kebocoran
                    </p>
                    <Badge variant="green">
                      <CheckCircle2 className="w-3 h-3" /> 100% Terverifikasi
                    </Badge>
                  </div>

                  <div className="divide-y divide-[var(--border-hairline)] text-xs">
                    {cekRealisme.slice(0, 8).map((c) => (
                      <div key={c.pemeriksaan} className="py-2 flex items-center justify-between gap-3">
                        <span className="text-[var(--text-secondary)]">{c.pemeriksaan}</span>
                        <span className="font-mono-num font-semibold text-[var(--text-primary)] shrink-0">
                          {c.nilai > 100
                            ? `${formatNumberId(c.nilai, 0)} L`
                            : formatNumberId(c.nilai, 4)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] text-xs space-y-1.5">
                    <p className="font-sub font-bold text-emerald-700 dark:text-emerald-300">
                      Uji Pemotongan Waktu Hari ke-100:
                    </p>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Seluruh{' '}
                      <strong className="font-mono-num">{causalCheckCount.featureCount}</strong>{' '}
                      indikator dihitung ulang hanya dari catatan masa lalu ≤ hari ke-100 lalu
                      dibandingkan dengan dataset lengkap. Selisih numerik maksimum:{' '}
                      <strong className="font-mono-num">{causalCheckCount.maxLeak.toFixed(4)}</strong>{' '}
                      (membuktikan nol kebocoran masa depan).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {subTab === 'graph' && (
            <div className="space-y-8">
              {/* Row 1: Feature Importance vs Kamus Data */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--accent-blue)]">
                      Kontribusi Global LightGBM B_plus
                    </p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mt-0.5">
                      36,3% Kekuatan Bertumpu pada Stop, Deviasi Rute &amp; Kru
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      <code className="font-mono-num">inter_z_stop</code> (14,9%) memadukan residual
                      dengan log(durasi stop) sehingga sopir istirahat dengan susut nol tak terjaring.
                    </p>
                  </div>

                  <div className="h-[310px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={featureImportance}
                        layout="vertical"
                        margin={{ top: 4, right: 20, left: 20, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                        <XAxis
                          type="number"
                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="fitur"
                          width={118}
                          tick={{
                            fontSize: 10.5,
                            fill: 'var(--text-primary)',
                            fontFamily: 'IBM Plex Mono',
                          }}
                        />
                        <Tooltip
                          formatter={(v: number) => `${formatNumberId(v * 100, 2)}% gain relatif`}
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-strong)',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="gain_relatif" name="Gain Relatif" radius={[0, 4, 4, 0]}>
                          {featureImportance.map((f, idx) => (
                            <Cell
                              key={f.fitur}
                              fill={idx < 3 ? '#0369a1' : idx < 6 ? '#15803d' : '#0f766e'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Searchable Operational Kamus Data Table */}
                <div className="lg:col-span-7 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                        Kamus Data Operasional Pertamina Patra Niaga (D1–D16)
                      </p>
                      <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                        Pemetaan Indikator ke Tier Arsitektur (1–3)
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1 text-xs font-sub">
                      {(['ALL', 'Tier 1', 'Tier 2', 'Tier 3'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTierFilter(tf)}
                          className={cn(
                            'px-2.5 py-1 rounded border transition-colors',
                            tierFilter === tf
                              ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                              : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                          )}
                        >
                          {tf === 'ALL' ? 'Semua' : tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DataTable
                    data={filteredKamus}
                    columns={kamusCols}
                    rowKey={(r) => r.kode}
                    maxHeightClass="max-h-[345px]"
                    searchPlaceholder="Cari D11, CUSUM, pair_zscore, atau NGS/ATG..."
                    searchMatcher={(r, q) =>
                      `${r.kode} ${r.fitur} ${r.tier} ${r.sumber_di_lapangan}`
                        .toLowerCase()
                        .includes(q)
                    }
                  />
                </div>
              </div>

              {/* Row 2: Spatial DBSCAN vs Bipartite Collusion Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                      <Radar className="w-4 h-4 text-[var(--accent-red)]" />
                      Klaster Spasial DBSCAN Stop Tak Terdaftar
                    </span>
                    <Badge variant="red">ε = 0,06 · min = 12</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Dijalankan ulang tiap 7 hari hanya pada koordinat berhenti historis (tanpa daftar
                    koordinat ilegal pradefinisi). Prevalensi anomali di dalam klaster hotspot
                    mencapai <strong>12,5×</strong> lebih tinggi.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
                      <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                        Luar Hotspot
                      </p>
                      <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)] mt-1">
                        {formatNumberId((hotspotOutside?.prevalensi ?? 0.01485) * 100, 2)}%
                      </p>
                      <p className="text-[11px] font-mono-num text-[var(--text-muted)] mt-0.5">
                        {formatNumberId(hotspotOutside?.jumlah_trip ?? 47451)} trip
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-500/[0.06]">
                      <p className="text-[10px] font-sub uppercase text-[var(--accent-red)]">
                        Dalam Hotspot
                      </p>
                      <p className="font-mono-num text-2xl font-bold text-[var(--accent-red)] mt-1">
                        {formatNumberId((hotspotInside?.prevalensi ?? 0.18522) * 100, 2)}%
                      </p>
                      <p className="text-[11px] font-mono-num text-[var(--text-muted)] mt-0.5">
                        {formatNumberId(hotspotInside?.jumlah_trip ?? 2057)} trip
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-amber)] shrink-0 mt-0.5" />
                    Saat peluang jejak GPS turun menjadi 0,55 di Skenario Sulit, fitur riwayat kru
                    &amp; graf mengompensasi hilangnya sinyal berhenti.
                  </p>
                </div>

                <div className="lg:col-span-7 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                      <Network className="w-4 h-4 text-[var(--accent-blue)]" />
                      Graf Kolusi Kru–SPBU (28 Pasangan Nyata / 1.239 Kandidat)
                    </span>
                    <Badge variant="green">Precision@20 = 75,0% (15/20 Terbukti)</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {collusionEval.map((c) => (
                      <div
                        key={c.metode}
                        className={cn(
                          'p-3 rounded-lg border',
                          c.metode === 'excess_crew'
                            ? 'border-[var(--accent-blue)] bg-sky-500/10'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
                        )}
                      >
                        <p className="font-sub text-xs font-bold text-[var(--text-primary)]">
                          {c.metode}
                        </p>
                        <p className="font-mono-num text-xl font-bold text-[var(--accent-blue)] mt-1">
                          {formatNumberId(c.AP, 3)}
                        </p>
                        <p className="text-[10px] font-mono-num text-[var(--text-muted)]">
                          AP · AUC {formatNumberId(c.AUC, 3)}
                        </p>
                        <p className="text-[10px] font-mono-num text-[var(--text-secondary)] mt-1">
                          P@k: {formatNumberId(c.P_at_k * 100, 1)}%
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-1">
                      <p className="font-sub font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                        Keunggulan excess_crew vs Modularitas
                      </p>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        Partisi modularitas menghasilkan <strong>ARI = 1,000</strong> terhadap
                        terminal (hanya mendeteksi klaster geografis depot), sedangkan{' '}
                        <code className="font-mono-num">excess_crew</code> (AP 0,636 seed 42; 0,643 ±
                        0,035 di 20 seed) mengisolasi kelebihan susut selektif antar-komplotan.
                      </p>
                    </div>
                    <div className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-1.5">
                      <p className="font-sub font-bold text-[var(--text-primary)]">
                        Komposisi Komplotan per Terminal
                      </p>
                      <div className="divide-y divide-[var(--border-hairline)] font-mono-num text-[11px]">
                        {collusionClusters.map((cl, idx) => (
                          <div key={idx} className="py-1 flex justify-between text-[var(--text-secondary)]">
                            <span>Terminal T{idx + 1}</span>
                            <span>
                              {cl.pasangan} pas. ({cl.crew} kru × {cl.spbu} SPBU)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === 'figures' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Grafik PNG Asli Keluaran Eksperimen NADI v2.1 (Seed 42–61)
                  </p>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                    Arsip Figur Ilmiah Lengkap (Klik Figur untuk Pembesaran Lightbox)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-sub">
                  {(['ALL', 'Fisika & EDA', 'Kinerja Model', 'Graf & Ketahanan'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setFigCategory(cat)}
                        className={cn(
                          'px-2.5 py-1 rounded border transition-colors',
                          figCategory === cat
                            ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                        )}
                      >
                        {cat === 'ALL' ? 'Semua Figur' : cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredFigs.map((fig) => (
                  <button
                    key={fig.id}
                    onClick={() => setActiveFigure(fig)}
                    className="group text-left rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden hover:border-[var(--accent-blue)] transition-all"
                  >
                    <div className="relative bg-white aspect-[16/10] overflow-hidden border-b border-[var(--border-hairline)]">
                      <img
                        src={`./figur/${fig.file}`}
                        alt={fig.title}
                        loading="lazy"
                        className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-[1.03]"
                      />
                      <span className="absolute top-2 right-2 w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Expand className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="font-sub text-[10px] uppercase tracking-wider text-[var(--accent-blue)]">
                        {fig.category}
                      </span>
                      <p className="font-display text-xs font-bold text-[var(--text-primary)] line-clamp-2">
                        {fig.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <FigureLightbox figure={activeFigure} onClose={() => setActiveFigure(null)} />
    </div>
  );
}
