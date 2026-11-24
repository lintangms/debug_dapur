/**
 * DEBUG DAPUR - Utensils & Stations
 * Interactive Spatula for stirring/flipping, Water Dispenser Tap, and Serving Dish plate.
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.Utensils = class Utensils {
  constructor() {
    // Spatula on counter
    this.spatula = {
      x: 750,
      y: 430,
      width: 70,
      height: 24,
      isHovered: false,
      isHeld: false,
      stirAngle: 0,
      stirCount: 0
    };

    // Serving Plate Station
    this.plate = {
      x: 870,
      y: 425,
      radiusX: 65,
      radiusY: 35,
      isHovered: false,
      hasDish: false,
      dishName: ""
    };

    // Water Tap / Sink Station (Left side)
    this.tap = {
      x: 210,
      y: 350,
      width: 60,
      height: 80,
      isRunning: false,
      waterStreamTimer: 0
    };
  }

  update(dt) {
    if (this.tap.isRunning) {
      this.tap.waterStreamTimer += dt;
      if (this.tap.waterStreamTimer > 1500) {
        this.tap.isRunning = false;
        this.tap.waterStreamTimer = 0;
      }
    }
  }

  isPointInSpatula(px, py) {
    const s = this.spatula;
    return px >= s.x - 30 && px <= s.x + 30 && py >= s.y - 20 && py <= s.y + 20;
  }

  isPointInPlate(px, py) {
    const p = this.plate;
    const dx = px - p.x;
    const dy = py - p.y;
    return (dx * dx) / (p.radiusX * p.radiusX) + (dy * dy) / (p.radiusY * p.radiusY) <= 1.2;
  }

  isPointInTap(px, py) {
    const t = this.tap;
    return px >= t.x - 30 && px <= t.x + 30 && py >= t.y - 40 && py <= t.y + 40;
  }

  render(ctx) {
    this.renderTap(ctx);
    this.renderPlate(ctx);
    this.renderSpatula(ctx);
  }

  renderTap(ctx) {
    const t = this.tap;
    ctx.save();

    // Chrome faucet curve
    ctx.strokeStyle = "#90A4AE";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(t.x - 20, t.y + 35);
    ctx.lineTo(t.x - 20, t.y - 15);
    ctx.quadraticCurveTo(t.x - 20, t.y - 35, t.x + 10, t.y - 35);
    ctx.lineTo(t.x + 15, t.y - 20);
    ctx.stroke();

    // Faucet nozzle
    ctx.fillStyle = "#546E7A";
    ctx.beginPath();
    ctx.roundRect(t.x + 9, t.y - 20, 12, 10, 2);
    ctx.fill();

    // Water valve knob
    ctx.fillStyle = "#0288D1";
    ctx.beginPath();
    ctx.arc(t.x - 20, t.y - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "#0277BD";
    ctx.textAlign = "center";
    ctx.fillText("KERAN AIR", t.x, t.y + 45);

    // Flowing water stream animation if running
    if (t.isRunning) {
      ctx.fillStyle = "rgba(41, 182, 246, 0.85)";
      ctx.beginPath();
      ctx.roundRect(t.x + 11, t.y - 10, 8, 55, 3);
      ctx.fill();

      // Splash ripples
      ctx.strokeStyle = "rgba(129, 212, 250, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(t.x + 15, t.y + 45, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderPlate(ctx) {
    const p = this.plate;
    ctx.save();

    // Plate shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.beginPath();
    ctx.ellipse(p.x + 2, p.y + 6, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic Plate Rim
    ctx.fillStyle = "#FAFAFA";
    ctx.strokeStyle = p.isHovered ? "#FF9800" : "#CFD8DC";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner plate rim
    ctx.strokeStyle = "#ECEFF1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.radiusX * 0.75, p.radiusY * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#78909C";
    ctx.textAlign = "center";
    ctx.fillText(p.hasDish ? p.dishName : "PIRING SAJI", p.x, p.y + 4);

    ctx.restore();
  }

  renderSpatula(ctx) {
    const s = this.spatula;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.stirAngle);

    // Spatula handle (wood)
    ctx.fillStyle = "#8D6E63";
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-28, -4, 38, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Spatula blade (silicone / metal)
    ctx.fillStyle = s.isHovered ? "#FF7043" : "#D32F2F";
    ctx.beginPath();
    ctx.roundRect(10, -12, 24, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Slots in blade
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(16, -8, 2, 16);
    ctx.fillRect(22, -8, 2, 16);

    ctx.restore();

    // Stir count badge if active
    if (s.stirCount > 0) {
      ctx.save();
      ctx.fillStyle = "#E65100";
      ctx.beginPath();
      ctx.arc(s.x + 22, s.y - 18, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.stirCount + "x", s.x + 22, s.y - 18);
      ctx.restore();
    }
  }
};
