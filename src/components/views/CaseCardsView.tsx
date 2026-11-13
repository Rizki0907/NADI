import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, CheckCircle2, ClipboardCheck, ShieldAlert, Sliders } from 'lucide-react';
import {
  caseCardsTop,
  causeValidationMatrix,
  localShapCases,
  tablesData,
  thresholdCompare,
  tierEval,
} from '../../data';
import type { CaseCardRow, LocalShapRow } from '../../types/nadi';
import { cn } from '../../utils/cn';
import { formatNumberId } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { EditorialHeader, Reveal } from '../ui/MotionPrimitives';

interface CaseCardsViewProps {
  highlightTripId?: number | null;
}

function parseShapFactors(str: string): { feature: string; contribution: number }[] {
  return str
    .split(',')
    .map((part) => {
      const m = part.trim().match(/^(.+?)\s*\(([-+]?\d+(?:\.\d+)?)\)$/);
      if (!m) return null;
      return { feature: m[1].trim(), contribution: Number(m[2]) };
    })
    .filter((x): x is { feature: string; contribution: number } => Boolean(x));
}

export function CaseCardsView({ highlightTripId }: CaseCardsViewProps) {
  const initialCase =
    caseCardsTop.find((c) => c.trip_id === highlightTripId) ?? caseCardsTop[0];
  const [selectedCase, setSelectedCase] = useState<CaseCardRow>(initialCase);

  useEffect(() => {
    if (highlightTripId) {
      const found = caseCardsTop.find((c) => c.trip_id === highlightTripId);
      if (found) setSelectedCase(found);
    }
  }, [highlightTripId]);
  const [terminalFilter, setTerminalFilter] = useState<'ALL' | 'T0' | 'T1'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'E10' | 'E20' | 'E50'>('ALL');
  const [selectedShap, setSelectedShap] = useState<LocalShapRow>(localShapCases[0]);
  const [ruleScaleIdx, setRuleScaleIdx] = useState<number>(1); // 0.5, 1.0, 1.5

  const filteredCases = useMemo(() => {
    return caseCardsTop.filter((c) => {
      if (terminalFilter !== 'ALL' && c.terminal_id !== terminalFilter) return false;
      if (gradeFilter !== 'ALL' && c.ethanol_grade !== gradeFilter) return false;
      return true;
    });
  }, [terminalFilter, gradeFilter]);

  const ruleSens = tablesData.sensitivitas_ambang_aturan_sebab as {
    skala_ambang: number;
    akurasi_ketat: number;
  }[];

  const shapBars = useMemo(
    () => parseShapFactors(selectedShap.kontributor_utama),
    [selectedShap]
  );

  const operatingPoints = tablesData.titik_operasi_kapasitas_vs_ambang as {
    definisi: string;
    trip_ditandai: number;
    persen_trip_ditandai: number;
    presisi: number;
    recall: number;
    f1: number;
  }[];

  const caseColumns: ColumnDef<CaseCardRow>[] = [
    {
      key: 'trip_id',
      header: 'Trip ID',
      sortValue: (r) => r.trip_id,
      render: (r) => (
        <span className="font-mono-num font-bold text-[var(--text-primary)]">#{r.trip_id}</span>
      ),
    },
    {
      key: 'day',
      header: 'Hari',
      align: 'center',
      sortValue: (r) => r.day,
      render: (r) => <span className="font-mono-num text-[var(--text-muted)]">H-{r.day}</span>,
    },
    {
      key: 'unit',
      header: 'Terminal / SPBU / Kru',
      sortValue: (r) => r.crew_id,
      render: (r) => (
        <div className="space-y-0.5">
          <p className="font-sub font-semibold text-[var(--text-primary)]">
            {r.spbu_id}{' '}
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded text-[10px]',
                r.crew_id === 'C071'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              )}
            >
              {r.crew_id}
            </span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Terminal {r.terminal_id}</p>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      align: 'center',
      sortValue: (r) => r.ethanol_grade,
      render: (r) => (
        <Badge
          variant={
            r.ethanol_grade === 'E50' ? 'red' : r.ethanol_grade === 'E20' ? 'green' : 'blue'
          }
        >
          {r.ethanol_grade}
        </Badge>
      ),
    },
    {
      key: 'skor_prob',
      header: 'Skor B_plus',
      align: 'right',
      sortValue: (r) => r.skor_prob,
      render: (r) => (
        <span className="font-mono-num font-bold text-[var(--accent-red)]">
          {formatNumberId(r.skor_prob * 100, 2)}%
        </span>
      ),
    },
    {
      key: 'dugaan_sebab',
      header: 'Dugaan Sebab (Aturan)',
      render: (r) => (
        <span className="text-xs text-[var(--text-secondary)] leading-snug block max-w-[260px]">
          {r.dugaan_sebab}
        </span>
      ),
    },
    {
      key: 'label',
      header: 'Verifikasi Uji',
      align: 'center',
      sortValue: (r) => r.label,
      render: (r) =>
        r.label === 1 ? (
          <Badge variant="green">Terbukti Anomali</Badge>
        ) : (
          <Badge variant="neutral">Wajar</Badge>
        ),
    },
  ];

  const causeMatrixCols = [
    {
      key: 'bongkar',
      label: 'Hotspot / Tak Terdaftar',
      rawKey: 'bongkar di lokasi tak terdaftar atau klaster hotspot',
    },
    {
      key: 'rute',
      label: 'Deviasi Rute + Susut',
      rawKey: 'akumulasi deviasi rute dan susut volume di atas batas wajar',
    },
    {
      key: 'kolusi',
      label: 'Kolusi Kru–SPBU',
      rawKey: 'indikasi kolusi relasional kru dan SPBU berulang',
    },
    {
      key: 'cusum',
      label: 'Mikro CUSUM',
      rawKey: 'pola akumulasi susut mikro berulang pada kru (CUSUM)',
    },
    {
      key: 'atg',
      label: 'Selisih Tinggi / Cek ATG',
      rawKey: 'selisih volume muat dan terima tinggi (indikasi curian / periksa ATG)',
    },
  ];

  return (
    <div className="w-full">
      {/* BAND 1: 3-TIER TRIAGE PYRAMID & OPERATING POLICY */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <Reveal>
            <EditorialHeader
              accent="red"
              eyebrow="Triase Kapasitas Audit 5% / Hari · Partisi Uji Hari 145–180"
              title="Peringkat Kartu Kasus: 4,8% Pengiriman Teratas Menjaring 68,1% Kasus Anomali"
              description="Pada 9.945 perjalanan uji (seed 42, 398 anomali), kuota pemeriksaan fisik Tier 1 cukup diarahkan ke 480 perjalanan untuk membuktikan 271 kasus (presisi 56,5%). Memasukkan Tier 2 (hingga 19,8% perjalanan) menaikkan recall kumulatif ke 83,9%, sementara Tier 3 (80,2%) cukup dipantau otomatis (prevalensi hanya 0,8%)."
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 3 Tier Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tierEval.map((t, i) => {
                const variant = i === 0 ? 'red' : i === 1 ? 'amber' : 'neutral';
                return (
                  <div
                    key={t.tier}
                    className={cn(
                      'rounded-lg border p-5 flex flex-col justify-between gap-4',
                      i === 0
                        ? 'border-rose-500/40 bg-rose-500/[0.04]'
                        : i === 1
                          ? 'border-amber-500/35 bg-amber-500/[0.03]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
                    )}
                  >
                    <div className="space-y-2">
                      <Badge variant={variant}>{t.tier}</Badge>
                      <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)] pt-1">
                        {formatNumberId(t.total_trip)} trip
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatNumberId(t.persen_trip * 100, 1)}% beban uji ·{' '}
                        <strong className="text-[var(--text-primary)]">{t.kasus_terbukti}</strong>{' '}
                        anomali
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-hairline)] space-y-1 text-xs font-sub">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Presisi Tier</span>
                        <span className="font-bold text-[var(--text-primary)]">
                          {formatNumberId(t.presisi_anomali * 100, 1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Recall Kumulatif</span>
                        <span className="font-bold text-[var(--accent-blue)]">
                          {formatNumberId(t.recall_kumulatif * 100, 1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Policy vs Single Threshold Comparison */}
            <div className="lg:col-span-5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Kuota Harian 5% vs Ambang Probabilitas Tunggal
                </p>
                <Badge variant="blue">Operasional</Badge>
              </div>

              <div className="space-y-3">
                {operatingPoints.map((op) => (
                  <div
                    key={op.definisi}
                    className="rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 text-xs space-y-1.5"
                  >
                    <p className="font-sub font-semibold text-[var(--text-primary)]">{op.definisi}</p>
                    <div className="grid grid-cols-4 gap-2 font-mono-num text-[11px]">
                      <div>
                        <span className="text-[var(--text-muted)] block">Ditandai</span>
                        <strong>{formatNumberId(op.trip_ditandai)}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Presisi</span>
                        <strong>{formatNumberId(op.presisi * 100, 1)}%</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Recall</span>
                        <strong>{formatNumberId(op.recall * 100, 1)}%</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">F1</span>
                        <strong className="text-[var(--accent-blue)]">
                          {formatNumberId(op.f1, 3)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Kapasitas harian 5% dipilih sebagai definisi utama karena menjamin stabilitas beban kerja
                tim investigator per hari, sedangkan ambang tunggal 0,15 bergantung pada sebaran skor harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: INTERACTIVE 12 TOP PRIORITY CASE CARDS + INSPECTOR */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <EditorialHeader
              eyebrow="Konsol Prioritas Investigator · Top 12 Kasus Uji"
              title="Seluruh 12 Kartu Teratas Terbukti Anomali (7 Berasal dari Kru C071)"
              description="Klik baris mana pun untuk memeriksa bukti dugaan sebab dan rekomendasi tindak lanjut lapangan. Konsentrasi kasus pada Kru C071 menyorot pola bongkar di lokasi tak terdaftar."
            />

            <div className="flex flex-wrap items-center gap-2 text-xs font-sub">
              {(['ALL', 'T0', 'T1'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTerminalFilter(t)}
                  className={cn(
                    'px-2.5 py-1.5 rounded border transition-colors',
                    terminalFilter === t
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                  )}
                >
                  {t === 'ALL' ? 'Semua Terminal' : `Terminal ${t}`}
                </button>
              ))}
              {(['ALL', 'E10', 'E20', 'E50'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={cn(
                    'px-2.5 py-1.5 rounded border transition-colors',
                    gradeFilter === g
                      ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                  )}
                >
                  {g === 'ALL' ? 'Semua Grade' : g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-4">
              <DataTable
                data={filteredCases}
                columns={caseColumns}
                rowKey={(r) => String(r.trip_id)}
                selectedKey={String(selectedCase.trip_id)}
                onRowClick={(r) => setSelectedCase(r)}
                searchPlaceholder="Filter trip, kru (mis. C071), SPBU, atau dugaan..."
                searchMatcher={(r, q) =>
                  `${r.trip_id} ${r.crew_id} ${r.spbu_id} ${r.terminal_id} ${r.dugaan_sebab}`
                    .toLowerCase()
                    .includes(q)
                }
              />
            </div>

            {/* Case Detail Card */}
            <div className="xl:col-span-4 rounded-lg border-2 border-[var(--accent-red)]/50 bg-[var(--bg-surface)] p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--accent-red)] font-bold">
                    {selectedCase.tier}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mt-0.5">
                    Kartu Kasus Trip #{selectedCase.trip_id}
                  </h3>
                </div>
                <Badge variant="green">
                  <CheckCircle2 className="w-3 h-3" /> Label Uji: 1
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-sub">
                <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Skor Risiko B_plus</span>
                  <strong className="font-mono-num text-lg text-[var(--accent-red)]">
                    {formatNumberId(selectedCase.skor_prob * 100, 2)}%
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Waktu &amp; Produk</span>
                  <strong className="text-[var(--text-primary)]">
                    Hari {selectedCase.day} · {selectedCase.ethanol_grade}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Rute Terminal → SPBU</span>
                  <strong className="text-[var(--text-primary)]">
                    {selectedCase.terminal_id} → {selectedCase.spbu_id}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Awak Mobil Tangki</span>
                  <strong className="text-[var(--accent-blue)]">Kru {selectedCase.crew_id}</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-sub uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Dugaan Sebab (Aturan Heuristik Berurutan)
                </p>
                <p className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-medium leading-relaxed flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[var(--accent-red)] shrink-0 mt-0.5" />
                  <span>{selectedCase.dugaan_sebab}</span>
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-sub uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Rekomendasi Tindak Lanjut Investigator
                </p>
                <p className="p-3 rounded border border-[var(--accent-blue)]/30 bg-sky-500/[0.06] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />
                  <span>{selectedCase.rekomendasi}</span>
                </p>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] italic pt-1">
                * NADI menyusun triase bukti &amp; dugaan modus; penetapan pelanggaran tetap wajib
                diverifikasi audit fisik lapangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 3: TREESHAP LOCAL EXPLANATIONS & CAUSE VALIDATION MATRIX */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: TreeSHAP Local Explorer */}
            <div className="lg:col-span-6 space-y-5">
              <EditorialHeader
                eyebrow="Explainable AI Eksak Polinomial (TreeSHAP)"
                title="Penjelasan Numerik Tiap Kasus & Transparansi Celah Modus M2"
                description="Bandingkan profil fitur kasus berskor tinggi (M1 deviasi rute & M4 kolusi) dengan contoh kasus M2 berisiko rendah (0,030 & 0,004) yang menunjukkan tantangan pada pencurian mikro tanpa jejak telematika."
              />

              <div className="flex flex-wrap gap-2">
                {localShapCases.map((s) => {
                  const active = selectedShap.trip_id === s.trip_id;
                  const isHigh = s.skor_prob >= 0.5;
                  return (
                    <button
                      key={s.trip_id}
                      onClick={() => setSelectedShap(s)}
                      className={cn(
                        'px-3 py-2 rounded-md border text-xs font-sub text-left transition-all',
                        active
                          ? 'border-[var(--accent-blue)] bg-sky-500/10 text-[var(--text-primary)]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">#{s.trip_id}</span>
                        <Badge variant={isHigh ? 'red' : 'amber'}>{s.modus}</Badge>
                      </div>
                      <p className="font-mono-num text-[11px] text-[var(--text-muted)] mt-0.5">
                        Kru {s.crew_id} · Skor {formatNumberId(s.skor_prob, 3)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                      3 Kontributor TreeSHAP Terbesar — Trip #{selectedShap.trip_id} (Modus{' '}
                      {selectedShap.modus})
                    </p>
                    <h4 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      Skor Probabilitas: {formatNumberId(selectedShap.skor_prob * 100, 1)}% (Kru{' '}
                      {selectedShap.crew_id})
                    </h4>
                  </div>
                  <Badge variant={selectedShap.skor_prob > 0.5 ? 'red' : 'amber'}>
                    {selectedShap.skor_prob > 0.5 ? 'Terjaring Kuota' : 'Tantangan M2'}
                  </Badge>
                </div>

                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={shapBars}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                      <XAxis
                        type="number"
                        domain={[-0.6, 1.1]}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="feature"
                        width={125}
                        tick={{ fontSize: 11, fill: 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}
                      />
                      <ReferenceLine x={0} stroke="var(--border-strong)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-strong)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="contribution" name="Nilai TreeSHAP" radius={[0, 4, 4, 0]}>
                        {shapBars.map((entry) => (
                          <Cell
                            key={entry.feature}
                            fill={entry.contribution >= 0 ? '#d11a2a' : '#0057a3'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {selectedShap.modus === 'M2' && (
                  <p className="text-xs text-[var(--text-secondary)] bg-amber-500/10 border border-amber-500/25 rounded p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
                    <span>
                      Transparansi Model: Pada dua kasus M2 ini, ukuran pencurian kecil tanpa jejak
                      stop (`inter_z_stop` negatif) membuat skor trip tunggal rendah — membuktikan
                      mengapa pemantauan kumulatif **CUSUM level kru** tetap vital.
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Validasi Aturan Dugaan Sebab vs Modus Asli */}
            <div className="lg:col-span-6 space-y-5">
              <EditorialHeader
                eyebrow="Validasi Heuristik Penyebab (Simulasi)"
                title="Kecocokan Dugaan Sebab Terhadap Modus Sebenarnya Mencapai 68,0%"
                description="Melampaui tebakan kelas mayoritas (47,0%). M1 (91,4%) dan M3 (89,9%) teridentifikasi paling tajam lewat pola hotspot & deviasi, sedangkan M4 (69,5%) oleh rasio kolusi pasangan."
              />

              {/* Threshold Sensitivity Pill */}
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-sub text-[var(--text-secondary)]">
                  <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                  <span>Sensitivitas Ambang Aturan:</span>
                </div>
                <div className="flex gap-1.5">
                  {ruleSens.map((rs, idx) => (
                    <button
                      key={rs.skala_ambang}
                      onClick={() => setRuleScaleIdx(idx)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-sub border transition-colors',
                        ruleScaleIdx === idx
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                      )}
                    >
                      Skala ×{rs.skala_ambang}:{' '}
                      <strong className="font-mono-num">
                        {formatNumberId(rs.akurasi_ketat * 100, 1)}%
                      </strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Confusion-style Matrix */}
              <div className="overflow-x-auto rounded-lg border border-[var(--border-strong)]">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] font-sub text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="p-3 text-left">Modus Asli</th>
                      {causeMatrixCols.map((col) => (
                        <th key={col.key} className="p-2.5 text-right">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)] bg-[var(--bg-surface)]">
                    {causeValidationMatrix.map((row) => (
                      <tr key={String(row.modus)}>
                        <td className="p-3 font-sub font-bold text-[var(--text-primary)]">
                          {String(row.modus)}
                        </td>
                        {causeMatrixCols.map((col) => {
                          const val = Number(row[col.rawKey] ?? 0);
                          const isDom = val >= 0.5;
                          return (
                            <td
                              key={col.key}
                              className={cn(
                                'p-2.5 text-right font-mono-num',
                                isDom
                                  ? 'bg-sky-600/15 font-bold text-[var(--accent-blue)]'
                                  : 'text-[var(--text-muted)]'
                              )}
                            >
                              {formatNumberId(val * 100, 1)}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Threshold vs Quota Curve Mini Table */}
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Trade-off Ambang Probabilitas Pembanding (Partisi Uji)
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-[11px] font-mono-num">
                  {thresholdCompare.map((tc) => (
                    <div
                      key={tc.ambang}
                      className={cn(
                        'p-2 rounded border',
                        tc.ambang === 0.15
                          ? 'border-[var(--accent-blue)] bg-sky-500/10'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
                      )}
                    >
                      <span className="block text-[10px] text-[var(--text-muted)]">
                        p≥{tc.ambang}
                      </span>
                      <strong className="text-[var(--text-primary)]">
                        P {formatNumberId(tc.presisi * 100, 0)}%
                      </strong>
                      <span className="block text-[10px] text-[var(--accent-green)]">
                        R {formatNumberId(tc.recall * 100, 0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
