/**
 * DEBUG DAPUR - Level Data & Algorithm Specifications
 * Target: Siswa SMA/SMK Kelas X - Informatika (Berpikir Komputasional & Algoritma)
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Data = window.DebugDapur.Data || {};

window.DebugDapur.Data.SCENES = [
  {
    id: 1,
    name: "Dapur Dasar",
    description: "Pengenalan instruksi sekuensial dan evaluasi kondisi tunggal.",
    levels: [1, 2],
    themeColor: "#4CAF50"
  },
  {
    id: 2,
    name: "Dapur Menengah",
    description: "Percabangan IF-ELSE, perulangan (looping), dan percabangan bersarang.",
    levels: [3, 4, 5],
    themeColor: "#FF9800"
  },
  {
    id: 3,
    name: "Dapur Mahir & Kuis",
    description: "Dekomposisi prosedur, efisiensi eksekusi, dan debugging resep rusak.",
    levels: [6, 7],
    themeColor: "#E91E63"
  }
];

window.DebugDapur.Data.LEVELS = [
  {
    id: 1,
    sceneId: 1,
    title: "Level 1: Masak Air",
    subtitle: "Konsep Dasar: Algoritma Sekuens (Urutan)",
    concept: "SEQUENCE (URUTAN)",
    description: "Pelajari bahwa komputer menjalankan instruksi langkah demi langkah dari atas ke bawah secara teratur.",
    conceptExplanation: "Algoritma Sekuens adalah serangkaian langkah yang dieksekusi secara berurutan, satu per satu dari awal hingga akhir, tanpa ada langkah yang dilewati atau dibalik.",
    targetDish: "Air Panas Mendidih",
    cookwareNeeded: "pot",
    requiredSteps: [
      { id: "prep_pot", label: "Siapkan Panci di Meja Persiapan", action: "SELECT_POT" },
      { id: "fill_water", label: "Isi Air ke dalam Panci", action: "FILL_WATER" },
      { id: "place_stove", label: "Letakkan Panci Berisi Air di atas Kompor", action: "PLACE_POT_STOVE" },
      { id: "turn_on_stove", label: "Nyalakan Api Kompor", action: "TURN_ON_STOVE" },
      { id: "wait_boil", label: "Tunggu Hingga Air Mendidih", action: "WAIT_BOIL" }
    ],
    availableIngredients: ["water"],
    targetStir: 0,
    timeLimit: 120,
    hintText: "Urutannya: Panci -> Isi Air -> Taruh di Kompor -> Nyalakan Api -> Tunggu mendidih!",
    flowchart: {
      title: "Bagan Alir: Algoritma Merebus Air",
      conceptNote: "Simbol persegi panjang mewakili PROSES (langkah eksekusi). Dalam sekuens, panah mengalir lurus dari atas ke bawah.",
      challengeText: "Lengkapi blok rumpang pada diagram alir di bawah ini sebelum mulai memasak di dapur!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Siapkan panci bersih" },
        { 
          id: "n3", 
          type: "process", 
          label: "Isi air ke dalam panci", 
          isMissing: true, 
          options: ["Isi air ke dalam panci", "Nyalakan kompor kosong", "Minum air mentah"], 
          correctAnswer: "Isi air ke dalam panci",
          explanation: "Dalam sekuensial yang aman, air harus diisikan ke dalam panci sebelum diletakkan di atas kompor panas."
        },
        { id: "n4", type: "process", label: "Taruh panci di kompor" },
        { id: "n5", type: "process", label: "Nyalakan api kompor" },
        { id: "n6", type: "process", label: "Tunggu air mendidih (100°C)" },
        { id: "n7", type: "terminator", label: "Selesai" }
      ]
    }
  },
  {
    id: 2,
    sceneId: 1,
    title: "Level 2: Indomie Kuah",
    subtitle: "Konsep Dasar: Percabangan Tunggal (IF)",
    concept: "CONDITIONAL (IF)",
    description: "Eksekusi aksi tertentu HANYA jika kondisi prasyarat sudah bernilai BENAR (True).",
    conceptExplanation: "Percabangan IF mengevaluasi kondisi. Jika kondisi terpenuhi (True), instruksi di dalam blok dijalankan. Jika tidak (False), instruksi dilewati atau harus menunggu.",
    targetDish: "Indomie Kuah Spesial",
    cookwareNeeded: "pot",
    codeRepresentation: "IF (air_mendidih == true) {\n    masukkan_mie();\n    tunggu_mie_matang();\n} ELSE {\n    tunggu_air_mendidih();\n}",
    requiredSteps: [
      { id: "fill_water", label: "Isi Panci dengan Air", action: "FILL_WATER" },
      { id: "place_stove", label: "Letakkan Panci di Kompor", action: "PLACE_POT_STOVE" },
      { id: "turn_on_stove", label: "Nyalakan Kompor", action: "TURN_ON_STOVE" },
      { id: "check_boil", label: "Periksa Kondisi: Apakah Air Mendidih?", action: "WAIT_BOIL" },
      { id: "add_noodles", label: "Masukkan Mie (Hanya jika air mendidih!)", action: "ADD_NOODLES" },
      { id: "cook_noodles", label: "Tunggu Mie Matang Sempurna", action: "COOK_NOODLES" },
      { id: "add_seasoning", label: "Tambahkan Bumbu Indomie", action: "ADD_SEASONING" },
      { id: "serve", label: "Sajikan ke Mangkuk", action: "SERVE_DISH" }
    ],
    availableIngredients: ["water", "noodles", "seasoning"],
    targetStir: 0,
    timeLimit: 150,
    hintText: "Jangan masukkan mie saat air masih dingin! Cek apakah gelembung air sudah mendidih (IF air_mendidih == true).",
    flowchart: {
      title: "Bagan Alir: Percabangan Merebus Mie",
      conceptNote: "Simbol belah ketupat mewakili KEPUTUSAN / DECISION (IF). Diagram memiliki dua cabang: YA (True) dan TIDAK (False).",
      challengeText: "Pilih simbol Decision (Belah Ketupat) yang mengevaluasi prasyarat sebelum mie dimasukkan!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Panaskan air dalam panci" },
        { 
          id: "n3", 
          type: "decision", 
          label: "Apakah air mendidih?", 
          isMissing: true, 
          options: ["Apakah air mendidih?", "Langsung tuang mie mentah", "Matikan kompor sekarang"], 
          correctAnswer: "Apakah air mendidih?",
          yesTo: "n5",
          noTo: "n4",
          explanation: "Kondisi 'air_mendidih == true' harus terpenuhi terlebih dahulu sebelum melangkah ke proses memasukkan mie."
        },
        { id: "n4", type: "process", label: "Tunggu air mendidih", isLoopBack: true },
        { id: "n5", type: "process", label: "Masukkan mie & bumbu gurih" },
        { id: "n6", type: "process", label: "Rebus mie hingga matang" },
        { id: "n7", type: "terminator", label: "Selesai (Sajikan)" }
      ]
    }
  },
  {
    id: 3,
    sceneId: 2,
    title: "Level 3: Telur Dadar",
    subtitle: "Konsep Dasar: Percabangan Ganda (IF - ELSE)",
    concept: "IF - ELSE",
    description: "Memilih di antara dua jalur aksi yang berbeda berdasarkan status kematangan telur.",
    conceptExplanation: "Percabangan IF-ELSE memberikan dua cabang alternatif: jika kondisi bernilai True lakukan aksi A, jika False lakukan aksi B.",
    targetDish: "Telur Dadar Emas Gurih",
    cookwareNeeded: "pan",
    codeRepresentation: "IF (bawah_matang == true) {\n    balik_telur(); // Balik sisi atas\n} ELSE {\n    lanjut_masak(); // Jangan balik dulu!\n}\n\nIF (kedua_sisi_matang) {\n    angkat_telur();\n} ELSE {\n    tunggu_matang();\n}",
    requiredSteps: [
      { id: "place_pan", label: "Letakkan Wajan di atas Kompor", action: "PLACE_PAN_STOVE" },
      { id: "turn_on_stove", label: "Nyalakan Api Sedang", action: "TURN_ON_STOVE" },
      { id: "add_oil", label: "Tuang Minyak Goreng", action: "ADD_OIL" },
      { id: "heat_oil", label: "Tunggu Minyak Panas", action: "HEAT_OIL" },
      { id: "pour_egg", label: "Tuang Adonan Telur Dadar", action: "POUR_EGG" },
      { id: "check_bottom", label: "IF bawah_matang -> Balik Telur", action: "FLIP_EGG" },
      { id: "cook_other_side", label: "Matangkan Sisi Satunya", action: "COOK_EGG_SIDE2" },
      { id: "serve", label: "Angkat & Sajikan ke Piring", action: "SERVE_DISH" }
    ],
    availableIngredients: ["oil", "egg"],
    targetStir: 0,
    timeLimit: 150,
    hintText: "Pantau warna telur! Jika bawah belum matang jangan dibalik (hancur). Jika kelamaan dibiarkan bisa gosong!",
    flowchart: {
      title: "Bagan Alir: Percabangan Ganda IF-ELSE",
      conceptNote: "IF-ELSE memberikan dua aksi berbeda: Jika bawah matang (YA), balik telur. Jika belum (TIDAK), lanjut masak bawah.",
      challengeText: "Pilih kondisi percabangan IF-ELSE yang menentukan kapan telur harus dibalik!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Panaskan minyak & tuang telur" },
        { 
          id: "n3", 
          type: "decision", 
          label: "Bagian bawah matang kokoh?", 
          isMissing: true, 
          options: ["Bagian bawah matang kokoh?", "Goreng cangkang telur", "Tinggalkan dapur tidur"], 
          correctAnswer: "Bagian bawah matang kokoh?",
          yesTo: "n5",
          noTo: "n4",
          explanation: "Mengevaluasi kematangan bawah mencegah telur hancur saat dibalik (jalur ELSE: tunggu)."
        },
        { id: "n4", type: "process", label: "ELSE: Lanjutkan masak bawah" },
        { id: "n5", type: "process", label: "IF: Balik telur ke sisi atas" },
        { id: "n6", type: "process", label: "Matangkan kedua sisi sempurna" },
        { id: "n7", type: "terminator", label: "Selesai (Angkat ke Piring)" }
      ]
    }
  },
  {
    id: 4,
    sceneId: 2,
    title: "Level 4: Nasi Goreng",
    subtitle: "Konsep Dasar: Perulangan (LOOPING / WHILE)",
    concept: "LOOPING (PERULANGAN)",
    description: "Lakukan pengadukan berulang kali dengan spatula hingga bumbu dan nasi matang merata.",
    conceptExplanation: "Perulangan (Loop) menjalankan blok instruksi yang sama berulang kali selama kondisi terpenuhi atau sampai target pengulangan (counter) tercapai.",
    targetDish: "Nasi Goreng Spesial Dapur Debug",
    cookwareNeeded: "pan",
    codeRepresentation: "stir_count = 0;\nWHILE (stir_count < 6) {\n    aduk_nasi();\n    stir_count = stir_count + 1;\n    tampilkan_progress(stir_count);\n}\nsajikan_nasi_goreng();",
    requiredSteps: [
      { id: "place_pan", label: "Siapkan Wajan di Kompor", action: "PLACE_PAN_STOVE" },
      { id: "turn_on_stove", label: "Nyalakan Api", action: "TURN_ON_STOVE" },
      { id: "add_oil", label: "Tuangkan Minyak Goreng", action: "ADD_OIL" },
      { id: "add_seasoning", label: "Masukkan Bumbu Halus", action: "ADD_SEASONING" },
      { id: "add_rice", label: "Masukkan Nasi Putih", action: "ADD_RICE" },
      { id: "add_sauce", label: "Tambahkan Kecap Manis", action: "ADD_SAUCE" },
      { id: "stir_loop", label: "Aduk Nasi Berulang Kali (Target: 6x)", action: "STIR_LOOP" },
      { id: "serve", label: "Sajikan ke Piring", action: "SERVE_DISH" }
    ],
    availableIngredients: ["oil", "seasoning", "rice", "sauce"],
    targetStir: 6,
    timeLimit: 150,
    hintText: "Klik spatula sebanyak 6 kali untuk perulangan adukan! Kurang dari 6x nasi belum rata, lebih dari 10x nasi bisa gosong.",
    flowchart: {
      title: "Bagan Alir: Perulangan WHILE Pengadukan",
      conceptNote: "Perulangan (Loop) memiliki kondisi terminasi counter. Selama kondisi bernilai YA, alur kembali berputar ke atas.",
      challengeText: "Pilih kondisi loop counter yang mengontrol perulangan pengadukan nasi!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Masukkan nasi, bumbu & kecap" },
        { id: "n3", type: "process", label: "Inisialisasi: stir_count = 0" },
        { 
          id: "n4", 
          type: "decision", 
          label: "stir_count < 6?", 
          isMissing: true, 
          options: ["stir_count < 6?", "stir_count == 999?", "nasi_hilang == true?"], 
          correctAnswer: "stir_count < 6?",
          yesTo: "n5",
          noTo: "n6",
          explanation: "Perulangan adukan terus berjalan selama counter stir_count masih di bawah target 6 adukan."
        },
        { id: "n5", type: "process", label: "Aduk spatula & stir_count++", isLoopBack: true },
        { id: "n6", type: "process", label: "Nasi tanak merata -> Angkat" },
        { id: "n7", type: "terminator", label: "Selesai" }
      ]
    }
  },
  {
    id: 5,
    sceneId: 2,
    title: "Level 5: Ayam Goreng Krispi",
    subtitle: "Konsep Dasar: Percabangan Bersarang (NESTED CONDITIONAL)",
    concept: "NESTED CONDITIONAL",
    description: "Mengambil keputusan di dalam keputusan lain: memantau letupan minyak panas saat menggoreng ayam.",
    conceptExplanation: "Nested Conditional adalah struktur IF yang berada di dalam blok IF lainnya. Keputusan kedua hanya dievaluasi jika keputusan pertama terpenuhi.",
    targetDish: "Ayam Goreng Krispi Emas",
    cookwareNeeded: "pan",
    codeRepresentation: "IF (minyak_panas == true) {\n    masukkan_ayam();\n    WHILE (ayam_belum_matang) {\n        IF (minyak_meletup == true) {\n            kecilkan_api_dan_tutup(); // nested if\n        } ELSE {\n            balik_ayam(); // nested else\n        }\n    }\n} ELSE {\n    tunggu_minyak_panas();\n}",
    requiredSteps: [
      { id: "place_pan", label: "Siapkan Wajan & Nyalakan Api", action: "PLACE_PAN_STOVE" },
      { id: "turn_on_stove", label: "Nyalakan Kompor Api Sedang", action: "TURN_ON_STOVE" },
      { id: "add_oil", label: "Tuang Minyak Banyak (Deep Fry)", action: "ADD_OIL" },
      { id: "heat_oil", label: "Tunggu Minyak Benar-Benar Panas", action: "HEAT_OIL" },
      { id: "add_chicken", label: "Masukkan Ayam Berbumbu", action: "ADD_CHICKEN" },
      { id: "handle_splatter", label: "Kondisi: Atasi Letupan Minyak (Kecilkan Api/Tutup)", action: "HANDLE_SPLATTER" },
      { id: "flip_chicken", label: "Balik Ayam Hingga Matang Emas", action: "FLIP_CHICKEN" },
      { id: "serve", label: "Tiriskan & Sajikan", action: "SERVE_DISH" }
    ],
    availableIngredients: ["oil", "chicken"],
    targetStir: 3,
    timeLimit: 160,
    hintText: "Saat minyak meletup-letup (minyak_meletup == true), segera kecilkan api sebelum membalik ayam!",
    flowchart: {
      title: "Bagan Alir: Percabangan Bersarang (Nested IF)",
      conceptNote: "Nested IF berarti ada simbol Decision di dalam cabang Decision sebelumnya. Keputusan letupan minyak dievaluasi saat penggorengan berlangsung.",
      challengeText: "Pilih kondisi percabangan internal (Nested IF) saat ayam berada di minyak panas!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Panaskan minyak & masukkan ayam" },
        { 
          id: "n3", 
          type: "decision", 
          label: "Minyak meletup? (Nested IF)", 
          isMissing: true, 
          options: ["Minyak meletup? (Nested IF)", "Ayam bisa terbang?", "Wajan meleleh?"], 
          correctAnswer: "Minyak meletup? (Nested IF)",
          yesTo: "n4",
          noTo: "n5",
          explanation: "Nested IF: Jika minyak meletup (YA), kecilkan api terlebih dahulu sebelum membalik ayam."
        },
        { id: "n4", type: "process", label: "YA: Kecilkan api kompor" },
        { id: "n5", type: "process", label: "TIDAK: Balik ayam hingga keemasan" },
        { id: "n6", type: "process", label: "Tiriskan ayam krispi" },
        { id: "n7", type: "terminator", label: "Selesai" }
      ]
    }
  },
  {
    id: 6,
    sceneId: 3,
    title: "Level 6: Paket Hemat Anak Kost",
    subtitle: "Konsep Dasar: Prosedur & Efisiensi Algoritma",
    concept: "PROCEDURE & EFFICIENCY",
    description: "Dekomposisi tugas memasak ke dalam 3 sub-prosedur: Prosedur Nasi, Prosedur Telur, dan Prosedur Ayam.",
    conceptExplanation: "Prosedur (Sub-rutin / Fungsi) adalah sekumpulan instruksi terpadu yang dapat dipanggil kembali untuk menyelesaikan sub-tugas tertentu, meningkatkan keterbacaan dan efisiensi program.",
    targetDish: "Paket Komplit (Nasi + Telur + Ayam)",
    cookwareNeeded: "multi",
    codeRepresentation: "PROCEDURE masak_nasi() {\n    siapkan_panci(); tuang_beras(); masak();\n}\nPROCEDURE masak_telur() {\n    goreng_telur(); balik(); tiriskan();\n}\nPROCEDURE masak_ayam() {\n    panaskan_minyak(); goreng_ayam(); tiriskan();\n}\n\n// Eksekusi Rangkaian Prosedur Efisien:\nmasak_nasi();\nmasak_ayam();\nmasak_telur();\nsatukan_ke_piring();",
    requiredSteps: [
      { id: "proc_rice", label: "Jalankan Prosedur: Masak Nasi Putih", action: "EXEC_PROC_RICE" },
      { id: "proc_chicken", label: "Jalankan Prosedur: Goreng Ayam Krispi", action: "EXEC_PROC_CHICKEN" },
      { id: "proc_egg", label: "Jalankan Prosedur: Dadar Telur", action: "EXEC_PROC_EGG" },
      { id: "assemble_plate", label: "Satukan Semua Komponen ke Piring Saji", action: "SERVE_DISH" }
    ],
    availableIngredients: ["rice", "chicken", "egg", "oil"],
    targetStir: 4,
    timeLimit: 180,
    hintText: "Gunakan dekomposisi! Selesaikan setiap prosedur memasak satu per satu secara efisien.",
    flowchart: {
      title: "Bagan Alir: Dekomposisi Prosedur (Sub-rutin)",
      conceptNote: "Simbol Prosedur (Predefined Process) memiliki garis ganda vertikal di sisinya, memanggil modul instruksi yang telah didefinisikan.",
      challengeText: "Lengkapi pemanggilan prosedur memasak lauk pauk pada rangkaian paket hemat!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "subroutine", label: "Panggil: masak_nasi()" },
        { id: "n3", type: "subroutine", label: "Panggil: masak_ayam()" },
        { 
          id: "n4", 
          type: "subroutine", 
          label: "Panggil: masak_telur()", 
          isMissing: true, 
          options: ["Panggil: masak_telur()", "Beli makanan online", "Cuci baju kotor"], 
          correctAnswer: "Panggil: masak_telur()",
          explanation: "Dekomposisi: Tiap sub-rutin (nasi, ayam, telur) menyelesaikan sub-tugasnya sendiri secara modular."
        },
        { id: "n5", type: "process", label: "Satukan semua ke piring saji" },
        { id: "n6", type: "terminator", label: "Selesai" }
      ]
    }
  },
  {
    id: 7,
    sceneId: 3,
    title: "Level 7: Boss Akhir — Debug Resep Ibu Kost",
    subtitle: "Konsep Dasar: Debugging Algoritma Terpadu",
    concept: "ALGORITHM DEBUGGING",
    description: "Chef Bug menemukan resep legendaris Ibu Kost yang penuh bug! Temukan instruksi yang salah, perbaiki urutan, perbaiki loop tak terbatas, dan jalankan resep yang bersih.",
    conceptExplanation: "Debugging adalah proses mendeteksi, mengisolasi, dan memperbaiki galat (bug/error) baik sintaksis, logika (logic error), maupun waktu-jalan (runtime error) dalam suatu algoritma.",
    targetDish: "Nasi Liwet Komplit Warisan Ibu Kost",
    cookwareNeeded: "boss_editor",
    codeRepresentation: "// RESEP IBU KOST DENGAN BANYAK BUG LOGIKA!\n// Tugasmu: Perbaiki urutan blok instruksi di papan resep!",
    corruptedSteps: [
      { id: "step_fire_early", text: "Nyalakan kompor langsung!", bugType: "SEQUENCE_ERROR", correctIndex: 3, explanation: "Panci belum ditaruh dan belum ada isinya, kompor tidak boleh dinyalakan dulu!" },
      { id: "step_fill_rice", text: "Masukkan beras & rempah ke panci", bugType: "OK", correctIndex: 1, explanation: "Langkah persiapan bahan ke dalam panci." },
      { id: "step_place_pot", text: "Letakkan panci di atas kompor", bugType: "OK", correctIndex: 2, explanation: "Panci ditaruh sebelum kompor dinyalakan." },
      { id: "step_prep_pot", text: "Ambil panci liwet bersih", bugType: "OK", correctIndex: 0, explanation: "Langkah pertama harus menyiapkan wadah memasak." },
      { id: "step_infinite_loop", text: "WHILE (true) { aduk_tanpa_henti(); }", bugType: "INFINITE_LOOP", correctIndex: 4, fixedText: "WHILE (adukan < 5) { aduk_liwet(); adukan++; }", explanation: "Looping tanpa batas (infinite loop) membuat nasi gosong dan program macet!" },
      { id: "step_wrong_if", text: "IF (nasi_gosong == true) { sajikan(); }", bugType: "LOGIC_ERROR", correctIndex: 5, fixedText: "IF (nasi_harum_dan_tanak == true) { sajikan(); }", explanation: "Kondisi penyajian salah! Harusnya disajikan saat nasi tanak, bukan saat gosong." }
    ],
    correctSequenceIds: [
      "step_prep_pot",
      "step_fill_rice",
      "step_place_pot",
      "step_fire_early",
      "step_infinite_loop",
      "step_wrong_if"
    ],
    timeLimit: 240,
    hintText: "Telusuri resep baris demi baris! Urutkan langkah persiapan, perbaiki perulangan tak hingga (infinite loop), dan perbaiki logika IF.",
    flowchart: {
      title: "Bagan Alir: Debugging Resep Liwet Warisan",
      conceptNote: "Pada tantangan Boss, telusuri alur diagram alir untuk menemukan letak Infinite Loop dan kondisi IF yang salah!",
      challengeText: "Perbaiki galat perulangan tak terhingga (Infinite Loop) pada bagan alir berikut!",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Persiapan panci & beras rempah" },
        { id: "n3", type: "process", label: "Taruh di kompor & nyalakan api" },
        { 
          id: "n4", 
          type: "decision", 
          label: "adukan < 5? (Loop Terkontrol)", 
          isMissing: true, 
          options: ["adukan < 5? (Loop Terkontrol)", "WHILE (true) { Aduk selamanya }", "Hancurkan panci"], 
          correctAnswer: "adukan < 5? (Loop Terkontrol)",
          explanation: "Mengganti loop tanpa batas dengan batas terkontrol (adukan < 5) mencegah program macet dan nasi gosong!"
        },
        { id: "n5", type: "decision", label: "Nasi tanak harum? -> Sajikan" },
        { id: "n6", type: "terminator", label: "Selesai (Nasi Liwet Juara)" }
      ]
    }
  }
];
