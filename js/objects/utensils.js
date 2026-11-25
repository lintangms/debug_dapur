/**
 * DEBUG DAPUR - Utensils & Stations
 * Interactive Spatula for stirring/flipping, Water Dispenser Tap, and Serving Dish plate.
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.Utensils = class Utensils {
  constructor() {
    // Spatula on counter (clearly placed to the right of the stove, never hidden behind it)
    this.spatula = {
      x: 845,
      y: 335,
      width: 74,
      height: 28,
      isHovered: false,
      isHeld: false,
      stirAngle: 0,
      stirAnimTimer: 0,
      stirCount: 0
    };

    // Serving Plate Station
    this.plate = {
      x: 890,
      y: 440,
      radiusX: 62,
      radiusY: 32,
      isHovered: false,
      hasDish: false,
      dishName: ""
    };

    // Water Tap / Sink Station (Left side)
    this.tap = {
      x: 195,
      y: 345,
      width: 60,
      height: 80,
      isRunning: false,
      waterStreamTimer: 0
    };
  }

  triggerSpatulaUse() {
    this.spatula.stirAnimTimer = 320;
  }

  update(dt) {
    if (this.tap.isRunning) {
      this.tap.waterStreamTimer += dt;
      if (this.tap.waterStreamTimer > 1500) {
        this.tap.isRunning = false;
        this.tap.waterStreamTimer = 0;
      }
    }

    if (this.spatula.stirAnimTimer > 0) {
      this.spatula.stirAnimTimer = Math.max(0, this.spatula.stirAnimTimer - dt);
      this.spatula.stirAngle = Math.sin(this.spatula.stirAnimTimer * 0.04) * 0.35;
    } else {
      this.spatula.stirAngle = 0;
    }
  }

  isPointInSpatula(px, py) {
    const s = this.spatula;
    return px >= s.x - 42 && px <= s.x + 42 && py >= s.y - 26 && py <= s.y + 28;
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

    // Utensil rest / ceramic holder mat on counter so spatula stands out clearly
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.beginPath();
    ctx.roundRect(s.x - 38, s.y - 18, 78, 38, 10);
    ctx.fill();

    ctx.fillStyle = s.isHovered ? "#FFF8E1" : "#ECEFF1";
    ctx.strokeStyle = s.isHovered ? "#FF9800" : "#B0BEC5";
    ctx.lineWidth = s.isHovered ? 2.5 : 2;
    ctx.beginPath();
    ctx.roundRect(s.x - 40, s.y - 20, 78, 38, 10);
    ctx.fill();
    ctx.stroke();

    ctx.translate(s.x, s.y - 2);
    ctx.rotate(s.stirAngle);

    // Spatula shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.roundRect(-29, -2, 38, 8, 3);
    ctx.roundRect(9, -10, 24, 24, 4);
    ctx.fill();

    // Spatula handle (wood)
    ctx.fillStyle = "#8D6E63";
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-30, -4, 38, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Spatula blade (bright silicone / metal)
    ctx.fillStyle = s.isHovered ? "#FF7043" : "#E53935";
    ctx.beginPath();
    ctx.roundRect(8, -12, 24, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Slots in blade
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(14, -8, 2, 16);
    ctx.fillRect(21, -8, 2, 16);

    ctx.restore();

    // Clear label below utensil rest
    ctx.save();
    ctx.font = "bold 10px 'Segoe UI', sans-serif";
    ctx.fillStyle = s.isHovered ? "#FFE082" : "#CFD8DC";
    ctx.textAlign = "center";
    ctx.fillText("SPATULA", s.x, s.y + 30);
    ctx.restore();

    // Stir count badge if active
    if (s.stirCount > 0) {
      ctx.save();
      ctx.fillStyle = "#E65100";
      ctx.beginPath();
      ctx.arc(s.x + 32, s.y - 22, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.stirCount + "x", s.x + 32, s.y - 22);
      ctx.restore();
    }
  }
};
