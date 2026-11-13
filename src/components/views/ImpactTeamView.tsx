import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookMarked,
  CheckCircle2,
  Coins,
  Compass,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { formatNumberId, formatRpJuta } from '../../utils/format';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Badge } from '../ui/Badge';

const TEAM_MEMBERS = [
  { order: '01', name: 'Faishal Muflih Irfanu Tsaqib' },
  { order: '02', name: 'Daffa Ahmad Pangreksa' },
  { order: '03', name: 'Muhammad Habib Nur Aiman' },
  { order: '04', name: 'Rizki Piji Fathoni' },
];

const SECI_LOOP = [
  {
    code: 'STEP 01 · EKSTERNALISASI',
    role: 'Tacit → Explicit',
    title: 'Putusan Lapangan Investigator',
    desc: 'Hasil verifikasi fisik atas Kartu Kasus (selisih muai, stop liar, & histori kru) direkam terstruktur pada siklus t+3 hari.',
  },
  {
    code: 'STEP 02 · KOMBINASI',
    role: 'Explicit → Explicit',
    title: 'Kalibrasi Ulang Fisika + ML',
    desc: 'Rumus standar ASTM D1250 & OIML digabungkan dengan fitur CUSUM serta pelatihan mingguan LightGBM yang bebas kebocoran masa depan.',
  },
  {
    code: 'STEP 03 · INTERNALISASI',
    role: 'Explicit → Tacit',
    title: 'Transfer Keahlian Lintas Mutasi',
    desc: 'Auditee/investigator baru langsung membaca 3 pendorong TreeSHAP & rekomendasi audit, sehingga kapabilitas kontrol susut tidak hilang saat rotasi personel.',
  },
];

const PILOT_KPIS = [
  {
    code: 'KPI-01',
    kpi: 'Precision Temuan Aktual Lapangan',
    measure: 'Proporsi trip Tier 1 (kuota 5%) yang terbukti menyimpang saat pemeriksaan fisik SPBU',
  },
  {
    code: 'KPI-02',
    kpi: 'Efisiensi Jam Audit per Kasus',
    measure: 'Pengurangan inspeksi sia-sia dari turunnya 1,88 alarm palsu/hari',
  },
  {
    code: 'KPI-03',
    kpi: 'Volume Penyimpangan Terbukti',
    measure: 'Verifikasi realisasi pengamanan liter (+18,5 pp vs batas statistik)',
  },
  {
    code: 'KPI-04',
    kpi: 'Biaya Integrasi Sistem Eksisting',
    measure: 'Memanfaatkan aliran DO, NGS, ATG, & GPS tanpa pengadaan sensor perangkat keras baru',
  },
];

const METHODOLOGY_NOTES = [
  'Seluruh data adalah hasil simulasi terkontrol v2.1 (seed 42–61); parameter alat ukur, peluang jejak telematika, dan ukuran penyimpangan adalah asumsi studi, bukan kalibrasi lapangan Pertamina Patra Niaga.',
  'Skenario sulit menguji ketahanan dengan menggandakan σ gabungan (0,280% → 0,559%), menurunkan TRACE_PROB (0,90 → 0,55), dan mengecilkan pengali ukuran curian (1,5 → 1,0).',
  'Hyperparameter LightGBM dipilih menggunakan label oracle partisi validasi pada seed utama lalu dibekukan untuk semua 20 seed; siklus replay harian hanya menerima label audit tertunda +3 hari dan berderau.',
  'Definisi operasional utama adalah kuota kapasitas investigasi harian 5% (bukan ambang probabilitas tetap).',
  'Dugaan sebab pada Kartu Kasus memakai aturan heuristik berurutan (akurasi simulasi 68,0%) dan celah utama masih terdapat pada pencurian mikro M2 tanpa jejak (recall 27,9%) serta 14 hari pertama aktor baru.',
  'Ablasi Tier 1–3 menguji nilai tambah integrasi data & analitik yang sudah mengalir, tanpa memerlukan pengadaan sensor perangkat keras tangki baru.',
  'NADI merupakan alat triase & pendukung keputusan (Human-in-the-Loop). Penetapan pelanggaran dan keputusan akhir tetap berada pada investigator manusia.',
];

