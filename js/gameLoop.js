/**
 * DEBUG DAPUR - Game Loop
 * High-precision requestAnimationFrame game loop with delta-time.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.GameLoop = (function() {
  let isRunning = false;
  let lastTime = 0;
  let updateCallback = null;
  let renderCallback = null;
  let animationFrameId = null;

  function start(onUpdate, onRender) {
    if (isRunning) return;
    isRunning = true;
    updateCallback = onUpdate;
    renderCallback = onRender;
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }

  function stop() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function loop(currentTime) {
    if (!isRunning) return;

    let dt = currentTime - lastTime;
    lastTime = currentTime;

    // Cap delta time to 100ms to avoid physics exploding after tab suspension
    if (dt > 100) dt = 100;

    if (updateCallback) updateCallback(dt);
    if (renderCallback) renderCallback();

    animationFrameId = requestAnimationFrame(loop);
  }

  return {
    start,
    stop,
    isRunning: () => isRunning
  };
})();
