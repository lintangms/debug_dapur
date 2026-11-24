/**
 * DEBUG DAPUR - Scene Manager
 * Handles UI screen switching, overlays, modals, and flow between screens.
 * Integrates Flowchart Briefing & Live Flowchart Inspector.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.SceneManager = (function() {
  let currentScene = "splash"; // splash, menu, level_select, flowchartBriefing, gameplay, quiz, results
  let activeLevelId = 1;

  const screens = {
    splash: null,
    menu: null,
    levelSelect: null,
    flowchartBriefing: null,
    gameplay: null,
    quiz: null,
    results: null
  };

  const modals = {
    pause: null,
    settings: null,
    howToPlay: null,
    about: null,
    recipeBoard: null,
    flowchart: null,
    levelComplete: null,
    resetConfirm: null
  };

  function init() {
    // Cache DOM Elements
    screens.splash = document.getElementById("screen-splash");
    screens.menu = document.getElementById("screen-menu");
    screens.levelSelect = document.getElementById("screen-level-select");
    screens.flowchartBriefing = document.getElementById("screen-flowchart-briefing");
    screens.gameplay = document.getElementById("screen-gameplay");
    screens.quiz = document.getElementById("screen-quiz");
    screens.results = document.getElementById("screen-results");

    modals.pause = document.getElementById("modal-pause");
    modals.settings = document.getElementById("modal-settings");
    modals.howToPlay = document.getElementById("modal-how-to-play");
    modals.about = document.getElementById("modal-about");
    modals.recipeBoard = document.getElementById("modal-recipe-board");
    modals.flowchart = document.getElementById("modal-flowchart");
    modals.levelComplete = document.getElementById("modal-level-complete");
    modals.resetConfirm = document.getElementById("modal-reset-confirm");

    bindEvents();
    renderLevelSelectGrid();
  }

  function showScreen(screenName) {
    currentScene = screenName;
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === screenName) {
          screens[key].classList.remove("hidden");
        } else {
          screens[key].classList.add("hidden");
        }
      }
    });

    // Close all open modals when switching major screens
    closeAllModals();

    if (screenName === "level_select") {
      renderLevelSelectGrid();
    } else if (screenName === "quiz") {
      setupQuizScreen();
    }
  }

  function showModal(modalName) {
    if (modals[modalName]) {
      modals[modalName].classList.remove("hidden");
    }
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playClick();
    }
  }

  function closeModal(modalName) {
    if (modals[modalName]) {
      modals[modalName].classList.add("hidden");
    }
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playClick();
    }
  }

  function closeAllModals() {
    Object.keys(modals).forEach(k => {
      if (modals[k]) modals[k].classList.add("hidden");
    });
  }

  function bindEvents() {
    // Splash Screen
    const splashStartBtn = document.getElementById("splash-start-btn");
    if (splashStartBtn) {
      splashStartBtn.addEventListener("click", () => {
        if (window.DebugDapur.AudioManager) {
          window.DebugDapur.AudioManager.playClick();
          window.DebugDapur.AudioManager.startBgm();
        }
        showScreen("menu");
      });
    }

    // Main Menu Buttons
    const btnPlay = document.getElementById("menu-btn-play");
    const btnSelect = document.getElementById("menu-btn-select");
    const btnHelp = document.getElementById("menu-btn-help");
    const btnSettings = document.getElementById("menu-btn-settings");
    const btnAbout = document.getElementById("menu-btn-about");

    if (btnPlay) {
      btnPlay.addEventListener("click", () => {
        // Start latest unlocked level with flowchart first
        const unlocked = window.DebugDapur.StorageManager.getData().unlockedLevels;
        const targetLevel = unlocked[unlocked.length - 1] || 1;
        startLevelWithFlowchart(targetLevel);
      });
    }

    if (btnSelect) {
      btnSelect.addEventListener("click", () => {
        showScreen("level_select");
      });
    }

    if (btnHelp) {
      btnHelp.addEventListener("click", () => showModal("howToPlay"));
    }

    if (btnSettings) {
      btnSettings.addEventListener("click", () => {
        populateSettings();
        showModal("settings");
      });
    }

    if (btnAbout) {
      btnAbout.addEventListener("click", () => showModal("about"));
    }

    // Level Select Back Button
    const btnSelectBack = document.getElementById("level-select-back-btn");
    if (btnSelectBack) {
      btnSelectBack.addEventListener("click", () => showScreen("menu"));
    }

    // Flowchart Briefing Back & Start Buttons
    const btnFcBack = document.getElementById("fc-btn-back-menu");
    const btnFcStart = document.getElementById("fc-btn-start-cooking");

    if (btnFcBack) {
      btnFcBack.addEventListener("click", () => {
        showScreen("level_select");
      });
    }

    if (btnFcStart) {
      btnFcStart.addEventListener("click", () => {
        startCookingSimulation(activeLevelId);
      });
    }

    // HUD Buttons
    const btnPause = document.getElementById("hud-btn-pause");
    const btnSound = document.getElementById("hud-btn-sound");
    const btnRecipe = document.getElementById("hud-btn-recipe");
    const btnFlowchart = document.getElementById("hud-btn-flowchart");

    if (btnPause) {
      btnPause.addEventListener("click", () => showModal("pause"));
    }

    if (btnSound) {
      btnSound.addEventListener("click", () => {
        if (window.DebugDapur.AudioManager) {
          const isMuted = window.DebugDapur.AudioManager.toggleSfxMute();
          window.DebugDapur.AudioManager.toggleMusicMute();
          updateSoundButtonIcon(btnSound, isMuted);
        }
      });
    }

    if (btnRecipe) {
      btnRecipe.addEventListener("click", () => {
        populateRecipeBoard();
        showModal("recipeBoard");
      });
    }

    if (btnFlowchart) {
      btnFlowchart.addEventListener("click", () => {
        populateFlowchartModal();
        showModal("flowchart");
      });
    }

    // Pause Menu Modal
    const btnResume = document.getElementById("pause-btn-resume");
    const btnRestart = document.getElementById("pause-btn-restart");
    const btnPauseMenu = document.getElementById("pause-btn-menu");

    if (btnResume) {
      btnResume.addEventListener("click", () => closeModal("pause"));
    }
    if (btnRestart) {
      btnRestart.addEventListener("click", () => {
        closeModal("pause");
        startCookingSimulation(activeLevelId);
      });
    }
    if (btnPauseMenu) {
      btnPauseMenu.addEventListener("click", () => {
        closeModal("pause");
        showScreen("menu");
      });
    }

    // Modal Close Buttons (Generic)
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-overlay");
        if (modal) modal.classList.add("hidden");
      });
    });

    // Level Complete Screen Buttons
    const btnNextLevel = document.getElementById("complete-btn-next");
    const btnReplay = document.getElementById("complete-btn-replay");
    const btnCompleteMenu = document.getElementById("complete-btn-menu");

    if (btnNextLevel) {
      btnNextLevel.addEventListener("click", () => {
        closeModal("levelComplete");
        if (activeLevelId < 7) {
          startLevelWithFlowchart(activeLevelId + 1);
        } else {
          // Finished Level 7! Go to Final Quiz
          showScreen("quiz");
        }
      });
    }

    if (btnReplay) {
      btnReplay.addEventListener("click", () => {
        closeModal("levelComplete");
        startLevelWithFlowchart(activeLevelId);
      });
    }

    if (btnCompleteMenu) {
      btnCompleteMenu.addEventListener("click", () => {
        closeModal("levelComplete");
        showScreen("menu");
      });
    }

    // Settings Controls
    const sfxSlider = document.getElementById("settings-sfx-volume");
    const musicSlider = document.getElementById("settings-music-volume");
    const btnResetData = document.getElementById("settings-btn-reset");

    if (sfxSlider) {
      sfxSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (window.DebugDapur.AudioManager) {
          window.DebugDapur.AudioManager.setSfxVolume(val);
        }
      });
    }

    if (musicSlider) {
      musicSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (window.DebugDapur.AudioManager) {
          window.DebugDapur.AudioManager.setMusicVolume(val);
        }
      });
    }

    if (btnResetData) {
      btnResetData.addEventListener("click", () => {
        showModal("resetConfirm");
      });
    }

    // Reset Confirm Buttons
    const btnConfirmYes = document.getElementById("reset-btn-confirm");
    const btnConfirmNo = document.getElementById("reset-btn-cancel");

    if (btnConfirmYes) {
      btnConfirmYes.addEventListener("click", () => {
        if (window.DebugDapur.StorageManager) {
          window.DebugDapur.StorageManager.resetProgress();
        }
        closeModal("resetConfirm");
        closeModal("settings");
        renderLevelSelectGrid();
        alert("Seluruh data progres dan skor telah direset ke awal.");
      });
    }

    if (btnConfirmNo) {
      btnConfirmNo.addEventListener("click", () => closeModal("resetConfirm"));
    }
  }

  /**
   * STAGE 1: FLOWCHART BRIEFING & PLANNING
   * Player studies and solves the missing algorithmic node in the flowchart first.
   */
  function startLevelWithFlowchart(levelId) {
    activeLevelId = Number(levelId);
    const levelData = window.DebugDapur.Data.LEVELS.find(l => l.id === activeLevelId);
    if (!levelData) return;

    if (window.DebugDapur.FlowchartSystem) {
      window.DebugDapur.FlowchartSystem.initLevel(levelData);
    }

    showScreen("flowchartBriefing");

    // Populate Header & Info
    const titleElem = document.getElementById("fc-level-title");
    const conceptElem = document.getElementById("fc-concept-badge");
    const speechElem = document.getElementById("fc-guide-speech");
    const challengeTextElem = document.getElementById("fc-challenge-text");
    const diagramContainer = document.getElementById("flowchart-diagram-container");
    const optionsContainer = document.getElementById("fc-options-container");
    const feedbackBox = document.getElementById("fc-feedback-box");
    const startCookingBtn = document.getElementById("fc-btn-start-cooking");

    if (titleElem) titleElem.textContent = `${levelData.title}`;
    if (conceptElem) conceptElem.textContent = `${levelData.concept}`;
    if (speechElem) {
      speechElem.textContent = levelData.flowchart.conceptNote || 
        "Pelajari bagan alir algoritma ini dan lengkapi blok rumpang agar siap dipraktikkan di dapur!";
    }
    if (challengeTextElem) challengeTextElem.textContent = levelData.flowchart.challengeText;
    if (feedbackBox) {
      feedbackBox.className = "flowchart-feedback-alert hidden";
      feedbackBox.textContent = "";
    }

    // Render Initial Flowchart
    if (diagramContainer && window.DebugDapur.FlowchartSystem) {
      window.DebugDapur.FlowchartSystem.renderFlowchartHtml(diagramContainer, { interactive: true });
    }

    // Find missing node for puzzle
    const missingNode = levelData.flowchart.nodes.find(n => n.isMissing);

    if (!missingNode) {
      // No missing node: allow immediate cooking
      if (startCookingBtn) startCookingBtn.disabled = false;
      if (optionsContainer) optionsContainer.innerHTML = "<div style='color:#78909C; font-weight:700;'>Flowchart lengkap dan siap dieksekusi!</div>";
    } else {
      // Missing node: render puzzle choice options
      if (startCookingBtn) startCookingBtn.disabled = true;
      if (optionsContainer) {
        optionsContainer.innerHTML = "";
        missingNode.options.forEach(optText => {
          const btn = document.createElement("button");
          btn.className = "fc-option-btn";
          btn.textContent = optText;

          btn.addEventListener("click", () => {
            handleFlowchartOptionClick(optText, btn, levelData);
          });

          optionsContainer.appendChild(btn);
        });
      }
    }
  }

  function handleFlowchartOptionClick(selectedText, clickedBtn, levelData) {
    if (!window.DebugDapur.FlowchartSystem) return;

    const result = window.DebugDapur.FlowchartSystem.submitChallengeOption(selectedText);
    const diagramContainer = document.getElementById("flowchart-diagram-container");
    const feedbackBox = document.getElementById("fc-feedback-box");
    const startCookingBtn = document.getElementById("fc-btn-start-cooking");
    const speechElem = document.getElementById("fc-guide-speech");

    // Clear previous option styles
    document.querySelectorAll(".fc-option-btn").forEach(b => {
      b.classList.remove("selected-correct", "selected-incorrect");
    });

    if (result.valid) {
      clickedBtn.classList.add("selected-correct");
      if (feedbackBox) {
        feedbackBox.className = "flowchart-feedback-alert success";
        feedbackBox.textContent = `BENAR! ${result.explanation}`;
      }
      if (speechElem) {
        speechElem.textContent = "Bagus sekali! Bagan alir kini valid dan terstruktur. Sekarang mari terapkan di dapur!";
      }
      // Re-render solved flowchart
      window.DebugDapur.FlowchartSystem.renderFlowchartHtml(diagramContainer, { interactive: false });
      if (startCookingBtn) startCookingBtn.disabled = false;
    } else {
      clickedBtn.classList.add("selected-incorrect");
      if (feedbackBox) {
        feedbackBox.className = "flowchart-feedback-alert error";
        feedbackBox.textContent = `BELUM TEPAT: ${result.explanation}`;
      }
      if (startCookingBtn) startCookingBtn.disabled = true;
    }
  }

  /**
   * STAGE 2: KITCHEN COOKING SIMULATION
   * Starts actual kitchen interactions based on the validated flowchart.
   */
  function startCookingSimulation(levelId) {
    showScreen("gameplay");
    if (window.DebugDapur.LevelManager) {
      window.DebugDapur.LevelManager.startLevel(levelId);
    }
  }

  function getStarSvg(isFilled) {
    return `<svg class="svg-icon" style="width: 18px; height: 18px; vertical-align: middle; margin: 0 1px;" viewBox="0 0 24 24"><path fill="${isFilled ? '#FFB300' : '#CFD8DC'}" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }

  function updateSoundButtonIcon(btn, isMuted) {
    if (!btn) return;
    if (isMuted) {
      btn.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
      btn.title = "Suara: Nonaktif";
    } else {
      btn.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
      btn.title = "Suara: Aktif";
    }
  }

  function renderLevelSelectGrid() {
    const grid = document.getElementById("level-select-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const storage = window.DebugDapur.StorageManager;
    const levels = window.DebugDapur.Data.LEVELS;
    const totalStars = storage.getTotalStars();

    const starCounterElem = document.getElementById("total-stars-count");
    if (starCounterElem) {
      starCounterElem.innerHTML = `<svg class="svg-icon" style="color: #FFB300;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> <span>${totalStars} / 21 Bintang</span>`;
    }

    levels.forEach(lvl => {
      const isUnlocked = storage.isLevelUnlocked(lvl.id);
      const stars = storage.getData().levelStars[lvl.id] || 0;

      const card = document.createElement("div");
      card.className = `level-card ${isUnlocked ? "unlocked" : "locked"}`;

      let starHtml = `${getStarSvg(false)}${getStarSvg(false)}${getStarSvg(false)}`;
      if (stars === 3) starHtml = `${getStarSvg(true)}${getStarSvg(true)}${getStarSvg(true)}`;
      else if (stars === 2) starHtml = `${getStarSvg(true)}${getStarSvg(true)}${getStarSvg(false)}`;
      else if (stars === 1) starHtml = `${getStarSvg(true)}${getStarSvg(false)}${getStarSvg(false)}`;

      card.innerHTML = `
        <div class="level-card-number">Level ${lvl.id}</div>
        <div class="level-card-title">${lvl.title.split(": ")[1]}</div>
        <div class="level-card-concept">${lvl.concept}</div>
        <div class="level-card-stars">${isUnlocked ? starHtml : "<span style='color:#78909C; font-weight:700;'>Terkunci</span>"}</div>
      `;

      if (isUnlocked) {
        card.addEventListener("click", () => {
          if (window.DebugDapur.AudioManager) {
            window.DebugDapur.AudioManager.playClick();
          }
          startLevelWithFlowchart(lvl.id);
        });
      }

      grid.appendChild(card);
    });

    // Final Quiz Card
    const quizCard = document.createElement("div");
    const isBossDone = storage.getData().levelStars[7] > 0;
    quizCard.className = `level-card quiz-card ${isBossDone ? "unlocked" : "locked"}`;
    quizCard.innerHTML = `
      <div class="level-card-number">Evaluasi Akhir</div>
      <div class="level-card-title">Kuis Algoritma & Tracing</div>
      <div class="level-card-concept">10 Soal Berpikir Komputasional</div>
      <div class="level-card-stars" style="color: #6A1B9A; font-weight: 700;">${isBossDone ? "Buka Kuis Evaluasi" : "Selesaikan Level 7"}</div>
    `;

    if (isBossDone) {
      quizCard.addEventListener("click", () => {
        showScreen("quiz");
      });
    }

    grid.appendChild(quizCard);
  }

  function populateRecipeBoard() {
    const lvl = window.DebugDapur.LevelManager.getCurrentLevelData();
    if (!lvl) return;

    const titleElem = document.getElementById("recipe-modal-title");
    const codeElem = document.getElementById("recipe-modal-code");
    const explanationElem = document.getElementById("recipe-modal-explanation");

    if (titleElem) titleElem.textContent = `Papan Resep & Algoritma: ${lvl.title}`;
    if (codeElem) codeElem.textContent = lvl.codeRepresentation || "// Alur Sekuensial Sederhana\nsiap_panci();\nisi_air();\nnyalakan_kompor();\ntunggu_mendidih();";
    if (explanationElem) explanationElem.textContent = lvl.conceptExplanation || lvl.description;
  }

  function populateFlowchartModal() {
    const lvl = window.DebugDapur.LevelManager.getCurrentLevelData();
    if (!lvl) return;

    const modalTitle = document.getElementById("modal-fc-title");
    const modalContainer = document.getElementById("modal-fc-diagram-container");

    if (modalTitle) modalTitle.textContent = `Bagan Alir (Flowchart): ${lvl.title}`;

    if (modalContainer && window.DebugDapur.FlowchartSystem) {
      window.DebugDapur.FlowchartSystem.initLevel(lvl);
      // Determine active recipe step index for live highlighting
      const logs = window.DebugDapur.AlgorithmEngine ? window.DebugDapur.AlgorithmEngine.getActionLog() : [];
      const currentStepIdx = Math.min(lvl.flowchart.nodes.length - 1, logs.length);
      window.DebugDapur.FlowchartSystem.renderFlowchartHtml(modalContainer, { 
        interactive: false,
        activeStepIndex: currentStepIdx 
      });
    }
  }

  function populateSettings() {
    const sfxSlider = document.getElementById("settings-sfx-volume");
    const musicSlider = document.getElementById("settings-music-volume");
    if (window.DebugDapur.AudioManager) {
      if (sfxSlider) sfxSlider.value = window.DebugDapur.AudioManager.getSfxVolume();
      if (musicSlider) musicSlider.value = window.DebugDapur.AudioManager.getMusicVolume();
    }
  }

  function showLevelComplete(scoreResult) {
    const titleElem = document.getElementById("complete-level-title");
    const starsElem = document.getElementById("complete-stars-display");
    const scoreElem = document.getElementById("complete-score-display");
    const gradeElem = document.getElementById("complete-grade-display");
    const nextBtn = document.getElementById("complete-btn-next");

    const lvl = window.DebugDapur.LevelManager.getCurrentLevelData();

    if (titleElem && lvl) titleElem.textContent = `SELESAI: ${lvl.title}`;
    if (scoreElem) scoreElem.textContent = `Skor Akhir: ${scoreResult.score} Poin`;
    if (gradeElem) gradeElem.textContent = scoreResult.grade;

    if (starsElem) {
      let starHtml = `${getStarSvg(false)}${getStarSvg(false)}${getStarSvg(false)}`;
      if (scoreResult.stars === 3) starHtml = `${getStarSvg(true)}${getStarSvg(true)}${getStarSvg(true)}`;
      else if (scoreResult.stars === 2) starHtml = `${getStarSvg(true)}${getStarSvg(true)}${getStarSvg(false)}`;
      else if (scoreResult.stars === 1) starHtml = `${getStarSvg(true)}${getStarSvg(false)}${getStarSvg(false)}`;
      starsElem.innerHTML = starHtml;
    }

    if (nextBtn) {
      if (lvl && lvl.id === 7) {
        nextBtn.textContent = "Buka Kuis Akhir";
      } else {
        nextBtn.textContent = "Lanjut Level Berikutnya";
      }
    }

    showModal("levelComplete");
  }

  // --- QUIZ SCREEN HANDLING ---
  function setupQuizScreen() {
    if (window.DebugDapur.QuizSystem) {
      window.DebugDapur.QuizSystem.init();
      renderCurrentQuizQuestion();
    }
  }

  function renderCurrentQuizQuestion() {
    const quizSystem = window.DebugDapur.QuizSystem;
    const q = quizSystem.getCurrentQuestion();
    if (!q) return;

    const numElem = document.getElementById("quiz-question-number");
    const conceptElem = document.getElementById("quiz-question-concept");
    const textElem = document.getElementById("quiz-question-text");
    const optionsElem = document.getElementById("quiz-options-container");
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const nextBtn = document.getElementById("quiz-btn-next");

    if (numElem) numElem.textContent = `Soal ${quizSystem.getCurrentIndex() + 1} dari ${quizSystem.getQuestionCount()}`;
    if (conceptElem) conceptElem.textContent = `Konsep: ${q.concept}`;
    if (textElem) textElem.textContent = q.question;

    if (feedbackBox) feedbackBox.classList.add("hidden");
    if (nextBtn) nextBtn.disabled = true;

    if (optionsElem) {
      optionsElem.innerHTML = "";
      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;

        btn.addEventListener("click", () => {
          handleQuizAnswerClick(idx, btn);
        });

        optionsElem.appendChild(btn);
      });
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        const hasNext = quizSystem.nextQuestion();
        if (hasNext) {
          renderCurrentQuizQuestion();
        } else {
          // Finished all questions! Show results
          showQuizResults();
        }
      };
    }
  }

  function handleQuizAnswerClick(selectedIndex, clickedBtn) {
    const quizSystem = window.DebugDapur.QuizSystem;
    const result = quizSystem.submitAnswer(selectedIndex);
    if (!result) return; // already submitted

    const options = document.querySelectorAll(".quiz-option-btn");
    options.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === result.correctIndex) {
        btn.classList.add("correct");
      } else if (idx === selectedIndex && !result.isCorrect) {
        btn.classList.add("incorrect");
      }
    });

    // Feedback box
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const feedbackStatus = document.getElementById("quiz-feedback-status");
    const feedbackExplanation = document.getElementById("quiz-feedback-explanation");
    const nextBtn = document.getElementById("quiz-btn-next");

    if (feedbackBox) {
      feedbackBox.classList.remove("hidden");
      if (feedbackStatus) {
        feedbackStatus.textContent = result.isCorrect ? "JAWABAN BENAR!" : "JAWABAN BELUM TEPAT";
        feedbackStatus.style.color = result.isCorrect ? "#2E7D32" : "#C62828";
      }
      if (feedbackExplanation) {
        feedbackExplanation.textContent = result.explanation;
      }
    }

    if (nextBtn) nextBtn.disabled = false;
  }

  function showQuizResults() {
    showScreen("results");
    const results = window.DebugDapur.QuizSystem.getResults();

    // Save quiz score
    if (window.DebugDapur.StorageManager) {
      window.DebugDapur.StorageManager.recordQuizResult(results.scorePercent);
    }

    const scoreElem = document.getElementById("results-score-percent");
    const detailElem = document.getElementById("results-score-detail");
    const predicateElem = document.getElementById("results-predicate");
    const btnBackMenu = document.getElementById("results-btn-menu");

    if (scoreElem) scoreElem.textContent = `${results.scorePercent}%`;
    if (detailElem) detailElem.textContent = `Menjawab Benar: ${results.correctCount} dari ${results.totalQuestions} Soal`;
    if (predicateElem) predicateElem.textContent = results.predicate;

    if (btnBackMenu) {
      btnBackMenu.onclick = () => showScreen("menu");
    }
  }

  return {
    init,
    showScreen,
    showModal,
    closeModal,
    showLevelComplete,
    startLevelWithFlowchart,
    startCookingSimulation,
    getCurrentScene: () => currentScene
  };
})();
