import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookMarked,
  CheckCircle2,
  Coins,
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
      {/* BAND 1: ILLUSTRATIVE ECONOMIC IMPACT & AUDIT EFFICIENCY */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-8">
          <Reveal>
            <EditorialHeader
              eyebrow="Bagian 3.8 Paper NADI · Efisiensi Audit & Simulasi Dampak Ekonomi"
              title="Kenaikan +18,5 Poin Volume Terjaring & Penurunan 188 Alarm Palsu per 100 Hari"
              description="Sesuai catatan ilmiah Bagian 3.8, angka finansial di bawah bersifat ilustratif berbasis skenario volume penyimpangan dan harga referensi Pertamax Rp15.950/L (Nov 2026) — bukan klaim kerugian aktual Pertamina sebelum uji kalibrasi lapangan."
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Illustrative Calculator */}
            <div className="lg:col-span-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                <span className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--text-primary)]">
                  <Coins className="w-4 h-4 text-[var(--accent-blue)]" />
                  Simulasi Nilai Tambah Triase B_plus vs Baseline adj-z (Kuota 5%)
                </span>
                <Badge variant="amber">Ilustratif Paper</Badge>
              </div>

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

            {/* Knowledge Management & Nonaka SECI */}
            <div className="lg:col-span-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 font-sub text-xs font-semibold text-[var(--accent-teal)]">
                <BookMarked className="w-4 h-4" />
                Kodifikasi Pengetahuan Organisasi (Nonaka [22])
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Mengubah Intuisi Investigator (Tacit) &amp; Standar Fisika (Explicit) Menjadi Aset Korporasi
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Selama ini keahlian menilai kejanggalan distribusi melekat pada pengalaman individu
                investigator. Dalam arsitektur NADI, umpan balik hasil audit dari seluruh terminal
                dihimpun menjadi pengetahuan kolektif organisasi yang diperbarui tiap minggu—sehingga
                kapabilitas pengendalian susut tidak hilang saat terjadi rotasi atau mutasi personel.
              </p>
              <div className="p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">Rencana Langkah Selanjutnya:</strong>{' '}
                Kalibrasi parameter pada data operasional riil{' '}
                <strong>PT Pertamina Patra Niaga Regional Jatimbalinus</strong> dengan pilot audit
                terbatas untuk mengukur precision temuan aktual dan pengembalian investasi.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: 7 METHODOLOGY PRINCIPLES & LIMITATIONS */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-6">
          <EditorialHeader
            eyebrow="Keterbukaan Ilmiah & Catatan Metodologi (Bagian 3.9 Paper)"
            title="Tujuh Prinsip Etika, Batasan Simulasi & Ancaman Validitas"
            description="Transparansi ilmiah penuh mengenai batas kemampuan sistem agar implementasi lapangan berjalan terukur."
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

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
            <span>
              <strong>Catatan Keterbatasan:</strong> Akurasi aturan dugaan sebab (68,0%) dan pemodelan
              pencurian mikro M2 (recall 27,9%) merupakan fokus penyempurnaan lanjutan saat fase
              kalibrasi data transaksi lapangan NGS/ATG Regional Jatimbalinus.
            </span>
          </div>
        </div>
      </section>

      {/* BAND 3: TEAM IDENTITY */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 space-y-6">
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

            <div className="flex items-center gap-2">
              <Badge variant="blue">
                <GraduationCap className="w-3.5 h-3.5" /> Universitas Negeri Surabaya
              </Badge>
              <Badge variant="green">
                <ShieldCheck className="w-3.5 h-3.5" /> Reproducible Archive v2.1
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
              Seluruh angka, kurva, dan Kartu Kasus pada dashboard ini bersumber langsung dari tabel CSV
              serta file replikasi `.pkl` resmi penelitian NADI v2.1.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

