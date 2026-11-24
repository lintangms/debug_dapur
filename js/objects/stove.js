/**
 * DEBUG DAPUR - Gas Stove Object
 * Dual-burner kitchen stove with interactive knobs, animated flames, and cookware docking.
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.Stove = class Stove {
  constructor(x, y, width = 360, height = 150) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Burners: left burner & right burner
    this.burners = [
      {
        id: 0,
        x: x + width * 0.28,
        y: y + height * 0.42,
        radius: 46,
        isLit: false,
        heatLevel: 'OFF', // OFF, LOW, MED, HIGH
        heatPower: 0, // 0.0 to 1.0
        dockedCookware: null,
        flameTimer: 0
      },
      {
        id: 1,
        x: x + width * 0.72,
        y: y + height * 0.42,
        radius: 46,
        isLit: false,
        heatLevel: 'OFF',
        heatPower: 0,
        dockedCookware: null,
        flameTimer: 0
      }
    ];

    // Interactive Knobs
    this.knobs = [
      { id: 0, x: x + width * 0.28, y: y + height * 0.82, radius: 18, angle: 0 },
      { id: 1, x: x + width * 0.72, y: y + height * 0.82, radius: 18, angle: 0 }
    ];

    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;
    this.burners.forEach(b => {
      if (b.isLit) {
        b.flameTimer += dt;
        if (b.dockedCookware) {
          b.dockedCookware.applyHeat(b.heatPower, dt);
        }
      }
    });
  }

  toggleBurner(burnerId) {
    const burner = this.burners[burnerId];
    if (!burner) return false;

    if (burner.isLit) {
      burner.isLit = false;
      burner.heatLevel = 'OFF';
      burner.heatPower = 0;
      this.knobs[burnerId].angle = 0;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playClick();
      }
    } else {
      burner.isLit = true;
      burner.heatLevel = 'MED';
      burner.heatPower = 0.6;
      this.knobs[burnerId].angle = Math.PI * 0.5;
      if (window.DebugDapur.AudioManager) {
        window.DebugDapur.AudioManager.playIgnite();
      }
    }
    return burner.isLit;
  }

  setHeatLevel(burnerId, level) {
    const burner = this.burners[burnerId];
    if (!burner) return;
    burner.heatLevel = level;
    if (level === 'OFF') {
      burner.isLit = false;
      burner.heatPower = 0;
      this.knobs[burnerId].angle = 0;
    } else if (level === 'LOW') {
      burner.isLit = true;
      burner.heatPower = 0.35;
      this.knobs[burnerId].angle = Math.PI * 0.25;
    } else if (level === 'MED') {
      burner.isLit = true;
      burner.heatPower = 0.65;
      this.knobs[burnerId].angle = Math.PI * 0.5;
    } else if (level === 'HIGH') {
      burner.isLit = true;
      burner.heatPower = 1.0;
      this.knobs[burnerId].angle = Math.PI * 0.75;
    }
  }

  dock(cookware, burnerId = 0) {
    const b = this.burners[burnerId];
    if (b) {
      b.dockedCookware = cookware;
      cookware.x = b.x;
      cookware.y = b.y - 15;
      cookware.isDockedOnStove = true;
      cookware.activeBurner = b;
    }
  }

  undock(cookware) {
    this.burners.forEach(b => {
      if (b.dockedCookware === cookware) {
        b.dockedCookware = null;
      }
    });
    cookware.isDockedOnStove = false;
    cookware.activeBurner = null;
  }

  isPointInKnob(px, py, burnerId) {
    const knob = this.knobs[burnerId];
    if (!knob) return false;
    const dx = px - knob.x;
    const dy = py - knob.y;
    return dx * dx + dy * dy <= (knob.radius + 10) * (knob.radius + 10);
  }

  isPointInBurner(px, py, burnerId) {
    const b = this.burners[burnerId];
    if (!b) return false;
    const dx = px - b.x;
    const dy = py - b.y;
    return dx * dx + dy * dy <= (b.radius + 20) * (b.radius + 20);
  }

  render(ctx) {
    ctx.save();

    // Stove Main Body / Chassis
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.roundRect(this.x + 4, this.y + 4, this.width, this.height, 16);
    ctx.fill();

    // Stainless steel metallic gradient body
    const bodyGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    bodyGrad.addColorStop(0, "#CFD8DC");
    bodyGrad.addColorStop(0.3, "#ECEFF1");
    bodyGrad.addColorStop(0.7, "#90A4AE");
    bodyGrad.addColorStop(1, "#607D8B");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#455A64";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 14);
    ctx.fill();
    ctx.stroke();

    // Top Cooktop Surface (dark heat-resistant plate)
    ctx.fillStyle = "#37474F";
    ctx.beginPath();
    ctx.roundRect(this.x + 12, this.y + 10, this.width - 24, this.height * 0.65, 8);
    ctx.fill();

    // Front Control Panel Trim
    ctx.fillStyle = "#263238";
    ctx.fillRect(this.x + 12, this.y + this.height * 0.72, this.width - 24, 2);

    // Brand Label
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#78909C";
    ctx.textAlign = "center";
    ctx.fillText("KOMPOR DEBUG v2.0", this.x + this.width * 0.5, this.y + this.height * 0.86);

    // Render Burners
    this.burners.forEach(b => {
      // Cast iron burner grate
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Metal ring inside
      ctx.strokeStyle = "#546E7A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Cast iron prongs
      ctx.strokeStyle = "#1A1A1A";
      ctx.lineWidth = 5;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a) * (b.radius * 0.3), b.y + Math.sin(a) * (b.radius * 0.3));
        ctx.lineTo(b.x + Math.cos(a) * b.radius, b.y + Math.sin(a) * b.radius);
        ctx.stroke();
      }

      // Animated Gas Flame if Lit
      if (b.isLit) {
        this.renderFlames(ctx, b);
      }
    });

    // Render Knobs
    this.knobs.forEach((k, idx) => {
      const b = this.burners[idx];
      // Knob base ring
      ctx.fillStyle = "#455A64";
      ctx.beginPath();
      ctx.arc(k.x, k.y, k.radius + 3, 0, Math.PI * 2);
      ctx.fill();

      // Knob face
      ctx.fillStyle = b.isLit ? "#FF7043" : "#ECEFF1";
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(k.x, k.y, k.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Knob pointer notch
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(k.angle);
      ctx.fillStyle = "#D32F2F";
      ctx.fillRect(-2, -k.radius + 2, 4, 10);
      ctx.restore();

      // Label below knob
      ctx.font = "9px sans-serif";
      ctx.fillStyle = b.isLit ? "#E65100" : "#37474F";
      ctx.textAlign = "center";
      ctx.fillText(b.isLit ? b.heatLevel : "OFF", k.x, k.y + k.radius + 12);
    });

    ctx.restore();
  }

  renderFlames(ctx, b) {
    ctx.save();
    const flameCount = 14;
    const flameBaseRadius = b.radius * 0.58;
    const flameHeight = 12 * b.heatPower + Math.sin(b.flameTimer * 0.02) * 3;

    for (let i = 0; i < flameCount; i++) {
      const angle = (i / flameCount) * Math.PI * 2 + (b.flameTimer * 0.002);
      const fx = b.x + Math.cos(angle) * flameBaseRadius;
      const fy = b.y + Math.sin(angle) * (flameBaseRadius * 0.85);

      // Blue base of gas flame
      ctx.fillStyle = "rgba(33, 150, 243, 0.85)";
      ctx.beginPath();
      ctx.arc(fx, fy, 4 * b.heatPower, 0, Math.PI * 2);
      ctx.fill();

      // Cyan / Orange tip of flame
      const tipX = fx + Math.cos(angle) * flameHeight;
      const tipY = fy - flameHeight * 1.2;

      const grad = ctx.createRadialGradient(fx, fy, 1, tipX, tipY, 7);
      grad.addColorStop(0, "rgba(0, 229, 255, 0.9)");
      grad.addColorStop(0.7, "rgba(255, 171, 0, 0.85)");
      grad.addColorStop(1, "rgba(255, 87, 34, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5 * b.heatPower, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heat glow overlay
    const glowGrad = ctx.createRadialGradient(b.x, b.y, 5, b.x, b.y, b.radius * 1.1);
    glowGrad.addColorStop(0, "rgba(255, 112, 67, 0.35)");
    glowGrad.addColorStop(1, "rgba(255, 112, 67, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
