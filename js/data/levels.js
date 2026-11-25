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
      conceptNote: "Simbol persegi panjang mewakili PROSES (langkah berurutan). Lihat langkah sebelum dan sesudah kotak [ ? ] untuk menebak langkah yang hilang.",
      challengeText: "Lengkapi blok proses yang hilang agar urutan merebus air aman dan logis:",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Siapkan panci bersih" },
        {
          id: "n3",
          type: "process",
          label: "Isi air bersih ke dalam panci",
          isMissing: true,
          options: ["Nyalakan kompor kosong", "Isi air bersih ke dalam panci", "Langsung sajikan panci kosong"],
          correctAnswer: "Isi air bersih ke dalam panci",
          hint: "Panci sudah disiapkan dan setelah ini akan ditaruh di kompor. Apa yang harus diisi ke dalam panci terlebih dahulu?",
          wrongFeedback: {
            "Nyalakan kompor kosong": "Bahaya! Menyalakan kompor sebelum panci berisi air ditaruh membuat gas terbuang dan panci bisa rusak.",
            "Langsung sajikan panci kosong": "Air bahkan belum dimasukkan dan belum direbus, tujuan memasak air belum tercapai!"
          },
          explanation: "Dalam urutan (sekuens) yang aman, air harus diisikan ke dalam panci sebelum panci ditaruh di atas kompor panas."
        },
        { id: "n4", type: "process", label: "Taruh panci di atas kompor" },
        { id: "n5", type: "process", label: "Nyalakan api kompor" },
        { id: "n6", type: "process", label: "Tunggu hingga air mendidih (100°C)" },
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
      title: "Bagan Alir: Percabangan Merebus Mie (IF)",
      conceptNote: "Simbol DECISION (IF?) memeriksa syarat sebelum melangkah. Cabang YA dijalankan jika syarat terpenuhi, cabang TIDAK dijalankan jika belum.",
      challengeText: "Syarat apa yang harus diperiksa sebelum mie boleh dimasukkan ke dalam panci?",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Isi air & panaskan panci di kompor" },
        {
          id: "n3",
          type: "decision",
          label: "Apakah air sudah mendidih?",
          isMissing: true,
          options: ["Apakah panci masih kosong?", "Matikan kompor sekarang?", "Apakah air sudah mendidih?"],
          correctAnswer: "Apakah air sudah mendidih?",
          yesTo: "n5",
          noTo: "n4",
          hint: "Lihat cabang YA dan TIDAK di bawahnya: jika TIDAK kita menunggu air mendidih, jika YA kita masukkan mie!",
          wrongFeedback: {
            "Apakah panci masih kosong?": "Jika panci kosong tentu tidak bisa merebus mie! Syarat yang dicek adalah status air panas.",
            "Matikan kompor sekarang?": "Kompor justru harus tetap menyala agar air bisa mendidih dan mie matang."
          },
          explanation: "Kondisi 'air mendidih == true' harus diperiksa terlebih dahulu sebelum melangkah ke proses memasukkan mie."
        },
        { id: "n4", type: "process", label: "Tunggu hingga air mendidih", isLoopBack: true, branchRole: "no" },
        { id: "n5", type: "process", label: "Masukkan mie & bumbu gurih", branchRole: "yes" },
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
      conceptNote: "IF-ELSE memilih 1 dari 2 jalur: jika kondisi YA, telur dibalik. Jika TIDAK, lanjut masak sisi bawah dulu.",
      challengeText: "Pertanyaan kondisi apa yang menentukan apakah telur sudah boleh dibalik?",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Panaskan minyak & tuang adonan telur" },
        {
          id: "n3",
          type: "decision",
          label: "Apakah bagian bawah sudah matang?",
          isMissing: true,
          options: ["Apakah minyak sudah habis?", "Apakah bagian bawah sudah matang?", "Apakah wajan sudah dicuci?"],
          correctAnswer: "Apakah bagian bawah sudah matang?",
          yesTo: "n5",
          noTo: "n4",
          hint: "Perhatikan jalur YA (Balik telur) dan jalur TIDAK (Lanjutkan masak bagian bawah).",
          wrongFeedback: {
            "Apakah minyak sudah habis?": "Keputusan membalik telur tidak bergantung pada minyak habis, melainkan kematangan sisi bawah telur.",
            "Apakah wajan sudah dicuci?": "Telur sedang dimasak di wajan, bukan saat mencuci wajan!"
          },
          explanation: "Mengevaluasi kematangan sisi bawah mencegah telur hancur saat dibalik (jika belum matang, ambil jalur ELSE untuk menunggu)."
        },
        { id: "n4", type: "process", label: "Lanjutkan masak sisi bawah", isLoopBack: true, branchRole: "no" },
        { id: "n5", type: "process", label: "Balik telur ke sisi atas", branchRole: "yes" },
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
      conceptNote: "Perulangan (Loop) mengulang aksi yang sama selama kondisi batas masih bernilai YA. Target adukan nasi goreng adalah 6 kali.",
      challengeText: "Pilih syarat batas perulangan (Loop) yang tepat untuk mengaduk nasi sebanyak 6 kali:",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Masukkan minyak, nasi, bumbu & kecap" },
        { id: "n3", type: "process", label: "Mulai hitungan aduk = 0" },
        {
          id: "n4",
          type: "decision",
          label: "Hitungan aduk < 6?",
          isMissing: true,
          options: ["Hitungan aduk == 999?", "Hitungan aduk < 6?", "Api kompor sudah mati?"],
          correctAnswer: "Hitungan aduk < 6?",
          yesTo: "n5",
          noTo: "n6",
          hint: "Selama hitungan adukan belum mencapai target 6x, cabang YA akan mengulang aksi mengaduk dengan spatula.",
          wrongFeedback: {
            "Hitungan aduk == 999?": "Karena hitungan dimulai dari 0, kondisi (0 == 999) langsung bernilai TIDAK dan nasi tidak pernah diaduk!",
            "Api kompor sudah mati?": "Jika kompor mati, pengadukan justru berhenti di tengah jalan sebelum bumbu tercampur."
          },
          explanation: "Perulangan terus mengaduk (cabang YA) selama hitungan adukan masih kurang dari 6 kali (< 6), lalu berhenti saat sudah 6 kali."
        },
        { id: "n5", type: "process", label: "Aduk spatula & hitungan +1", isLoopBack: true, branchRole: "yes" },
        { id: "n6", type: "process", label: "Nasi matang merata -> Angkat", branchRole: "no" },
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
      conceptNote: "Nested IF artinya ada pemeriksaan kondisi tambahan di dalam proses menggoreng ayam ketika minyak sudah panas.",
      challengeText: "Kondisi apa yang harus dicek saat ayam digoreng sebelum kita boleh membaliknya?",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Panaskan minyak & masukkan ayam" },
        {
          id: "n3",
          type: "decision",
          label: "Apakah minyak meletup panas?",
          isMissing: true,
          options: ["Apakah ayam masih mentah beku?", "Apakah wajan belum ada minyak?", "Apakah minyak meletup panas?"],
          correctAnswer: "Apakah minyak meletup panas?",
          yesTo: "n4",
          noTo: "n5",
          hint: "Lihat hasil cabang YA ('Kecilkan api kompor') dan cabang TIDAK ('Balik ayam'). Kondisi apa yang memicu kita mengecilkan api?",
          wrongFeedback: {
            "Apakah ayam masih mentah beku?": "Ayam yang sudah masuk di minyak panas tidak dicek dengan mengecilkan api karena beku — perhatikan cabang YA!",
            "Apakah wajan belum ada minyak?": "Minyak sudah dipanaskan di langkah sebelumnya. Lihat cabang YA: mengecilkan api."
          },
          explanation: "Nested IF: Jika minyak sedang meletup (YA), kecilkan api terlebih dahulu agar aman sebelum membalik ayam."
        },
        { id: "n4", type: "process", label: "Kecilkan api kompor dahulu", branchRole: "yes" },
        { id: "n5", type: "process", label: "Balik ayam hingga keemasan", branchRole: "no" },
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
      conceptNote: "Simbol SUB-RUTIN memanggil satu modul tugas memasak yang terpisah agar paket lengkap tersusun rapi dan efisien.",
      challengeText: "Lengkapi panggilan prosedur lauk ketiga agar Paket Komplit (Nasi + Ayam + Telur) lengkap:",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "subroutine", label: "Panggil: masak_nasi()" },
        { id: "n3", type: "subroutine", label: "Panggil: masak_ayam()" },
        {
          id: "n4",
          type: "subroutine",
          label: "Panggil: masak_telur()",
          isMissing: true,
          options: ["Ulangi masak_nasi() lagi", "Panggil: masak_telur()", "Sajikan piring kosong"],
          correctAnswer: "Panggil: masak_telur()",
          hint: "Target paket adalah Nasi + Ayam + Telur. Nasi dan ayam sudah dimasak, prosedur mana yang belum dipanggil?",
          wrongFeedback: {
            "Ulangi masak_nasi() lagi": "Nasi sudah dimasak pada prosedur pertama. Jika diulang, paket malah kekurangan lauk telur!",
            "Sajikan piring kosong": "Langkah berikutnya baru menyatukan semua lauk ke piring saji, dan telur belum dimasak!"
          },
          explanation: "Dekomposisi: Tiap sub-rutin (nasi, ayam, telur) menyelesaikan sub-tugasnya sendiri secara modular sebelum digabung."
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
      conceptNote: "Pada tantangan Boss, temukan perbaikan kondisi perulangan agar resep tidak mengalami Infinite Loop (aduk tanpa henti).",
      challengeText: "Pilih kondisi loop yang benar untuk menggantikan bug 'aduk tanpa henti':",
      nodes: [
        { id: "n1", type: "terminator", label: "Mulai" },
        { id: "n2", type: "process", label: "Siapkan panci & masukkan beras rempah" },
        { id: "n3", type: "process", label: "Taruh di kompor & nyalakan api" },
        {
          id: "n4",
          type: "decision",
          label: "Apakah adukan < 5 kali?",
          isMissing: true,
          options: ["Aduk terus selamanya (true)", "Matikan api sebelum dimasak", "Apakah adukan < 5 kali?"],
          correctAnswer: "Apakah adukan < 5 kali?",
          yesTo: "n5",
          noTo: "n6",
          hint: "Loop yang sehat butuh batas berhenti! Jika adukan belum 5 kali (YA), aduk lagi; jika sudah 5 kali (TIDAK), lanjut sajikan.",
          wrongFeedback: {
            "Aduk terus selamanya (true)": "Itu justru penyebab Infinite Loop! Program tidak akan pernah berhenti dan nasi jadi gosong.",
            "Matikan api sebelum dimasak": "Jika kompor dimatikan sebelum diaduk dan matang, nasi liwet tetap mentah."
          },
          explanation: "Mengganti loop tanpa batas dengan batas terkontrol (adukan < 5) mencegah program macet dan nasi gosong!"
        },
        { id: "n5", type: "process", label: "Aduk nasi liwet (+1)", isLoopBack: true, branchRole: "yes" },
        { id: "n6", type: "process", label: "Nasi tanak & harum -> Sajikan", branchRole: "no" },
        { id: "n7", type: "terminator", label: "Selesai (Nasi Liwet Juara)" }
      ]
    }
  }
];
