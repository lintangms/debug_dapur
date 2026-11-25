/**
 * DEBUG DAPUR - Input Manager
 * Handles responsive canvas scaling, mouse coordinates, and touch interactions.
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.InputManager = (function() {
  let canvas = null;
  let mouse = {
    x: 0,
    y: 0,
    isDown: false,
    dragTarget: null
  };

  const listeners = {
    click: [],
    down: [],
    up: [],
    move: [],
    dragstart: [],
    drag: [],
    dragend: []
  };

  function init(canvasElement) {
    canvas = canvasElement;

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
  }

  function getCanvasCoords(clientX, clientY) {
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  let dragThreshold = 3;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let hasFiredDragStart = false;

  function onMouseDown(e) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    mouse.x = coords.x;
    mouse.y = coords.y;
    mouse.isDown = true;
    startX = coords.x;
    startY = coords.y;
    isDragging = false;
    hasFiredDragStart = false;
    notify('down', mouse);
  }

  function onMouseMove(e) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    mouse.x = coords.x;
    mouse.y = coords.y;
    if (mouse.isDown) {
      const dist = Math.hypot(coords.x - startX, coords.y - startY);
      if (dist >= dragThreshold) {
        isDragging = true;
        if (!hasFiredDragStart) {
          hasFiredDragStart = true;
          notify('dragstart', mouse);
        }
        notify('drag', mouse);
      }
    }
    notify('move', mouse);
  }

  function onMouseUp(e) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    mouse.x = coords.x;
    mouse.y = coords.y;
    mouse.isDown = false;
    if (isDragging) {
      isDragging = false;
      hasFiredDragStart = false;
      notify('dragend', mouse);
    } else {
      notify('click', mouse);
    }
    notify('up', mouse);
  }

  function onTouchStart(e) {
    if (e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      mouse.x = coords.x;
      mouse.y = coords.y;
      mouse.isDown = true;
      startX = coords.x;
      startY = coords.y;
      isDragging = false;
      hasFiredDragStart = false;
      notify('down', mouse);
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      mouse.x = coords.x;
      mouse.y = coords.y;
      if (mouse.isDown) {
        const dist = Math.hypot(coords.x - startX, coords.y - startY);
        if (dist >= dragThreshold) {
          isDragging = true;
          if (!hasFiredDragStart) {
            hasFiredDragStart = true;
            notify('dragstart', mouse);
          }
          notify('drag', mouse);
        }
      }
      notify('move', mouse);
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    mouse.isDown = false;
    if (isDragging) {
      isDragging = false;
      hasFiredDragStart = false;
      notify('dragend', mouse);
    } else {
      notify('click', mouse);
    }
    notify('up', mouse);
  }

  function on(event, callback) {
    if (listeners[event]) {
      listeners[event].push(callback);
    }
  }

  function off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  }

  function notify(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  }

  return {
    init,
    on,
    off,
    getMouse: () => mouse,
    getCanvasCoords
  };
})();
