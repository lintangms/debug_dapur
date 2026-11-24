/**
 * DEBUG DAPUR - Central Game Coordinator
 * Glues canvas, systems, inputs, rendering, and levels.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.Game = (function() {
  let canvas = null;
  let ctx = null;

  const VIRTUAL_WIDTH = 1280;
  const VIRTUAL_HEIGHT = 720;

  function init() {
    canvas = document.getElementById("game-canvas");
    if (!canvas) {
      console.error("Canvas element #game-canvas not found!");
      return;
    }
    ctx = canvas.getContext("2d");
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;

    // Initialize systems
    if (window.DebugDapur.StorageManager) {
      window.DebugDapur.StorageManager.getData();
    }

    if (window.DebugDapur.AudioManager) {
      window.DebugDapur.AudioManager.applySettings();
    }

    if (window.DebugDapur.FeedbackSystem) {
      window.DebugDapur.FeedbackSystem.init();
    }

    if (window.DebugDapur.InputManager) {
      window.DebugDapur.InputManager.init(canvas);
      // Extra boss board click interception
      window.DebugDapur.InputManager.on('click', (mouse) => {
        if (window.DebugDapur.LevelManager && window.DebugDapur.LevelManager.getCurrentLevelId() === 7) {
          window.DebugDapur.LevelManager.handleBossBoardClick(mouse.x, mouse.y);
        }
      });
    }

    if (window.DebugDapur.LevelManager) {
      window.DebugDapur.LevelManager.init(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }

    if (window.DebugDapur.SceneManager) {
      window.DebugDapur.SceneManager.init();
    }

    // Start game loop
    if (window.DebugDapur.GameLoop) {
      window.DebugDapur.GameLoop.start(update, render);
    }
  }

  function update(dt) {
    if (window.DebugDapur.SceneManager && window.DebugDapur.SceneManager.getCurrentScene() === "gameplay") {
      if (window.DebugDapur.LevelManager) {
        window.DebugDapur.LevelManager.update(dt);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    if (window.DebugDapur.SceneManager && window.DebugDapur.SceneManager.getCurrentScene() === "gameplay") {
      if (window.DebugDapur.LevelManager) {
        window.DebugDapur.LevelManager.render(ctx);
      }
    }
  }

  return {
    init,
    getCanvas: () => canvas,
    getContext: () => ctx,
    VIRTUAL_WIDTH,
    VIRTUAL_HEIGHT
  };
})();
