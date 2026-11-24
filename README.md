# DEBUG DAPUR 🍳🐛
### Game Edukasi Interaktif untuk Belajar Urutan dan Percabangan Algoritma
**Target Pengguna:** Siswa SMA/SMK Kelas X — Mata Pelajaran Informatika (Elemen Berpikir Komputasional & Algoritma Pemrograman)

---

## 📌 Deskripsi Game

**DEBUG DAPUR** adalah game simulasi memasak 2D berbasis peramban (browser) yang mentransformasikan konsep-konsep fundamental ilmu komputer dan pemrograman ke dalam aktivitas memasak yang menyenangkan, lucu, dan interaktif. 

Pemain berperan sebagai asisten koki magang yang dipandu oleh **Chef Bug**—seekor ulat koki jenaka yang menggemaskan namun ceroboh. Setiap aktivitas memasak di dapur (menyalakan kompor, merebus air, mengaduk nasi, membalik telur) secara langsung mewakili konsep logika algoritma. Kesalahan urutan atau kondisi memasak akan memicu **Bug Terdeteksi!**, di mana pemain diajak untuk menganalisis penyebab kesalahan (debugging) dan memperbaikinya.

---

## 🚀 Fitur Utama & Keunggulan

1. **Sistem Bagan Alir (Flowchart) Edukatif Terpadu**:
   - Pemain tidak hanya "pure memasak", tetapi **wajib menganalisis dan melengkapi Flowchart (Bagan Alir)** sebelum memasuki simulasi dapur!
   - Menggunakan simbol-simbol standar internasional flowchart Informatika:
     - **Terminator** (Oval/Kapsul): Mulai / Selesai
     - **Proses** (Persegi Panjang): Aksi memasak (persiapan, perebusan, penggorengan)
     - **Decision** (Belah Ketupat / Diamond): Percabangan kondisi `IF` dengan cabang `YA` dan `TIDAK`
     - **Sub-rutin** (Garis Ganda): Pemanggilan prosedur terdekomposisi
     - **Panah Loop**: Perulangan counter `WHILE`
   - Tombol **Flowchart** di HUD dapur memungkinkan siswa memantau langkah aktif secara live saat memasak.

2. **100% Mandiri Tanpa Dependensi Eksternal (Pure Vanilla JS)**:
   - Dibangun murni menggunakan **HTML5 Canvas 2D API**, **CSS3**, dan **Vanilla JavaScript (ES6+)**.
   - Tidak memerlukan Node.js build step, bundler, React, Phaser, atau backend eksternal.
   - Dapat langsung dimainkan dengan membuka file `index.html` di browser modern apapun.

3. **Sintesis Audio Web Audio API Mandiri**:
   - Seluruh efek suara dan musik latar marimba santai **disintesis secara real-time** menggunakan Web Audio API (0 file MP3 eksternal, anti 404).

4. **Karakter Orisinil Prosedural — Chef Bug**:
   - Chef Bug digambar secara prosedural di Canvas 2D dengan animasi responsif (bernapas, melompat, berkedip, bingung, sedih, dan merayakan kemenangan).

5. **Sistem Validasi Algoritma & Debugging Real-time**:
   - Mendeteksi galat urutan (*Sequence Error*), pelanggaran kondisi (*Conditional Violation*), galat percabangan (*IF-ELSE Decision Bug*), putaran loop belum tuntas (*Incomplete Loop*), hingga *Infinite Loop*.

6. **Sistem Progresi & Penilaian Bintang (1–3 Bintang)**:
   - Evaluasi akurasi langkah, jumlah bug yang dibuat, dan efisiensi waktu memasak, tersimpan permanen di `LocalStorage`.

---

## 🗺️ Rincian 7 Level Permainan (3 Scene)

