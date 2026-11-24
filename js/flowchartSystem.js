/**
 * DEBUG DAPUR - Flowchart System
 * Renders standard flowchart diagrams (Terminator, Process, Decision, Subroutine)
 * and provides interactive pre-cooking analysis & puzzle validation.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.FlowchartSystem = (function() {
  let currentLevel = null;
  let isSolved = false;
  let selectedOption = null;

  function initLevel(levelData) {
    currentLevel = levelData;
    isSolved = false;
    selectedOption = null;
  }

  function getFlowchartData() {
    return currentLevel ? currentLevel.flowchart : null;
  }

  function isChallengeSolved() {
    return isSolved;
  }

  /**
   * Validates player's selected option for the missing flowchart node.
   */
  function submitChallengeOption(optionText) {
    if (!currentLevel || !currentLevel.flowchart) return { valid: false };

    const missingNode = currentLevel.flowchart.nodes.find(n => n.isMissing);
    if (!missingNode) {
      isSolved = true;
      return { valid: true };
    }

    selectedOption = optionText;
    const isCorrect = (optionText === missingNode.correctAnswer);

    if (isCorrect) {
      isSolved = true;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playSuccess();
      }
      return {
        valid: true,
        explanation: missingNode.explanation || "Langkah flowchart tepat! Alur algoritma kini lengkap dan valid."
      };
    } else {
      isSolved = false;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playBugError();
      }
      return {
        valid: false,
        explanation: "Pilihan ini belum tepat. Perhatikan kembali urutan logis atau kondisi yang harus dievaluasi."
      };
    }
  }

  /**
   * Generates HTML markup for rendering the flowchart diagram visually.
   */
  function renderFlowchartHtml(containerElem, options = {}) {
    if (!containerElem || !currentLevel || !currentLevel.flowchart) return;

    const fc = currentLevel.flowchart;
    const isInteractive = options.interactive !== false;
    const activeStepIndex = options.activeStepIndex !== undefined ? options.activeStepIndex : -1;

    let html = `<div class="flowchart-diagram-wrapper">`;

    fc.nodes.forEach((node, idx) => {
      const isMissingNode = node.isMissing && !isSolved && isInteractive;
      const isActive = (idx === activeStepIndex);

      let shapeClass = "fc-process";
      let shapeTag = "PROSES";

      if (node.type === "terminator") {
        shapeClass = "fc-terminator";
        shapeTag = "TERMINATOR";
      } else if (node.type === "decision") {
        shapeClass = "fc-decision";
        shapeTag = "DECISION (IF)";
      } else if (node.type === "subroutine") {
        shapeClass = "fc-subroutine";
        shapeTag = "SUB-RUTIN";
      }

      if (isMissingNode) {
        shapeClass += " fc-missing";
      } else if (node.isMissing && isSolved) {
        shapeClass += " fc-solved";
      }

      if (isActive) {
        shapeClass += " fc-active-step";
      }

      const displayText = (isMissingNode) 
        ? (selectedOption ? selectedOption : "[ ? ] Klik pilihan di bawah untuk melengkapi") 
        : node.label;

      html += `
        <div class="fc-node-container" data-node-id="${node.id}">
          <div class="fc-node ${shapeClass}">
            <div class="fc-node-tag">${shapeTag}</div>
            <div class="fc-node-label">${displayText}</div>
            ${node.isLoopBack ? '<div class="fc-loop-badge">Loop Kembali ↺</div>' : ''}
          </div>
      `;

      // Branch decision indicators or standard downward arrow
      if (idx < fc.nodes.length - 1) {
        if (node.type === "decision") {
          html += `
            <div class="fc-decision-branches">
              <div class="fc-branch fc-branch-yes">
                <span class="fc-branch-label">YA (True)</span>
                <div class="fc-arrow-down">↓</div>
              </div>
              <div class="fc-branch fc-branch-no">
                <span class="fc-branch-label">TIDAK (False)</span>
                <div class="fc-arrow-turn">⤴ Tunggu</div>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="fc-connector">
              <div class="fc-line"></div>
              <div class="fc-arrowhead">▼</div>
            </div>
          `;
        }
      }

      html += `</div>`;
    });

    html += `</div>`;
    containerElem.innerHTML = html;
  }

  return {
    initLevel,
    getFlowchartData,
    isChallengeSolved,
    submitChallengeOption,
    renderFlowchartHtml
  };
})();
