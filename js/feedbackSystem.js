/**
 * DEBUG DAPUR - Feedback System
 * Displays pedagogical bug dialogues, educational explanations, and Chef Bug animated cues.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.FeedbackSystem = (function() {
  let modalElement = null;
  let modalTitle = null;
  let modalExplanation = null;
  let modalConcept = null;
  let modalCloseBtn = null;

  function init() {
    modalElement = document.getElementById("bug-modal");
    modalTitle = document.getElementById("bug-modal-title");
    modalExplanation = document.getElementById("bug-modal-explanation");
    modalConcept = document.getElementById("bug-modal-concept");
    modalCloseBtn = document.getElementById("bug-modal-close");

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        hideBugAlert();
      });
    }
  }

  function showBugAlert(bugDetails, chefBug = null) {
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playBugError();
    }

    if (chefBug) {
      chefBug.setState("sad", "Aduh! Ada bug dalam langkah kita!", 4000);
    }

    if (modalElement) {
      if (modalTitle) modalTitle.textContent = bugDetails.title || "BUG TERDETEKSI!";
      if (modalExplanation) modalExplanation.textContent = bugDetails.explanation || "Terjadi kesalahan dalam urutan instruksi algoritma.";
      if (modalConcept) modalConcept.textContent = bugDetails.concept || "Algoritma Pemrograman";
      modalElement.classList.remove("hidden");
    } else {
      // Fallback
      alert(`${bugDetails.title}\n\n${bugDetails.explanation}\n\nKonsep: ${bugDetails.concept}`);
    }
  }

  function hideBugAlert() {
    if (modalElement) {
      modalElement.classList.add("hidden");
    }
  }

  function showSuccessHint(message, chefBug = null) {
    if (chefBug) {
      chefBug.setState("happy", message, 3500);
    }
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playSuccess();
    }
  }

  function showCelebration(message, chefBug = null) {
    if (chefBug) {
      chefBug.setState("celebrating", message, 5000);
    }
    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.playLevelComplete();
    }
  }

  return {
    init,
    showBugAlert,
    hideBugAlert,
    showSuccessHint,
    showCelebration
  };
})();
