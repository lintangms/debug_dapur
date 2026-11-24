/**
 * DEBUG DAPUR - Storage Manager
 * Persistent state handling using browser LocalStorage
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.StorageManager = (function() {
  const STORAGE_KEY = "debug_dapur_save_v1";

  const defaultData = {
    unlockedLevels: [1], // Level 1 unlocked by default
    levelStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    levelHighScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    quizCompleted: false,
    quizScore: 0,
    totalPlayTime: 0,
    settings: {
      sfxVolume: 0.8,
      musicVolume: 0.5,
      sfxMuted: false,
      musicMuted: false
    }
  };

  let cachedData = null;

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedData = Object.assign({}, defaultData, parsed);
        cachedData.settings = Object.assign({}, defaultData.settings, parsed.settings || {});
        cachedData.levelStars = Object.assign({}, defaultData.levelStars, parsed.levelStars || {});
        cachedData.levelHighScores = Object.assign({}, defaultData.levelHighScores, parsed.levelHighScores || {});
        return cachedData;
      }
    } catch (e) {
      console.warn("Could not read LocalStorage, using fallback memory state", e);
    }
    cachedData = JSON.parse(JSON.stringify(defaultData));
    return cachedData;
  }

  function saveData() {
    if (!cachedData) cachedData = defaultData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    } catch (e) {
      console.warn("Could not write to LocalStorage", e);
    }
  }

  function getData() {
    if (!cachedData) {
      loadData();
    }
    return cachedData;
  }

  function isLevelUnlocked(levelId) {
    const data = getData();
    return data.unlockedLevels.includes(Number(levelId));
  }

  function unlockLevel(levelId) {
    const data = getData();
    const id = Number(levelId);
    if (!data.unlockedLevels.includes(id)) {
      data.unlockedLevels.push(id);
      saveData();
    }
  }

  function recordLevelCompletion(levelId, stars, score) {
    const data = getData();
    const id = Number(levelId);

    // Update stars (keep highest)
    const currentStars = data.levelStars[id] || 0;
    if (stars > currentStars) {
      data.levelStars[id] = stars;
    }

    // Update high score
    const currentScore = data.levelHighScores[id] || 0;
    if (score > currentScore) {
      data.levelHighScores[id] = score;
    }

    // Unlock next level if exists
    if (id < 7) {
      unlockLevel(id + 1);
    }

    saveData();
  }

  function recordQuizResult(score) {
    const data = getData();
    data.quizCompleted = true;
    if (score > (data.quizScore || 0)) {
      data.quizScore = score;
    }
    saveData();
  }

  function updateSettings(newSettings) {
    const data = getData();
    data.settings = Object.assign({}, data.settings, newSettings);
    saveData();
  }

  function resetProgress() {
    cachedData = JSON.parse(JSON.stringify(defaultData));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    saveData();
    return cachedData;
  }

  function getTotalStars() {
    const data = getData();
    return Object.values(data.levelStars).reduce((sum, s) => sum + s, 0);
  }

  // Initial load
  loadData();

  return {
    getData,
    isLevelUnlocked,
    unlockLevel,
    recordLevelCompletion,
    recordQuizResult,
    updateSettings,
    resetProgress,
    getTotalStars
  };
})();