export function ImpactTeamView() {
  const [anomalyVolLiters, setAnomalyVolLiters] = useState(100000);
  const [recoveryRatePct, setRecoveryRatePct] = useState(50);

  const retailPricePertamax = 15950; // Paper Section 1 & 3.8 ref [7]

  const econ = useMemo(() => {
    const addedCaptureShare = 0.185; // +18.5 pp (65.9% -> 84.4%)
    const additionalLitersPrioritized = anomalyVolLiters * addedCaptureShare;
    const grossEquivalentRp = additionalLitersPrioritized * retailPricePertamax;
    const recoveredGrossRp = grossEquivalentRp * (recoveryRatePct / 100);
    const savedFalseAlarmsPer100Days = 1.88 * 100;

    return {
      additionalLitersPrioritized,
      grossEquivalentRp,
      recoveredGrossRp,
      savedFalseAlarmsPer100Days,
    };
  }, [anomalyVolLiters, recoveryRatePct]);

  return (
    <div className="w-full">
      {/* SECTION 1: ILLUSTRATIVE ROI WORKBENCH + JATIMBALINUS PILOT CHARTER */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] py-8 lg:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1.5 max-w-3xl">
            <p className="font-sub text-[10.5px] uppercase tracking-[0.14em] text-[var(--accent-blue)]">
              Bagian 3.8 &amp; 4 Paper NADI · Tata Kelola Implementasi, SECI &amp; Pilot Regional
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Dampak Ekonomi Ilustratif, Konversi Pengetahuan &amp; Rencana Pilot Jatimbalinus
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Kenaikan <strong>+18,5 poin persentase</strong> cakupan volume prioritas serta
              penghematan <strong>188 inspeksi palsu / 100 hari</strong> diterjemahkan menjadi
              kerangka pilot kalibrasi lapangan berbasis acuan Pertamax Rp15.950/L (ref. [7] Nov 2026).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Illustrative Impact Calculator */}
            <div className="lg:col-span-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Coins className="w-4 h-4 text-[var(--accent-blue)]" />
                  Simulasi Nilai Tambah Kuota 5% (B_plus vs adj-z)
                </span>
                <Badge variant="amber">Ilustratif Paper</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Volume Penyimpangan Skenario</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatNumberId(anomalyVolLiters)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={500000}
                    step={50000}
                    value={anomalyVolLiters}
                    onChange={(e) => setAnomalyVolLiters(Number(e.target.value))}
                    className="w-full accent-[var(--accent-blue)]"
                  />
                </label>

                <label className="space-y-1.5">
                  <div className="flex justify-between font-sub">
                    <span className="text-[var(--text-muted)]">Asumsi Rasio Pemulihan</span>
                    <span className="font-bold text-[var(--accent-green)]">
                      {recoveryRatePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={75}
                    step={5}
                    value={recoveryRatePct}
                    onChange={(e) => setRecoveryRatePct(Number(e.target.value))}
                    className="w-full accent-[var(--accent-green)]"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-2 divide-x divide-y divide-[var(--border-hairline)]">
                <div className="p-3.5">
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Tambahan Masuk Prioritas
                  </p>
                  <p className="font-mono-num text-xl font-bold text-[var(--accent-blue)] mt-1">
                    +<AnimatedCounter value={econ.additionalLitersPrioritized} /> L
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Basis +18,5 pp</p>
                </div>

                <div className="p-3.5">
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Nilai Ekuivalen (@Rp15.950)
                  </p>
                  <p className="font-mono-num text-xl font-bold text-[var(--text-primary)] mt-1">
                    {formatRpJuta(econ.grossEquivalentRp)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Bruto volume terjaring</p>
                </div>

                <div className="p-3.5">
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Ilustrasi Nilai Pemulihan
                  </p>
                  <p className="font-mono-num text-xl font-bold text-[var(--accent-green)] mt-1">
                    {formatRpJuta(econ.recoveredGrossRp)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Sebelum biaya audit</p>
                </div>

                <div className="p-3.5">
                  <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                    Hemat Peringatan / 100 Hr
                  </p>
                  <p className="font-mono-num text-xl font-bold text-[var(--accent-red)] mt-1">
                    −{formatNumberId(econ.savedFalseAlarmsPer100Days, 0)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">1,88 alarm palsu/hari</p>
                </div>
              </div>
            </div>

            {/* Right: Regional Jatimbalinus Pilot KPI Charter Table */}
            <div className="lg:col-span-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Compass className="w-4 h-4 text-[var(--accent-blue)]" />
                  Piagam KPI Pilot Kalibrasi · PT Pertamina Patra Niaga Jatimbalinus
                </span>
                <Badge variant="blue">Fase Berikutnya</Badge>
              </div>
              <div className="divide-y divide-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {PILOT_KPIS.map((item) => (
                  <div key={item.code} className="p-4 flex items-start gap-3 text-xs">
                    <span className="font-mono-num text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--accent-blue)] shrink-0 mt-0.5">
                      {item.code}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-sub font-bold text-[var(--text-primary)]">{item.kpi}</p>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{item.measure}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal Nonaka SECI Knowledge Conversion Pipeline */}
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--accent-teal)]">
                <BookMarked className="w-4 h-4" />
                Siklus Konversi Pengetahuan Organisasi Nonaka SECI [22]
              </span>
              <span className="font-mono-num text-[10.5px] text-[var(--text-muted)]">
                Menjaga Ketahanan Kontrol Susut Lintas Mutasi Personel
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              {SECI_LOOP.map((step, idx) => (
                <div key={step.code} className="relative flex items-stretch gap-3">
                  <div className="flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-num text-[10px] font-bold text-[var(--accent-blue)]">
                        {step.code}
                      </span>
                      <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                        {step.role}
                      </span>
                    </div>
                    <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                      {step.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {idx < SECI_LOOP.length - 1 && (
                    <div className="hidden lg:flex items-center text-[var(--accent-blue)]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 7 METHODOLOGY COMPLIANCE REGISTER & RESEARCH TEAM ROSTER */}
      <section className="py-9 lg:py-11 bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-2">
              <span className="font-sub text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Register Keterbukaan Ilmiah, Etika Human-in-the-Loop &amp; Batasan Simulasi (Bagian 3.9)
              </span>
              <Badge variant="neutral">7 Catatan Wajib</Badge>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {METHODOLOGY_NOTES.map((note, idx) => (
                <div
                  key={idx}
                  className="px-5 py-3.5 flex items-start gap-4 text-xs leading-relaxed text-[var(--text-secondary)]"
                >
                  <span className="font-mono-num text-[11px] font-bold text-[var(--accent-blue)] shrink-0">
                    CAT-0{idx + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            <div className="px-5 py-3.5 bg-amber-500/[0.07] border-t border-amber-500/20 flex items-start gap-3 text-xs text-[var(--text-secondary)]">
              <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
              <span>
                <strong>Agenda Riset Lanjutan:</strong> Meningkatkan cakupan pencurian mikro M2 tanpa
                jejak (saat ini recall 27,9%) dan akurasi klasifikasi aturan sebab (68,0%) bersama
                kalibrasi transaksi aktual Regional Jatimbalinus.
              </span>
            </div>
          </div>

          {/* Academic Team Roster */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[10.5px] font-sub uppercase tracking-[0.14em] text-[var(--accent-blue)]">
                  <Users className="w-3.5 h-3.5" />
                  Tim Peneliti · IKMS PT Pertamina Patra Niaga 2026
                </p>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                  Tim Sains Data Universitas Negeri Surabaya
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="blue">
                  <GraduationCap className="w-3.5 h-3.5" /> Universitas Negeri Surabaya
                </Badge>
                <Badge variant="green">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reproducible Archive v2.1
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {TEAM_MEMBERS.map((m) => (
                <div
                  key={m.name}
                  className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num text-[11px] font-bold text-[var(--accent-blue)]">
                      PENULIS {m.order}
                    </span>
                    <Award className="w-4 h-4 text-[var(--accent-green)] opacity-80" />
                  </div>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">Universitas Negeri Surabaya</p>
                </div>
              ))}
            </div>

            <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0" />
              Seluruh metrik, uji Wilcoxon 20 seed, figur grafik, dan Kartu Kasus TreeSHAP pada web
              ini bersumber langsung dari tabel CSV serta `.pkl` arsip resmi v2.1.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
