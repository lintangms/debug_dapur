/**
 * DEBUG DAPUR - Cookware Objects (Pot & Pan)
 * Handles cooking states, boiling water, frying, bubbling, heat transfer, and food rendering.
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.Cookware = class Cookware {
  constructor(type, x, y, width = 140, height = 90) {
    this.type = type; // 'pot' or 'pan'
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.homeX = x;
    this.homeY = y;
    this.width = width;
    this.height = height;

    this.isDockedOnStove = false;
    this.activeBurner = null;

    // Internal Cookware Contents & States
    this.hasWater = false;
    this.waterTemp = 25; // in Celsius
    this.isBoiling = false;

    this.hasOil = false;
    this.oilTemp = 25;
    this.isOilHot = false;
    this.isOilSplattering = false;

    // Added foods
    this.contents = []; // e.g. ['noodles', 'seasoning'], ['egg'], ['rice']
    this.eggFlipped = false;
    this.eggBottomCooked = false;
    this.eggTopCooked = false;

    this.chickenFlipped = false;
    this.chickenCooked = false;

    this.riceStirCount = 0;
    this.riceCooked = false;

    this.isBurnt = false;
    this.isDone = false;

    // Animation & cooking timers
    this.timer = 0;
    this.eggCookTimer = 0;
    this.eggCookTopTimer = 0;
    this.overcookTimer = 0;
    this.chickenCookTimer = 0;
    this.noodlesTimer = 0;
    this.splatterHandled = false;
    this.bubbles = [];
    this.steamParticles = [];
  }

  setHomePosition(x, y) {
    this.homeX = x;
    this.homeY = y;
    if (!this.isDockedOnStove) {
      this.x = x;
      this.y = y;
    }
  }

  reset() {
    this.x = this.homeX;
    this.y = this.homeY;
    this.isDockedOnStove = false;
    this.activeBurner = null;
    this.hasWater = false;
    this.waterTemp = 25;
    this.isBoiling = false;
    this.hasOil = false;
    this.oilTemp = 25;
    this.isOilHot = false;
    this.isOilSplattering = false;
    this.contents = [];
    this.eggFlipped = false;
    this.eggBottomCooked = false;
    this.eggTopCooked = false;
    this.chickenFlipped = false;
    this.chickenCooked = false;
    this.riceStirCount = 0;
    this.riceCooked = false;
    this.isBurnt = false;
    this.isDone = false;
    this.timer = 0;
    this.eggCookTimer = 0;
    this.eggCookTopTimer = 0;
    this.overcookTimer = 0;
    this.chickenCookTimer = 0;
    this.noodlesTimer = 0;
    this.splatterHandled = false;
    this.bubbles = [];
    this.steamParticles = [];
  }

  applyHeat(power, dt) {
    if (this.isBurnt) return;

    const heatRate = power * (dt / 1000) * 15;

    // Water heating
    if (this.hasWater) {
      this.waterTemp = Math.min(100, this.waterTemp + heatRate * 1.8);
      if (this.waterTemp >= 100) {
        if (!this.isBoiling) {
          this.isBoiling = true;
          if (window.DebugDapur.AudioManager) {
            window.DebugDapur.AudioManager.startContinuousSound('boiling');
          }
        }
      }
    }

    // Oil heating
    if (this.hasOil) {
      this.oilTemp = Math.min(180, this.oilTemp + heatRate * 2.8);
      if (this.oilTemp >= 140) {
        if (!this.isOilHot) {
          this.isOilHot = true;
          if (window.DebugDapur.AudioManager) {
            window.DebugDapur.AudioManager.startContinuousSound('sizzling');
          }
        }
      }
    }

    // Food Cooking Progress
    if (this.type === 'pan') {
      // Egg cooking
      if (this.contents.includes('egg') && this.isOilHot) {
        if (!this.eggBottomCooked) {
          this.eggCookTimer = (this.eggCookTimer || 0) + dt;
          if (this.eggCookTimer > 4000) {
            this.eggBottomCooked = true;
          }
        } else if (this.eggFlipped && !this.eggTopCooked) {
          this.eggCookTopTimer = (this.eggCookTopTimer || 0) + dt;
          if (this.eggCookTopTimer > 3500) {
            this.eggTopCooked = true;
            this.isDone = true;
          }
        } else if (!this.eggFlipped && this.eggBottomCooked) {
          // Left too long without flipping -> burnt!
          this.overcookTimer = (this.overcookTimer || 0) + dt;
          if (this.overcookTimer > 8000) {
            this.isBurnt = true;
          }
        }
      }

      // Chicken cooking
      if (this.contents.includes('chicken') && this.isOilHot) {
        this.chickenCookTimer = (this.chickenCookTimer || 0) + dt;
        // Oil splattering warning occurs between 3s and 7s
        if (this.chickenCookTimer > 2500 && this.chickenCookTimer < 8000 && !this.splatterHandled) {
          this.isOilSplattering = true;
        } else {
          this.isOilSplattering = false;
        }

        if (this.chickenCookTimer > 6000 && this.chickenFlipped) {
          this.chickenCooked = true;
          this.isDone = true;
        }
      }

      // Rice cooking
      if (this.contents.includes('rice')) {
        if (this.riceStirCount >= 6) {
          this.riceCooked = true;
          this.isDone = true;
        }
      }
    } else if (this.type === 'pot') {
      // Noodles cooking in boiling water
      if (this.contents.includes('noodles') && this.isBoiling) {
        this.noodlesTimer = (this.noodlesTimer || 0) + dt;
        if (this.noodlesTimer > 4500) {
          this.isDone = true;
        }
      }
    }
  }

  update(dt) {
    this.timer += dt;

    // Bubble simulation for boiling
    if (this.isBoiling) {
      if (Math.random() < 0.3) {
        this.bubbles.push({
          x: this.x - this.width * 0.3 + Math.random() * (this.width * 0.6),
          y: this.y + 10,
          radius: 2 + Math.random() * 4,
          vy: -1 - Math.random() * 2,
          life: 1.0
        });
      }
      // Steam
      if (Math.random() < 0.25) {
        this.steamParticles.push({
          x: this.x - 20 + Math.random() * 40,
          y: this.y - 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.5 - Math.random() * 1.5,
          radius: 6 + Math.random() * 8,
          alpha: 0.6
        });
      }
    }

    // Sizzling smoke if pan is hot
    if (this.isOilHot && (this.contents.length > 0 || this.isOilSplattering)) {
      if (Math.random() < 0.3) {
        this.steamParticles.push({
          x: this.x - 25 + Math.random() * 50,
          y: this.y - 5,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.2 - Math.random() * 2,
          radius: 4 + Math.random() * 6,
          alpha: this.isBurnt ? 0.8 : 0.4,
          isSmoke: this.isBurnt
        });
      }
    }

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy;
      b.life -= dt * 0.003;
      if (b.life <= 0 || b.y < this.y - 15) {
        this.bubbles.splice(i, 1);
      }
    }

    // Update steam
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const s = this.steamParticles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.radius += dt * 0.008;
      s.alpha -= dt * 0.001;
      if (s.alpha <= 0) {
        this.steamParticles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Render Cookware base based on type
    if (this.type === 'pot') {
      this.renderPot(ctx);
    } else {
      this.renderPan(ctx);
    }

    // Render contents inside
    this.renderContents(ctx);

    // Render bubbles
    this.bubbles.forEach(b => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render steam particles
    this.steamParticles.forEach(s => {
      ctx.fillStyle = s.isSmoke
        ? `rgba(55, 71, 79, ${s.alpha})`
        : `rgba(240, 244, 248, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Warning text if splattering, or helpful cooking status pill
    if (this.isOilSplattering) {
      this.renderStatusPill(ctx, "MINYAK MELETUP! KECILKAN API!", "#D50000", "#FFEBEE");
    } else if (this.isBurnt) {
      this.renderStatusPill(ctx, "GOSONG!", "#212121", "#FFCDD2");
    } else if (this.isDone) {
      this.renderStatusPill(ctx, "MATANG! Klik Piring Saji", "#1B5E20", "#E8F5E9");
    } else if (this.type === 'pan' && this.contents.includes('egg') && this.eggBottomCooked && !this.eggFlipped) {
      this.renderStatusPill(ctx, "SIAP DIBALIK! Klik Spatula", "#E65100", "#FFF3E0");
    } else if (this.type === 'pan' && this.contents.includes('chicken') && this.chickenCookTimer > 5500 && !this.chickenFlipped) {
      this.renderStatusPill(ctx, "SIAP DIBALIK! Klik Spatula", "#E65100", "#FFF3E0");
    } else if (this.type === 'pot' && this.isBoiling && !this.contents.includes('noodles')) {
      this.renderStatusPill(ctx, "MENDIDIH (100°C)", "#01579B", "#E1F5FE");
    } else if (this.type === 'pan' && this.isOilHot && this.contents.length === 0) {
      this.renderStatusPill(ctx, "MINYAK PANAS!", "#E65100", "#FFF8E1");
    } else if (this.isDockedOnStove && this.hasWater && !this.isBoiling && this.activeBurner && this.activeBurner.isLit) {
      this.renderStatusPill(ctx, `Memanaskan Air: ${Math.round(this.waterTemp)}°C`, "#0277BD", "#E1F5FE");
    } else if (this.isDockedOnStove && this.hasOil && !this.isOilHot && this.activeBurner && this.activeBurner.isLit) {
      this.renderStatusPill(ctx, `Memanaskan Minyak: ${Math.round(this.oilTemp)}°C`, "#EF6C00", "#FFF8E1");
    }

    ctx.restore();
  }

  renderStatusPill(ctx, text, textColor, bgColor) {
    ctx.save();
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    const textWidth = ctx.measureText(text).width;
    const pillW = textWidth + 16;
    const pillH = 20;
    const px = this.x - pillW * 0.5;
    const py = this.y - 54;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, py, pillW, pillH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, this.x, py + pillH * 0.5);
    ctx.restore();
  }

  renderPot(ctx) {
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 35, this.width * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side handles
    ctx.fillStyle = "#263238";
    ctx.beginPath();
    // Left handle
    ctx.roundRect(this.x - this.width * 0.55, this.y - 10, 16, 22, 4);
    // Right handle
    ctx.roundRect(this.x + this.width * 0.55 - 16, this.y - 10, 16, 22, 4);
    ctx.fill();

    // Pot Body (Deep silver/blue pot)
    const potGrad = ctx.createLinearGradient(this.x - this.width * 0.5, this.y, this.x + this.width * 0.5, this.y);
    potGrad.addColorStop(0, "#546E7A");
    potGrad.addColorStop(0.3, "#90A4AE");
    potGrad.addColorStop(0.7, "#78909C");
    potGrad.addColorStop(1, "#37474F");

    ctx.fillStyle = potGrad;
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width * 0.45, this.y - 20, this.width * 0.9, 55, [4, 4, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Top Rim opening
    ctx.fillStyle = "#37474F";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 20, this.width * 0.45, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Water level if present
    if (this.hasWater) {
      const waterGrad = ctx.createRadialGradient(this.x, this.y - 18, 5, this.x, this.y - 18, this.width * 0.4);
      if (this.isBoiling) {
        waterGrad.addColorStop(0, "rgba(129, 212, 250, 0.95)");
        waterGrad.addColorStop(1, "rgba(3, 169, 244, 0.85)");
      } else {
        waterGrad.addColorStop(0, "rgba(179, 229, 252, 0.9)");
        waterGrad.addColorStop(1, "rgba(79, 195, 247, 0.8)");
      }
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 18, this.width * 0.42, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderPan(ctx) {
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 25, this.width * 0.52, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long pan handle extending left
    ctx.fillStyle = "#212121";
    ctx.strokeStyle = "#424242";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width * 0.85, this.y + 2, this.width * 0.45, 12, 5);
    ctx.fill();
    ctx.stroke();

    // Hanging hole in handle
    ctx.fillStyle = "#ECEFF1";
    ctx.beginPath();
    ctx.arc(this.x - this.width * 0.8, this.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pan Exterior (Non-stick black/charcoal curved skillet)
    const panGrad = ctx.createLinearGradient(this.x - this.width * 0.5, this.y, this.x + this.width * 0.5, this.y);
    panGrad.addColorStop(0, "#37474F");
    panGrad.addColorStop(0.5, "#455A64");
    panGrad.addColorStop(1, "#263238");

    ctx.fillStyle = panGrad;
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width * 0.48, this.y - 5, this.width * 0.96, 32, [6, 6, 20, 20]);
    ctx.fill();
    ctx.stroke();

    // Pan Inner Basin
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 5, this.width * 0.46, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Oil inside pan
    if (this.hasOil) {
      const oilGrad = ctx.createRadialGradient(this.x, this.y - 4, 3, this.x, this.y - 4, this.width * 0.4);
      oilGrad.addColorStop(0, "rgba(255, 238, 88, 0.85)");
      oilGrad.addColorStop(1, "rgba(251, 192, 45, 0.75)");
      ctx.fillStyle = oilGrad;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 4, this.width * 0.42, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderContents(ctx) {
    if (this.isBurnt) {
      // Burnt crust
      ctx.fillStyle = "#1B1B1B";
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 8, this.width * 0.32, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Noodles in Pot
    if (this.contents.includes('noodles')) {
      ctx.strokeStyle = "#FFF176";
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const offset = (i - 3) * 6;
        ctx.beginPath();
        ctx.moveTo(this.x + offset - 15, this.y - 18 + Math.sin(this.timer * 0.005 + i) * 2);
        ctx.quadraticCurveTo(this.x + offset, this.y - 24, this.x + offset + 15, this.y - 18);
        ctx.stroke();
      }
      // Seasoning sprinkles
      if (this.contents.includes('seasoning')) {
        ctx.fillStyle = "#E65100";
        for (let j = 0; j < 8; j++) {
          ctx.beginPath();
          ctx.arc(this.x - 18 + j * 5, this.y - 18 + (j % 3) * 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Egg in Pan
    if (this.contents.includes('egg')) {
      const eggX = this.x;
      const eggY = this.y - 6;

      // Egg white
      ctx.fillStyle = this.eggBottomCooked ? "#FFF9C4" : "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(eggX, eggY, 32, 11, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.eggBottomCooked ? "#FBC02D" : "#FFF59D";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Egg yolk (if not flipped)
      if (!this.eggFlipped) {
        ctx.fillStyle = "#FFB300";
        ctx.beginPath();
        ctx.ellipse(eggX + 4, eggY - 2, 11, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(eggX + 2, eggY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Flipped side cooked golden pattern
        ctx.strokeStyle = "#E65100";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(eggX, eggY, 14, 0, Math.PI * 0.8);
        ctx.stroke();
      }
    }

    // Rice in Pan
    if (this.contents.includes('rice')) {
      const riceX = this.x;
      const riceY = this.y - 7;
      // Rice mound
      const isMixed = this.contents.includes('sauce') || this.riceStirCount > 2;
      ctx.fillStyle = isMixed ? (this.riceCooked ? "#D87A24" : "#F57C00") : "#FAFAFA";
      ctx.beginPath();
      ctx.ellipse(riceX, riceY, 38, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isMixed ? "#BF360C" : "#E0E0E0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Grains texture
      ctx.fillStyle = isMixed ? "#8D6E63" : "#BDBDBD";
      for (let k = 0; k < 12; k++) {
        ctx.fillRect(riceX - 25 + (k * 4.5), riceY - 4 + (k % 3) * 2, 3, 1.5);
      }
    }

    // Chicken in Pan
    if (this.contents.includes('chicken')) {
      const chickX = this.x;
      const chickY = this.y - 8;

      ctx.fillStyle = this.chickenCooked ? "#D84315" : (this.chickenFlipped ? "#F57C00" : "#FFB74D");
      ctx.beginPath();
      ctx.ellipse(chickX, chickY, 26, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8D6E63";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bone
      ctx.fillStyle = "#FFFDE7";
      ctx.beginPath();
      ctx.roundRect(chickX + 18, chickY - 2, 14, 6, 3);
      ctx.fill();
      ctx.stroke();
    }
  }

  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return (dx * dx) / ((this.width * 0.5) * (this.width * 0.5)) +
           (dy * dy) / ((this.height * 0.5) * (this.height * 0.5)) <= 1.2;
  }
};