### SCENE 1 — DAPUR DASAR
* **Level 1: Masak Air (SEQUENCE / URUTAN)**
  - *Tujuan*: Mempelajari bahwa komputer menjalankan instruksi langkah demi langkah dari atas ke bawah.
  - *Gameplay*: Siapkan panci ➔ Isi air bersih di keran ➔ Taruh di atas kompor ➔ Nyalakan kompor ➔ Tunggu mendidih.
  - *Bug Pembelajaran*: Menyalakan kompor tanpa panci atau memanaskan panci kosong memicu peringatan sekuensial.
* **Level 2: Indomie Kuah (CONDITIONAL / IF)**
  - *Tujuan*: Mengevaluasi kondisi prasyarat sebelum menjalankan aksi (`IF air_mendidih == true`).
  - *Gameplay*: Rebus air hingga mendidih ➔ Masukkan mie hanya jika air sudah mendidih ➔ Tambahkan bumbu ➔ Sajikan.
  - *Bug Pembelajaran*: Memasukkan mie saat air masih dingin akan memicu peringatan pelanggaran kondisi IF.

### SCENE 2 — DAPUR MENENGAH
* **Level 3: Telur Dadar (IF - ELSE)**
  - *Tujuan*: Memahami dua jalur alternatif berdasarkan status kematangan telur.
  - *Gameplay*: Panaskan minyak ➔ Tuang telur ➔ Evaluasi: `IF bawah_matang -> balik_telur()` `ELSE -> tunggu_sebentar()`.
  - *Bug Pembelajaran*: Membalik terlalu dini menyebabkan telur hancur; membiarkan terlalu lama menyebabkan telur gosong.
* **Level 4: Nasi Goreng (LOOPING / PERULANGAN)**
  - *Tujuan*: Mengeksekusi instruksi berulang menggunakan variabel counter pengadukan (`WHILE stir_count < 6`).
  - *Gameplay*: Masukkan bumbu, nasi putih, dan kecap ke wajan ➔ Klik spatula berulang kali hingga target 6 adukan tercapai ➔ Nasi matang merata.
* **Level 5: Ayam Goreng Krispi (NESTED CONDITIONAL)**
  - *Tujuan*: Mengambil keputusan di dalam keputusan lain (`Nested IF`).
  - *Gameplay*: Masukkan ayam ke minyak panas ➔ Tangani letupan minyak: `IF minyak_panas { IF minyak_meletup { kecilkan_api(); } ELSE { balik_ayam(); } }`.

### SCENE 3 — DAPUR MAHIR & KUIS
* **Level 6: Paket Hemat Anak Kost (PROCEDURE & EFFICIENCY)**
  - *Tujuan*: Menerapkan dekomposisi masalah ke dalam modul-modul prosedur (`masak_nasi()`, `masak_ayam()`, `masak_telur()`) dan menyusun urutan eksekusi yang efisien.
* **Level 7: Boss Akhir — Debug Resep Ibu Kost (ALGORITHM DEBUGGING)**
  - *Tujuan*: Mendiagnosis dan memperbaiki resep warisan Ibu Kost yang rusak dan penuh bug pada papan tulis interaktif.
  - *Tantangan*: Memperbaiki urutan instruksi, mengatasi perulangan tanpa henti (*infinite loop* `WHILE true`), dan membetulkan kondisi percabangan `IF` yang keliru sebelum resep diuji.

---

## 🎓 Evaluasi Akhir: Kuis 10 Soal Berpikir Komputasional
Setelah menyelesaikan Level 7 Boss Akhir, pemain membuka evaluasi kuis akhir komprehensif berisi 10 soal skenario kontekstual memasak yang menguji:
1. Algoritma Sekuens
2. Percabangan Tunggal (IF)
3. Percabangan Ganda (IF-ELSE)
4. Perulangan (WHILE Loop Counter)
5. Infinite Loop & Bahayanya
6. Percabangan Bersarang (Nested Conditional)
7. Dekomposisi Prosedur / Fungsi
8. Identifikasi Logic Error dalam Debugging
9. Efisiensi & Optimasi Algoritma
10. Tracing Kode Berpikir Komputasional

