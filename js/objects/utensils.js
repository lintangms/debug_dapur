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
      homeX: 845,
      homeY: 335,
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
      dishName: "",
      contents: [] // items served onto plate
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

    // Trash Can Station (Meja samping kiri bawah wastafel)
    this.trashCan = {
      x: 205,
      y: 450,
      width: 64,
      height: 72,
      isHovered: false,
      isOpen: false,
      lidAnimTimer: 0,
      trashCount: 0
    };
  }

  triggerTrashUse() {
    this.trashCan.lidAnimTimer = 500;
    this.trashCan.isOpen = true;
    this.trashCan.trashCount++;
  }

  resetSpatula() {
    this.spatula.x = this.spatula.homeX;
    this.spatula.y = this.spatula.homeY;
    this.spatula.isHeld = false;
    this.spatula.stirAngle = 0;
  }

  triggerSpatulaUse() {
    this.spatula.stirAnimTimer = 350;
  }

  update(dt) {
    if (this.tap.isRunning) {
      this.tap.waterStreamTimer += dt;
      if (this.tap.waterStreamTimer > 1500) {
        this.tap.isRunning = false;
        this.tap.waterStreamTimer = 0;
      }
    }

    if (this.trashCan.lidAnimTimer > 0) {
      this.trashCan.lidAnimTimer -= dt;
      if (this.trashCan.lidAnimTimer <= 0) {
        this.trashCan.isOpen = false;
      }
    }

    if (this.spatula.stirAnimTimer > 0) {
      this.spatula.stirAnimTimer = Math.max(0, this.spatula.stirAnimTimer - dt);
      this.spatula.stirAngle = Math.sin(this.spatula.stirAnimTimer * 0.04) * 0.35;
    } else {
      this.spatula.stirAngle = 0;
    }
  }

  isPointInTrash(px, py) {
    const tc = this.trashCan;
    return px >= tc.x - tc.width * 0.5 && px <= tc.x + tc.width * 0.5 &&
           py >= tc.y - tc.height * 0.5 && py <= tc.y + tc.height * 0.5 + 8;
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
    this.renderTrashCan(ctx);
    this.renderPlate(ctx);
    this.renderSpatula(ctx);
  }

  renderTrashCan(ctx) {
    const tc = this.trashCan;
    ctx.save();

    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(tc.x, tc.y + tc.height * 0.48, tc.width * 0.48, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bin body (Trapezoid container)
    const binGrad = ctx.createLinearGradient(tc.x - tc.width * 0.5, tc.y, tc.x + tc.width * 0.5, tc.y);
    binGrad.addColorStop(0, tc.isHovered ? "#EF5350" : "#78909C");
    binGrad.addColorStop(0.3, tc.isHovered ? "#FF7043" : "#90A4AE");
    binGrad.addColorStop(0.7, tc.isHovered ? "#E53935" : "#607D8B");
    binGrad.addColorStop(1, tc.isHovered ? "#C62828" : "#455A64");

    ctx.fillStyle = binGrad;
    ctx.strokeStyle = tc.isHovered ? "#B71C1C" : "#37474F";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    const halfTop = tc.width * 0.44;
    const halfBot = tc.width * 0.36;
    const topY = tc.y - tc.height * 0.35;
    const botY = tc.y + tc.height * 0.46;

    ctx.moveTo(tc.x - halfTop, topY);
    ctx.lineTo(tc.x + halfTop, topY);
    ctx.lineTo(tc.x + halfBot, botY);
    ctx.lineTo(tc.x - halfBot, botY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Recycle / Trash symbol
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tc.x, tc.y + 6, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(tc.x - 3, tc.y + 2);
    ctx.lineTo(tc.x + 3, tc.y + 2);
    ctx.lineTo(tc.x, tc.y + 9);
    ctx.closePath();
    ctx.fill();

    // Lid
    const lidLift = tc.isOpen ? -14 : 0;
    const lidAngle = tc.isOpen ? -0.22 : 0;

    ctx.save();
    ctx.translate(tc.x, topY + lidLift);
    ctx.rotate(lidAngle);

    // Lid body
    ctx.fillStyle = tc.isHovered ? "#D32F2F" : "#455A64";
    ctx.strokeStyle = tc.isHovered ? "#B71C1C" : "#263238";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-tc.width * 0.5, -6, tc.width, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Lid handle
    ctx.fillStyle = "#ECEFF1";
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Text Label below
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = tc.isHovered ? "#D32F2F" : "#CFD8DC";
    ctx.textAlign = "center";
    ctx.fillText("TONG SAMPAH", tc.x, botY + 12);

    // Notification if user threw away ingredients
    if (tc.trashCount > 0) {
      ctx.fillStyle = "#C62828";
      ctx.beginPath();
      ctx.arc(tc.x + tc.width * 0.4, topY - 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText("-" + (tc.trashCount * 80), tc.x + tc.width * 0.4, topY - 4);
    }

    ctx.restore();
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

    // Render food contents on plate if any
    if (p.contents && p.contents.length > 0) {
      // 1. Rice mound
      if (p.contents.includes("rice")) {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#E0E0E0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x - (p.contents.length > 1 ? 14 : 0), p.y - 2, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Steam specks
        ctx.fillStyle = "#E0F2F1";
        ctx.beginPath();
        ctx.arc(p.x - 14, p.y - 12, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Chicken piece
      if (p.contents.includes("chicken")) {
        ctx.fillStyle = "#BF360C";
        ctx.strokeStyle = "#D84315";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x + 6, p.y - 12, 26, 16, 6);
        ctx.fill();
        ctx.stroke();
        // Golden crust specks
        ctx.fillStyle = "#FFB300";
        ctx.beginPath();
        ctx.arc(p.x + 18, p.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Egg omelette
      if (p.contents.includes("egg")) {
        ctx.fillStyle = "#FBC02D";
        ctx.strokeStyle = "#F57F17";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x + (p.contents.length > 1 ? 8 : 0), p.y + 6, 18, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 4. Noodles
      if (p.contents.includes("noodles")) {
        ctx.fillStyle = "#FDD835";
        ctx.strokeStyle = "#F57F17";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 24, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Label
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#78909C";
    ctx.textAlign = "center";
    ctx.fillText(p.hasDish ? p.dishName : "PIRING SAJI", p.x, p.y + 16);

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
