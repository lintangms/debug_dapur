/**
 * DEBUG DAPUR - Application Entry Point
 */

window.addEventListener("DOMContentLoaded", () => {
  if (window.DebugDapur && window.DebugDapur.Game) {
    window.DebugDapur.Game.init();
  }
});
