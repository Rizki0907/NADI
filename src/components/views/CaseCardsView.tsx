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
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
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
  const [ruleScaleIdx, setRuleScaleIdx] = useState<number>(1);

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
      {/* SECTION 1: TRIAGE HIERARCHY & NARRATIVE */}
      <section className="px-4 sm:px-6 lg:px-8 py-9 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-6">
        <Reveal>
          <EditorialHeader
            accent="red"
            eyebrow="Bagian 2.6 & 3.7 · Keluaran Triase Investigator (Partisi Uji Hari 145–180)"
            title="Kapasitas Audit Terbatas 5%: Memisahkan Inspeksi Fisik Segera dari Pemantauan"
            description="Dari 9.945 perjalanan periode uji (terdapat 398 anomali), tim investigator tidak mungkin mengaudit seluruh pengiriman atau mengandalkan inspeksi acak—karena prevalensi anomali hanya sekitar 2,2%–4,0%, sehingga pemeriksaan acak habis memburu trip jujur."
          />
        </Reveal>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* 3 Tiers + Explanation */}
          <div className="xl:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tierEval.map((t, i) => {
                const variant = i === 0 ? 'red' : i === 1 ? 'amber' : 'neutral';
                return (
                  <div
                    key={t.tier}
                    className={cn(
                      'rounded-lg border p-4 flex flex-col justify-between gap-3',
                      i === 0
                        ? 'border-rose-500/45 bg-rose-500/[0.04]'
                        : i === 1
                          ? 'border-amber-500/35 bg-amber-500/[0.03]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
                    )}
                  >
                    <div className="space-y-1.5">
                      <Badge variant={variant}>{t.tier}</Badge>
                      <p className="font-mono-num text-2xl font-bold text-[var(--text-primary)] pt-1">
                        {formatNumberId(t.total_trip)} trip
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatNumberId(t.persen_trip * 100, 1)}% beban ·{' '}
                        <strong className="text-[var(--text-primary)]">{t.kasus_terbukti}</strong>{' '}
                        terbukti
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-[var(--border-hairline)] space-y-1 text-xs font-sub">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Presisi Tier</span>
                        <span className="font-bold">{formatNumberId(t.presisi_anomali * 100, 1)}%</span>
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

            <div className="p-4 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--text-primary)]">Dampak Praktis Triase Berjenjang:</strong>{' '}
                Kartu Kasus membedakan mana perjalanan yang wajib langsung diperiksa fisik hari ini
                (Tier 1: 480 trip, presisi <strong>56,5%</strong>, menjaring 271 dari 398 anomali),
                mana yang cukup audit dokumen/ATG jarak jauh (Tier 2: menambah recall kumulatif ke{' '}
                <strong>83,9%</strong>), dan mana yang aman dilepas ke pemantauan otomatis (Tier 3:
                80,2% trip dengan sisa prevalensi hanya <strong>0,8%</strong>). Sepanjang 180 hari,
                siklus replay (termasuk 1.485 audit acak pengawal distribusi) membuka 639 label
                positif dari 3.367 trip yang diaudit.
              </div>
            </div>
          </div>

          {/* Quota vs Single Threshold */}
          <div className="xl:col-span-5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Kuota Harian 5% vs Ambang Probabilitas Tunggal (0,15)
              </p>
              <Badge variant="blue">Bagian 2.7</Badge>
            </div>

            <div className="space-y-2.5">
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
              Mengapa NADI memilih <strong>kapasitas harian 5%</strong> ketimbang ambang probabilitas
              tetap? Ambang tunggal (mis. 0,15) bisa membanjiri investigator pada hari sibuk atau
              kosong saat kondisi landai, sedangkan kuota 5% menjamin beban kerja terarah yang stabil
              setiap hari. Menambah kuota ke 10% hanya menaikkan volume terjaring +6,2 poin (81,3% →
              87,5% pada seed utama).
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: TOP 12 PRIORITY CASE CARDS WORKBENCH */}
      <section className="px-4 sm:px-6 lg:px-8 py-9 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <EditorialHeader
            eyebrow="Konsol Keputusan Investigator · 12 Kartu Peringkat Teratas"
            title="Konsentrasi Kasus Nyata: Kru C071 Menguasai 7 dari 12 Kartu Teratas"
            description="Dalam data simulasi, 70,2% seluruh penyimpangan berasal dari hanya 10 kru teratas (28 dari 150 kru). Klik baris di tabel untuk membedah dugaan sebab, lokasi terminal–SPBU, serta instruksi tindak lanjut lapangan."
          />

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-sub">
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
              searchPlaceholder="Filter trip, kru (C071 / C038), SPBU, atau dugaan..."
              searchMatcher={(r, q) =>
                `${r.trip_id} ${r.crew_id} ${r.spbu_id} ${r.terminal_id} ${r.dugaan_sebab}`
                  .toLowerCase()
                  .includes(q)
              }
            />
          </div>

          <div className="xl:col-span-4 rounded-lg border-2 border-[var(--accent-red)]/50 bg-[var(--bg-surface)] p-5 space-y-4">
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
                <CheckCircle2 className="w-3 h-3" /> Terbukti: 1
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-sub">
              <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Skor Risiko B_plus</span>
                <strong className="font-mono-num text-lg text-[var(--accent-red)]">
                  {formatNumberId(selectedCase.skor_prob * 100, 2)}%
                </strong>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Hari &amp; Produk</span>
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

            <div className="space-y-1.5 text-xs">
              <p className="font-sub uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                Dugaan Sebab (Aturan Berurutan)
              </p>
              <p className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-medium leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--accent-red)] shrink-0 mt-0.5" />
                <span>{selectedCase.dugaan_sebab}</span>
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-sub uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                Rekomendasi Tindakan Investigator
              </p>
              <p className="p-3 rounded border border-[var(--accent-blue)]/30 bg-sky-500/[0.06] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />
                <span>{selectedCase.rekomendasi}</span>
              </p>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[var(--border-hairline)]">
              Catatan Tata Kelola: Kecocokan dugaan sebab diuji pada simulasi sebesar 68,0%; sistem
              tidak menetapkan sanksi otomatis tanpa bukti verifikasi fisik ATG &amp; segel tangki.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: TREESHAP EXPLAINER & RULE VALIDATION MATRIX */}
      <section className="px-4 sm:px-6 lg:px-8 py-9 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* TreeSHAP Local Explorer */}
          <div className="xl:col-span-6 space-y-5">
            <EditorialHeader
              eyebrow="Bagian 2.6 & 3.3 · TreeSHAP Eksak Polinomial"
              title="Mengintip Alasan Numerik di Balik Skor Tinggi (M1/M4) dan Celah M2"
              description="Setiap Kartu Kasus menyertakan nilai Shapley (TreeSHAP) atas 3 fitur pendorong utama. Dua kasus M2 sengaja ditampilkan untuk menunjukkan batas jujur sistem ketika pelaku mencuri dalam jumlah mikro tanpa meninggalkan jejak GPS."
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
                      Kru {s.crew_id} · {formatNumberId(s.skor_prob, 3)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Atribusi TreeSHAP Trip #{selectedShap.trip_id} · Kru {selectedShap.crew_id}
                  </p>
                  <h4 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Probabilitas: {formatNumberId(selectedShap.skor_prob * 100, 1)}% (Modus{' '}
                    {selectedShap.modus})
                  </h4>
                </div>
                <Badge variant={selectedShap.skor_prob > 0.5 ? 'red' : 'amber'}>
                  {selectedShap.skor_prob > 0.5 ? 'Prioritas Tier 1' : 'Celah Mikro M2'}
                </Badge>
              </div>

              <div className="h-[205px] w-full">
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
                    <Bar dataKey="contribution" name="Kontribusi TreeSHAP" radius={[0, 4, 4, 0]}>
                      {shapBars.map((entry) => (
                        <Cell
                          key={entry.feature}
                          fill={entry.contribution >= 0 ? '#e11d48' : '#0369a1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded p-3 leading-relaxed">
                {selectedShap.modus === 'M1' && (
                  <>
                    <strong>Interpretasi Modus M1:</strong> Deviasi rute kilometer dan interaksi
                    residual dengan durasi berhenti (<code>inter_z_stop</code>) mendorong skor
                    mendekati 0,90–0,94, memberi petunjuk pasti bagi auditor untuk mengecek GPS
                    titik berhenti ilegal.
                  </>
                )}
                {selectedShap.modus === 'M4' && (
                  <>
                    <strong>Interpretasi Modus M4 (Kolusi):</strong> Selain{' '}
                    <code>inter_z_stop (+0,87)</code> dan <code>resid_adj (+0,73)</code>, metrik
                    relasional pasangan kru–SPBU (<code>pair_zscore +0,60</code>) ikut mengangkat
                    probabilitas ke 91,2% sehingga potensi kolusi antara kru dan oknum SPBU dapat
                    segera ditindak.
                  </>
                )}
                {selectedShap.modus === 'M2' && (
                  <span className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
                    <span>
                      <strong>Keterbatasan Kejujuran M2:</strong> Karena pelaku mengambil porsi
                      sangat kecil (0,10–0,30%) tanpa deviasi rute atau berhenti lama, fitur{' '}
                      <code>inter_z_stop</code> justru bernilai negatif. Kasus M2 hanya terdeteksi
                      saat akumulasinya muncul di <strong>CUSUM riwayat kru</strong> (recall M2 =
                      27,9%).
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Cause Validation Matrix */}
          <div className="xl:col-span-6 space-y-5">
            <EditorialHeader
              eyebrow="Validasi Heuristik Dugaan Sebab (Bagian 3.7)"
              title="Kecocokan Dugaan Terhadap Modus Asli Mencapai 68,0%"
              description="Lima aturan heuristik berurutan tidak dirancang sebagai klasifikator terlatih, namun sudah jauh melampaui tebakan kelas mayoritas (47,0%) untuk memberi konteks investigasi awal."
            />

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-sub text-[var(--text-secondary)]">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span>Uji Sensitivitas Ambang Aturan:</span>
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

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-2">
              <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Kurva Trade-off Ambang Probabilitas Pembanding (Partisi Uji)
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
                    <span className="block text-[10px] text-[var(--text-muted)]">p≥{tc.ambang}</span>
                    <strong className="text-[var(--text-primary)]">
                      P {formatNumberId(tc.presisi * 100, 0)}%
                    </strong>
                    <span className="block text-[10px] text-[var(--accent-green)]">
                      R {formatNumberId(tc.recall * 100, 0)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Semakin tinggi ambang probabilitas (mis. 0,60), presisi mencapai{' '}
                <strong>98,3%</strong> namun recall turun ke <strong>44,0%</strong>—meloloskan lebih
                dari separuh kasus penyimpangan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