---

## 💻 Cara Menjalankan Game Secara Lokal

### Metode 1: Buka Langsung (Paling Mudah)
1. Buka folder proyek ini di File Explorer komputer Anda.
2. Klik ganda file `index.html`.
3. Game akan langsung berjalan di Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari.

### Metode 2: Menggunakan Local Web Server (Direkomendasikan)
Jika ingin menjalankan melalui local server:
* **Menggunakan Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Buka browser dan akses: `http://localhost:8000`

* **Menggunakan Node.js / npx**:
  ```bash
  npx serve .
  ```

---

## 📁 Struktur Direktori Proyek

```
debug-dapur/
│
├── index.html                  # File HTML utama (Canvas, HUD, Dialog, Modals)
├── README.md                   # Dokumentasi lengkap proyek & kurikulum
│
├── css/
│   ├── main.css                # Base styling, tema dapur hangat, reset, layout 16:9
│   ├── menu.css                # Tampilan Splash Screen, Menu Utama, Level Grid
│   ├── gameplay.css            # HUD atas, drawer log algoritma, modal dialog bug
│   └── responsive.css          # Penyesuaian responsif layar desktop, tablet, HP
│
├── js/
│   ├── main.js                 # Entry point inisialisasi aplikasi
│   ├── game.js                 # Koordinator utama kanvas dan game loop
│   ├── gameLoop.js             # High-precision requestAnimationFrame loop
│   ├── sceneManager.js         # Pengatur transisi layar, menu, dan modal
│   ├── inputManager.js         # Normalisasi koordinat kanvas, mouse, dan touch
│   ├── audioManager.js         # Web Audio API synthesizer (SFX & Cozy BGM)
│   ├── storageManager.js       # Manajemen penyimpanan LocalStorage
│   ├── levelManager.js         # Controller gameplay 7 level & interaksi objek
│   ├── scoringSystem.js        # Kalkulator skor, penalti bug, dan bintang 1-3
│   ├── algorithmEngine.js      # Validator logika algoritma dan pencatat log
│   ├── feedbackSystem.js       # Pengelola alert bug edukatif & animasi Chef Bug
│   ├── quizSystem.js           # Mesin kuis 10 soal dengan penjelasan pedagogis
│   │
│   ├── objects/
│   │   ├── chefBug.js          # Karakter kartun Chef Bug prosedural & ekspresi
│   │   ├── stove.js            # Kompor gas 2 burner, animasi api, & knop putar
│   │   ├── cookware.js         # Panci & wajan, perebusan, penggorengan, & makanan
│   │   ├── ingredients.js      # Rak bahan masakan (air, mie, telur, minyak, nasi, dll)
│   │   └── utensils.js         # Spatula aduk/balik, keran air wastafel, & piring saji
│   │
│   └── data/
│       ├── levels.js           # Spesifikasi detail 7 level & pseudocode
│       └── quiz.js             # Bank 10 soal kuis evaluasi berbasis skenario
│
└── assets/                     # Direktori aset pendukung
```

---

## 🎯 Keselarasan Kurikulum (Capaian Pembelajaran)
* **Jenjang**: SMA / SMK / MAK Kelas X
* **Mata Pelajaran**: Informatika (Fase E)
* **Elemen**: Berpikir Komputasional (BK) & Algoritma Pemrograman (AP)
* **Indikator Keberhasilan**:
  - Siswa mampu mengurutkan instruksi komputasi secara logis dan runtut.
  - Siswa memahami peran evaluasi kondisi boolean dalam percabangan IF dan IF-ELSE.
  - Siswa dapat mengontrol perulangan berulang dengan kondisi berhenti yang tepat.
  - Siswa mampu melakukan dekomposisi masalah kompleks ke dalam prosedur-prosedur terpisah.
  - Siswa terampil melakukan *code tracing* dan *debugging* terhadap kesalahan logika.
