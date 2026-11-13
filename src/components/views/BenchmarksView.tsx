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
import {
  CheckCircle2,
  Cpu,
  Fuel,
  GitCompare,
  Layers,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
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
  tablesData,
} from '../../data';
import { cn } from '../../utils/cn';
import { extractMean, formatNumberId } from '../../utils/format';
import type { ScenarioMode } from '../../utils/physics';
import { Badge } from '../ui/Badge';

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

  const pairedHardTests = useMemo(
    () =>
      (tablesData.uji_berpasangan_skenario_sulit as {
        pembanding: string;
        metrik: string;
        selisih_rata: number;
        ci95_bawah: number;
        ci95_atas: number;
        p_wilcoxon: number;
      }[]) ?? [],
    []
  );

  const policyRobustness = useMemo(
    () =>
      (tablesData.robustness_menurut_kebijakan_investigasi as {
        model: string;
        B_graph: string;
        B_plus: string;
      }[]) ?? [],
    []
  );

  const bestTuning = useMemo(
    () =>
      (tablesData.hasil_tuning_hyperparameter as {
        kombinasi: number;
        PR_AUC: number;
        ROC_AUC: number;
        num_leaves: number;
        min_child_samples: number;
        learning_rate: number;
        reg_lambda: number;
        colsample_bytree: number;
      }[])[0],
    []
  );

  return (
    <div className="w-full">
      {/* SECTION 1: STRESS-TEST VALIDATION HEADER & 20-SEED BENCHMARK MATRIX */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] py-8 lg:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <p className="font-sub text-[10.5px] uppercase tracking-[0.14em] text-[var(--accent-blue)]">
                Lembar Validasi Statistik RQ2 &amp; RQ3 · 20 Replikasi Seed (42–61) · Wilcoxon Signed-Rank
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {scenario === 'sulit'
                  ? 'Skenario Sulit: B_plus Bertahan di PR AUC 0,402 Saat adj-z Runtuh ke 0,079'
                  : 'Skenario Dasar: Umpan Balik +3 Hari Mengangkat PR AUC 0,430 Menjadi 0,732'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Penambahan umpan balik audit tertunda &amp; berderau (20% meleset, 1% keliru) menaikkan
                kinerja bertahap dari <strong>IF (0,481) → IF_AAD (0,586) → B_plus (0,732)</strong>. Di
                kondisi ekstrem Skenario Sulit, fitur tambahan <code>B_plus</code> terpisah signifikan
                dari <code>B_graph</code> (Δ = +0,012; p = 0,019).
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs font-sub shrink-0">
              <button
                onClick={() => onChangeScenario('dasar')}
                className={cn(
                  'px-3 py-1.5 rounded border font-semibold transition-colors',
                  scenario === 'dasar'
                    ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                    : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Dasar (83a4a949)
              </button>
              <button
                onClick={() => onChangeScenario('sulit')}
                className={cn(
                  'px-3 py-1.5 rounded border font-semibold transition-colors',
                  scenario === 'sulit'
                    ? 'bg-[var(--accent-red)] text-white border-[var(--accent-red)]'
                    : 'bg-[var(--bg-canvas)] border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Sulit (5eb161c3)
              </button>
            </div>
          </div>

          {/* 4 Paired Confidence Chips Strip */}
          <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
            {scorecardNadi.slice(0, 4).map((sc) => (
              <div key={sc.dimensi_evaluasi} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[10px] font-sub uppercase text-[var(--text-muted)]">
                  <span>{sc.dimensi_evaluasi}</span>
                  <span className="font-mono-num text-emerald-700 dark:text-emerald-300 font-bold">
                    p={sc.p_wilcoxon}
                  </span>
                </div>
                <p className="font-mono-num text-base font-bold text-[var(--accent-blue)]">
                  {sc['selisih_berpasangan_[ci95]']}
                </p>
                <p className="text-[11px] font-mono-num text-[var(--text-secondary)]">
                  Base {sc.pembanding} → NADI {sc.sistem_nadi}
                </p>
              </div>
            ))}
          </div>

          {/* Side-by-side: Trajectory Plot + 6-Model Leaderboard */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                    Lintasan Seed 42–61 · {scenario === 'sulit' ? 'Sulit' : 'Dasar'}
                  </p>
                  <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                    Konsistensi Antar-Replikasi Independen
                  </h3>
                </div>
                <div className="flex gap-1 text-[10.5px] font-sub">
                  {([
                    { id: 'pr_auc', label: 'PR AUC' },
                    { id: 'recall', label: 'Recall @5%' },
                    { id: 'vol_rec', label: 'Vol. Terjaring' },
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

              <div className="h-[275px] w-full bg-[var(--bg-surface)] rounded border border-[var(--border-hairline)] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trajectoryData}
                    margin={{ top: 8, right: 14, left: -12, bottom: 2 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                    <XAxis dataKey="seed" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis
                      domain={trajMetric === 'pr_auc' ? [0, 1] : [0, 100]}
                      tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
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
                      name="B_plus (Usulan)"
                      stroke="#0369a1"
                      strokeWidth={2.5}
                      dot={{ r: 2.5 }}
                    />
                    {trajMetric === 'pr_auc' && (
                      <Line
                        type="monotone"
                        dataKey="IF_AAD"
                        name="IF_AAD"
                        stroke="#15803d"
                        strokeWidth={1.8}
                        dot={{ r: 2 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="adj_z"
                      name="Baseline adj-z"
                      stroke="#e11d48"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between gap-2">
                <span className="font-sub text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-[var(--accent-blue)]" />
                  Rekap Kuota 5% Lintas 6 Model (Mean ± SD)
                </span>
                <Badge variant="green">
                  <CheckCircle2 className="w-3 h-3" /> Sulit p ={' '}
                  {(pairedHardTests[0]?.p_wilcoxon ?? 1.9e-6).toExponential(1)}
                </Badge>
              </div>

              <div className="overflow-x-auto bg-[var(--bg-surface)]">
                <table className="w-full text-[11.5px] border-collapse font-mono-num">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] font-sub text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="p-2.5 text-left">Model</th>
                      <th className="p-2.5 text-right">PR Dasar</th>
                      <th className="p-2.5 text-right">PR Sulit</th>
                      <th className="p-2.5 text-right">Recall</th>
                      <th className="p-2.5 text-right">Vol.</th>
                      <th className="p-2.5 text-right">FA/Hr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {robustness20Seed.map((r) => {
                      const hard = prAucScenarios.find((h) => h.model === r.model);
                      const isWin = r.model === 'B_plus';
                      return (
                        <tr key={r.model} className={cn(isWin && 'bg-sky-500/[0.08] font-semibold')}>
                          <td className="p-2.5 font-sub text-[var(--text-primary)]">{r.model}</td>
                          <td className="p-2.5 text-right text-[var(--accent-blue)]">{r.PR_AUC}</td>
                          <td className="p-2.5 text-right text-[var(--accent-red)]">
                            {hard?.skenario_sulit ?? '—'}
                          </td>
                          <td className="p-2.5 text-right text-[var(--accent-green)]">{r.R}</td>
                          <td className="p-2.5 text-right">{r.vol_rec}</td>
                          <td className="p-2.5 text-right text-[var(--text-muted)]">
                            {r.FA_per_hari}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-hairline)] leading-relaxed">
                <strong>Stabilitas Replay &amp; Validation Freezing:</strong> Mengganti model pemilih
                audit harian antara <code>B_graph</code> vs <code>B_plus</code> menjaga hasil
                hampir identik ({policyRobustness[1]?.B_graph} vs {policyRobustness[1]?.B_plus}).
                Hyperparameter optimal (<code>num_leaves={bestTuning?.num_leaves}</code>,{' '}
                <code>lr={bestTuning?.learning_rate}</code>) dikunci pada semua 20 replikasi.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 2x2 TECHNICAL DIAGNOSTIC MATRIX QUADRANTS */}
      <section className="py-9 lg:py-11 bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QUADRANT [RQ3-A]: DATA READINESS TIER ABLATION */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex items-center justify-between">
              <span className="font-mono-num text-[11px] font-bold text-[var(--accent-green)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> [RQ3-A] ABLASI KESIAPAN DATA (5 SEED)
              </span>
              <Badge variant="green">Tanpa Sensor Baru</Badge>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Prioritas investasi digital PT Pertamina Patra Niaga terbukti: menyatukan telematika
                GPS &amp; riwayat kru (<strong>Tier 1+2</strong>) menyumbang lompatan terbesar{' '}
                <strong className="font-mono-num text-[var(--accent-blue)]">
                  +0,161 [0,117; 0,205] PR AUC
                </strong>{' '}
                di atas Tier 1 (+0,100), disempurnakan graf &amp; DBSCAN Tier 3 (+0,025).
              </p>
              <div className="h-[225px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ablationChart} margin={{ top: 8, right: 12, left: -12, bottom: 2 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: 'var(--text-secondary)' }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-strong)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="pr_auc" name="PR AUC" fill="#0369a1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="recall" name="Recall @5%" fill="#15803d" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="vol_rec" name="Vol. Terjaring" fill="#0f766e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* QUADRANT [RQ3-B]: SIGMA BAND RECALL (MICRO THEFT) */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex items-center justify-between">
              <span className="font-mono-num text-[11px] font-bold text-[var(--accent-red)] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> [RQ3-B] SENSITIVITAS UKURAN TERHADAP σ
              </span>
              <Badge variant="red">&lt; 1σ: 5,0× Lebih Tajam</Badge>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pada penyimpangan mikro di bawah standar deviasi ukur (<strong>&lt; 1σ</strong>),{' '}
                <code>adj-z</code> hanya menangkap <strong>6,0%</strong> sedangkan <code>B_plus</code>{' '}
                menangkap <strong>29,9%</strong> (5,0× lipat), dan pada 1,0–1,5σ naik menjadi{' '}
                <strong>60,2% vs 28,4%</strong>.
              </p>
              <div className="h-[225px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sigmaChart} margin={{ top: 8, right: 12, left: -12, bottom: 2 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                    <XAxis dataKey="band" tick={{ fontSize: 10.5, fill: 'var(--text-secondary)' }} />
                    <YAxis
                      unit="%"
                      domain={[0, 100]}
                      tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }}
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
                    <Bar dataKey="B_plus" name="B_plus (%)" fill="#0369a1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="IF_AAD" name="IF_AAD (%)" fill="#15803d" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="adj_z" name="adj-z (%)" fill="#e11d48" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* QUADRANT [RQ3-C]: ETHANOL GRADES & FALSE ALARM SOURCES */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex items-center justify-between">
              <span className="font-mono-num text-[11px] font-bold text-[var(--accent-blue)] flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5" /> [RQ3-C] LINTAS GRADE E10–E50 &amp; SUMBER FA
              </span>
              <Badge variant="green">E50 Recall 65,5%</Badge>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {gradeEval.map((g) => (
                  <div
                    key={g.grade}
                    className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                  >
                    <div className="flex justify-between font-sub">
                      <strong>{g.grade}</strong>
                      <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                        n={g.n_anomali}
                      </span>
                    </div>
                    <p className="font-mono-num text-lg font-bold text-[var(--accent-blue)] mt-1">
                      {formatNumberId(g.recall * 100, 1)}%
                    </p>
                    <p className="text-[10px] font-mono-num text-[var(--text-muted)]">
                      FA {formatNumberId(g.tingkat_fa * 100, 2)}%
                    </p>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-[var(--border-hairline)] text-xs">
                {falseAlarmSources.map((fa) => (
                  <div key={fa.sumber} className="py-1.5 flex justify-between">
                    <span className="text-[var(--text-secondary)] capitalize">
                      {fa.sumber} ({formatNumberId(fa.trip_wajar)} trip)
                    </span>
                    <span className="font-mono-num font-bold text-[var(--accent-red)]">
                      {formatNumberId(fa.lift_vs_wajar_biasa, 2)}×{' '}
                      <span className="font-normal text-[var(--text-muted)]">
                        ({formatNumberId(fa.tingkat_fa * 100, 2)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUADRANT [RQ3-D]: COLD-START 9 NEW ACTORS & GENERATOR SENSITIVITY */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex items-center justify-between">
              <span className="font-mono-num text-[11px] font-bold text-[var(--accent-teal)] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> [RQ3-D] COLD-START AKTOR BARU &amp; STRES GENERATOR
              </span>
              <Badge variant="blue">Hibrida 75/25</Badge>
            </div>
            <div className="p-5 space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {crewTop3.slice(0, 3).map((ct) => (
                  <div
                    key={ct.model}
                    className="p-2.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                  >
                    <span className="font-sub font-bold text-[var(--text-primary)]">{ct.model}</span>
                    <p className="font-mono-num text-base font-bold text-[var(--accent-blue)]">
                      AP {formatNumberId(ct.AP, 3)}
                    </p>
                    <p className="font-mono-num text-[10px] text-[var(--text-muted)]">
                      P@k {formatNumberId(ct.P_k, 3)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Pada 14 hari pertama 9 kru baru, <strong>IF_AAD</strong> mencatat recall{' '}
                <strong className="font-mono-num">0,604</strong> (di atas <code>B_plus</code> 0,539),
                sehingga kuota harian mencampurkan 25% <code>IF_AAD</code> sambil mempertahankan
                presisi alarm kru{' '}
                <strong className="font-mono-num text-[var(--accent-green)]">
                  {formatNumberId(
                    (crewLatency.find((c) => c.model === 'B_plus')?.presisi_alarm ?? 0.859) * 100,
                    1
                  )}
                  %
                </strong>
                .
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono-num border-collapse">
                  <thead className="border-b border-[var(--border-hairline)] text-[var(--text-muted)] font-sub">
                    <tr>
                      <th className="py-1 text-left">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Varian Stres
                      </th>
                      <th className="py-1 text-right">B_plus</th>
                      <th className="py-1 text-right">adj-z</th>
                      <th className="py-1 text-right">Selisih Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {sensitivityGenerator.map((s) => (
                      <tr key={s.varian}>
                        <td className="py-1 font-sub text-[var(--text-primary)]">{s.varian}</td>
                        <td className="py-1 text-right text-[var(--accent-blue)] font-semibold">
                          {s.PR_AUC_Bplus}
                        </td>
                        <td className="py-1 text-right text-[var(--text-muted)]">
                          {s.PR_AUC_base_adj}
                        </td>
                        <td className="py-1 text-right text-[var(--accent-green)] font-bold">
                          +{s.selisih_Bplus_vs_base}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono-num">
                Wilcoxon 20-seed: p = {pairedTestsTrip[8]?.p_wilcoxon.toExponential(1)} (B_plus vs
                adj-z).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
