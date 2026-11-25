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
  let trashCount = 0;
  let isLevelCompleted = false;

  // Active Drag and Drop State
  let draggingEntity = null; // { type: 'spatula'|'cookware'|'ingredient', obj, offsetX, offsetY, startX, startY }

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
    // Instantiate persistent kitchen objects with clean non-overlapping desktop spacing
    chefBug = new window.DebugDapur.Objects.ChefBug(1040, 310, 1.0);
    stove = new window.DebugDapur.Objects.Stove(455, 305, 320, 150);
    pot = new window.DebugDapur.Objects.Cookware('pot', 330, 335, 125, 82);
    pan = new window.DebugDapur.Objects.Cookware('pan', 365, 445, 135, 78);
    ingredients = new window.DebugDapur.Objects.Ingredients(350, 560, 500, 95);
    utensils = new window.DebugDapur.Objects.Utensils();

    // Register click, drag & hover handlers with InputManager
    if (window.DebugDapur.InputManager) {
      window.DebugDapur.InputManager.on('click', handleCanvasClick);
      window.DebugDapur.InputManager.on('move', handleCanvasMove);
      window.DebugDapur.InputManager.on('dragstart', handleCanvasDragStart);
      window.DebugDapur.InputManager.on('drag', handleCanvasDrag);
      window.DebugDapur.InputManager.on('dragend', handleCanvasDragEnd);
    }
  }

  function startLevel(levelId) {
    currentLevelId = Number(levelId);
    levelData = window.DebugDapur.Data.LEVELS.find(l => l.id === currentLevelId);
    if (!levelData) return;

    // Always stop any leftover continuous cooking audio when starting/restarting a level
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.stopAllContinuousSounds();
    }

    startTime = Date.now();
    actionCount = 0;
    trashCount = 0;
    draggingEntity = null;
    isLevelCompleted = false;

    // Reset burner states cleanly
    stove.setHeatLevel(0, 'OFF');
    stove.setHeatLevel(1, 'OFF');
    stove.burners[0].dockedCookware = null;
    stove.burners[1].dockedCookware = null;

    // Assign clean non-overlapping home positions based on cookware mode
    if (levelData.cookwareNeeded === 'pot') {
      pot.setHomePosition(330, 385);
      pan.setHomePosition(365, 445);
    } else if (levelData.cookwareNeeded === 'pan') {
      pot.setHomePosition(330, 335);
      pan.setHomePosition(365, 395);
    } else {
      // 'multi' (Level 6) or 'boss_editor' (Level 7): keep well separated
      pot.setHomePosition(335, 335);
      pan.setHomePosition(365, 445);
      if (levelData.cookwareNeeded === 'multi') {
        level6State = { riceDone: false, chickenDone: false, eggDone: false, assembled: false };
      }
    }

    pot.reset();
    pan.reset();

    utensils.resetSpatula();
    utensils.spatula.stirCount = 0;
    utensils.spatula.stirAnimTimer = 0;
    utensils.plate.hasDish = false;
    utensils.plate.dishName = "";
    utensils.plate.contents = [];
    utensils.tap.isRunning = false;
    utensils.tap.waterStreamTimer = 0;
    utensils.trashCan.isOpen = false;
    utensils.trashCan.trashCount = 0;
    utensils.trashCan.lidAnimTimer = 0;

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

  function isSimulationPaused() {
    const blockingModalIds = [
      "modal-pause",
      "bug-modal",
      "modal-level-complete",
      "modal-recipe-board",
      "modal-flowchart"
    ];
    return blockingModalIds.some(id => {
      const el = document.getElementById(id);
      return el && !el.classList.contains("hidden");
    });
  }

  function syncCookingAudio() {
    if (!window.DebugDapur.AudioManager || !stove) return;
    const anyBoilingOnLit = stove.burners.some(
      b => b.isLit && b.dockedCookware && b.dockedCookware.hasWater && b.dockedCookware.isBoiling
    );
    const anySizzlingOnLit = stove.burners.some(
      b => b.isLit && b.dockedCookware && b.dockedCookware.hasOil && b.dockedCookware.isOilHot
    );

    if (!anyBoilingOnLit) {
      window.DebugDapur.AudioManager.stopContinuousSound('boiling');
    } else {
      window.DebugDapur.AudioManager.startContinuousSound('boiling');
    }

    if (!anySizzlingOnLit) {
      window.DebugDapur.AudioManager.stopContinuousSound('sizzling');
    } else {
      window.DebugDapur.AudioManager.startContinuousSound('sizzling');
    }
  }

  function update(dt) {
    if (chefBug) chefBug.update(dt);
    if (isLevelCompleted || isSimulationPaused()) return;

    if (stove) stove.update(dt);
    if (pot) pot.update(dt);
    if (pan) pan.update(dt);
    if (utensils) utensils.update(dt);

    syncCookingAudio();

    // Check automatic boiling completion on Level 1
    if (currentLevelId === 1 && pot.isBoiling && !isLevelCompleted) {
      completeCurrentLevel();
    }
  }

  function handleCanvasMove(mouse) {
    if (!levelData) return;
    const mx = mouse.x;
    const my = mouse.y;

    if (utensils) {
      utensils.spatula.isHovered = utensils.isPointInSpatula(mx, my);
      utensils.plate.isHovered = utensils.isPointInPlate(mx, my);
      utensils.trashCan.isHovered = utensils.isPointInTrash(mx, my);
    }
    if (ingredients) {
      ingredients.hoveredItem = ingredients.getItemAt(mx, my);
    }

    const canvas = window.DebugDapur.Game && window.DebugDapur.Game.getCanvas();
    if (canvas) {
      const overCookware =
        (pot && levelData.cookwareNeeded !== 'pan' && pot.isPointInside(mx, my)) ||
        (pan && levelData.cookwareNeeded !== 'pot' && pan.isPointInside(mx, my));
      const overStove = stove && (stove.isPointInKnob(mx, my, 0) || stove.isPointInKnob(mx, my, 1));
      const overChef = chefBug && ((mx - chefBug.x) ** 2 + (my - chefBug.y) ** 2 <= 55 * 55);
      const isInteractive =
        (utensils && (utensils.spatula.isHovered || utensils.plate.isHovered || utensils.trashCan.isHovered || utensils.isPointInTap(mx, my))) ||
        (ingredients && ingredients.hoveredItem) ||
        overCookware ||
        overStove ||
        overChef ||
        !!draggingEntity;
      canvas.style.cursor = isInteractive ? "pointer" : "default";
    }
  }

  // --- DRAG AND DROP HANDLERS ---

  function handleCanvasDragStart(mouse) {
    if (isLevelCompleted || isSimulationPaused()) return;
    const mx = mouse.x;
    const my = mouse.y;

    // A. Drag Spatula to Stir / Flip
    if (utensils && utensils.isPointInSpatula(mx, my)) {
      draggingEntity = {
        type: 'spatula',
        obj: utensils.spatula,
        startX: utensils.spatula.homeX || 845,
        startY: utensils.spatula.homeY || 335,
        offsetX: mx - utensils.spatula.x,
        offsetY: my - utensils.spatula.y,
        accumulatedAngle: 0,
        lastStirAngle: null
      };
      utensils.spatula.isHeld = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      return;
    }

    // B. Drag Cookware (Pan or Pot) to Plate (serve), Trash (discard), or Stove Burners
    // Check pot first if active, or pan
    if (pot && levelData && levelData.cookwareNeeded !== 'pan' && pot.isPointInside(mx, my)) {
      draggingEntity = {
        type: 'cookware',
        obj: pot,
        startX: pot.x,
        startY: pot.y,
        offsetX: mx - pot.x,
        offsetY: my - pot.y
      };
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      return;
    }

    if (pan && levelData && levelData.cookwareNeeded !== 'pot' && pan.isPointInside(mx, my)) {
      draggingEntity = {
        type: 'cookware',
        obj: pan,
        startX: pan.x,
        startY: pan.y,
        offsetX: mx - pan.x,
        offsetY: my - pan.y
      };
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
      return;
    }

    // C. Drag Ingredient from Shelf to Cookware or Trash
    if (ingredients) {
      const clickedItem = ingredients.getItemAt(mx, my);
      if (clickedItem) {
        draggingEntity = {
          type: 'ingredient',
          item: clickedItem,
          startX: clickedItem.x,
          startY: clickedItem.y,
          currentX: mx,
          currentY: my
        };
        if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
        return;
      }
    }
  }

  function handleCanvasDrag(mouse) {
    if (!draggingEntity) return;

    if (draggingEntity.type === 'spatula') {
      draggingEntity.obj.x = mouse.x - draggingEntity.offsetX;
      draggingEntity.obj.y = mouse.y - draggingEntity.offsetY;

      // Circular stirring gesture detection over pan or pot
      const activeCookware = (pan && pan.isPointInside(mouse.x, mouse.y)) ? pan
        : ((pot && pot.isPointInside(mouse.x, mouse.y)) ? pot : null);

      if (activeCookware) {
        const dx = mouse.x - activeCookware.x;
        const dy = mouse.y - activeCookware.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Within stirring bowl range
        if (dist > 10 && dist < 120) {
          const currentAngle = Math.atan2(dy, dx);
          if (draggingEntity.lastStirAngle !== null) {
            let diff = currentAngle - draggingEntity.lastStirAngle;
            // Handle angle wrap around -PI to PI
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            draggingEntity.accumulatedAngle += Math.abs(diff);

            // Give subtle visual tilt to spatula blade following motion
            draggingEntity.obj.stirAngle = Math.sin(draggingEntity.accumulatedAngle) * 0.45;

            // Full circular rotation completed (~5.5 radians, close to 2*PI)
            if (draggingEntity.accumulatedAngle >= 5.5) {
              draggingEntity.accumulatedAngle = 0;
              handleCircularStirTrigger(activeCookware);
            }
          }
          draggingEntity.lastStirAngle = currentAngle;
        } else {
          draggingEntity.lastStirAngle = null;
        }
      } else {
        draggingEntity.lastStirAngle = null;
        draggingEntity.obj.stirAngle = 0;
      }
    } else if (draggingEntity.type === 'cookware') {
      draggingEntity.obj.x = mouse.x - draggingEntity.offsetX;
      draggingEntity.obj.y = mouse.y - draggingEntity.offsetY;
    } else if (draggingEntity.type === 'ingredient') {
      draggingEntity.currentX = mouse.x;
      draggingEntity.currentY = mouse.y;
    }
  }

  function handleCircularStirTrigger(cookware) {
    // 1. Level 4: Stir Loop (Nasi Goreng)
    if (currentLevelId === 4) {
      if (!cookware.contents.includes("rice")) {
        chefBug.setState("confused", "Masukkan nasi putih ke wajan dahulu sebelum diaduk!", 2500);
        return;
      }
      if (cookware.riceStirCount < 6) {
        cookware.riceStirCount++;
        utensils.spatula.stirCount = cookware.riceStirCount;
        utensils.triggerSpatulaUse();
        if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playStir();
        logStep(`[Loop While Putaran Spatula] Mengaduk nasi (${cookware.riceStirCount}/6 putaran)`, true);

        if (cookware.riceStirCount === 6) {
          cookware.riceCooked = true;
          chefBug.setState("celebrating", "Loop selesai! Nasi goreng matang merata dan harum sempurna!", 3500);
        } else {
          chefBug.setState("cooking", `Putaran bagus! Terus aduk memutar (${cookware.riceStirCount}/6)`, 1500);
        }
        updateHUD();
      }
      return;
    }

    // 2. Level 3: Flip Egg
    if (currentLevelId === 3 && cookware.contents.includes("egg") && !cookware.eggFlipped) {
      if (cookware.eggBottomCooked) {
        cookware.eggFlipped = true;
        utensils.triggerSpatulaUse();
        if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSpatulaFlip();
        logStep("Membalik telur dadar dengan putaran spatula", true);
        chefBug.setState("happy", "Hebat! Gerakan memutar spatula berhasil membalik telur dadar!", 3000);
        updateHUD();
      } else {
        chefBug.setState("confused", "Bagian bawah belum matang! Tunggu beberapa detik sebelum membalik.", 2000);
      }
      return;
    }

    // 3. Level 5: Flip Chicken
    if (currentLevelId === 5 && cookware.contents.includes("chicken") && !cookware.chickenFlipped) {
      if (cookware.isOilSplattering) {
        window.DebugDapur.FeedbackSystem.showBugAlert({
          title: "BUG PERCABANGAN BERSARANG!",
          explanation: "Minyak sedang meletup-letup panas! Kecilkan api kompor terlebih dahulu sebelum mengaduk/membalik ayam!",
          concept: "Nested Conditional: Atasi letupan minyak sebelum membalik."
        }, chefBug);
        return;
      }
      cookware.chickenFlipped = true;
      utensils.triggerSpatulaUse();
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSpatulaFlip();
      logStep("Membalik ayam krispi dengan putaran spatula", true);
      chefBug.setState("happy", "Ayam krispi berhasil dibalik ke sisi emas!", 3000);
      updateHUD();
      return;
    }

    // Generic stir feedback for any cookware
    utensils.triggerSpatulaUse();
    if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playStir();
    chefBug.setState("cooking", "Adukan merata!", 1200);
  }

  function handleCanvasDragEnd(mouse) {
    if (!draggingEntity) return;
    const mx = mouse.x;
    const my = mouse.y;
    const entity = draggingEntity;
    draggingEntity = null;

    // 1. Spatula Dragged: ALWAYS return safely to home stand
    if (entity.type === 'spatula') {
      utensils.resetSpatula();

      const targetPan = (pan && pan.isPointInside(mx, my)) ? pan : null;
      const targetPot = (pot && pot.isPointInside(mx, my)) ? pot : null;

      if (targetPan || targetPot) {
        // If user dragged & dropped spatula over pan without completing circular motion
        handleSpatulaClick();
      }
      return;
    }

    // 2. Cookware Dragged
    if (entity.type === 'cookware') {
      const cw = entity.obj;
      const droppedOnPlate = utensils && utensils.isPointInPlate(mx, my);
      const droppedOnTrash = utensils && utensils.isPointInTrash(mx, my);

      if (droppedOnPlate) {
        // Return position immediately, then trigger serving logic
        cw.x = entity.startX;
        cw.y = entity.startY;
        handlePlateDrop(cw);
        return;
      }

      if (droppedOnTrash) {
        cw.x = entity.startX;
        cw.y = entity.startY;
        handleTrashCookware(cw);
        return;
      }

      // If dragged onto stove burners
      if (stove) {
        if (stove.isPointInBurner(mx, my, 0)) {
          if (cw.type === 'pan') {
            stove.dock(cw, 0);
            logStep("Meletakkan wajan di atas kompor (Burner 1)", true);
          } else {
            stove.dock(cw, 0);
            logStep("Meletakkan panci di atas kompor (Burner 1)", true);
          }
          if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
          updateHUD();
          return;
        } else if (stove.isPointInBurner(mx, my, 1)) {
          stove.dock(cw, 1);
          logStep(`Meletakkan ${cw.type === 'pan' ? 'wajan' : 'panci'} di atas kompor (Burner 2)`, true);
          if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playClick();
          updateHUD();
          return;
        }
      }

      // Else snap back to original docked/counter position
      cw.x = entity.startX;
      cw.y = entity.startY;
      return;
    }

    // 3. Ingredient Dragged
    if (entity.type === 'ingredient') {
      const droppedOnTrash = utensils && utensils.isPointInTrash(mx, my);
      if (droppedOnTrash) {
        handleTrashIngredient(entity.item);
        return;
      }

      // Dropped on cookware?
      const targetPan = (pan && pan.isPointInside(mx, my)) ? pan : null;
      const targetPot = (pot && pot.isPointInside(mx, my)) ? pot : null;
      if (targetPan || targetPot) {
        handleIngredientClick(entity.item);
      }
    }
  }

  function handleTrashIngredient(item) {
    trashCount++;
    actionCount++;
    utensils.triggerTrashUse();
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playBugError();
    }
    logStep(`Membuang ${item.name} ke tong sampah (-80 Poin)`, false);
    chefBug.setState("sad", `Ups! ${item.name} dibuang ke tong sampah! Skor berkurang 80 poin.`, 3500);
    updateHUD();
  }

  function handleTrashCookware(cookware) {
    if (cookware.contents.length === 0 && !cookware.hasWater && !cookware.hasOil) {
      chefBug.setState("confused", "Panci / wajan ini masih bersih, tidak perlu dibuang!", 2500);
      return;
    }
    trashCount++;
    actionCount++;
    utensils.triggerTrashUse();
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playBugError();
    }

    const discardedItems = cookware.contents.join(", ") || (cookware.hasOil ? "minyak" : "air");
    cookware.contents = [];
    cookware.hasWater = false;
    cookware.hasOil = false;
    cookware.isBoiling = false;
    cookware.isOilHot = false;
    cookware.isOilSplattering = false;
    cookware.eggFlipped = false;
    cookware.eggBottomCooked = false;
    cookware.eggTopCooked = false;
    cookware.chickenFlipped = false;
    cookware.chickenCooked = false;
    cookware.riceStirCount = 0;
    cookware.riceCooked = false;
    cookware.isBurnt = false;
    cookware.isDone = false;
    syncCookingAudio();

    logStep(`Membuang isi masakan (${discardedItems}) ke tong sampah (-80 Poin)`, false);
    chefBug.setState("sad", "Bahan yang salah telah dibersihkan di tong sampah. Hati-hati, skor berkurang 80 poin!", 4000);
    updateHUD();
  }

  function handlePlateDrop(cookware) {
    // Serving via dragging cookware to plate
    actionCount++;
    if (currentLevelId === 6) {
      handleLevel6Execution(cookware);
      return;
    }

    const validation = window.DebugDapur.AlgorithmEngine.validateAction("SERVE_DISH", { pot: cookware, pan: cookware });
    if (!validation.valid) {
      window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
      return;
    }

    // Successfully served!
    // Move cookware food to plate
    if (cookware.contents && cookware.contents.length > 0) {
      utensils.plate.contents = [...cookware.contents];
    } else if (levelData.targetDish.toLowerCase().includes("telur")) {
      utensils.plate.contents = ["egg"];
    } else if (levelData.targetDish.toLowerCase().includes("ayam")) {
      utensils.plate.contents = ["chicken"];
    } else if (levelData.targetDish.toLowerCase().includes("mie")) {
      utensils.plate.contents = ["noodles"];
    } else if (levelData.targetDish.toLowerCase().includes("nasi")) {
      utensils.plate.contents = ["rice"];
    }

    // Cookware becomes empty and clean again
    cookware.reset();
    syncCookingAudio();

    utensils.plate.hasDish = true;
    utensils.plate.dishName = levelData.targetDish;
    logStep(`Menyajikan ${levelData.targetDish} ke piring saji (Wadah kini kosong & bersih!)`, true);
    completeCurrentLevel();
  }

  function handleCanvasClick(mouse) {
    if (isLevelCompleted || isSimulationPaused()) return;
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

    // Spatula & Plate Utensil Clicks
    if (utensils.isPointInSpatula(mx, my)) {
      handleSpatulaClick();
      return;
    }
    if (utensils.isPointInPlate(mx, my)) {
      handlePlateClick();
      return;
    }
    if (utensils.isPointInTrash(mx, my)) {
      chefBug.setState("confused", "Seret (drag) wajan atau bahan yang salah ke tong sampah untuk membuangnya.", 2500);
      return;
    }

    // 4. Cookware Clicks (Move to Stove / Prep)
    if (pot.isPointInside(mx, my) && levelData.cookwareNeeded !== 'pan') {
      handlePotClick();
      return;
    }
    if (pan.isPointInside(mx, my) && levelData.cookwareNeeded !== 'pot') {
      handlePanClick();
      return;
    }

    // 5. Ingredient Shelf Click
    const clickedItem = ingredients.getItemAt(mx, my);
    if (clickedItem) {
      handleIngredientClick(clickedItem);
      return;
    }

    // 6. Chef Bug Click (Ask for Hint)
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
      if (currentLevelId === 5 && burner.dockedCookware === pan && pan.isOilSplattering) {
        // Special nested conditional resolution: lower heat
        stove.setHeatLevel(burnerId, 'LOW');
        pan.isOilSplattering = false;
        pan.splatterHandled = true;
        if (window.DebugDapur.AudioManager) {
          window.DebugDapur.AudioManager.playClick();
        }
        logStep("Mengecilkan api kompor (Mengatasi letupan minyak)", true);
        chefBug.setState("happy", "Bagus! Api dikecilkan, letupan minyak teratasi!", 3000);
        updateHUD();
        return;
      }
      stove.toggleBurner(burnerId);
      syncCookingAudio();
      logStep(`Mematikan api burner kompor #${burnerId + 1}`, true);
      updateHUD();
      return;
    }

    // Turning on stove: Validate with Algorithm Engine
    const validation = window.DebugDapur.AlgorithmEngine.validateAction("TURN_ON_STOVE", {
      pot,
      pan,
      stove,
      burnerId,
      activeCookware: burner.dockedCookware
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
      // Dock on burner 1 in multi mode (keeps pan handle away on burner 0), or burner 0 otherwise
      const preferredBurner = (levelData && levelData.cookwareNeeded === 'multi') ? 1 : 0;
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("PLACE_POT_STOVE", { pot, stove });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      stove.dock(pot, preferredBurner);
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Meletakkan panci di atas kompor", true);
      chefBug.setState("idle", "Panci sudah di atas kompor.", 2000);
    } else {
      // Undock back to counter home position
      stove.undock(pot);
      pot.x = pot.homeX;
      pot.y = pot.homeY;
      syncCookingAudio();
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
      pan.x = pan.homeX;
      pan.y = pan.homeY;
      syncCookingAudio();
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
      logStep("Memindahkan wajan ke meja", true);
    }
    updateHUD();
  }

  function handleIngredientClick(item) {
    // Allow filling water directly from ingredient shelf when pot is on counter or unlit stove
    if (item.id === "water") {
      handleWaterTapClick();
      return;
    }

    const activeCookware = (levelData.cookwareNeeded === 'pot')
      ? (pot.isDockedOnStove ? pot : null)
      : (levelData.cookwareNeeded === 'pan')
        ? (pan.isDockedOnStove ? pan : null)
        : (pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null));

    if (!activeCookware) {
      chefBug.setState("confused", "Siapkan dan letakkan panci atau wajan di kompor terlebih dahulu!", 3000);
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
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playIngredientDrop();
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
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSeasoningSprinkle();
      logStep("Menaburkan bumbu gurih", true);
      updateHUD();
      return;
    }

    // OIL (Level 3, 4, 5)
    if (item.id === "oil") {
      const targetPan = pan.isDockedOnStove ? pan : activeCookware;
      targetPan.hasOil = true;
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playOilPour();
      logStep("Menuangkan minyak goreng ke wajan", true);
      chefBug.setState("cooking", "Minyak dituang. Tunggu hingga panas berdesis!", 2500);
      updateHUD();
      return;
    }

    // EGG (Level 3)
    if (item.id === "egg") {
      const targetPan = pan.isDockedOnStove ? pan : activeCookware;
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("POUR_EGG", { pan: targetPan });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      targetPan.contents.push("egg");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playEggCrack();
      logStep("Menuang adonan telur dadar ke minyak panas", true);
      chefBug.setState("happy", "Szzzzz! Telur dadar mulai mengembang harum.", 3000);
      updateHUD();
      return;
    }

    // RICE (Level 4)
    if (item.id === "rice") {
      const targetCookware = pan.isDockedOnStove ? pan : activeCookware;
      targetCookware.contents.push("rice");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playIngredientDrop();
      logStep("Memasukkan nasi putih ke wajan", true);
      chefBug.setState("happy", "Nasi putih sudah masuk! Sekarang tambahkan bumbu & aduk berulang.", 3000);
      updateHUD();
      return;
    }

    // SAUCE (Level 4)
    if (item.id === "sauce") {
      const targetPan = pan.isDockedOnStove ? pan : activeCookware;
      targetPan.contents.push("sauce");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playOilPour();
      logStep("Menuangkan kecap manis legit", true);
      updateHUD();
      return;
    }

    // CHICKEN (Level 5)
    if (item.id === "chicken") {
      const targetPan = pan.isDockedOnStove ? pan : activeCookware;
      const validation = window.DebugDapur.AlgorithmEngine.validateAction("ADD_CHICKEN", { pan: targetPan });
      if (!validation.valid) {
        window.DebugDapur.FeedbackSystem.showBugAlert(validation, chefBug);
        return;
      }
      targetPan.contents.push("chicken");
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playIngredientDrop();
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
      utensils.triggerSpatulaUse();
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
      utensils.triggerSpatulaUse();
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
      utensils.triggerSpatulaUse();
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSpatulaFlip();
      logStep("Membalik ayam krispi ke sisi emas", true);
      chefBug.setState("happy", "Ayam dibalik dengan aman tanpa letupan minyak!", 3000);
      updateHUD();
      return;
    }

    // Generic stir sound & animation
    utensils.triggerSpatulaUse();
    if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playStir();
  }

  function handlePlateClick() {
    const activeCookware = pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null);

    // LEVEL 6: PROCEDURAL ASSEMBLY
    if (currentLevelId === 6) {
      handleLevel6Execution(activeCookware);
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
    if (activeCookware.contents && activeCookware.contents.length > 0) {
      utensils.plate.contents = [...activeCookware.contents];
    } else if (levelData.targetDish.toLowerCase().includes("telur")) {
      utensils.plate.contents = ["egg"];
    } else if (levelData.targetDish.toLowerCase().includes("ayam")) {
      utensils.plate.contents = ["chicken"];
    } else if (levelData.targetDish.toLowerCase().includes("mie")) {
      utensils.plate.contents = ["noodles"];
    } else if (levelData.targetDish.toLowerCase().includes("nasi")) {
      utensils.plate.contents = ["rice"];
    }

    // Cookware becomes empty and clean again
    activeCookware.reset();
    syncCookingAudio();

    utensils.plate.hasDish = true;
    utensils.plate.dishName = levelData.targetDish;
    logStep(`Menyajikan ${levelData.targetDish} ke piring saji`, true);
    completeCurrentLevel();
  }

  function handleLevel6Execution(cookware) {
    const cw = cookware || (pot.isDockedOnStove ? pot : (pan.isDockedOnStove ? pan : null));

    // Level 6: Procedure execution
    if (!level6State.riceDone) {
      level6State.riceDone = true;
      if (!utensils.plate.contents.includes("rice")) {
        utensils.plate.contents.push("rice");
      }
      if (cw) {
        cw.reset();
        syncCookingAudio();
      }
      utensils.plate.hasDish = true;
      utensils.plate.dishName = "Piring (Nasi Siap)";
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSuccess();
      logStep("[Prosedur 1] Selesai: masak_nasi() -> Nasi dipindah ke piring saji, panci kembali kosong & bersih!", true);
      chefBug.setState("happy", "Prosedur 1 Selesai: Nasi matang dipindah ke piring! Panci kosong kembali untuk langkah selanjutnya.", 3500);
    } else if (!level6State.chickenDone) {
      level6State.chickenDone = true;
      if (!utensils.plate.contents.includes("chicken")) {
        utensils.plate.contents.push("chicken");
      }
      if (cw) {
        cw.reset();
        syncCookingAudio();
      }
      utensils.plate.hasDish = true;
      utensils.plate.dishName = "Piring (Nasi + Ayam)";
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSuccess();
      logStep("[Prosedur 2] Selesai: masak_ayam() -> Ayam goreng krispi dipindah ke piring, wajan kembali kosong & bersih!", true);
      chefBug.setState("happy", "Prosedur 2 Selesai: Ayam goreng dipindah ke piring! Wajan kosong kembali.", 3500);
    } else if (!level6State.eggDone) {
      level6State.eggDone = true;
      if (!utensils.plate.contents.includes("egg")) {
        utensils.plate.contents.push("egg");
      }
      if (cw) {
        cw.reset();
        syncCookingAudio();
      }
      utensils.plate.hasDish = true;
      utensils.plate.dishName = "Paket Komplit Anak Kost";
      if (window.DebugDapur.AudioManager) window.DebugDapur.AudioManager.playSuccess();
      logStep("[Prosedur 3] Selesai: masak_telur() -> Telur dadar dipindah ke piring saji!", true);
      chefBug.setState("celebrating", "Prosedur 3 Selesai: Semua prosedur berhasil dijalankan! Paket komplit siap disajikan!", 3500);
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
      actionCount,
      trashCount
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

    // 2. Stove first, then cookware on counter/burners, then utensils (tap, plate, spatula) in front
    if (stove) stove.render(ctx);
    if (pot && levelData && levelData.cookwareNeeded !== 'pan') pot.render(ctx);
    if (pan && levelData && levelData.cookwareNeeded !== 'pot') pan.render(ctx);
    if (utensils) utensils.render(ctx);
    if (ingredients) ingredients.render(ctx);

    // If cookware is being dragged, re-render it on top layer so it doesn't get covered by stove or counter
    if (draggingEntity && draggingEntity.type === 'cookware') {
      draggingEntity.obj.render(ctx);
    }
    // If spatula is being dragged, re-render on top layer
    if (draggingEntity && draggingEntity.type === 'spatula') {
      utensils.renderSpatula(ctx);
    }

    // 3. Chef Bug
    if (chefBug) chefBug.render(ctx);

    // 4. Render Dragging Ingredient Preview if active
    if (draggingEntity && draggingEntity.type === 'ingredient') {
      ctx.save();
      ctx.translate(draggingEntity.currentX, draggingEntity.currentY);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 4, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = draggingEntity.item.color;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FF9800";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (ingredients) {
        ingredients.renderVectorIcon(ctx, draggingEntity.item.iconType, 0, 0);
      }
      ctx.restore();
    }

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
