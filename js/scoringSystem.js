/**
 * DEBUG DAPUR - Scoring System
 * Evaluates performance: correct actions, bugs made, time efficiency -> 1 to 3 stars.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.ScoringSystem = (function() {

  /**
   * Calculates stars and points for completed level.
   * Criteria:
   * - 3 Stars: 0 Bugs, completed within time efficiency bonus
   * - 2 Stars: 1-2 Bugs, completed correctly
   * - 1 Star: 3+ Bugs, completed correctly
   */
  function calculateScore(levelId, timeSpentSec, bugCount, actionCount, trashCount = 0) {
    let baseScore = 1000;

    // Deduct points for bugs
    const bugPenalty = bugCount * 150;

    // Deduct points for discarding ingredients into trash (-80 per discard)
    const trashPenalty = trashCount * 80;

    // Time bonus: up to 300 points if finished swiftly
    const timeBonus = Math.max(0, 300 - Math.floor(timeSpentSec * 2));

    // Efficiency penalty if unnecessary repetitive clicks
    const efficiencyPenalty = Math.max(0, (actionCount - 8) * 10);

    const finalScore = Math.max(100, baseScore - bugPenalty - trashPenalty + timeBonus - efficiencyPenalty);

    let stars = 1;
    const totalMistakes = bugCount + Math.floor(trashCount / 2);
    if (totalMistakes === 0) {
      stars = 3;
    } else if (totalMistakes <= 2) {
      stars = 2;
    } else {
      stars = 1;
    }

    return {
      stars,
      score: finalScore,
      bugCount,
      trashCount,
      timeSpentSec,
      grade: stars === 3 ? "Sempurna! (Master Algoritma)" : (stars === 2 ? "Bagus! (Cukup Teliti)" : "Berhasil! (Perlu Lebih Teliti)")
    };
  }

  return {
    calculateScore
  };
})();
