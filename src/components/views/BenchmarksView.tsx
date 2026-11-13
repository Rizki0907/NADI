import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Fuel, Layers, ShieldAlert } from 'lucide-react';
import {
  ablasiTier,
  crewLatency,
  crewTop3,
  falseAlarmSources,
  gradeEval,
  pairedTestsTrip,
  prAucScenarios,
  robustness20Seed,
  scorecardNadi,
  seedTrajectoriesDasar,
  seedTrajectoriesSulit,
  sensitivityGenerator,
  sigmaRecall,
} from '../../data';
import { cn } from '../../utils/cn';
import { extractMean, formatNumberId } from '../../utils/format';
import type { ScenarioMode } from '../../utils/physics';
import { Badge } from '../ui/Badge';
import { EditorialHeader } from '../ui/MotionPrimitives';

interface BenchmarksViewProps {
  scenario: ScenarioMode;
  onChangeScenario: (s: ScenarioMode) => void;
}

export function BenchmarksView({ scenario, onChangeScenario }: BenchmarksViewProps) {
  const [trajMetric, setTrajMetric] = useState<'pr_auc' | 'recall' | 'vol_rec'>('pr_auc');

  const trajectoryData = useMemo(() => {
    const src = scenario === 'sulit' ? seedTrajectoriesSulit : seedTrajectoriesDasar;
    return src.map((pt) => {
      if (trajMetric === 'recall') {
        return {
          seed: `S${pt.seed}`,
          B_plus: Number((pt.b_plus_recall * 100).toFixed(1)),
          adj_z: Number((pt.adj_z_recall * 100).toFixed(1)),
          IF_AAD: null,
        };
      }
      if (trajMetric === 'vol_rec') {
        return {
          seed: `S${pt.seed}`,
          B_plus: Number((pt.b_plus_vol_rec * 100).toFixed(1)),
          adj_z: Number((pt.adj_z_vol_rec * 100).toFixed(1)),
          IF_AAD: null,
        };
      }
      return {
        seed: `S${pt.seed}`,
        B_plus: pt.b_plus_pr_auc,
        IF_AAD: pt.if_aad_pr_auc,
        adj_z: pt.adj_z_pr_auc,
      };
    });
  }, [scenario, trajMetric]);

  const ablationChart = useMemo(
    () =>
      ablasiTier.map((row) => ({
        name: row.set_data,
        pr_auc: extractMean(row.PR_AUC),
        recall: extractMean(row.R),
        vol_rec: extractMean(row.vol_rec),
      })),
    []
  );

  const sigmaChart = useMemo(
    () =>
      sigmaRecall.map((r) => ({
        band: r.rentang_sigma,
        n: r.jumlah_trip,
        B_plus: Number((r.B_plus * 100).toFixed(1)),
        IF_AAD: Number((r.IF_AAD * 100).toFixed(1)),
        adj_z: Number((r['baseline (adj-z-score)'] * 100).toFixed(1)),
      })),
    []
  );

  return (
    <div className="w-full">
      {/* BAND 1: 20-SEED TRAJECTORY & 6-MODEL SCORECARD */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <EditorialHeader
              eyebrow="Evaluasi Ketahanan 20 Replikasi (Seed 42–61) · Wilcoxon Signed-Rank"
              title={
                scenario === 'sulit'
                  ? 'Skenario Sulit: B_plus Mempertahankan PR AUC 0,402 Saat Baseline Runtuh ke 0,079'
                  : 'Skenario Dasar: B_plus Unggul Konsisten di Seluruh 20 Replikasi (PR AUC 0,732 vs 0,430)'
              }
              description="Menggunakan uji peringkat bertanda Wilcoxon berpasangan pada 20 seed acak. Penambahan umpan balik investigator menaikkan performa dari IF tak berpengawasan (0,481) → IF_AAD (0,586) → B_plus (0,732)."
            />

            <div className="flex flex-wrap gap-1.5 text-xs font-sub">
              <button
                onClick={() => onChangeScenario('dasar')}
                className={cn(
                  'px-3 py-1.5 rounded border font-semibold',
                  scenario === 'dasar'
                    ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                    : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Skenario Dasar (83a4a949)
              </button>
              <button
                onClick={() => onChangeScenario('sulit')}
                className={cn(
                  'px-3 py-1.5 rounded border font-semibold',
                  scenario === 'sulit'
                    ? 'bg-[var(--accent-red)] text-white border-[var(--accent-red)]'
                    : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Skenario Sulit (5eb161c3)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 20-seed trajectory line chart */}
            <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-sub font-semibold text-[var(--text-primary)]">
                  Lintasan Per-Seed (Seed 42–61 · {scenario === 'sulit' ? 'Skenario Sulit' : 'Skenario Dasar'})
                </p>
                <div className="flex gap-1 text-[11px] font-sub">
                  {([
                    { id: 'pr_auc', label: 'PR AUC' },
                    { id: 'recall', label: 'Recall @5% (%)' },
                    { id: 'vol_rec', label: 'Vol. Terjaring (%)' },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTrajMetric(m.id)}
                      className={cn(
                        'px-2 py-1 rounded border',
                        trajMetric === m.id
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-muted)]'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData} margin={{ top: 8, right: 16, left: -10, bottom: 2 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                    <XAxis dataKey="seed" tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }} />
                    <YAxis
                      domain={trajMetric === 'pr_auc' ? [0, 1] : [0, 100]}
                      tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }}
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
                      dataKey="B_plus"
                      name="B_plus (Usulan NADI)"
                      stroke="#0057a3"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    {trajMetric === 'pr_auc' && (
                      <Line
                        type="monotone"
                        dataKey="IF_AAD"
                        name="IF_AAD (Semi-Supervised)"
                        stroke="#0f8a4b"
                        strokeWidth={1.8}
                        dot={{ r: 2 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="adj_z"
                      name="Baseline adj-z-score"
                      stroke="#d11a2a"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Paired Scorecard Table */}
            <div className="lg:col-span-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Scorecard Uji Berpasangan (20 Seed, 95% CI)
                </p>
                <Badge variant="green">
                  <CheckCircle2 className="w-3 h-3" /> p &lt; 0,001
                </Badge>
              </div>

              <div className="divide-y divide-[var(--border-hairline)] text-xs">
                {scorecardNadi.map((sc) => (
                  <div key={sc.dimensi_evaluasi} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {sc.dimensi_evaluasi}
                      </span>
                      <span className="font-mono-num text-[11px] text-[var(--accent-blue)] font-bold shrink-0">
                        {sc['selisih_berpasangan_[ci95]']}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-[var(--text-muted)]">
                      <span>
                        Base: {sc.pembanding} → NADI: {sc.sistem_nadi}
                      </span>
                      <span>p={sc.p_wilcoxon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6-Model Full Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] font-sub text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="p-3 text-left">Metode Model</th>
                  <th className="p-3 text-right">PR AUC (Dasar)</th>
                  <th className="p-3 text-right">PR AUC (Sulit)</th>
                  <th className="p-3 text-right">Presisi @5%</th>
                  <th className="p-3 text-right">Recall @5%</th>
                  <th className="p-3 text-right">Vol. Terjaring</th>
                  <th className="p-3 text-right">FA / Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)] font-mono-num">
                {robustness20Seed.map((r) => {
                  const hard = prAucScenarios.find((h) => h.model === r.model);
                  const isWin = r.model === 'B_plus';
                  return (
                    <tr
                      key={r.model}
                      className={cn(isWin && 'bg-sky-500/[0.07] font-semibold')}
                    >
                      <td className="p-3 font-sub text-[var(--text-primary)]">
                        {r.model}{' '}
                        {isWin && (
                          <Badge variant="blue" className="ml-1.5">
                            Usulan NADI
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right text-[var(--accent-blue)]">{r.PR_AUC}</td>
                      <td className="p-3 text-right text-[var(--accent-red)]">
                        {hard?.skenario_sulit ?? '—'}
                      </td>
                      <td className="p-3 text-right">{r.P}</td>
                      <td className="p-3 text-right text-[var(--accent-green)]">{r.R}</td>
                      <td className="p-3 text-right">{r.vol_rec}</td>
                      <td className="p-3 text-right text-[var(--text-muted)]">{r.FA_per_hari}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BAND 2: TIER ABLATION & SIGMA RANGE RECALL */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Tier Data Ablation */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-sub uppercase tracking-wider text-[var(--accent-green)]">
                <Layers className="w-4 h-4" />
                Ablasi Kesiapan Data (5 Replikasi)
              </div>
              <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                Integrasi Tier 2 (Telematika + Riwayat Kru) Memberi Lompatan Terbesar (+0,161 PR AUC)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Temuan ini memandu prioritas investasi: sebelum membangun analitik graf relasional Tier
                3 (+0,025 PR AUC), integrasi data pengukuran bersama GPS telematika &amp; riwayat kru
                memberi nilai pengembalian deteksi terbesar (+0,161 [0,117; 0,205]).
              </p>

              <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ablationChart} margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-strong)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="pr_auc" name="PR AUC" fill="#0057a3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recall" name="Recall @5%" fill="#0f8a4b" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="vol_rec"
                        name="Volume Terjaring"
                        fill="#0e7490"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recall by Sigma Band */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-sub uppercase tracking-wider text-[var(--accent-red)]">
                <ShieldAlert className="w-4 h-4" />
                Sensitivitas Ukuran Pencurian Terhadap σ (Seed 42, 398 Anomali Uji)
              </div>
              <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                Pada Anomali Mikro (&lt; 1σ), B_plus 5,0× Lebih Tajam daripada adj-z (29,9% vs 6,0%)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pada pita besar ≥ 1,5σ (241 perjalanan), semua model cukup baik (B_plus 88,0%).
                Keunggulan mutlak NADI muncul di pita &lt; 1σ dan 1,0–1,5σ yang selama ini lolos dari
                rekonsiliasi volume murni.
              </p>

              <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sigmaChart} margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                      <XAxis dataKey="band" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                      <YAxis
                        unit="%"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <Tooltip
                        formatter={(v: number) => `${v}%`}
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-strong)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="B_plus" name="B_plus (%)" fill="#0057a3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="IF_AAD" name="IF_AAD (%)" fill="#0f8a4b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="adj_z" name="Baseline adj-z (%)" fill="#d11a2a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 3: ETHANOL GRADES, FALSE ALARMS, PARAMETER SENSITIVITY & NEW ACTOR LATENCY */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Ethanol Grade & False Alarm Source */}
            <div className="lg:col-span-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Fuel className="w-4 h-4 text-[var(--accent-green)]" />
                  Kinerja Lintas Kadar Etanol &amp; Akar Sumber False Alarm
                </span>
                <Badge variant="green">E50 Recall 65,5%</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {gradeEval.map((g) => (
                  <div
                    key={g.grade}
                    className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-sub">{g.grade}</strong>
                      <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                        n={g.n_anomali}
                      </span>
                    </div>
                    <p className="font-mono-num text-xl font-bold text-[var(--accent-blue)] mt-1">
                      {formatNumberId(g.recall * 100, 1)}%
                    </p>
                    <p className="text-[10px] font-mono-num text-[var(--text-muted)]">
                      CI [{formatNumberId(g.ci_bawah * 100, 1)}–{formatNumberId(g.ci_atas * 100, 1)}%]
                    </p>
                    <p className="text-[10px] font-mono-num text-[var(--text-secondary)] mt-1">
                      FA: {formatNumberId(g.tingkat_fa * 100, 2)}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Lift Alarm Palsu Dibanding Pengiriman Wajar Biasa
                </p>
                {falseAlarmSources.map((fa) => (
                  <div
                    key={fa.sumber}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border-hairline)] last:border-none"
                  >
                    <span className="text-[var(--text-secondary)] capitalize">
                      {fa.sumber} ({formatNumberId(fa.trip_wajar)} trip)
                    </span>
                    <span className="font-mono-num">
                      <strong
                        className={cn(
                          fa.lift_vs_wajar_biasa > 1.5
                            ? 'text-[var(--accent-red)]'
                            : fa.lift_vs_wajar_biasa < 1
                              ? 'text-[var(--accent-green)]'
                              : 'text-[var(--text-primary)]'
                        )}
                      >
                        {formatNumberId(fa.lift_vs_wajar_biasa, 2)}×
                      </strong>{' '}
                      <span className="text-[var(--text-muted)]">
                        ({formatNumberId(fa.tingkat_fa * 100, 2)}% FA)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* New Actor Cold-Start & Crew Top-3 + Generator Sensitivity */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-3">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Deteksi Level Kru Top-3 (14 Hari) vs Cold-Start 9 Aktor Baru
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {crewTop3.slice(0, 3).map((ct) => (
                    <div
                      key={ct.model}
                      className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
                    >
                      <span className="font-sub font-bold text-[var(--text-primary)]">{ct.model}</span>
                      <p className="font-mono-num text-lg font-bold text-[var(--accent-blue)] mt-1">
                        AP {formatNumberId(ct.AP, 3)}
                      </p>
                      <p className="font-mono-num text-[10px] text-[var(--text-muted)]">
                        AUC {formatNumberId(ct.AUC, 3)} · P@k {formatNumberId(ct.P_k, 3)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Pada 14 hari pertama aktor baru, **IF_AAD** mencatat recall{' '}
                  <span className="font-mono-num font-semibold">0,604</span> (di atas{' '}
                  <code>B_plus</code> <span className="font-mono-num">0,539</span>; alasan kebijakan
                  hibrida 25% IF_AAD!), sedangkan presisi alarm <code>B_plus</code> mencapai{' '}
                  <strong className="font-mono-num text-[var(--accent-green)]">
                    {formatNumberId(
                      (crewLatency.find((c) => c.model === 'B_plus')?.presisi_alarm ?? 0.859) * 100,
                      1
                    )}
                    %
                  </strong>{' '}
                  berbanding <span className="font-mono-num">33,3%</span> pada <code>adj-z</code>.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-2.5">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Sensitivitas Parameter Generator (Tanpa Jejak Telematika vs Ukuran Kecil)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono-num border-collapse">
                    <thead className="text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
                      <tr>
                        <th className="py-1.5 text-left font-sub">Varian</th>
                        <th className="py-1.5 text-right">B_plus</th>
                        <th className="py-1.5 text-right">adj-z</th>
                        <th className="py-1.5 text-right">Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-hairline)]">
                      {sensitivityGenerator.map((s) => (
                        <tr key={s.varian}>
                          <td className="py-1.5 font-sub text-[var(--text-primary)]">{s.varian}</td>
                          <td className="py-1.5 text-right text-[var(--accent-blue)] font-semibold">
                            {s.PR_AUC_Bplus}
                          </td>
                          <td className="py-1.5 text-right text-[var(--text-muted)]">
                            {s.PR_AUC_base_adj}
                          </td>
                          <td className="py-1.5 text-right text-[var(--accent-green)] font-bold">
                            +{s.selisih_Bplus_vs_base}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  * Terbukti pada 20 seed: `pairedTestsTrip` menunjukkan p ={' '}
                  {pairedTestsTrip[4]?.p_wilcoxon.toExponential(1)} (B_plus vs IF_AAD) &amp; p ={' '}
                  {pairedTestsTrip[8]?.p_wilcoxon.toExponential(1)} (B_plus vs adj-z).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
