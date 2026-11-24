/**
 * DEBUG DAPUR - Algorithm Engine
 * Core validation logic for Sequence, IF, IF-ELSE, Looping, Nested, Procedures, and Debugging.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.AlgorithmEngine = (function() {
  let currentLevel = null;
  let actionLog = [];
  let currentStepIndex = 0;
  let bugCount = 0;
  let isLevelPassed = false;

  function initLevel(levelData) {
    currentLevel = levelData;
    actionLog = [];
    currentStepIndex = 0;
    bugCount = 0;
    isLevelPassed = false;
  }

  function logAction(actionLabel, isValid = true, bugDetails = null) {
    const stepNum = String(actionLog.length + 1).padStart(2, '0');
    const entry = {
      stepNum,
      label: actionLabel,
      isValid,
      bugDetails,
      timestamp: Date.now()
    };
    actionLog.push(entry);
    return entry;
  }

  /**
   * Validates player action against level algorithm requirements.
   * Returns { valid: boolean, bugType: string, title: string, explanation: string, concept: string }
   */
  function validateAction(actionType, context = {}) {
    if (!currentLevel) return { valid: false, message: "Level belum dimuat" };

    const levelId = currentLevel.id;

    // LEVEL 1: SEQUENCE (URUTAN)
    if (levelId === 1) {
      return validateLevel1(actionType, context);
    }

    // LEVEL 2: CONDITIONAL (IF)
    if (levelId === 2) {
      return validateLevel2(actionType, context);
    }

    // LEVEL 3: IF - ELSE
    if (levelId === 3) {
      return validateLevel3(actionType, context);
    }

    // LEVEL 4: LOOPING (WHILE)
    if (levelId === 4) {
      return validateLevel4(actionType, context);
    }

    // LEVEL 5: NESTED CONDITIONAL
    if (levelId === 5) {
      return validateLevel5(actionType, context);
    }

    // LEVEL 6: PROCEDURE & EFFICIENCY
    if (levelId === 6) {
      return validateLevel6(actionType, context);
    }

    // LEVEL 7: BOSS DEBUGGING
    if (levelId === 7) {
      return validateLevel7(actionType, context);
    }

    return { valid: true };
  }

  // --- LEVEL 1 VALIDATOR (SEQUENCE) ---
  function validateLevel1(action, ctx) {
    const pot = ctx.pot;
    const stove = ctx.stove;

    // Turning on stove without pot
    if (action === "TURN_ON_STOVE") {
      if (!pot.isDockedOnStove) {
        bugCount++;
        return {
          valid: false,
          bugType: "SEQUENCE_ERROR",
          title: "BUG SEKUENS: KOMPOR MENYALA KOSONG!",
          explanation: "Kamu menyalakan kompor gas saat kompor masih kosong tanpa panci. Dalam algoritma sekuens, langkah persiapan wadah harus diselesaikan SEBELUM langkah eksekusi pemanasan.",
          concept: "Algoritma Sekuens: Langkah instruksi harus runut dari awal persiapan hingga pemanasan."
        };
      }
      if (!pot.hasWater) {
        bugCount++;
        return {
          valid: false,
          bugType: "LOGIC_ERROR",
          title: "BUG LOGIKA: PANCI KOSONG DIPANASKAN!",
          explanation: "Panci dipanaskan tanpa diisi air terlebih dahulu! Panci bisa gosong dan rusak. Urutan yang benar: Isi air ke panci DAHULU, baru letakkan di kompor dan nyalakan api.",
          concept: "Sekuens: Tindakan mengisi air (fill_water) harus mendahului menyalakan api (heat)."
        };
      }
    }

    // Filling water after placing pot on active lit stove
    if (action === "FILL_WATER") {
      if (pot.isDockedOnStove && stove.burners[0].isLit) {
        bugCount++;
        return {
          valid: false,
          bugType: "HAZARD_ERROR",
          title: "BUG SEKUENS BERBAHAYA!",
          explanation: "Menuangkan air ke atas kompor yang sudah menyala sangat berbahaya! Panci harus diisi air di keran wastafel sebelum ditaruh dan dipanaskan.",
          concept: "Urutan Instruksi: Persiapan bahan cair dilakukan sebelum kontak dengan sumber panas."
        };
      }
    }

    // Placing pot without water on lit stove
    if (action === "PLACE_POT_STOVE") {
      if (stove.burners[0].isLit && !pot.hasWater) {
        bugCount++;
        return {
          valid: false,
          bugType: "SEQUENCE_ERROR",
          title: "BUG SEKUENS: PANCI KOSONG KE KOMPOR PANAS!",
          explanation: "Panci masih kosong belum diisi air. Isi air di keran terlebih dahulu!",
          concept: "Sekuensial: Input data (air) harus ada sebelum proses eksekusi dijalankan."
        };
      }
    }

    return { valid: true };
  }

  // --- LEVEL 2 VALIDATOR (CONDITIONAL IF) ---
  function validateLevel2(action, ctx) {
    const pot = ctx.pot;

    if (action === "ADD_NOODLES") {
      // Must check IF water is boiling
      if (!pot.isBoiling) {
        bugCount++;
        return {
          valid: false,
          bugType: "CONDITIONAL_VIOLATION",
          title: "BUG CONDITIONAL: KONDISI IF TIDAK TERPENUHI!",
          explanation: "Kamu memasukkan mie saat air belum mendidih (air_mendidih == false). Mie akan menyerap air dingin, menjadi lembek, dan gagal matang.\n\nKode Algoritma:\nIF (air_mendidih == true) {\n    masukkan_mie();\n} ELSE {\n    tunggu_air_mendidih();\n}",
          concept: "Percabangan IF: Aksi di dalam blok IF HANYA boleh dieksekusi bila kondisi bernilai TRUE."
        };
      }
    }

    if (action === "ADD_SEASONING") {
      if (!pot.contents.includes("noodles")) {
        bugCount++;
        return {
          valid: false,
          bugType: "SEQUENCE_ERROR",
          title: "BUG URUTAN: BUMBU DITUANG KE AIR KOSONG!",
          explanation: "Mie belum dimasukkan tetapi bumbu sudah dituang. Masukkan mie terlebih dahulu saat air mendidih.",
          concept: "Sekuens & Kondisi: Bahan utama diproses sebelum bahan pelengkap."
        };
      }
    }

    if (action === "SERVE_DISH") {
      if (!pot.contents.includes("noodles") || !pot.isDone) {
        bugCount++;
        return {
          valid: false,
          bugType: "PREMATURE_TERMINATION",
          title: "BUG SELESAI DINI: MIE BELUM MATANG!",
          explanation: "Kamu menyajikan mie sebelum proses perebusan selesai. Tunggu mie matang sempurna (is_done == true).",
          concept: "Kondisi Terminasi: Program baru boleh selesai ketika seluruh tujuan bernilai True."
        };
      }
    }

    return { valid: true };
  }

  // --- LEVEL 3 VALIDATOR (IF - ELSE) ---
  function validateLevel3(action, ctx) {
    const pan = ctx.pan;

    if (action === "POUR_EGG") {
      if (!pan.hasOil) {
        bugCount++;
        return {
          valid: false,
          bugType: "CONDITIONAL_ERROR",
          title: "BUG: TELUR DITUANG KE WAJAN TANPA MINYAK!",
          explanation: "Wajan belum diberi minyak goreng! Telur akan lengket dan hangus.\nIF (ada_minyak == true) tuang_telur(); ELSE tuang_minyak_dahulu();",
          concept: "IF-ELSE: Evaluasi prasyarat minyak sebelum memasukkan adonan telur."
        };
      }
      if (!pan.isOilHot) {
        bugCount++;
        return {
          valid: false,
          bugType: "CONDITIONAL_ERROR",
          title: "BUG: MINYAK BELUM PANAS!",
          explanation: "Minyak masih dingin! Telur dadar akan menyerap terlalu banyak minyak mentah. Tunggu hingga minyak panas berdesis.",
          concept: "IF-ELSE: Tunggu kondisi True (minyak_panas == true)."
        };
      }
    }

    if (action === "FLIP_EGG") {
      if (!pan.contents.includes("egg")) {
        return { valid: false, title: "Wajan Kosong!", explanation: "Belum ada telur di wajan." };
      }
      if (!pan.eggBottomCooked) {
        bugCount++;
        return {
          valid: false,
          bugType: "IF_ELSE_DECISION_BUG",
          title: "BUG PERCABANGAN: TELUR DIBALIK TERLALU CEPAT!",
          explanation: "Bagian bawah telur belum matang kokoh! Jika dibalik sekarang telur akan hancur berantakan.\n\nIF (bagian_bawah_matang == true) {\n    balik_telur();\n} ELSE {\n    tunggu_sebentar(); // JALUR INI YANG HARUS DIPILIH!\n}",
          concept: "IF-ELSE: Saat kondisi IF False, ambil jalur ELSE (tunggu sejenak)."
        };
      }
    }

    if (action === "SERVE_DISH") {
      if (!pan.eggTopCooked) {
        bugCount++;
        return {
          valid: false,
          bugType: "CONDITIONAL_ERROR",
          title: "BUG: KEDUA SISI BELUM MATANG!",
          explanation: "Sisi atas telur belum matang sempurna! Telur dadar harus matang di kedua sisi sebelum disajikan.",
          concept: "Kondisi Ganda: Evaluasi (sisi_bawah_matang && sisi_atas_matang)."
        };
      }
    }

    return { valid: true };
  }

  // --- LEVEL 4 VALIDATOR (LOOPING) ---
  function validateLevel4(action, ctx) {
    const pan = ctx.pan;

    if (action === "STIR_LOOP") {
      if (!pan.contents.includes("rice")) {
        bugCount++;
        return {
          valid: false,
          bugType: "SEQUENCE_ERROR",
          title: "BUG: MENGADUK WAJAN TANPA NASI!",
          explanation: "Nasi belum dimasukkan ke wajan! Masukkan nasi putih terlebih dahulu sebelum memulai perulangan pengadukan (loop).",
          concept: "Inisialisasi Looping: Data yang akan diproses dalam perulangan harus disiapkan terlebih dahulu."
        };
      }
    }

    if (action === "SERVE_DISH") {
      if (pan.riceStirCount < 6) {
        bugCount++;
        return {
          valid: false,
          bugType: "INCOMPLETE_LOOP_BUG",
          title: "BUG PERULANGAN: LOOP SELESAI TERLALU DINI!",
          explanation: `Kamu baru mengaduk ${pan.riceStirCount} kali dari target 6 kali!\nNasi belum matang merata dan bumbu belum tercampur.\n\nWHILE (stir_count < 6) {\n    aduk_nasi();\n    stir_count++;\n}`,
          concept: "Perulangan: Loop hanya berhenti ketika kondisi terminasi (stir_count >= 6) terpenuhi."
        };
      }
    }

    return { valid: true };
  }

  // --- LEVEL 5 VALIDATOR (NESTED CONDITIONAL) ---
  function validateLevel5(action, ctx) {
    const pan = ctx.pan;

    if (action === "ADD_CHICKEN") {
      if (!pan.isOilHot) {
        bugCount++;
        return {
          valid: false,
          bugType: "CONDITIONAL_ERROR",
          title: "BUG: MINYAK BELUM CUKUP PANAS!",
          explanation: "Ayam dimasukkan saat minyak belum panas. Ayam akan menyerap minyak dingin dan kulitnya tidak krispi.\nIF (minyak_panas == true) masukkan_ayam();",
          concept: "Outer Conditional: Syarat utama minyak_panas wajib bernilai True."
        };
      }
    }

    if (action === "FLIP_CHICKEN") {
      if (pan.isOilSplattering) {
        bugCount++;
        return {
          valid: false,
          bugType: "NESTED_CONDITIONAL_BUG",
          title: "BUG PERCABANGAN BERSARANG!",
          explanation: "Minyak sedang meletup-letup panas! Kamu harus mengecilkan api atau menutup wajan terlebih dahulu sebelum membalik ayam!\n\nIF (minyak_panas) {\n    IF (minyak_meletup == true) {\n        kecilkan_api(); // HARUS DILAKUKAN DULU!\n    } ELSE {\n        balik_ayam();\n    }\n}",
          concept: "Nested Conditional: Selesaikan kondisi internal (inner IF) sebelum melanjutkan aksi lain."
        };
      }
    }

    return { valid: true };
  }

  // --- LEVEL 6 VALIDATOR (PROCEDURES) ---
  function validateLevel6(action, ctx) {
    // Procedures execution order check
    return { valid: true };
  }

  // --- LEVEL 7 VALIDATOR (BOSS DEBUGGING) ---
  function validateLevel7(actionType, context) {
    const sequence = Array.isArray(context) ? context : (Array.isArray(actionType) ? actionType : (context && context.sequence ? context.sequence : []));
    const targetSeq = [
      "step_prep_pot",
      "step_fill_rice",
      "step_place_pot",
      "step_fire_early",
      "step_infinite_loop",
      "step_wrong_if"
    ];

    let hasMismatch = false;
    let bugInfo = null;

    for (let i = 0; i < targetSeq.length; i++) {
      if (sequence[i] !== targetSeq[i]) {
        hasMismatch = true;
        const currentItem = sequence[i];
        if (currentItem === "step_infinite_loop" && i < 4) {
          bugInfo = {
            title: "BUG PERULANGAN TAK TERHINGGA DINI!",
            explanation: "Perulangan aduk tidak bisa dijalankan sebelum wadah disiapkan dan kompor dinyalakan."
          };
        } else if (currentItem === "step_wrong_if" && i < 5) {
          bugInfo = {
            title: "BUG LOGIKA TERMINASI DINI!",
            explanation: "Penyajian (sajikan) diletakkan terlalu awal padahal proses memasak belum selesai."
          };
        } else {
          bugInfo = {
            title: "URUTAN REKURSIS/SEKUENS SALAH!",
            explanation: "Periksa kembali logika alur memasak liwet dari persiapan panci hingga penyajian."
          };
        }
        break;
      }
    }

    if (hasMismatch) {
      bugCount++;
      return {
        valid: false,
        bugType: "RECIPE_BUG",
        title: bugInfo ? bugInfo.title : "RESEP MASIH MEMILIKI BUG!",
        explanation: bugInfo ? bugInfo.explanation : "Telusuri instruksi satu per satu. Urutkan logika dari persiapan hingga selesai.",
        concept: "Algorithmic Debugging: Tracing & penyelarasan kode agar alur eksekusi sesuai spesifikasi."
      };
    }

    return { valid: true };
  }

  return {
    initLevel,
    logAction,
    validateAction,
    getActionLog: () => actionLog,
    getBugCount: () => bugCount
  };
})();
