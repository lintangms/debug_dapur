/**
 * DEBUG DAPUR - Ingredients & Trays
 * Interactive ingredient items with procedural Canvas vector icons (No blurry emojis!).
 */

window.DebugDapur = window.DebugDapur || {};
window.DebugDapur.Objects = window.DebugDapur.Objects || {};

window.DebugDapur.Objects.Ingredients = class Ingredients {
  constructor(x, y, width = 480, height = 95) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.items = [];
    this.activeIngredients = [];
    this.draggedItem = null;
    this.hoveredItem = null;
  }

  setAvailableIngredients(list) {
    this.activeIngredients = list;
    this.items = [];

    const itemDefs = {
      water: { id: "water", name: "Air Bersih", color: "#E1F5FE", iconType: "water" },
      noodles: { id: "noodles", name: "Mie Instan", color: "#FFF8E1", iconType: "noodles" },
      seasoning: { id: "seasoning", name: "Bumbu Gurih", color: "#FBE9E7", iconType: "seasoning" },
      oil: { id: "oil", name: "Minyak Goreng", color: "#FFFDE7", iconType: "oil" },
      egg: { id: "egg", name: "Telur Ayam", color: "#FFFDE7", iconType: "egg" },
      rice: { id: "rice", name: "Nasi Putih", color: "#F5F5F5", iconType: "rice" },
      sauce: { id: "sauce", name: "Kecap Manis", color: "#EFEBE9", iconType: "sauce" },
      chicken: { id: "chicken", name: "Ayam Marinasi", color: "#FBE9E7", iconType: "chicken" }
    };

    const count = list.length;
    const slotWidth = this.width / Math.max(1, count);

    list.forEach((key, idx) => {
      const def = itemDefs[key];
      if (def) {
        this.items.push({
          id: def.id,
          name: def.name,
          color: def.color,
          iconType: def.iconType,
          x: this.x + slotWidth * (idx + 0.5),
          y: this.y + this.height * 0.48,
          radius: 26,
          scale: 1.0
        });
      }
    });
  }

  getItemAt(px, py) {
    for (let item of this.items) {
      const dx = px - item.x;
      const dy = py - item.y;
      if (dx * dx + dy * dy <= item.radius * item.radius) {
        return item;
      }
    }
    return null;
  }

  render(ctx) {
    ctx.save();

    // Shelf Tray Drop Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.roundRect(this.x + 4, this.y + 4, this.width, this.height, 12);
    ctx.fill();

    // Wooden Tray Frame
    const trayGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    trayGrad.addColorStop(0, "#6D4C41");
    trayGrad.addColorStop(0.2, "#8D6E63");
    trayGrad.addColorStop(1, "#4E342E");

    ctx.fillStyle = trayGrad;
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 12);
    ctx.fill();
    ctx.stroke();

    // Inner tray bed
    ctx.fillStyle = "#3E2723";
    ctx.beginPath();
    ctx.roundRect(this.x + 8, this.y + 18, this.width - 16, this.height - 26, 8);
    ctx.fill();

    // Title label on top rim
    ctx.font = "bold 10px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#D7CCC8";
    ctx.textAlign = "center";
    ctx.fillText("RAK BAHAN MAKANAN", this.x + this.width * 0.5, this.y + 13);

    // Render each ingredient item slot
    this.items.forEach(item => {
      const isHovered = (this.hoveredItem === item);

      // Ceramic saucer plate
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.arc(item.x, item.y + 2, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isHovered ? "#FF9800" : "#B0BEC5";
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.stroke();

      // Ingredient base circle
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();

      // Procedural Vector Icon
      this.renderVectorIcon(ctx, item.iconType, item.x, item.y - 1);

      // Name label
      ctx.font = "bold 9px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(item.name, item.x, item.y + item.radius * 0.65);
    });

    ctx.restore();
  }

  renderVectorIcon(ctx, type, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    if (type === "water") {
      // Clean teardrop shape
      ctx.fillStyle = "#0288D1";
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.bezierCurveTo(7, -2, 9, 4, 9, 7);
      ctx.arc(0, 7, 9, 0, Math.PI);
      ctx.bezierCurveTo(-9, 4, -7, -2, 0, -11);
      ctx.closePath();
      ctx.fill();

      // Highlight shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(-3, 6, 2, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "noodles") {
      // Noodle block / bowl
      ctx.fillStyle = "#E65100";
      ctx.beginPath();
      ctx.roundRect(-10, -3, 20, 14, [2, 2, 8, 8]);
      ctx.fill();

      // Wavy golden noodles on top
      ctx.strokeStyle = "#FDD835";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, -4);
      ctx.quadraticCurveTo(-4, -9, 0, -4);
      ctx.quadraticCurveTo(5, -9, 9, -4);
      ctx.stroke();

      // Chopsticks
      ctx.strokeStyle = "#8D6E63";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(10, 2);
      ctx.stroke();
    } else if (type === "seasoning") {
      // Spice shaker bottle
      ctx.fillStyle = "#78909C";
      ctx.beginPath();
      ctx.roundRect(-6, -10, 12, 5, 2);
      ctx.fill();

      ctx.fillStyle = "#FF7043";
      ctx.beginPath();
      ctx.roundRect(-8, -5, 16, 17, 3);
      ctx.fill();

      // Shaker holes
      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.arc(-2, -8, 0.9, 0, Math.PI * 2);
      ctx.arc(2, -8, 0.9, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "oil") {
      // Golden oil bottle
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.roundRect(-3, -11, 6, 6, 1);
      ctx.fill();

      ctx.fillStyle = "#FBC02D";
      ctx.beginPath();
      ctx.roundRect(-7, -5, 14, 16, 4);
      ctx.fill();

      // Oil level inside
      ctx.fillStyle = "#F57F17";
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 9, 2);
      ctx.fill();
    } else if (type === "egg") {
      // Egg shape
      ctx.fillStyle = "#FFA726";
      ctx.beginPath();
      ctx.ellipse(0, 1, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.ellipse(-2, -3, 2, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "rice") {
      // Rice bowl
      ctx.fillStyle = "#37474F";
      ctx.beginPath();
      ctx.arc(0, 4, 10, 0, Math.PI);
      ctx.fill();

      // Rice mound
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 4, 9, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(-4, 0, 3, 1.5);
      ctx.fillRect(1, 2, 3, 1.5);
    } else if (type === "sauce") {
      // Soy sauce bottle
      ctx.fillStyle = "#D32F2F"; // red cap
      ctx.beginPath();
      ctx.roundRect(-3, -11, 6, 5, 1);
      ctx.fill();

      ctx.fillStyle = "#3E2723"; // dark sauce body
      ctx.beginPath();
      ctx.roundRect(-7, -6, 14, 18, 4);
      ctx.fill();

      // Label
      ctx.fillStyle = "#FFF9C4";
      ctx.fillRect(-5, 0, 10, 6);
    } else if (type === "chicken") {
      // Drumstick meat
      ctx.fillStyle = "#E65100";
      ctx.beginPath();
      ctx.ellipse(-2, -1, 9, 7, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Bone
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.roundRect(4, 2, 7, 4, 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
