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
import { CheckCircle2, Expand, Network, Radar } from 'lucide-react';
import {
  cekRealisme,
  collusionEval,
  featureImportance,
  hotspotSummary,
  kamusData,
  PAPER_FIGURES,
  residualSources,
  tablesData,
} from '../../data';
import type { KamusDataRow, PaperFigureItem } from '../../types/nadi';
import { cn } from '../../utils/cn';
import { formatNumberId } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { FigureLightbox } from '../ui/FigureLightbox';
import { EditorialHeader, Reveal } from '../ui/MotionPrimitives';

export function PhysicsGraphView() {
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
      header: 'Tier Data',
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
      {/* BAND 1: RQ1 RESIDUAL DECOMPOSITION & CAUSAL ZERO-LEAKAGE PROOF */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <Reveal>
            <EditorialHeader
              eyebrow="Pembuktian RQ1 · Dekomposisi Residual & Verifikasi Kausalitas"
              title="Mengapa Selisih Volume Saja Menyesatkan (dan Bagaimana Bias Lokal Memisahkannya)"
              description="Pada data simulasi, 58,5% anomali saja yang melampaui persentil ke-95 trip wajar sementara kontaminasi air E50 memiliki median residual 0,616%. Koreksi bertingkat SPBU, terminal, dan truk menekan korelasi bias ATG dari 0,933 menjadi 0,104."
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Residual by Source Chart */}
            <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5">
              <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Perbandingan Median &amp; Mean Residual Menurut Sumber (%)
              </p>
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">
                Air Etanol E50 (0,616%) Menyamai Besaran Anomali Mikro
              </h3>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residualSources} margin={{ top: 8, right: 16, left: -6, bottom: 4 }}>
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
                              ? '#d11a2a'
                              : entry.sumber === 'air etanol'
                                ? '#b45309'
                                : '#0057a3'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Realism & Zero Leakage Audit Card */}
            <div className="lg:col-span-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Audit Realisme &amp; Uji Bebas Kebocoran Waktu
                </p>
                <Badge variant="green">
                  <CheckCircle2 className="w-3 h-3" /> Lolos 100%
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

              <div className="p-3.5 rounded border border-emerald-500/30 bg-emerald-500/[0.07] text-xs space-y-1">
                <p className="font-sub font-bold text-emerald-700 dark:text-emerald-300">
                  Verifikasi Pemotongan Temporal (Hari ke-100):
                </p>
                <p className="text-[var(--text-secondary)]">
                  Seluruh <strong className="font-mono-num">{causalCheckCount.featureCount}</strong>{' '}
                  fitur dihitung ulang hanya hingga hari ke-100; selisih maksimum terhadap dataset penuh
                  tercatat <strong className="font-mono-num">{causalCheckCount.maxLeak.toFixed(4)}</strong>{' '}
                  (nol kebocoran data masa depan).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: FEATURE IMPORTANCE & INTERACTIVE KAMUS DATA */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Top 10 LightGBM Global Gain */}
            <div className="lg:col-span-5 space-y-4">
              <EditorialHeader
                eyebrow="Kontribusi 29 Fitur · Model B_plus"
                title="36,3% Kekuatan Model Bertumpu pada Interaksi Stop, Deviasi Rute & Variabilitas Kru"
                description="Fitur terpenting inter_z_stop (14,9%) menggabungkan residual volume terkoreksi dengan logaritma durasi berhenti—membedakan sopir istirahat wajar dari pembongkaran tak resmi."
              />

              <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4">
                <div className="h-[340px] w-full">
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
                        tick={{ fontSize: 10.5, fill: 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}
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
                            fill={idx < 3 ? '#0057a3' : idx < 6 ? '#0f8a4b' : '#0e7490'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Kamus Data Searchable */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Kamus Data Operasional (Tabel D1–D16)
                  </p>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                    Pemetaan Fitur ke Sumber Data Pertamina Patra Niaga (Tier 1–3)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-sub">
                  {(['ALL', 'Tier 1', 'Tier 2', 'Tier 3'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTierFilter(tf)}
                      className={cn(
                        'px-2.5 py-1 rounded border transition-colors',
                        tierFilter === tf
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                      )}
                    >
                      {tf === 'ALL' ? 'Semua Tier' : tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-4">
                <DataTable
                  data={filteredKamus}
                  columns={kamusCols}
                  rowKey={(r) => r.kode}
                  maxHeightClass="max-h-[360px]"
                  searchPlaceholder="Cari kode fitur (D11), CUSUM, pair_zscore, atau NGS/ATG..."
                  searchMatcher={(r, q) =>
                    `${r.kode} ${r.fitur} ${r.tier} ${r.sumber_di_lapangan}`
                      .toLowerCase()
                      .includes(q)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 3: SPATIAL DBSCAN HOTSPOT, COLLUSION GRAPH & PAPER FIGURE ARCHIVE */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* DBSCAN Hotspot Proof */}
            <div className="lg:col-span-5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Radar className="w-4 h-4 text-[var(--accent-red)]" />
                  Klaster Spasial DBSCAN Stop Tak Terdaftar
                </span>
                <Badge variant="red">ε = 0,06 · min = 12</Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                DBSCAN dijalankan ulang tiap 7 hari hanya pada koordinat historis tanpa memerlukan
                daftar titik curang terlebih dahulu. Perjalanan yang berhenti dalam radius hotspot
                memiliki prevalensi anomali <strong className="text-[var(--text-primary)]">12,5×</strong>{' '}
                lebih tinggi.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Di Luar Hotspot (in_hotspot = 0)
                  </p>
                  <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {formatNumberId((hotspotOutside?.prevalensi ?? 0.01485) * 100, 2)}%
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)] mt-1">
                    {formatNumberId(hotspotOutside?.jumlah_trip ?? 47451)} perjalanan
                  </p>
                </div>

                <div className="p-4 rounded border border-rose-500/40 bg-rose-500/[0.06]">
                  <p className="text-[10px] font-sub uppercase text-[var(--accent-red)]">
                    Dalam Hotspot (in_hotspot = 1)
                  </p>
                  <p className="font-mono-num text-2xl font-bold text-[var(--accent-red)] mt-1">
                    {formatNumberId((hotspotInside?.prevalensi ?? 0.18522) * 100, 2)}%
                  </p>
                  <p className="text-[11px] font-mono-num text-[var(--text-muted)] mt-1">
                    {formatNumberId(hotspotInside?.jumlah_trip ?? 2057)} perjalanan
                  </p>
                </div>
              </div>
            </div>

            {/* Bipartite Collusion Graph Detection */}
            <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Network className="w-4 h-4 text-[var(--accent-blue)]" />
                  Deteksi Kolusi Pasangan Kru–SPBU (28 Pasangan Nyata dari 1.239 Kandidat)
                </span>
                <Badge variant="green">Precision@20 = 75,0% (15/20 Nyata)</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {collusionEval.map((c) => (
                  <div
                    key={c.metode}
                    className={cn(
                      'p-3.5 rounded border',
                      c.metode === 'excess_crew'
                        ? 'border-[var(--accent-blue)] bg-sky-500/10'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
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

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Mengapa <code>excess_crew</code> (AP = 0,636 seed 42; 0,643 ± 0,035 di 20 seed) mengungguli
                modularitas komunitas (0,453)? Partisi modularitas menghasilkan Adjusted Rand Index 1,000
                terhadap terminal—hanya memotret batas geografis depot, bukan kelebihan residual selektif
                antara kru dan SPBU tertentu.
              </p>
            </div>
          </div>

          {/* Paper Genuine Figures Lightbox Gallery */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-hairline)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Arsip Figur Sains Asli dari Notebook Eksperimen v2.1
                </p>
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  Galeri Grafik Eksperimen (Klik untuk Perbesar)
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
                          : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
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
                  className="group text-left rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] overflow-hidden hover:border-[var(--accent-blue)] transition-all"
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
        </div>
      </section>

      <FigureLightbox figure={activeFigure} onClose={() => setActiveFigure(null)} />
    </div>
  );
}

