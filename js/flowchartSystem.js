/**
 * DEBUG DAPUR - Flowchart System
 * Renders standard flowchart diagrams (Terminator, Process, Decision, Subroutine)
 * with clear two-column YA/TIDAK branching and shuffled interactive puzzle choices.
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
   * Returns a Fisher-Yates shuffled copy of options so the answer is never stuck in one position.
   */
  function getShuffledOptions(missingNode) {
    if (!missingNode || !Array.isArray(missingNode.options)) return [];
    const copy = missingNode.options.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
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
      const specificReason = (missingNode.wrongFeedback && missingNode.wrongFeedback[optionText])
        ? missingNode.wrongFeedback[optionText]
        : "Pilihan ini belum tepat. Perhatikan kembali alur sebelum dan sesudah kotak bertanda [ ? ].";
      return {
        valid: false,
        explanation: specificReason,
        hint: missingNode.hint || ""
      };
    }
  }

  function renderNodeMarkup(node, isInteractive, isActive) {
    const isMissingNode = node.isMissing && !isSolved && isInteractive;

    let shapeClass = "fc-process";
    let shapeTag = "PROSES";

    if (node.type === "terminator") {
      shapeClass = "fc-terminator";
      shapeTag = "TERMINATOR";
    } else if (node.type === "decision") {
      shapeClass = "fc-decision";
      shapeTag = "◆ KONDISI (IF?)";
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

    const displayText = isMissingNode
      ? (selectedOption ? selectedOption : "[ ? ] Pilih jawaban yang tepat di bawah")
      : node.label;

    return `
      <div class="fc-node ${shapeClass}" data-node-id="${node.id}">
        <div class="fc-node-tag">${shapeTag}</div>
        <div class="fc-node-label">${displayText}</div>
        ${node.isLoopBack ? '<div class="fc-loop-badge">↺ Ulangi ke Kondisi</div>' : ''}
      </div>
    `;
  }

  /**
   * Generates HTML markup for rendering the flowchart diagram visually.
   */
  function renderFlowchartHtml(containerElem, options = {}) {
    if (!containerElem || !currentLevel || !currentLevel.flowchart) return;

    const fc = currentLevel.flowchart;
    const isInteractive = options.interactive !== false;
    const activeStepIndex = options.activeStepIndex !== undefined ? options.activeStepIndex : -1;

    const nodeById = {};
    const indexById = {};
    fc.nodes.forEach((n, i) => {
      nodeById[n.id] = n;
      indexById[n.id] = i;
    });

    const renderedBranchIds = new Set();
    let html = `<div class="flowchart-diagram-wrapper">`;

    fc.nodes.forEach((node, idx) => {
      if (renderedBranchIds.has(node.id)) return;

      const isActive = (idx === activeStepIndex);
      html += `<div class="fc-node-container" data-node-id="${node.id}">`;
      html += renderNodeMarkup(node, isInteractive, isActive);

      const yesNode = node.yesTo ? nodeById[node.yesTo] : null;
      const noNode = node.noTo ? nodeById[node.noTo] : null;

      if (node.type === "decision" && yesNode && noNode) {
        renderedBranchIds.add(yesNode.id);
        renderedBranchIds.add(noNode.id);

        const yesActive = (indexById[yesNode.id] === activeStepIndex);
        const noActive = (indexById[noNode.id] === activeStepIndex);

        html += `
          <div class="fc-branch-split">
            <div class="fc-branch-col fc-branch-col-yes">
              <div class="fc-branch-pill fc-pill-yes">YA (Benar) ↓</div>
              ${renderNodeMarkup(yesNode, isInteractive, yesActive)}
            </div>
            <div class="fc-branch-col fc-branch-col-no">
              <div class="fc-branch-pill fc-pill-no">TIDAK (Salah) ↓</div>
              ${renderNodeMarkup(noNode, isInteractive, noActive)}
            </div>
          </div>
        `;

        // Check if there are remaining unrendered nodes after the branch
        const hasRemaining = fc.nodes.slice(idx + 1).some(n => !renderedBranchIds.has(n.id));
        if (hasRemaining) {
          html += `
            <div class="fc-connector">
              <div class="fc-line"></div>
              <div class="fc-arrowhead">▼</div>
            </div>
          `;
        }
      } else {
        const hasNextUnrendered = fc.nodes.slice(idx + 1).some(n => !renderedBranchIds.has(n.id));
        if (hasNextUnrendered) {
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
    getShuffledOptions,
    submitChallengeOption,
    renderFlowchartHtml
  };
})();
