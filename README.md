# NADI: Neraca Aliran Distribusi Intelligence
Arsip reproduksibilitas studi simulasi susut distribusi BBM untuk IKMS 2026.

Versi kode v2.1. Seed utama 42, jumlah seed robustness 20, hash residual seed utama 2c462e0f08be.
Hash konfigurasi: skenario dasar 83a4a949, skenario sulit 5eb161c3.

## Catatan metodologi
1. Seluruh data adalah hasil simulasi. Parameter simulasi (ketidakpastian pengukuran, peluang jejak telematika, ukuran pencurian) adalah asumsi, bukan kalibrasi dari data lapangan.
2. Hasil dilaporkan pada dua skenario: dasar dan sulit. Skenario sulit mengembalikan sigma gabungan, TRACE_PROB, dan SIZE_MULT ke nilai yang lebih konservatif (lihat konfigurasi.json).
3. Hyperparameter dipilih memakai label sebenarnya pada partisi validasi di seed utama (pemilihan dengan label oracle) lalu dipakai tetap untuk semua seed. Replay loop hanya memakai label hasil investigasi yang tertunda dan bising.
4. Definisi operasi utama adalah kapasitas investigasi harian 5%. Ambang probabilitas tunggal hanya dilaporkan sebagai pembanding.
5. Dugaan sebab pada Kartu Kasus memakai aturan heuristik dengan ambang manual, bukan klasifikator terlatih.
6. Ablasi tingkat data menguji kebutuhan data dan analitik, bukan sensor fisik baru.
7. Sistem ini adalah alat triase dan pendukung keputusan, bukan penentu kecurangan. Keputusan akhir tetap ada pada investigator.

## Web Dashboard NADI (IKMS 2026)
- **Ringkasan & Laboratorium Rekonsiliasi Fisika (ASTM D1250 15 °C):** Simulasi interaktif perubahan suhu muat/terima, kadar etanol (`E10`, `E20`, `E50`), bias lokal, serta perbandingan `Skenario Dasar (83a4a949)` vs `Skenario Sulit (5eb161c3)`.
- **Konsol Kartu Kasus & TreeSHAP:** Peringkat triase Tier 1–3, inspeksi 12 kasus teratas, atribusi TreeSHAP eksak per perjalanan, dan matriks validasi dugaan sebab vs modus M1–M4.
- **29 Fitur, DBSCAN Hotspot & Graf Kolusi Kru–SPBU:** Dekomposisi residual, uji pemotongan temporal (zero data leakage), Feature Importance LightGBM, Kamus Data `D1–D16`, statistik `excess_crew`, serta galeri figur eksperimen v2.1.
- **Benchmark & Ketahanan 20 Seed:** Lintasan 20 replikasi (`seed 42–61`), uji berpasangan Wilcoxon, ablasi kesiapan data Tier 1–3, sensitivitas sigma, evaluasi kadar etanol, dan deteksi aktor baru.
- **Dampak Audit, Etika & Tim Peneliti UNESA:** Kalkulator ilustratif dampak triase, prinsip Nonaka SECI, dan 7 batasan metodologi ilmiah.

```bash
npm install
npm run dev
npm run build
```
