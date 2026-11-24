/**
 * DEBUG DAPUR - Final Quiz Data
 * Evaluasi Konsep Algoritma & Berpikir Komputasional Berdasarkan Simulasi Memasak
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Data = window.DebugDapur.Data || {};

window.DebugDapur.Data.QUIZ_QUESTIONS = [
  {
    id: 1,
    concept: "SEQUENCE (URUTAN)",
    question: "Chef Bug ingin memasak air panas. Jika ia menyalakan kompor gas SEBELUM meletakkan panci berisi air di atasnya, apa konsekuensi algoritma dari tindakan tersebut?",
    options: [
      "Instruksi tetap valid karena kompor sudah menghasilkan panas",
      "Terjadi pelanggaran sekuens (Sequence Bug) yang memboroskan gas dan berpotensi bahaya",
      "Komputer akan otomatis menukar urutan instruksi ke posisi yang benar",
      "Akan terjadi perulangan tak terhingga (infinite loop)"
    ],
    correctAnswer: 1,
    explanation: "Dalam algoritma sekuensial, urutan eksekusi sangat menentukan keselamatan dan kebenaran proses. Memanaskan sebelum objek yang dipanaskan siap adalah galat logika urutan (Sequence Error)."
  },
  {
    id: 2,
    concept: "CONDITIONAL (IF)",
    question: "Perhatikan pseudocode berikut:\nIF (air_mendidih == true) {\n    masukkan_mie();\n}\nJika saat program berjalan status 'air_mendidih' masih bernilai FALSE, apa yang akan dilakukan sistem?",
    options: [
      "Mie tetap dimasukkan karena instruksi sudah tertulis",
      "Sistem membatalkan seluruh program dan mati mendadak",
      "Instruksi memasukkan mie dilewati dan tidak dieksekusi",
      "Sistem mengulang dari awal proses persiapan"
    ],
    correctAnswer: 2,
    explanation: "Struktur percabangan IF hanya mengeksekusi blok kode di dalamnya apabila kondisi prasyarat bernilai TRUE. Jika bernilai FALSE, instruksi diabaikan/dilewati."
  },
  {
    id: 3,
    concept: "IF - ELSE",
    question: "Saat mendadar telur, Chef Bug menulis kode:\nIF (bagian_bawah_kuning_kecokelatan) {\n    balik_telur();\n} ELSE {\n    tunggu_10_detik();\n}\nKapan perintah 'tunggu_10_detik()' akan dieksekusi?",
    options: [
      "Ketika bagian bawah telur sudah kuning kecokelatan",
      "Ketika bagian bawah telur BELUM kuning kecokelatan (kondisi IF bernilai False)",
      "Setiap saat secara bersamaan dengan membalik telur",
      "Hanya saat kompor dimatikan"
    ],
    correctAnswer: 1,
    explanation: "Blok ELSE adalah jalur alternatif yang secara otomatis dieksekusi ketika kondisi pada pernyataan IF bernilai FALSE (tidak terpenuhi)."
  },
  {
    id: 4,
    concept: "LOOPING (PERULANGAN)",
    question: "Dalam resep nasi goreng, Chef Bug membutuhkan 5 kali adukan:\nstir_count = 0;\nWHILE (stir_count < 5) {\n    aduk_nasi();\n    stir_count = stir_count + 1;\n}\nBerapa kali fungsi 'aduk_nasi()' akan dieksekusi hingga loop berhenti?",
    options: [
      "4 kali",
      "5 kali",
      "6 kali",
      "Tak terhingga (tidak pernah berhenti)"
    ],
    correctAnswer: 1,
    explanation: "Nilai stir_count berturut-turut adalah 0, 1, 2, 3, 4 (total 5 kali eksekusi). Ketika bernilai 5, kondisi (5 < 5) menjadi FALSE sehingga loop selesai."
  },
  {
    id: 5,
    concept: "INFINITE LOOP (BUG PERULANGAN)",
    question: "Perhatikan kode pembuatan sup berikut:\nsuhu = 20;\nWHILE (suhu < 100) {\n    panaskan_sup();\n    // Lupa menambahkan: suhu = suhu + 10;\n}\nApa bahaya yang ditimbulkan oleh kode di atas?",
    options: [
      "Sup akan langsung matang dalam sekejap",
      "Terjadi 'Infinite Loop' karena kondisi (suhu < 100) selalu bernilai True, menyebabkan sistem hang atau sup hangus terbakar",
      "Sistem otomatis menaikkan suhu tanpa diperintah",
      "Kode menghasilkan pesan sukses langsung"
    ],
    correctAnswer: 1,
    explanation: "Infinite Loop terjadi ketika kondisi loop tidak pernah bernilai False akibat tidak adanya pembaruan variabel counter/kondisi (variabel suhu tidak pernah naik)."
  },
  {
    id: 6,
    concept: "NESTED CONDITIONAL (PERCABANGAN BERSARANG)",
    question: "Perhatikan struktur berikut:\nIF (minyak_panas == true) {\n    masukkan_ayam();\n    IF (minyak_meletup == true) {\n        tutup_wajan();\n    }\n}\nKapan wajan akan ditutup oleh chef?",
    options: [
      "Cukup dengan minyak meletup, tanpa peduli minyak sudah panas atau belum",
      "Hanya jika minyak SUDAH PANAS dan juga MELETUP",
      "Setiap kali ayam dimasukkan tanpa syarat lain",
      "Hanya saat minyak dingin"
    ],
    correctAnswer: 1,
    explanation: "Pada nested conditional (percabangan bersarang), kondisi di dalam (inner IF) HANYA diperiksa jika kondisi di luar (outer IF) telah terpenuhi (bernilai TRUE)."
  },
  {
    id: 7,
    concept: "PROCEDURE (PROSEDUR / FUNGSI)",
    question: "Mengapa pada Level 6 (Paket Hemat), langkah memasak dipisahkan menjadi prosedur 'masak_nasi()', 'masak_telur()', dan 'masak_ayam()'?",
    options: [
      "Agar game terlihat lebih rumit tanpa alasan",
      "Menerapkan konsep dekomposisi: memecah masalah besar menjadi modul-modul kecil yang mandiri, rapi, dan mudah dikelola",
      "Komputer tidak bisa menjalankan lebih dari satu bahan makanan sekaligus",
      "Supaya pemain tidak bisa menggunakan bumbu yang sama"
    ],
    correctAnswer: 1,
    explanation: "Prosedur (fungsi) menerapkan pilar Dekomposisi dan Abstraksi dalam Berpikir Komputasional. Kode menjadi modular, dapat dipakai berulang kali, dan mudah di-debug."
  },
  {
    id: 8,
    concept: "DEBUGGING",
    question: "Chef Bug melihat kuah sup terasa sangat asin padahal resep sudah diikuti. Setelah dicek, ternyata instruksi 'tambah_garam(1_sendok)' berada di dalam perulangan WHILE pengadukan 10 kali. Jenis kesalahan apakah ini?",
    options: [
      "Syntax Error (kesalahan penulisan kata kunci)",
      "Logic Error (kesalahan logika algoritma sehingga hasil tidak sesuai ekspektasi)",
      "Hardware Error (kerusakan panci atau kompor)",
      "Runtime Crash (aplikasi tertutup mendadak)"
    ],
    correctAnswer: 1,
    explanation: "Logic Error adalah kesalahan alur pemikiran di mana kode dapat dijalankan tanpa error sintaksis, namun menghasilkan output/perilaku yang keliru (garam tertambah 10 kali)."
  },
  {
    id: 9,
    concept: "EFISIENSI ALGORITMA",
    question: "Untuk membuat Paket Nasi + Telur + Teh Manis, algoritma mana yang paling efisien dari segi penggunaan waktu?",
    options: [
      "Tunggu air teh mendidih sambil diam -> baru masak nasi -> baru goreng telur",
      "Rebus air teh dan masak nasi bersamaan di kompor berbeda, sembari menggoreng telur (Paralel / Multitasking)",
      "Goreng telur kemarin malam -> biarkan basi -> sajikan pagi ini",
      "Makan bahan mentah tanpa dimasak"
    ],
    correctAnswer: 1,
    explanation: "Efisiensi algoritma mengukur optimalisasi waktu dan sumber daya. Memanfaatkan sumber daya yang ada secara paralel meminimalkan waktu tunggu total (latency)."
  },
  {
    id: 10,
    concept: "BERPIKIR KOMPUTASIONAL",
    question: "Dalam menyelesaikan tantangan Level 7 (Boss Debug Resep Ibu Kost), langkah pertama yang paling tepat dilakukan saat melihat resep bermasalah adalah:",
    options: [
      "Langsung klik tombol sajikan tanpa membaca",
      "Mendiagnosis dan menelusuri resep baris demi baris (tracing) untuk menemukan letak bug logika",
      "Menghapus seluruh resep dan membuat resep baru dari awal",
      "Menyalahkan Chef Bug karena resepnya rusak"
    ],
    correctAnswer: 1,
    explanation: "Tracing (penelusuran kode) langkah demi langkah adalah teknik fundamental dalam debugging untuk mengidentifikasi variabel atau urutan mana yang menyimpang dari spesifikasi."
  }
];
