import { useMemo, useState } from 'react';
import {
  AlertTriangle,
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
import { EditorialHeader, Reveal } from '../ui/MotionPrimitives';

const TEAM_MEMBERS = [
  { order: '01', name: 'Faishal Muflih Irfanu Tsaqib' },
  { order: '02', name: 'Daffa Ahmad Pangreksa' },
  { order: '03', name: 'Muhammad Habib Nur Aiman' },
  { order: '04', name: 'Rizki Piji Fathoni' },
];

const SECI_STEPS = [
  {
    code: '01 · TACIT → EXPLICIT',
    title: 'Eksternalisasi Intuisi Lapangan',
    desc: 'Putusan benar/salah investigator atas Kartu Kasus (selisih muai, stop liar, dan perilaku kru) terekam terstruktur +3 hari setelah penugasan.',
  },
  {
    code: '02 · EXPLICIT → EXPLICIT',
    title: 'Kombinasi Fisika & Pembelajaran Aktif',
    desc: 'Rumus standar ASTM D1250 & OIML digabungkan dengan fitur CUSUM kru serta kalibrasi ulang LightGBM mingguan yang bebas dari kebocoran label masa depan.',
  },
  {
    code: '03 · EXPLICIT → TACIT',
    title: 'Internalisasi via Penjelasan TreeSHAP',
    desc: 'Investigator baru langsung membaca 3 atribut numerik pendorong & saran pemeriksaan di Kartu Kasus—sehingga keahlian pengendalian susut bertahan melampaui rotasi personel.',
  },
];

const PILOT_KPIS = [
  {
    kpi: 'Precision Temuan Aktual di Lapangan',
    target: 'Validasi rasio kasus terbukti dari kuota harian 5% Tier 1',
  },
  {
    kpi: 'Efisiensi Jam Audit per Kasus',
    target: 'Penurunan beban pemeriksaan dari berkurangnya 1,88 alarm palsu/hari',
  },
  {
    kpi: 'Volume Penyimpangan Berhasil Dibuktikan',
    target: 'Verifikasi tambahan cakupan volume (+18,5 poin persentase vs baseline)',
  },
  {
    kpi: 'Biaya Integrasi Tier 1 → Tier 2',
    target: 'Memanfaatkan aliran DO, ATG, & GPS eksisting tanpa sensor perangkat keras baru',
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
    const savedFalseAlarmsPer100Days = 1.88 * 100; // 9.34 -> 7.46 /day

    return {
      additionalLitersPrioritized,
      grossEquivalentRp,
      recoveredGrossRp,
      savedFalseAlarmsPer100Days,
    };
  }, [anomalyVolLiters, recoveryRatePct]);

  return (
    <div className="w-full">
      {/* WORKBENCH BAND 1: ILLUSTRATIVE ECONOMIC IMPACT & NONAKA KNOWLEDGE MANAGEMENT */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-8">
        <Reveal>
          <EditorialHeader
            eyebrow="Bagian 3.8 &amp; 4 Paper NADI · Efisiensi Operasional, Aset Pengetahuan &amp; Roadmap Pilot"
            title="Tambahan +18,5 Poin Cakupan Volume &amp; Hemat 188 Pemeriksaan Palsu per 100 Hari"
            description="Menggabungkan acuan harga bahan bakar Pertamax Rp15.950/liter (ref. [7] November 2026) sebagai ilustrasi skenario manajerial—sekaligus merumuskan konversi pengetahuan Nonaka SECI untuk PT Pertamina Patra Niaga."
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Illustrative Calculator */}
          <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                <Coins className="w-4 h-4 text-[var(--accent-blue)]" />
                Kalkulator Ilustratif Nilai Tambah Triase B_plus vs Baseline adj-z (Kuota 5%)
              </span>
              <Badge variant="amber">Ilustratif Paper</Badge>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Dengan memprioritaskan 5% perjalanan berisiko tertinggi setiap hari,{' '}
              <code className="font-mono-num">B_plus</code> menjaring{' '}
              <strong>84,4%</strong> total volume curian vs <strong>65,9%</strong> pada{' '}
              <code className="font-mono-num">adj-z</code> (+18,5 poin persentase) sembari
              memangkas peringatan palsu harian dari 9,34 menjadi 7,46 trip/hari (−1,88/hari).
              Simulasi di bawah bersifat ilustratif sebelum uji kalibrasi aktual di lapangan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <div className="flex justify-between font-sub">
                  <span className="text-[var(--text-muted)]">Volume Penyimpangan Hipotetis</span>
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
                  <span className="text-[var(--text-muted)]">Rasio Pemulihan Terbukti</span>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-hairline)]">
              <div>
                <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                  Tambahan Masuk Prioritas
                </p>
                <p className="font-mono-num text-xl font-bold text-[var(--accent-blue)] mt-1">
                  +<AnimatedCounter value={econ.additionalLitersPrioritized} /> L
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Basis +18,5 pp</p>
              </div>

              <div>
                <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                  Nilai Ekuivalen (@Rp15.950)
                </p>
                <p className="font-mono-num text-xl font-bold text-[var(--text-primary)] mt-1">
                  {formatRpJuta(econ.grossEquivalentRp)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Bruto volume prioritas</p>
              </div>

              <div>
                <p className="text-[10px] font-sub uppercase text-[var(--text-muted)]">
                  Ilustrasi Pemulihan
                </p>
                <p className="font-mono-num text-xl font-bold text-[var(--accent-green)] mt-1">
                  {formatRpJuta(econ.recoveredGrossRp)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Sebelum biaya audit</p>
              </div>

              <div>
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

          {/* Knowledge Management & Nonaka SECI + Regional Pilot Roadmap */}
          <div className="lg:col-span-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--accent-teal)]">
              <BookMarked className="w-4 h-4" />
              Kodifikasi Pengetahuan Organisasi (Nonaka [22])
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Mempertahankan Keahlian Investigasi Susut Melampaui Mutasi Personel
            </h3>
            <div className="space-y-2.5 text-xs">
              {SECI_STEPS.map((st) => (
                <div
                  key={st.code}
                  className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-1"
                >
                  <p className="font-mono-num text-[10px] font-bold text-[var(--accent-blue)]">
                    {st.code} · {st.title}
                  </p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pilot Roadmap Jatimbalinus */}
        <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
              <Compass className="w-4 h-4 text-[var(--accent-blue)]" />
              Langkah Implementasi Berikutnya: Pilot Kalibrasi Regional Jatimbalinus
            </div>
            <Badge variant="blue">Human-in-the-Loop Governance</Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-4xl">
            Sebelum implementasi menyeluruh, tim merekomendasikan uji kalibrasi parameter fisika dan
            derau pada transaksi riil (NGS, DO, ATG, dan GPS) di{' '}
            <strong>PT Pertamina Patra Niaga Regional Jatimbalinus</strong> dengan empat tolok ukur
            evaluasi pilot berikut:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {PILOT_KPIS.map((item) => (
              <div
                key={item.kpi}
                className="p-3.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-1"
              >
                <p className="font-sub font-bold text-[var(--text-primary)]">{item.kpi}</p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {item.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKBENCH BAND 2: 7 METHODOLOGY PRINCIPLES & LIMITATIONS */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] space-y-6">
        <EditorialHeader
          eyebrow="Keterbukaan Ilmiah &amp; Batasan Metodologi (Bagian 3.9 &amp; 5 Paper)"
          title="Tujuh Prinsip Etika, Keterbatasan Simulasi &amp; Ancaman Validitas"
          description="Transparansi ilmiah penuh mengenai batas kemampuan sistem serta pemisahan tegas antara bukti simulasi dan asumsi lapangan sebelum penerapan industri."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {METHODOLOGY_NOTES.map((note, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 flex items-start gap-3 text-xs leading-relaxed text-[var(--text-secondary)]"
            >
              <span className="font-mono-num text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--accent-blue)] shrink-0">
                0{idx + 1}
              </span>
              <span>{note}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] flex items-start gap-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
          <span>
            <strong>Fokus Penyempurnaan Lanjutan:</strong> Aturan heuristik dugaan sebab pada Kartu
            Kasus (akurasi simulasi <strong>68,0%</strong>), deteksi pencurian mikro M2 tanpa jejak
            telematika (recall <strong>27,9%</strong>), dan mitigasi fase <em>cold-start</em> 14
            hari aktor baru merupakan agenda utama pembaruan saat data operasional riil Regional
            Jatimbalinus diuji.
          </span>
        </div>
      </section>

      {/* WORKBENCH BAND 3: TEAM IDENTITY */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-sub uppercase tracking-[0.14em] text-[var(--accent-blue)]">
              <Users className="w-3.5 h-3.5" />
              Tim Peneliti · IKMS PT Pertamina Patra Niaga 2026
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Tim Sains Data Universitas Negeri Surabaya
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="blue">
              <GraduationCap className="w-3.5 h-3.5" /> Universitas Negeri Surabaya
            </Badge>
            <Badge variant="green">
              <ShieldCheck className="w-3.5 h-3.5" /> Arsip Replikasi Tervalidasi v2.1
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((m) => (
            <div
              key={m.name}
              className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs font-bold text-[var(--accent-blue)]">
                  Penulis {m.order}
                </span>
                <Award className="w-4 h-4 text-[var(--accent-green)] opacity-75" />
              </div>
              <p className="font-display text-base font-bold text-[var(--text-primary)]">
                {m.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Universitas Negeri Surabaya</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0" />
          <span>
            Seluruh angka, kurva, uji berpasangan Wilcoxon, dan Kartu Kasus TreeSHAP pada konsol ini
            terikat langsung ke arsip CSV (39 tabel) serta replikasi `.pkl` resmi penelitian NADI v2.1.
          </span>
        </div>
      </section>
    </div>
  );
}
