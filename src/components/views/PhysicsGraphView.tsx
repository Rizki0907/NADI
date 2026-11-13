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
  GitBranch,
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
      {/* WORKBENCH BAND 1: RQ1 RESIDUAL DECOMPOSITION & CAUSAL ZERO-LEAKAGE AUDIT */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-8">
        <Reveal>
          <EditorialHeader
            eyebrow="Pembuktian RQ1 · Bagian 2.4 & 3.1 Paper · Dekomposisi Fisika & Koreksi Bias Kausal"
            title="Mengapa Selisih Volume Saja Menyesatkan — dan Bagaimana Pembersihan Bertingkat Memisahkannya"
            description="Dalam rantai Terminal–Mobil Tangki–SPBU, 41,5% perjalanan curang berada di bawah persentil ke-95 perjalanan wajar karena tertutup derau alat ukur OIML R 117-1, bias tangki ATG SPBU, serta pemisahan fase air-etanol E50 (median 0,616%)."
          />
        </Reveal>

        {/* Narrative Insight Banner explaining Equations (8)-(10) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-blue)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1.5">
            <p className="font-sub font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              1. Koreksi Termal &amp; Susut Wajar (Pers. 1–6)
            </p>
            <p className="text-[var(--text-secondary)]">
              Konversi muat-terima ke suhu standar <strong>15 °C</strong> menghapus pembiasan ekspansi
              termal ΔT (rata-rata 2 °C). Residual terkoreksi menyisakan komponen penguapan{' '}
              <em>flash</em>, holdup tangki, derau gabungan σ = 0,280%, serta bias kalibrasi lokal.
            </p>
          </div>

          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-green)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1.5">
            <p className="font-sub font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              2. Pengurangan Bias Kausal Bertingkat (Pers. 8–10)
            </p>
            <p className="text-[var(--text-secondary)]">
              Setiap perjalanan hanya dikurangi median historis SPBU (min. 5 trip), median terminal
              (min. 10 trip), dan rerata truk sebelumnya sebelum waktu berangkat <em>t</em>. Langkah ini
              menekan korelasi residual terhadap bias ATG dari <strong>r = 0,933</strong> menjadi{' '}
              <strong>r = 0,104</strong>.
            </p>
          </div>

          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-red)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1.5">
            <p className="font-sub font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              3. Jebakan Air-Etanol E50 vs Pencurian Mikro
            </p>
            <p className="text-[var(--text-secondary)]">
              Kontaminasi air pada <strong>E50</strong> memicu lonjakan susut wajar dengan median{' '}
              <strong className="font-mono-num">0,616%</strong> (melampaui ambang batas statistik wajar).
              Tanpa konteks penguapan etanol &amp; telematika, detektor konvensional membanjiri audit dengan
              peringatan palsu SPBU basah.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Residual by Source Chart */}
          <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Dekomposisi Residual Skenario Dasar (%) · Tabel Eksperimen
                </p>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Air Etanol E50 (0,616%) Bertumpuk di Atas Sebagian Anomali Mikro
                </h3>
              </div>
              <Badge variant="amber">58,5% Anomali &gt; p95 Wajar</Badge>
            </div>

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

            {/* Temporal Split Breakdown (Train -> Val -> Test with Novel Actors) */}
            <div className="pt-3 border-t border-[var(--border-hairline)] space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-sub font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <CalendarClock className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                Partisi Waktu Berurutan 180 Hari (49.508 Trip · Tanpa Pengacakan Acak)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {temporalSplit.map((sp) => (
                  <div
                    key={sp.split}
                    className="p-2.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-sub">
                      <span className="uppercase font-bold text-[10px] text-[var(--accent-blue)]">
                        {sp.split === 'train'
                          ? 'Latih'
                          : sp.split === 'val'
                            ? 'Validasi'
                            : 'Uji (Aktor Baru)'}
                      </span>
                      <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                        Hr {sp.hari_awal}–{sp.hari_akhir}
                      </span>
                    </div>
                    <p className="font-mono-num font-bold text-[var(--text-primary)]">
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

          {/* Realism & Zero Leakage Audit Card */}
          <div className="lg:col-span-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Audit Realisme Simulasi &amp; Uji Kausalitas
              </p>
              <Badge variant="green">
                <CheckCircle2 className="w-3 h-3" /> 100% Lolos
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

            <div className="p-3.5 rounded border border-emerald-500/30 bg-emerald-500/[0.07] text-xs space-y-1.5">
              <p className="font-sub font-bold text-emerald-700 dark:text-emerald-300">
                Uji Pemotongan Waktu Hari ke-100 (Zero Future Leakage):
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Seluruh <strong className="font-mono-num">{causalCheckCount.featureCount}</strong>{' '}
                fitur dihitung ulang memakai riwayat yang dipotong tepat pada hari ke-100, lalu
                dibandingkan dengan perhitungan dataset penuh. Selisih numerik maksimum tercatat{' '}
                <strong className="font-mono-num">{causalCheckCount.maxLeak.toFixed(4)}</strong> —
                membuktikan nol kebocoran informasi masa depan saat pelatihan maupun skor harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKBENCH BAND 2: 29 FEATURES GLOBAL GAIN & SEARCHABLE KAMUS DATA */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Top 10 LightGBM Global Gain */}
          <div className="lg:col-span-5 space-y-4">
            <EditorialHeader
              eyebrow="Anatomi 29 Indikator Kausal · Model B_plus"
              title="36,3% Daya Deteksi Bertumpu pada Interaksi Stop, Deviasi Rute & Akumulasi Kru"
              description="Alih-alih mengandalkan selisih volume tunggal, NADI menghubungkan ukuran susut terkoreksi dengan sinyal perilaku telematika dan riwayat kumulatif kru secara bertahap."
            />

            <div className="p-3.5 rounded border-l-2 border-[var(--accent-blue)] bg-[var(--bg-surface)] border-y border-r border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
              <p className="font-sub font-semibold text-[var(--text-primary)]">
                Tafsir Tiga Sinyal Teratas:
              </p>
              <p>
                <strong>inter_z_stop (14,9%)</strong> mengalikan z_adj dengan log(1 + durasi stop tak
                terjadwal) agar pengemudi yang berhenti sah (makan/istirahat dengan z_adj ≈ 0) tidak
                tertuduh, sementara <strong>route_dev_ratio (11,5%)</strong> &amp;{' '}
                <strong>crew_std20 (9,9%)</strong> mengunci pola pengalihan rute berulang.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4">
              <div className="h-[320px] w-full">
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
                          fill={idx < 3 ? '#0369a1' : idx < 6 ? '#15803d' : '#0f766e'}
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
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                  Kamus Data &amp; Kesiapan Integrasi PT Pertamina Patra Niaga (D1–D16)
                </p>
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mt-1">
                  Pemetaan Sumber Data Lapangan menurut Tier Arsitektur
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

            <div className="p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-sub font-bold text-[var(--accent-blue)]">Tier 1 (Fisika Dasar):</span>{' '}
                NGS terminal, DO, &amp; ATG SPBU (tanpa perlu GPS).
              </div>
              <div>
                <span className="font-sub font-bold text-[var(--accent-green)]">Tier 2 (Operasional):</span>{' '}
                Integrasi telematika GPS &amp; riwayat CUSUM/EWMA kru.
              </div>
              <div>
                <span className="font-sub font-bold text-[var(--accent-teal)]">Tier 3 (Relasional):</span>{' '}
                Hotspot DBSCAN mingguan &amp; graf kolusi pasangan kru–SPBU.
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-4">
              <DataTable
                data={filteredKamus}
                columns={kamusCols}
                rowKey={(r) => r.kode}
                maxHeightClass="max-h-[380px]"
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
      </section>

      {/* WORKBENCH BAND 3: SPATIAL DBSCAN HOTSPOT, BIPARTITE COLLUSION GRAPH & FIGURE LIGHTBOX */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* DBSCAN Hotspot Proof */}
          <div className="lg:col-span-5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Radar className="w-4 h-4 text-[var(--accent-red)]" />
                Penemuan Otomatis Hotspot Berhenti Liar (DBSCAN)
              </span>
              <Badge variant="red">ε = 0,06 · min = 12</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Sesuai Persamaan (14) pada paper, NADI <strong>tidak membutuhkan daftar koordinat
              lokasi penadahan gelap terlebih dahulu</strong>. Algoritma DBSCAN melatih ulang koordinat
              berhenti tidak terjadwal setiap 7 hari dari histori yang tersedia; perjalanan dalam
              radius klaster mencatat kepadatan anomali{' '}
              <strong className="text-[var(--text-primary)]">12,5×</strong> lebih tinggi.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
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

            <div className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[11px] text-[var(--text-muted)] leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-amber)] inline mr-1.5" />
              <em>Catatan Ketahanan (Skenario Sulit):</em> Ketika probabilitas jejak telematika
              tercatat diturunkan dari 0,90 menjadi 0,55, peran fitur graf &amp; riwayat kru menjadi
              penyangga utama saat sinyal berhenti GPS absen.
            </div>
          </div>

          {/* Bipartite Collusion Graph Detection */}
          <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Network className="w-4 h-4 text-[var(--accent-blue)]" />
                Graf Bipartit Kru–SPBU: Mengisolasi 28 Pasangan Kolusi dari 1.239 Kandidat
              </span>
              <Badge variant="green">Precision@20 = 75,0% (15/20 Terkonfirmasi)</Badge>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-1">
                <p className="font-sub font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                  Kenapa Modularitas Komunitas Gagal (ARI = 1,000)?
                </p>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Partisi modularitas menghasilkan <em>Adjusted Rand Index</em> <strong>1,000</strong>{' '}
                  terhadap terminal depot—artinya algoritma hanya menggambar ulang batas geografis
                  pengiriman rutin. Sebaliknya, metrik{' '}
                  <code className="font-mono-num">excess_crew</code> (Pers. 15) mengukur{' '}
                  <strong>kelebihan residual pasangan spesifik</strong> setelah dikurangi kecenderungan
                  rata-rata kru di semua SPBU lain (AP = 0,636 seed 42; 0,643 ± 0,035 di 20 seed).
                </p>
              </div>

              <div className="p-3.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-1.5">
                <p className="font-sub font-bold text-[var(--text-primary)]">
                  Struktur Komplotan Lintas 3 Terminal
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

        {/* Paper Genuine Figures Lightbox Gallery */}
        <div className="space-y-4 pt-6 border-t border-[var(--border-hairline)]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Arsip Figur Ilmiah Asli dari Eksperimen NADI v2.1 (20 Grafik PNG Resolusi Penuh)
              </p>
              <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                Galeri Figur Paper (Klik untuk Pembesaran &amp; Keterangan)
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
      </section>

      <FigureLightbox figure={activeFigure} onClose={() => setActiveFigure(null)} />
    </div>
  );
}
