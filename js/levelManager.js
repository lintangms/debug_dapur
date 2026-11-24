/**
 * DEBUG DAPUR - Level Manager
 * Manages active kitchen scenes, objects, level progressions, and gameplay events.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.LevelManager = (function() {
  let currentLevelId = 1;
  let levelData = null;
  let startTime = 0;
  let actionCount = 0;
  let isLevelCompleted = false;

  // Kitchen Objects
  let chefBug = null;
  let stove = null;
  let pot = null;
  let pan = null;
  let ingredients = null;
  let utensils = null;

  // Boss Debugger State (Level 7)
  let bossBlocks = [];
  let selectedBlock = null;

  // Multi-Procedure State (Level 6)
  let level6State = {
    riceDone: false,
    chickenDone: false,
    eggDone: false,
    assembled: false
  };

  function init(canvasWidth, canvasHeight) {
    // Instantiate persistent kitchen objects with optimized desktop spacing
    chefBug = new window.DebugDapur.Objects.ChefBug(1040, 310, 1.0);
    stove = new window.DebugDapur.Objects.Stove(450, 310, 320, 150);
    pot = new window.DebugDapur.Objects.Cookware('pot', 315, 380, 130, 85);
    pan = new window.DebugDapur.Objects.Cookware('pan', 315, 380, 140, 80);
    ingredients = new window.DebugDapur.Objects.Ingredients(350, 560, 500, 95);
    utensils = new window.DebugDapur.Objects.Utensils();

    // Register click & drag handlers with InputManager
    if (window.DebugDapur.InputManager) {
      window.DebugDapur.InputManager.on('click', handleCanvasClick);
    }
  }

  function startLevel(levelId) {
    currentLevelId = Number(levelId);
    levelData = window.DebugDapur.Data.LEVELS.find(l => l.id === currentLevelId);
    if (!levelData) return;

    startTime = Date.now();
    actionCount = 0;
    isLevelCompleted = false;

    // Reset objects
    pot.reset();
    pan.reset();
    stove.burners[0].isLit = false;
    stove.burners[0].heatLevel = 'OFF';
    stove.burners[0].heatPower = 0;
    stove.burners[0].dockedCookware = null;
    stove.burners[1].isLit = false;
    stove.burners[1].dockedCookware = null;

    utensils.spatula.stirCount = 0;
    utensils.plate.hasDish = false;
    utensils.plate.dishName = "";
    utensils.tap.isRunning = false;

    // Setup active cookware & ingredients
    if (levelData.cookwareNeeded === 'pot') {
      pot.x = 315;
      pot.y = 380;
    } else if (levelData.cookwareNeeded === 'pan') {
      pan.x = 315;
      pan.y = 380;
    } else if (levelData.cookwareNeeded === 'multi') {
      pot.x = 295;
      pot.y = 360;
      pan.x = 295;
      pan.y = 440;
      level6State = { riceDone: false, chickenDone: false, eggDone: false, assembled: false };
    }

    if (levelData.availableIngredients) {
      ingredients.setAvailableIngredients(levelData.availableIngredients);
    }

    // Initialize Algorithm Engine
    if (window.DebugDapur.AlgorithmEngine) {
      window.DebugDapur.AlgorithmEngine.initLevel(levelData);
    }

    // Level 7 Boss setup
    if (currentLevelId === 7) {
      initBossBlocks();
    }

    // Chef Bug Greeting
    chefBug.setState("happy", `Ayo masak ${levelData.targetDish}! ${levelData.subtitle}`, 4500);

    // Update UI HUD
    updateHUD();
  }

  function initBossBlocks() {
    // Corrupted recipe blocks for student to arrange & fix
    bossBlocks = [
      { id: "step_fire_early", text: "Nyalakan kompor langsung!", bugFixed: true, fixedText: "Nyalakan kompor gas", isBuggy: true },
      { id: "step_fill_rice", text: "Masukkan beras & rempah ke panci", bugFixed: true, fixedText: "Masukkan beras & rempah", isBuggy: false },
      { id: "step_place_pot", text: "Letakkan panci di atas kompor", bugFixed: true, fixedText: "Letakkan panci di kompor", isBuggy: false },
      { id: "step_prep_pot", text: "Ambil panci liwet bersih", bugFixed: true, fixedText: "Ambil panci liwet bersih", isBuggy: false },
      { id: "step_infinite_loop", text: "WHILE (true) { aduk_tanpa_henti(); }", bugFixed: false, fixedText: "WHILE (adukan < 5) { aduk_liwet(); adukan++; }", isBuggy: true, bugType: "loop" },
      { id: "step_wrong_if", text: "IF (nasi_gosong == true) { sajikan(); }", bugFixed: false, fixedText: "IF (nasi_harum_dan_tanak == true) { sajikan(); }", isBuggy: true, bugType: "if" }
    ];
  }

  function update(dt) {
    if (chefBug) chefBug.update(dt);
    if (stove) stove.update(dt);
    if (pot) pot.update(dt);
    if (pan) pan.update(dt);
    if (utensils) utensils.update(dt);

    // Check automatic boiling or cooking completion
    if (currentLevelId === 1 && pot.isBoiling && !isLevelCompleted) {
      completeCurrentLevel();
    }
  }

  function handleCanvasClick(mouse) {
    if (isLevelCompleted) return;
    actionCount++;

    const mx = mouse.x;
    const my = mouse.y;

    // 1. Water Tap Click
    if (utensils.isPointInTap(mx, my)) {
      handleWaterTapClick();
      return;
    }

    // 2. Stove Burner Knob Clicks
    if (stove.isPointInKnob(mx, my, 0)) {
      handleStoveKnobClick(0);
      return;
    }
    if (stove.isPointInKnob(mx, my, 1)) {
      handleStoveKnobClick(1);
      return;
    }

    // 3. Cookware Clicks (Move to Stove / Prep)
    if (pot.isPointInside(mx, my) && levelData.cookwareNeeded !== 'pan') {
      handlePotClick();
      return;
    }
    if (pan.isPointInside(mx, my) && levelData.cookwareNeeded !== 'pot') {
      handlePanClick();
      return;
    }

    // 4. Ingredient Shelf Click
    const clickedItem = ingredients.getItemAt(mx, my);
    if (clickedItem) {
      handleIngredientClick(clickedItem);
      return;
    }

    // 5. Spatula Utensil Click (Stir / Flip)
    if (utensils.isPointInSpatula(mx, my)) {
      handleSpatulaClick();
      return;
    }

    // 6. Plate Serving Station Click
    if (utensils.isPointInPlate(mx, my)) {
      handlePlateClick();
      return;
    }

    // 7. Chef Bug Click (Ask for Hint)
    const dx = mx - chefBug.x;
    const dy = my - chefBug.y;
    if (dx * dx + dy * dy <= 55 * 55) {
      chefBug.setState("happy", `Petunjuk: ${levelData.hintText}`, 5000);
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
    }
  }

  // --- INTERACTION HANDLERS ---

  function handleWaterTapClick() {
    utensils.tap.isRunning = true;
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playWaterPour();
    }

    // If pot is nearby or in prep area, fill with water
    if (!pot.isDockedOnStove) {
      pot.hasWater = true;
      logStep("Mengisi air bersih ke dalam panci", true);
      chefBug.setState("happy", "Panci sudah terisi air segar! Siap dipanaskan.", 2500);
    } else {
      // Check sequence violation
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("FILL_WATER", { pot, stove });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
      } else {
        pot.hasWater = true;
        logStep("Mengisi air ke dalam panci di atas kompor", true);
      }
    }
    updateHUD();
  }

  function handleStoveKnobClick(burnerId) {
    const burner = stove.burners[burnerId];

    // If currently lit, turn off or adjust
    if (burner.isLit) {
      if (currentLevelId === 5 && pan.isOilSplattering) {
        // Special nested conditional resolution: lower heat
        stove.setHeatLevel(burnerId, 'LOW');
        pan.isOilSplattering = false;
        pan.splatterHandled = true;
        logStep("Mengecilkan api kompor (Mengatasi letupan minyak)", true);
        chefBug.setState("happy", "Bagus! Api dikecilkan, letupan minyak teratasi!", 3000);
        updateHUD();
        return;
      }
      stove.toggleBurner(burnerId);
      logStep(`Mematikan api burner kompor #${burnerId + 1}`, true);
      updateHUD();
      return;
    }

    // Turning on stove: Validate with Algorithm Engine
    const activeCookware = burnerId === 0 ? (pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null)) : null;
    const validation = window.DebugDapur.AlgorithmEngine.validateAction("TURN_ON_STOVE", {
      pot,
      pan,
      stove,
      burnerId
    });

    if (!validation.valid) {
      window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
      return;
    }

    stove.toggleBurner(burnerId);
    logStep("Menyalakan api kompor", true);
    chefBug.setState("cooking", "Api kompor menyala! Pemanasan dimulai.", 3000);
    updateHUD();
  }

  function handlePotClick() {
    if (!pot.isDockedOnStove) {
      // Dock on burner 0
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("PLACE_POT_STOVE", { pot, stove });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      stove.dock(pot, 0);
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Meletakkan panci di atas kompor", true);
      chefBug.setState("idle", "Panci sudah di atas kompor.", 2000);
    } else {
      // Undock back to counter
      stove.undock(pot);
      pot.x = 315;
      pot.y = 380;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Memindahkan panci kembali ke meja", true);
    }
    updateHUD();
  }

  function handlePanClick() {
    if (!pan.isDockedOnStove) {
      stove.dock(pan, 0);
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Meletakkan wajan di atas kompor", true);
    } else {
      stove.undock(pan);
      pan.x = 315;
      pan.y = 380;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Memindahkan wajan ke meja", true);
    }
    updateHUD();
  }

  function handleIngredientClick(item) {
    const activeCookware = pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null);

    if (!activeCookware) {
      chefBug.setState("confused", "Siapkan dan letakkan panci atau wajan di kompor terlebih dahulu!", 3000);
      return;
    }

    // WATER
    if (item.id === "water") {
      activeCookware.hasWater = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playWaterPour();
      logStep("Menambahkan air bersih", true);
      return;
    }

    // NOODLES (Level 2)
    if (item.id === "noodles") {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("ADD_NOODLES", { pot: activeCookware });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activeCookware.contents.push("noodles");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      logStep("Memasukkan mie instan ke air mendidih", true);
      chefBug.setState("happy", "Kondisi IF terpenuhi! Mie sedang dimasak.", 3000);
      updateHUD();
      return;
    }

    // SEASONING (Level 2 & 4)
    if (item.id === "seasoning") {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("ADD_SEASONING", { pot: activeCookware, pan: activeCookware });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activeCookware.contents.push("seasoning");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      logStep("Menaburkan bumbu gurih", true);
      updateHUD();
      return;
    }

    // OIL (Level 3, 4, 5)
    if (item.id === "oil") {
      activeCookware.hasOil = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playWaterPour();
      logStep("Menuangkan minyak goreng ke wajan", true);
      chefBug.setState("cooking", "Minyak dituang. Tunggu hingga panas berdesis!", 2500);
      updateHUD();
      return;
    }

    // EGG (Level 3)
    if (item.id === "egg") {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("POUR_EGG", { pan: activeCookware });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activeCookware.contents.push("egg");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playWaterPour();
      logStep("Menuang adonan telur dadar ke minyak panas", true);
      chefBug.setState("happy", "Szzzzz! Telur dadar mulai mengembang harum.", 3000);
      updateHUD();
      return;
    }

    // RICE (Level 4)
    if (item.id === "rice") {
      activeCookware.contents.push("rice");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      logStep("Memasukkan nasi putih ke wajan", true);
      chefBug.setState("happy", "Nasi putih sudah masuk! Sekarang tambahkan bumbu & aduk berulang.", 3000);
      updateHUD();
      return;
    }

    // SAUCE (Level 4)
    if (item.id === "sauce") {
      activeCookware.contents.push("sauce");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      logStep("Menuangkan kecap manis legit", true);
      updateHUD();
      return;
    }

    // CHICKEN (Level 5)
    if (item.id === "chicken") {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("ADD_CHICKEN", { pan: activeCookware });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activeCookware.contents.push("chicken");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      logStep("Memasukkan ayam marinasi ke minyak panas", true);
      chefBug.setState("cooking", "Ayam masuk! Perhatikan letupan minyak!", 3000);
      updateHUD();
      return;
    }
  }

  function handleSpatulaClick() {
    const activePan = pan.isDockedOnStove ? pan : null;

    if (!activePan) {
      chefBug.setState("confused", "Letakkan wajan di kompor sebelum menggunakan spatula!", 2500);
      return;
    }

    // LEVEL 3: FLIP EGG
    if (currentLevelId === 3 && activePan.contents.includes("egg")) {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("FLIP_EGG", { pan: activePan });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activePan.eggFlipped = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSpatulaFlip();
      logStep("Membalik telur dadar (sisi kedua matang)", true);
      chefBug.setState("happy", "Pilihan IF-ELSE tepat! Sisi bawah matang, kini mematangkan sisi atas.", 3000);
      updateHUD();
      return;
    }

    // LEVEL 4: LOOPING STIR
    if (currentLevelId === 4) {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("STIR_LOOP", { pan: activePan });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activePan.riceStirCount++;
      utensils.spatula.stirCount = activePan.riceStirCount;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playStir();
      logStep(`[Loop While] Mengaduk nasi (Iterasi ke-${activePan.riceStirCount}/6)`, true);

      if (activePan.riceStirCount === 6) {
        activePan.riceCooked = true;
        chefBug.setState("celebrating", "Loop selesai! Nasi goreng matang merata dan harum sempurna!", 3500);
      } else {
        chefBug.setState("cooking", `Aduk lagi! (${activePan.riceStirCount}/6)`, 1500);
      }
      updateHUD();
      return;
    }

    // LEVEL 5: FLIP CHICKEN
    if (currentLevelId === 5 && activePan.contents.includes("chicken")) {
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("FLIP_CHICKEN", { pan: activePan });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      activePan.chickenFlipped = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSpatulaFlip();
      logStep("Membalik ayam krispi ke sisi emas", true);
      chefBug.setState("happy", "Ayam dibalik dengan aman tanpa letupan minyak!", 3000);
      updateHUD();
      return;
    }

    // Generic stir sound
    if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playStir();
  }

  function handlePlateClick() {
    const activeCookware = pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null);

    // LEVEL 6: PROCEDURAL ASSEMBLY
    if (currentLevelId === 6) {
      handleLevel6Execution();
      return;
    }

    // LEVEL 2, 3, 4, 5 SERVING CHECK
    if (!activeCookware) {
      chefBug.setState("confused", "Belum ada masakan di wajan/panci untuk disajikan!", 2500);
      return;
    }

    const validation = window.DebugDapur.AlgorithmEngine.validateAction("SERVE_DISH", { pot: activeCookware, pan: activeCookware });
    if (!validation.valid) {
      window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
      return;
    }

    // Successfully served!
    utensils.plate.hasDish = true;
    utensils.plate.dishName = levelData.targetDish;
    logStep(`Menyajikan ${levelData.targetDish} ke piring saji`, true);
    completeCurrentLevel();
  }

  function handleLevel6Execution() {
    // Level 6: Procedure execution
    if (!level6State.riceDone) {
      level6State.riceDone = true;
      logStep("[Prosedur 1] Eksekusi: masak_nasi() selesai", true);
      chefBug.setState("happy", "Prosedur 1 Selesai: Nasi liwet harum telah matang!", 3000);
    } else if (!level6State.chickenDone) {
      level6State.chickenDone = true;
      logStep("[Prosedur 2] Eksekusi: masak_ayam() selesai", true);
      chefBug.setState("happy", "Prosedur 2 Selesai: Ayam goreng krispi keemasan siap!", 3000);
    } else if (!level6State.eggDone) {
      level6State.eggDone = true;
      logStep("[Prosedur 3] Eksekusi: masak_telur() selesai", true);
      chefBug.setState("celebrating", "Prosedur 3 Selesai: Telur dadar siap! Semua prosedur komplit!", 3000);
    } else if (!level6State.assembled) {
      level6State.assembled = true;
      utensils.plate.hasDish = true;
      utensils.plate.dishName = "Paket Komplit Anak Kost";
      logStep("Menyatukan semua hasil prosedur ke piring saji utama", true);
      completeCurrentLevel();
    }
    updateHUD();
  }

  function logStep(text, isValid) {
    if (window.DebugDapur.AlgorithmEngine) {
      window.DebugDapur.AlgorithmEngine.logAction(text, isValid);
    }
    updateHUD();
  }

  function completeCurrentLevel() {
    if (isLevelCompleted) return;
    isLevelCompleted = true;

    // Stop continuous audio
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.stopAllContinuousSounds();
    }

    const timeSpentSec = Math.round((Date.now() - startTime) / 1000);
    const bugCount = window.DebugDapur.AlgorithmEngine.getBugCount();

    const scoreResult = window.DebugDapur.ScoringSystem.calculateScore(
      currentLevelId,
      timeSpentSec,
      bugCount,
      actionCount
    );

    // Save to storage
    if (window.DebugDapur.StorageManager) {
      window.DebugDapur.StorageManager.recordLevelCompletion(
        currentLevelId,
        scoreResult.stars,
        scoreResult.score
      );
    }

    // Play celebration audio & chef animation
    window.DebugDapur.FeedbackSystem.showCelebration(`Luar biasa! Kamu menyelesaikan ${levelData.title}!`, chefBug);

    // Show Level Complete Screen
    setTimeout(() => {
      if (window.DebugDapur.SceneManager) {
        window.DebugDapur.SceneManager.showLevelComplete(scoreResult);
      }
    }, 2200);
  }

  // Render Kitchen World
  function render(ctx) {
    // 1. Kitchen Background & Floor
    renderKitchenEnvironment(ctx);

    // 2. Interactive Objects
    if (utensils) utensils.render(ctx);
    if (stove) stove.render(ctx);
    if (pot && levelData && levelData.cookwareNeeded !== 'pan') pot.render(ctx);
    if (pan && levelData && levelData.cookwareNeeded !== 'pot') pan.render(ctx);
    if (ingredients) ingredients.render(ctx);

    // 3. Chef Bug
    if (chefBug) chefBug.render(ctx);

    // 4. If Boss Level 7, render Boss Overlay Board
    if (currentLevelId === 7) {
      renderBossBoard(ctx);
    }
  }

  function renderKitchenEnvironment(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Wall (Warm soft cream backsplash)
    ctx.fillStyle = "#FFF8E1";
    ctx.fillRect(0, 0, w, 280);

    // Backsplash tile grid pattern
    ctx.strokeStyle = "rgba(238, 225, 197, 0.6)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 280);
      ctx.stroke();
    }
    for (let y = 0; y < 280; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Kitchen Shelves on Wall
    ctx.fillStyle = "#8D6E63";
    ctx.fillRect(400, 110, 380, 14);
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(400, 124, 380, 6);

    // Spice jars on shelf
    const jarColors = ["#E53935", "#FDD835", "#43A047", "#8E24AA", "#FB8C00"];
    jarColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(430 + i * 65, 78, 28, 32, 4);
      ctx.fill();
      ctx.fillStyle = "#CFD8DC";
      ctx.fillRect(432 + i * 65, 72, 24, 6);
    });

    // Floor (Warm terracotta tiles)
    const floorGrad = ctx.createLinearGradient(0, 280, 0, h);
    floorGrad.addColorStop(0, "#D7CCC8");
    floorGrad.addColorStop(1, "#BCAAA4");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 280, w, h - 280);

    // Main Kitchen Counter (Polished dark granite island)
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(140, 290, 890, 240);

    const counterGrad = ctx.createLinearGradient(140, 280, 140, 520);
    counterGrad.addColorStop(0, "#455A64");
    counterGrad.addColorStop(0.1, "#37474F");
    counterGrad.addColorStop(0.9, "#263238");
    counterGrad.addColorStop(1, "#1A237E");

    ctx.fillStyle = counterGrad;
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(140, 275, 880, 240, 16);
    ctx.fill();
    ctx.stroke();

    // Polished specular highlight strip on counter edge
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(145, 280, 870, 8);
  }

  // --- LEVEL 7 BOSS BLACKBOARD RENDERER & INTERACTION ---
  function renderBossBoard(ctx) {
    const bx = 160;
    const by = 80;
    const bw = 850;
    const bh = 560;

    ctx.save();
    // Modal Backing Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Wooden Frame Blackboard
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.roundRect(bx - 14, by - 14, bw + 28, bh + 28, 16);
    ctx.fill();

    // Blackboard surface
    ctx.fillStyle = "#263238";
    ctx.strokeStyle = "#37474F";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 8);
    ctx.fill();
    ctx.stroke();

    // Header Title
    ctx.font = "bold 20px 'Segoe UI', Tahoma, sans-serif";
    ctx.fillStyle = "#FFD54F";
    ctx.textAlign = "center";
    ctx.fillText("PAPAN DEBUG RESEP IBU KOST — LEVEL 7 (FINAL BOSS)", bx + bw * 0.5, by + 36);

    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ECEFF1";
    ctx.fillText("Urutkan instruksi dari atas ke bawah dan perbaiki bug logika dengan tombol kuning!", bx + bw * 0.5, by + 65);

    // Render Blocks
    const startY = by + 90;
    const blockHeight = 58;
    const blockGap = 12;

    bossBlocks.forEach((block, idx) => {
      const cy = startY + idx * (blockHeight + blockGap);
      const isSelected = (selectedBlock === idx);

      // Block container
      ctx.fillStyle = isSelected ? "#37474F" : "#1E272C";
      ctx.strokeStyle = block.bugFixed ? "#4CAF50" : "#FF5252";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(bx + 40, cy, bw - 80, blockHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Step number badge
      ctx.fillStyle = "#455A64";
      ctx.beginPath();
      ctx.roundRect(bx + 52, cy + 12, 34, 34, 6);
      ctx.fill();
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`0${idx + 1}`, bx + 69, cy + 29);

      // Instruction text
      ctx.font = "bold 15px 'Courier New', monospace";
      ctx.fillStyle = block.bugFixed ? "#C8E6C9" : "#FFCDD2";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const displayText = block.bugFixed ? (block.fixedText || block.text) : block.text;
      ctx.fillText(displayText, bx + 105, cy + 29);

      // Reorder buttons [↑] [↓]
      ctx.fillStyle = "#546E7A";
      ctx.beginPath();
      ctx.roundRect(bx + bw - 210, cy + 12, 32, 34, 4); // UP
      ctx.roundRect(bx + bw - 170, cy + 12, 32, 34, 4); // DOWN
      ctx.fill();
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText("▲", bx + bw - 194, cy + 29);
      ctx.fillText("▼", bx + bw - 154, cy + 29);

      // Fix bug button if buggy
      if (block.isBuggy) {
        ctx.fillStyle = block.bugFixed ? "#2E7D32" : "#FFB300";
        ctx.beginPath();
        ctx.roundRect(bx + bw - 125, cy + 12, 75, 34, 6);
        ctx.fill();
        ctx.font = "bold 12px 'Segoe UI', sans-serif";
        ctx.fillStyle = block.bugFixed ? "#FFFFFF" : "#263238";
        ctx.fillText(block.bugFixed ? "✓ FIX" : "PERBAIKI", bx + bw - 87, cy + 29);
      }
    });

    // Run & Test Recipe Button at Bottom
    const btnY = by + bh - 55;
    ctx.fillStyle = "#4CAF50";
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.5 - 150, btnY, 300, 44, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 16px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("UJI & JALANKAN RESEP", bx + bw * 0.5, btnY + 22);

    ctx.restore();
  }

  function handleBossBoardClick(mx, my) {
    const bx = 160;
    const by = 80;
    const bw = 850;
    const bh = 560;

    const startY = by + 90;
    const blockHeight = 58;
    const blockGap = 12;

    // Check click on blocks
    bossBlocks.forEach((block, idx) => {
      const cy = startY + idx * (blockHeight + blockGap);

      // Click UP button
      if (mx >= bx + bw - 210 && mx <= bx + bw - 178 && my >= cy + 12 && my <= cy + 46) {
        if (idx > 0) {
          const temp = bossBlocks[idx];
          bossBlocks[idx] = bossBlocks[idx - 1];
          bossBlocks[idx - 1] = temp;
          if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
        }
        return;
      }

      // Click DOWN button
      if (mx >= bx + bw - 170 && mx <= bx + bw - 138 && my >= cy + 12 && my <= cy + 46) {
        if (idx < bossBlocks.length - 1) {
          const temp = bossBlocks[idx];
          bossBlocks[idx] = bossBlocks[idx + 1];
          bossBlocks[idx + 1] = temp;
          if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
        }
        return;
      }

      // Click FIX button
      if (block.isBuggy && mx >= bx + bw - 125 && mx <= bx + bw - 50 && my >= cy + 12 && my <= cy + 46) {
        block.bugFixed = !block.bugFixed;
        if (window.DebugDapur.AudioManager) {
          if (block.bugFixed) window.DebugDapur.AudioManager.playSuccess();
          else window.DebugDapur.AudioManager.playClick();
        }
        return;
      }
    });

    // Click "UJI & JALANKAN RESEP" Button
    const btnY = by + bh - 55;
    if (mx >= bx + bw * 0.5 - 150 && mx <= bx + bw * 0.5 + 150 && my >= btnY && my <= btnY + 44) {
      testBossRecipe();
    }
  }

  function testBossRecipe() {
    // 1. Check all bugs fixed
    const unfixed = bossBlocks.find(b => b.isBuggy && !b.bugFixed);
    if (unfixed) {
      window.DebugDapur.FeedbackSystem.showBugAlert({
        title: "BUG LOGIKA MASIH ADA!",
        explanation: `Masih ada instruksi yang memiliki bug (${unfixed.text}). Klik tombol 'PERBAIKI' untuk memperbaiki logika perulangan atau kondisinya!`,
        concept: "Debugging: Semua galat logika harus diperbaiki sebelum kode layak dieksekusi."
      }, chefBug);
      return;
    }

    // 2. Check Sequence
    const currentSeqIds = bossBlocks.map(b => b.id);
    const validation = window.DebugDapur.AlgorithmEngine.validateAction("TEST_BOSS_RECIPE", currentSeqIds);
    if (!validation.valid) {
      window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
      return;
    }

    // All correct!
    logStep("RESEP BERHASIL DIBERSIHKAN DARI SEMUA BUG!", true);
    completeCurrentLevel();
  }

  // Update DOM HUD with steps, recipe log & status
  function updateHUD() {
    const levelTitleElem = document.getElementById("hud-level-title");
    const conceptElem = document.getElementById("hud-concept");
    const objectiveElem = document.getElementById("hud-objective");
    const logListElem = document.getElementById("hud-log-list");

    if (levelTitleElem && levelData) {
      levelTitleElem.textContent = levelData.title;
    }
    if (conceptElem && levelData) {
      conceptElem.textContent = levelData.concept;
    }
    if (objectiveElem && levelData) {
      objectiveElem.textContent = `Tujuan: ${levelData.targetDish}`;
    }

    if (logListElem && window.DebugDapur.AlgorithmEngine) {
      const logs = window.DebugDapur.AlgorithmEngine.getActionLog();
      logListElem.innerHTML = "";
      logs.slice(-5).forEach(l => {
        const li = document.createElement("li");
        li.textContent = `[${l.stepNum}] ${l.label}`;
        logListElem.appendChild(li);
      });
    }
  }

  return {
    init,
    startLevel,
    update,
    render,
    handleBossBoardClick,
    getCurrentLevelId: () => currentLevelId,
    getCurrentLevelData: () => levelData,
    getChefBug: () => chefBug
  };
})();
