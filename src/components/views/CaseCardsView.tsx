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
  FileSearch,
  Fuel,
  MapPin,
  ShieldAlert,
  Sliders,
  UserCheck,
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

  return (
    <div className="w-full">
      {/* SECTION 1: INVESTIGATOR DISPATCH DOCKET (MASTER-DETAIL INBOX LAYOUT) */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] py-8 lg:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header + Tier Summary Bar */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <p className="font-sub text-[10.5px] uppercase tracking-[0.14em] text-[var(--accent-blue)]">
                Modul Operasional · Bagian 3.4 &amp; 3.5 Paper · Triase Kapasitas 5% Harian
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Meja Disposisi Kartu Kasus &amp; Atribusi Numerik TreeSHAP
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Menjaga prinsip <strong>Human-in-the-Loop</strong>: kuota 5% harian memadatkan
                alarm ke Tier 1 Segera dengan kepadatan temuan{' '}
                <strong className="font-mono-num text-[var(--accent-blue)]">2,8×</strong> lebih
                presisi (<strong className="font-mono-num">35,6% vs 12,8%</strong>) ketimbang ambang
                tetap p &ge; 0,50, sembari tetap membongkar pencurian berulang di bawah 1σ.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs shrink-0">
              {tierEval.map((t) => (
                <div
                  key={t.tier}
                  className={cn(
                    'px-3 py-2 rounded-md border bg-[var(--bg-canvas)]',
                    t.tier.includes('Tier 1')
                      ? 'border-[var(--accent-red)]/50'
                      : t.tier.includes('Tier 2')
                        ? 'border-[var(--accent-amber)]/50'
                        : 'border-[var(--border-hairline)]'
                  )}
                >
                  <p className="font-sub text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    {t.tier.split(':')[0]}
                  </p>
                  <p className="font-mono-num text-sm font-bold text-[var(--text-primary)] mt-0.5">
                    {formatNumberId(t.presisi_anomali * 100, 1)}% presisi
                  </p>
                  <p className="font-mono-num text-[10px] text-[var(--text-muted)]">
                    {t.kasus_terbukti}/{t.total_trip} trip
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* MASTER-DETAIL SPLIT WORKBENCH: Left Priority Queue (5 cols) | Right Forensic Dossier (7 cols) */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            {/* LEFT QUEUE RAIL */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)] flex flex-col bg-[var(--bg-surface)]">
              {/* Filter Bar */}
              <div className="p-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 flex flex-wrap items-center justify-between gap-2">
                <span className="font-sub text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Antrean Prioritas ({filteredCases.length}/12 Teruji)
                </span>
                <div className="flex flex-wrap items-center gap-1 text-[10.5px] font-sub">
                  {(['ALL', 'T0', 'T1'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTerminalFilter(t)}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        terminalFilter === t
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-muted)]'
                      )}
                    >
                      {t === 'ALL' ? 'Semua' : t}
                    </button>
                  ))}
                  {(['E10', 'E20', 'E50'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter((prev) => (prev === g ? 'ALL' : g))}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        gradeFilter === g
                          ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-muted)]'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Ranked Ticket List */}
              <div className="flex-1 max-h-[480px] overflow-y-auto divide-y divide-[var(--border-hairline)]">
                {filteredCases.map((c, idx) => {
                  const isActive = selectedCase.trip_id === c.trip_id;
                  return (
                    <button
                      key={c.trip_id}
                      onClick={() => setSelectedCase(c)}
                      className={cn(
                        'w-full px-4 py-3 text-left transition-colors flex items-start justify-between gap-3 border-l-[3px]',
                        isActive
                          ? 'bg-sky-500/[0.08] border-l-[var(--accent-blue)]'
                          : 'border-l-transparent hover:bg-[var(--bg-canvas)]'
                      )}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-xs font-bold text-[var(--accent-blue)]">
                            #{c.trip_id}
                          </span>
                          <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                            Peringkat {idx + 1} · Hr {c.day}
                          </span>
                          <Badge
                            variant={
                              c.ethanol_grade === 'E50'
                                ? 'red'
                                : c.ethanol_grade === 'E20'
                                  ? 'green'
                                  : 'blue'
                            }
                          >
                            {c.ethanol_grade}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-sub text-[var(--text-secondary)]">
                          {c.terminal_id} → <strong>{c.spbu_id}</strong> · Kru{' '}
                          <strong
                            className={cn(
                              c.crew_id === 'C071' && 'text-[var(--accent-red)]'
                            )}
                          >
                            {c.crew_id}
                          </strong>
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                          {c.dugaan_sebab}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="font-mono-num text-xs font-bold text-[var(--accent-red)] block">
                          {formatNumberId(c.skor_prob * 100, 1)}%
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-sub text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Anomali
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Recurring Actor Alert Strip */}
              <div className="p-3 bg-rose-500/[0.06] border-t border-rose-500/20 text-[11px] text-[var(--text-secondary)] leading-snug">
                <strong className="text-[var(--accent-red)]">Temuan Kru C071:</strong> Akumulasi
                CUSUM mengangkat <strong>7 dari 12</strong> kartu kasus uji teratas berasal dari{' '}
                <strong>Kru C071</strong> meski susut tunggal sering &lt; 1σ.
              </div>
            </div>

            {/* RIGHT ACTIVE FORENSIC DOSSIER & TREESHAP INSPECTOR */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-6">
              <div className="space-y-5">
                {/* Docket File Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono-num text-[10.5px] text-[var(--text-muted)]">
                      <FileSearch className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                      BERKAS TRIASE INVESTIGATOR · HARI KE-{selectedCase.day}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                      Perjalanan #{selectedCase.trip_id} — Kru {selectedCase.crew_id}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="red">{selectedCase.tier}</Badge>
                    <Badge variant="green">Terbukti Label={selectedCase.label}</Badge>
                  </div>
                </div>

                {/* Telemetry Key Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-sub uppercase text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Jalur Rantai
                    </span>
                    <p className="font-mono-num font-bold text-[var(--text-primary)] mt-1">
                      {selectedCase.terminal_id} → {selectedCase.spbu_id}
                    </p>
                  </div>

                  <div className="p-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-sub uppercase text-[var(--text-muted)] flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Awak Mobil Tangki
                    </span>
                    <p className="font-mono-num font-bold text-[var(--accent-blue)] mt-1">
                      {selectedCase.crew_id}
                    </p>
                  </div>

                  <div className="p-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-sub uppercase text-[var(--text-muted)] flex items-center gap-1">
                      <Fuel className="w-3 h-3" /> Grade Bioetanol
                    </span>
                    <p className="font-mono-num font-bold text-[var(--accent-green)] mt-1">
                      {selectedCase.ethanol_grade}
                    </p>
                  </div>

                  <div className="p-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-sub uppercase text-[var(--text-muted)] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Skor B_plus
                    </span>
                    <p className="font-mono-num text-lg font-bold text-[var(--accent-red)] mt-0.5">
                      {formatNumberId(selectedCase.skor_prob * 100, 1)}%
                    </p>
                  </div>
                </div>

                {/* Cause & Action Field Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg border-l-2 border-[var(--accent-red)] bg-[var(--bg-surface)] border-y border-r border-[var(--border-hairline)] space-y-1">
                    <p className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--accent-red)]">
                      Dugaan Penyebab Heuristik
                    </p>
                    <p className="text-[var(--text-primary)] font-semibold leading-relaxed capitalize">
                      {selectedCase.dugaan_sebab}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border-l-2 border-[var(--accent-blue)] bg-[var(--bg-surface)] border-y border-r border-[var(--border-hairline)] space-y-1">
                    <p className="font-sub text-[10px] font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                      Tindakan Audit Terarah Lapangan
                    </p>
                    <p className="text-[var(--text-secondary)] leading-relaxed capitalize">
                      {selectedCase.rekomendasi}
                    </p>
                  </div>
                </div>

                {/* Integrated TreeSHAP Local Attribution Force Plot */}
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-sub text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        Dekonstruksi Skor TreeSHAP Eksak · Profil Modus Uji Representative
                      </p>
                      <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                        Pilih Sampel Profil Modus untuk Melihat Pendorong Numerik:
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-sub">
                      {localShapCases.map((sc) => (
                        <button
                          key={sc.trip_id}
                          onClick={() => setSelectedShap(sc)}
                          className={cn(
                            'px-2.5 py-1 rounded border transition-colors',
                            selectedShap.trip_id === sc.trip_id
                              ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                              : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                          )}
                        >
                          #{sc.trip_id} ({sc.modus})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[155px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={shapBars}
                        layout="vertical"
                        margin={{ top: 4, right: 20, left: 20, bottom: 2 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                        <XAxis
                          type="number"
                          domain={[-0.6, 1.1]}
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="feature"
                          width={118}
                          tick={{ fontSize: 10.5, fill: 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}
                        />
                        <ReferenceLine x={0} stroke="var(--text-muted)" />
                        <Tooltip
                          formatter={(val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)} log-odds`}
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-strong)',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="contribution" radius={[0, 3, 3, 0]}>
                          {shapBars.map((b) => (
                            <Cell key={b.feature} fill={b.contribution >= 0 ? '#e11d48' : '#0369a1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {selectedShap.modus === 'M2' ? (
                      <span>
                        <strong className="text-[var(--accent-red)]">Contoh Celah Kejujuran (M2 Tanpa Jejak):</strong>{' '}
                        Pada Trip #{selectedShap.trip_id}, pencurian mikro tidak menimbulkan deviasi
                        rute maupun stop panjang, sehingga skor B_plus turun ke{' '}
                        <strong>{formatNumberId(selectedShap.skor_prob * 100, 1)}%</strong> (recall M2
                        masih <strong>27,9%</strong>).
                      </span>
                    ) : (
                      <span>
                        <strong>Penjelasan Transparan Modus {selectedShap.modus}:</strong> Kombinasi
                        atribut perilaku dan residual mendorong probabilitas ke{' '}
                        <strong>{formatNumberId(selectedShap.skor_prob * 100, 1)}%</strong>—langsung
                        menunjuk bukti yang harus diverifikasi auditor.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CAUSE MATRIX, THRESHOLD POLICY & HEURISTIC SENSITIVITY */}
      <section className="py-9 lg:py-11 bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quota 5% vs Static Threshold Ledger */}
          <div className="lg:col-span-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <ClipboardCheck className="w-4 h-4 text-[var(--accent-green)]" />
                Evaluasi Operasional Kuota 5% vs Ambang Statis
              </span>
              <Badge variant="blue">F1 Kuota 0,468 vs 0,213</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse font-mono-num">
                <thead className="border-b border-[var(--border-hairline)] text-[10px] font-sub uppercase text-[var(--text-muted)]">
                  <tr>
                    <th className="py-2 text-left">Definisi Operasi</th>
                    <th className="py-2 text-right">Presisi</th>
                    <th className="py-2 text-right">Recall</th>
                    <th className="py-2 text-right">F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {operatingPoints.map((op) => (
                    <tr key={op.definisi}>
                      <td className="py-2 font-sub text-[var(--text-primary)]">{op.definisi}</td>
                      <td className="py-2 text-right font-bold text-[var(--accent-blue)]">
                        {formatNumberId(op.presisi * 100, 1)}%
                      </td>
                      <td className="py-2 text-right">{formatNumberId(op.recall * 100, 1)}%</td>
                      <td className="py-2 text-right">{formatNumberId(op.f1, 3)}</td>
                    </tr>
                  ))}
                  {thresholdCompare.slice(0, 2).map((tc) => (
                    <tr key={tc.ambang} className="text-[var(--text-muted)]">
                      <td className="py-2 font-sub">
                        Ambang Statis p ≥ {formatNumberId(tc.ambang, 2)} ({formatNumberId(tc.persen_trip_ditandai, 1)}% trip)
                      </td>
                      <td className="py-2 text-right">{formatNumberId(tc.presisi * 100, 1)}%</td>
                      <td className="py-2 text-right">{formatNumberId(tc.recall * 100, 1)}%</td>
                      <td className="py-2 text-right">{formatNumberId(tc.f1, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cause Validation Matrix & Heuristic Sensitivity */}
          <div className="lg:col-span-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Sliders className="w-4 h-4 text-[var(--accent-teal)]" />
                Validasi Silang Dugaan Sebab vs Ground Truth (398 Anomali Uji)
              </span>
              <Badge variant="neutral">Akurasi Ketat 68,0%</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono-num border-collapse">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-muted)] font-sub uppercase">
                  <tr>
                    <th className="py-1.5 text-left">Kategori Dugaan</th>
                    <th className="py-1.5 text-right">M1</th>
                    <th className="py-1.5 text-right">M2</th>
                    <th className="py-1.5 text-right">M3</th>
                    <th className="py-1.5 text-right">M4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {causeValidationMatrix.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-sub text-[var(--text-primary)]">
                        {String(row.dugaan_sebab ?? row.kategori ?? Object.values(row)[0])}
                      </td>
                      <td className="py-1.5 text-right">{String(row.M1 ?? 0)}</td>
                      <td className="py-1.5 text-right">{String(row.M2 ?? 0)}</td>
                      <td className="py-1.5 text-right">{String(row.M3 ?? 0)}</td>
                      <td className="py-1.5 text-right">{String(row.M4 ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[var(--accent-amber)] shrink-0" />
                Skala Ambang Aturan ({ruleSens[ruleScaleIdx]?.skala_ambang ?? 1.0}×):{' '}
                <strong className="font-mono-num text-[var(--text-primary)]">
                  {formatNumberId((ruleSens[ruleScaleIdx]?.akurasi_ketat ?? 0.68) * 100, 1)}%
                </strong>
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, ruleSens.length - 1)}
                value={ruleScaleIdx}
                onChange={(e) => setRuleScaleIdx(Number(e.target.value))}
                aria-label="Uji sensitivitas skala ambang aturan"
                className="w-40 accent-[var(--accent-blue)]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
