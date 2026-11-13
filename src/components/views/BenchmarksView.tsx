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
      {/* WORKBENCH BAND 1: 20-SEED TRAJECTORY & 6-MODEL SCORECARD */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <EditorialHeader
            eyebrow="Pembuktian RQ2 · Evaluasi 20 Replikasi (Seed 42–61) &amp; Skenario Dasar vs Sulit"
            title={
              scenario === 'sulit'
                ? 'Skenario Sulit: B_plus Mempertahankan PR AUC 0,402 Saat Baseline Runtuh ke 0,079'
                : 'Skenario Dasar: Umpan Balik Tertunda (+3 Hari) Mengangkat PR AUC dari 0,430 Menjadi 0,732'
            }
            description="Menggunakan uji peringkat bertanda Wilcoxon berpasangan lintas 20 seed acak independen. Pada kondisi operasional paling ekstrem (derau ukur digandakan &amp; peluang jejak GPS turun ke 0,55), B_plus tidak hanya unggul telak terhadap adj-z (+0,323; p = 1,9×10⁻⁶), melainkan juga memisahkan diri dari B_graph (Δ = +0,012; p = 0,019)."
          />

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
              Skenario Dasar (83a4a949)
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
              Skenario Sulit (5eb161c3)
            </button>
          </div>
        </div>

        {/* Interpretative Comparison Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-blue)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1">
            <p className="font-sub font-bold text-[var(--accent-blue)] uppercase tracking-wider text-[10px]">
              Mengapa B_plus ≈ B_graph di Skenario Dasar?
            </p>
            <p className="text-[var(--text-secondary)]">
              Pada skenario dasar, selisih berpasangan B_plus vs B_graph hanya{' '}
              <strong className="font-mono-num">−0,000 [−0,004; +0,004] (p = 0,898)</strong> karena
              B_graph telah menyerap fitur graf &amp; historis inti. Kontribusi fitur interaktif
              tambahan terbukti saat sinyal memburuk pada Skenario Sulit (Δ = +0,012; p = 0,019).
            </p>
          </div>

          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-green)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1">
            <p className="font-sub font-bold text-[var(--accent-green)] uppercase tracking-wider text-[10px]">
              Nilai Tambah Label Audit Tertunda &amp; Berderau
            </p>
            <p className="text-[var(--text-secondary)]">
              Meskipun 20% anomali terlewat oleh auditor dan 1% trip normal keliru ditandai saat
              umpan balik terbuka (+3 hari), penambahan umpan balik tetap menaikkan deteksi:{' '}
              <strong>IF tak berpengawasan (0,481) → IF_AAD (0,586) → B_plus (0,732)</strong>.
            </p>
          </div>

          <div className="p-4 rounded-lg border-l-2 border-[var(--accent-teal)] bg-[var(--bg-canvas)] border-y border-r border-[var(--border-hairline)] space-y-1">
            <p className="font-sub font-bold text-[var(--accent-teal)] uppercase tracking-wider text-[10px]">
              Stabilitas Kebijakan Replay &amp; Tuning Validation
            </p>
            <p className="text-[var(--text-secondary)]">
              Mengubah pengambil kebijakan audit harian antara B_graph vs B_plus menghasilkan kinerja
              identik (<strong className="font-mono-num">{policyRobustness[1]?.B_graph}</strong> vs{' '}
              <strong className="font-mono-num">{policyRobustness[1]?.B_plus}</strong>). Hyperparameter
              terbaik validasi (<code className="font-mono-num">num_leaves={bestTuning?.num_leaves}</code>,{' '}
              <code className="font-mono-num">lr={bestTuning?.learning_rate}</code>) dibekukan di semua seed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 20-seed trajectory line chart */}
          <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                  Lintasan Konsistensi Antar-Replikasi
                </p>
                <p className="text-sm font-sub font-bold text-[var(--text-primary)]">
                  Seed 42–61 · {scenario === 'sulit' ? 'Skenario Sulit (5eb161c3)' : 'Skenario Dasar (83a4a949)'}
                </p>
              </div>
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
                      'px-2.5 py-1 rounded border transition-colors',
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

            <div className="h-[275px] w-full">
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
                    stroke="#0369a1"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  {trajMetric === 'pr_auc' && (
                    <Line
                      type="monotone"
                      dataKey="IF_AAD"
                      name="IF_AAD (Semi-Supervised)"
                      stroke="#15803d"
                      strokeWidth={1.8}
                      dot={{ r: 2 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="adj_z"
                    name="Baseline adj-z-score"
                    stroke="#e11d48"
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
                <CheckCircle2 className="w-3 h-3" /> Wilcoxon Signifikan
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
                      Pembanding: {sc.pembanding} → NADI: {sc.sistem_nadi}
                    </span>
                    <span>p={sc.p_wilcoxon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6-Model Full Comparison Table */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-sub font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-[var(--accent-blue)]" />
              Rekapitulasi Kuota Audit Harian 5% Lintas 6 Arsitektur Model (Mean ± SD, 20 Seed)
            </p>
            <span className="text-[11px] font-mono-num text-[var(--text-muted)]">
              Uji Skenario Sulit: Δ(B_plus vs adj-z) = +
              {formatNumberId(pairedHardTests[0]?.selisih_rata ?? 0.323, 3)} · p ={' '}
              {(pairedHardTests[0]?.p_wilcoxon ?? 1.9e-6).toExponential(1)}
            </span>
          </div>

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

      {/* WORKBENCH BAND 2: TIER ABLATION (CAPEX GUIDANCE) & SIGMA RANGE SENSITIVITY */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tier Data Ablation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-sub uppercase tracking-wider text-[var(--accent-green)]">
              <Layers className="w-4 h-4" />
              Pembuktian RQ3 · Ablasi Kesiapan Data Bertingkat (5 Replikasi)
            </div>
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] leading-snug">
              Integrasi Tier 2 (Telematika + Riwayat Kru) Memberi Lompatan Terbesar (+0,161 PR AUC)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Seluruh peningkatan kinerja ini dicapai{' '}
              <strong>tanpa membeli sensor tangki perangkat keras baru</strong>—murni dari
              pemanfaatan aliran data digital yang sudah ada. Ablasi berurutan membuktikan bahwa
              prioritas investasi pertama adalah menyatukan log telematika GPS &amp; riwayat kru
              (Tier 2: +0,161 CI [0,117; 0,205]) di atas tabel muat/terima dasar (Tier 1: +0,100),
              lalu diperkaya lapisan graf &amp; DBSCAN (Tier 3: +0,025 [0,007; 0,043]).
            </p>

            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
              <div className="h-[250px] w-full">
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
                    <Bar dataKey="pr_auc" name="PR AUC" fill="#0369a1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recall" name="Recall @5%" fill="#15803d" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="vol_rec"
                      name="Volume Terjaring"
                      fill="#0f766e"
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
              Sensitivitas Ukuran Pencurian Relatif Terhadap Derau σ (398 Anomali Uji)
            </div>
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] leading-snug">
              Pada Pita Mikro (&lt; 1σ), B_plus 5,0× Lebih Tajam daripada adj-z (29,9% vs 6,0%)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ketika pencurian berskala besar (&ge; 1,5σ, 241 trip uji), mayoritas model memadai
              (B_plus 88,0%, adj-z 83,4%). Terobosan NADI terjadi pada dua pita tersulit:{' '}
              <strong>&lt; 1σ</strong> (29,9% vs 6,0%) dan <strong>1,0–1,5σ</strong> (60,2% vs 28,4%),
              yang selama ini lolos dari audit berbasis ambang batas statis karena nilainya berada di
              dalam rentang toleransi meteran.
            </p>

            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
              <div className="h-[250px] w-full">
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
                    <Bar dataKey="B_plus" name="B_plus (%)" fill="#0369a1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="IF_AAD" name="IF_AAD (%)" fill="#15803d" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="adj_z" name="Baseline adj-z (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKBENCH BAND 3: ETHANOL GRADES, FALSE ALARMS, COLD-START POLICY & PARAMETER SENSITIVITY */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ethanol Grade & False Alarm Source */}
          <div className="lg:col-span-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Fuel className="w-4 h-4 text-[var(--accent-green)]" />
                Kinerja Lintas Grade (E10/E20/E50) &amp; Akar Sumber False Alarm
              </span>
              <Badge variant="green">E50 Recall 65,5%</Badge>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Meskipun penguapan dan potensi kontaminasi air pada campuran etanol tinggi (E50)
              meningkatkan tingkat peringatan palsu hingga{' '}
              <strong className="font-mono-num text-[var(--accent-red)]">3,13×</strong> dibanding
              pengiriman wajar normal, tingkat tangkap anomali (recall) pada E50 tetap stabil di{' '}
              <strong className="font-mono-num">65,5%</strong>—hampir setara dengan E10 (67,7%).
            </p>

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

            <div className="space-y-2 pt-2 border-t border-[var(--border-hairline)]">
              <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Lift Alarm Palsu (False Alarm Rate Relatif Terhadap Pengiriman Wajar Biasa)
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[var(--accent-blue)]" />
                  Cold-Start 9 Aktor Baru vs Reputasi Kru Top-3
                </p>
                <Badge variant="blue">Dasar Kebijakan 75% / 25%</Badge>
              </div>

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

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pada periode <em>cold-start</em> (14 hari pertama 9 kru baru yang belum punya
                rekam jejak histori), model tanpa pengawasan adaptif <strong>IF_AAD</strong>{' '}
                menangkap <strong className="font-mono-num">60,4%</strong> anomali—melampaui{' '}
                <code className="font-mono-num">B_plus</code> (53,9%). Temuan empiris inilah yang
                melandasi aturan kuota campuran <strong>75% B_plus + 25% IF_AAD</strong>, sehingga
                sistem tetap menjaga presisi alarm kru{' '}
                <strong className="font-mono-num text-[var(--accent-green)]">
                  {formatNumberId(
                    (crewLatency.find((c) => c.model === 'B_plus')?.presisi_alarm ?? 0.859) * 100,
                    1
                  )}
                  %
                </strong>{' '}
                (vs <span className="font-mono-num">33,3%</span> pada <code>adj-z</code>) sekaligus
                sigap menghadapi pemain baru.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[var(--accent-teal)]" />
                  Sensitivitas Parameter Generator: Hilangnya Sinyal Telematika &amp; Ukuran Kecil
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono-num border-collapse">
                  <thead className="text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
                    <tr>
                      <th className="py-1.5 text-left font-sub">Varian Uji Stres</th>
                      <th className="py-1.5 text-right">B_plus</th>
                      <th className="py-1.5 text-right">adj-z</th>
                      <th className="py-1.5 text-right">Keunggulan Δ</th>
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
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Pada variasi paling berat (<code className="font-mono-num">ukuran_x07</code>, di mana
                ukuran pencurian menyusut 30%), baseline <code className="font-mono-num">adj-z</code>{' '}
                jatuh hingga <strong>0,139</strong> sementara <code className="font-mono-num">B_plus</code>{' '}
                bertahan di <strong>0,606</strong> (selisih +0,467). Even saat sinyal telematika
                ekstrem dihilangkan (<code className="font-mono-num">tanpa_jejak</code>), memori
                CUSUM kru &amp; graf kolusi tetap menjaga keunggulan <strong>+0,322</strong> (wilcoxon{' '}
                <code className="font-mono-num">
                  p = {pairedTestsTrip[8]?.p_wilcoxon.toExponential(1)}
                </code>
                ).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
