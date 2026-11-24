/**
 * DEBUG DAPUR - Chef Bug Character
 * Procedural 2D animated cartoon caterpillar chef.
 * Expressive states: idle, happy, confused, surprised, sad, celebrating, cooking
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.ChefBug = class ChefBug {
  constructor(x, y, scale = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.state = 'idle'; // idle, happy, confused, surprised, sad, celebrating, cooking
    this.timer = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.dialogue = "";
    this.dialogueTimer = 0;
    this.targetY = y;
    this.jumpY = 0;
    this.armAngle = 0;
  }

  setState(state, dialogue = null, duration = 3000) {
    this.state = state;
    if (dialogue) {
      this.dialogue = dialogue;
      this.dialogueTimer = duration;
    }
  }

  say(text, duration = 3500) {
    this.dialogue = text;
    this.dialogueTimer = duration;
  }

  clearDialogue() {
    this.dialogue = "";
    this.dialogueTimer = 0;
  }

  update(dt) {
    this.timer += dt;
    this.blinkTimer += dt;

    if (this.blinkTimer > 3500) {
      this.isBlinking = true;
      if (this.blinkTimer > 3700) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.dialogue = "";
      }
    }

    // State specific animations
    if (this.state === 'celebrating' || this.state === 'happy') {
      this.jumpY = Math.abs(Math.sin(this.timer * 0.008)) * -25;
      this.armAngle = Math.sin(this.timer * 0.01) * 0.5;
    } else if (this.state === 'cooking') {
      this.jumpY = Math.sin(this.timer * 0.005) * 4;
      this.armAngle = Math.sin(this.timer * 0.015) * 0.8;
    } else if (this.state === 'confused' || this.state === 'sad') {
      this.jumpY = Math.sin(this.timer * 0.002) * 3;
      this.armAngle = -0.3;
    } else {
      // Idle breathing bounce
      this.jumpY = Math.sin(this.timer * 0.003) * 5;
      this.armAngle = Math.sin(this.timer * 0.003) * 0.1;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + this.jumpY);
    ctx.scale(this.scale, this.scale);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 75 - this.jumpY * 0.5, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body segments (cute caterpillar/bug shape)
    // Lower body (rear)
    ctx.fillStyle = "#66BB6A"; // bright bug green
    ctx.beginPath();
    ctx.ellipse(25, 45, 22, 20, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Middle body
    ctx.fillStyle = "#81C784";
    ctx.beginPath();
    ctx.ellipse(5, 38, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chef Apron / Coat on body
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(-22, 20, 44, 38, 8);
    ctx.fill();
    ctx.strokeStyle = "#B0BEC5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Apron buttons & pocket
    ctx.fillStyle = "#D32F2F";
    ctx.beginPath();
    ctx.arc(-5, 32, 2.5, 0, Math.PI * 2);
    ctx.arc(-5, 42, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Red neckerchief (scarf)
    ctx.fillStyle = "#E53935";
    ctx.beginPath();
    ctx.moveTo(-16, 18);
    ctx.lineTo(16, 18);
    ctx.lineTo(8, 28);
    ctx.lineTo(0, 24);
    ctx.lineTo(-8, 28);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = "#81C784";
    ctx.beginPath();
    ctx.arc(0, -5, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = "rgba(255, 138, 128, 0.65)";
    ctx.beginPath();
    ctx.arc(-22, 2, 7, 0, Math.PI * 2);
    ctx.arc(22, 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    this.renderAntennae(ctx);

    // Chef Hat (Toque)
    this.renderChefHat(ctx);

    // Face features based on expression
    this.renderFace(ctx);

    // Little hands / arms
    this.renderArms(ctx);

    ctx.restore();

    // Speech bubble if dialogue active
    if (this.dialogue) {
      this.renderSpeechBubble(ctx);
    }
  }

  renderAntennae(ctx) {
    const sway = Math.sin(this.timer * 0.005) * 4;
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Left antenna
    ctx.beginPath();
    ctx.moveTo(-14, -38);
    ctx.quadraticCurveTo(-26 + sway, -58, -32 + sway, -68);
    ctx.stroke();

    ctx.fillStyle = "#C8E6C9";
    ctx.beginPath();
    ctx.arc(-32 + sway, -68, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right antenna
    ctx.beginPath();
    ctx.moveTo(14, -38);
    ctx.quadraticCurveTo(26 - sway, -58, 32 - sway, -68);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(32 - sway, -68, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  renderChefHat(ctx) {
    // Hat base
    ctx.fillStyle = "#F5F5F5";
    ctx.strokeStyle = "#CFD8DC";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(-24, -48, 48, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Hat puffs
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(-18, -62, 16, 0, Math.PI * 2);
    ctx.arc(0, -74, 20, 0, Math.PI * 2);
    ctx.arc(18, -62, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Little badge on hat (gear/bug icon)
    ctx.fillStyle = "#FFB300";
    ctx.beginPath();
    ctx.arc(0, -40, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFace(ctx) {
    const eyeY = -8;

    if (this.isBlinking && this.state !== 'sad' && this.state !== 'confused') {
      // Blinking eyes
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-18, eyeY);
      ctx.lineTo(-8, eyeY);
      ctx.moveTo(8, eyeY);
      ctx.lineTo(18, eyeY);
      ctx.stroke();
    } else if (this.state === 'happy' || this.state === 'celebrating') {
      // Happy curved eyes ^ ^
      ctx.strokeStyle = "#1B5E20";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(-13, eyeY, 7, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(13, eyeY, 7, Math.PI, 0, false);
      ctx.stroke();

      // Big happy smile
      ctx.fillStyle = "#D32F2F";
      ctx.beginPath();
      ctx.arc(0, 6, 12, 0, Math.PI, false);
      ctx.fill();
      ctx.stroke();
    } else if (this.state === 'surprised') {
      // Big round eyes O O
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-13, eyeY, 9, 0, Math.PI * 2);
      ctx.arc(13, eyeY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(-13, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(13, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // O mouth
      ctx.fillStyle = "#D32F2F";
      ctx.beginPath();
      ctx.arc(0, 10, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'confused') {
      // One eye squint, one wide
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-13, eyeY - 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(-13, eyeY - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Squint right eye
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, eyeY);
      ctx.lineTo(18, eyeY + 2);
      ctx.stroke();

      // Wavy mouth
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.quadraticCurveTo(0, 4, 8, 8);
      ctx.stroke();
    } else if (this.state === 'sad') {
      // Droopy eyes
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-13, eyeY, 7, 0, Math.PI * 2);
      ctx.arc(13, eyeY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(-13, eyeY + 2, 3, 0, Math.PI * 2);
      ctx.arc(13, eyeY + 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Sad frown
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 14, 8, Math.PI, 0, true);
      ctx.stroke();

      // Sweat/tear drop
      ctx.fillStyle = "#42A5F5";
      ctx.beginPath();
      ctx.arc(22, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal friendly smile & normal eyes
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-13, eyeY, 7, 0, Math.PI * 2);
      ctx.arc(13, eyeY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pupils looking slightly towards kitchen center
      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(-11, eyeY, 3.5, 0, Math.PI * 2);
      ctx.arc(15, eyeY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupil gleam
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-12, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.arc(14, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute smile
      ctx.strokeStyle = "#1B5E20";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 6, 8, 0.2, Math.PI - 0.2, false);
      ctx.stroke();
    }
  }

  renderArms(ctx) {
    ctx.save();
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // Left arm
    ctx.beginPath();
    ctx.moveTo(-20, 32);
    ctx.lineTo(-34, 30 + this.armAngle * 15);
    ctx.stroke();

    // Right arm holding wooden spoon
    ctx.beginPath();
    ctx.moveTo(20, 32);
    ctx.lineTo(36, 28 - this.armAngle * 15);
    ctx.stroke();

    // Wooden spoon
    ctx.save();
    ctx.translate(36, 28 - this.armAngle * 15);
    ctx.rotate(0.4 + this.armAngle);
    ctx.strokeStyle = "#8D6E63";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -20);
    ctx.stroke();

    // Spoon scoop
    ctx.fillStyle = "#A1887F";
    ctx.beginPath();
    ctx.ellipse(0, -22, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  renderSpeechBubble(ctx) {
    ctx.save();
    const maxTextWidth = 240;

    ctx.font = "bold 13px 'Segoe UI', Tahoma, sans-serif";
    const words = this.dialogue.split(" ");
    const lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const lineHeight = 18;
    const padding = 12;
    const boxWidth = Math.min(260, Math.max(160, maxTextWidth + padding * 2));
    const boxHeight = lines.length * lineHeight + padding * 2;

    // Smart positioning:
    // If Chef Bug is on the right half of the canvas (x > 700), place bubble to his LEFT.
    // If on the left half, place bubble to his RIGHT.
    const isRightSide = (this.x > 700);
    let bubbleX = isRightSide ? (this.x - boxWidth - 32) : (this.x + 35);
    let bubbleY = this.y - 120 + this.jumpY;

    // Strict boundary clamping so bubble NEVER clips on any screen
    bubbleX = Math.max(16, Math.min(1280 - boxWidth - 16, bubbleX));
    bubbleY = Math.max(16, Math.min(720 - boxHeight - 16, bubbleY));

    // Bubble Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.beginPath();
    ctx.roundRect(bubbleX + 3, bubbleY + 3, boxWidth, boxHeight, 10);
    ctx.fill();

    // Bubble Body
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#37474F";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Bubble Tail pointing towards Chef Bug's head
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    if (isRightSide) {
      // Tail on the right side of the bubble pointing toward Chef Bug
      const tailBaseY = bubbleY + Math.min(boxHeight - 15, Math.max(15, boxHeight * 0.5));
      ctx.moveTo(bubbleX + boxWidth, tailBaseY - 8);
      ctx.lineTo(this.x - 12, this.y - 15);
      ctx.lineTo(bubbleX + boxWidth, tailBaseY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clean seam
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(bubbleX + boxWidth - 2, tailBaseY - 7, 4, 18);
    } else {
      // Tail on the bottom-left pointing to Chef Bug
      ctx.moveTo(bubbleX + 15, bubbleY + boxHeight);
      ctx.lineTo(bubbleX - 12, bubbleY + boxHeight + 15);
      ctx.lineTo(bubbleX + 28, bubbleY + boxHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clean seam
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(bubbleX + 14, bubbleY + boxHeight - 2, 15, 4);
    }

    // Text inside bubble
    ctx.fillStyle = "#263238";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], bubbleX + padding, bubbleY + padding + i * lineHeight);
    }

    ctx.restore();
  }
};
