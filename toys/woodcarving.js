/**
 * WOOD CARVING & WHITTLING TOY
 * Canvas-based whittling simulation: slice curved wood shavings off timber blocks,
 * chisel grooves, buff with sanding sponge, and reveal hand-carved pixel artifacts!
 */

class WoodCarvingToy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.tool = 'knife'; // 'knife', 'chisel', 'sandpaper'
    this.woodType = 'pine'; // 'pine', 'mahogany', 'birch'

    // Carving canvas dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.isCarving = false;
    this.lastX = 0;
    this.lastY = 0;
    this.shavings = []; // fluttering wood flakes
    this.chipsCount = 0;

    // Secret silhouette to reveal (optional guide)
    this.revealMode = 'duck'; // 'duck', 'heart', 'freeform'

    this.initWoodBlock();
    this.initEvents();
    this.initControls();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initWoodBlock() {
    // We maintain an offscreen canvas for the wood block to allow pixel-perfect carving
    this.woodCanvas = document.createElement('canvas');
    this.woodCanvas.width = this.width;
    this.woodCanvas.height = this.height;
    this.woodCtx = this.woodCanvas.getContext('2d');

    const wCtx = this.woodCtx;
    const bx = 60, by = 50, bw = this.width - 120, bh = this.height - 100;

    // Choose base wood colors
    const colors = {
      pine: { base: '#d4a373', grain: '#bc6c25', bark: '#603813' },
      mahogany: { base: '#8b4513', grain: '#582f0e', bark: '#331800' },
      birch: { base: '#eddcd2', grain: '#ddbea9', bark: '#7f5539' }
    }[this.woodType];

    // Clear and draw wood block
    wCtx.clearRect(0, 0, this.width, this.height);

    // Draw wood grain
    wCtx.fillStyle = colors.base;
    wCtx.fillRect(bx, by, bw, bh);

    // Grain lines
    wCtx.strokeStyle = colors.grain;
    wCtx.lineWidth = 2;
    for (let y = by + 10; y < by + bh; y += 14) {
      wCtx.beginPath();
      wCtx.moveTo(bx, y);
      for (let x = bx; x < bx + bw; x += 20) {
        wCtx.lineTo(x, y + Math.sin(x * 0.04) * 4);
      }
      wCtx.stroke();
    }

    // Outer bark edge
    wCtx.lineWidth = 12;
    wCtx.strokeStyle = colors.bark;
    wCtx.strokeRect(bx, by, bw, bh);

    // Pixelated bark bevel
    wCtx.lineWidth = 3;
    wCtx.strokeStyle = '#000';
    wCtx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);
  }

  setTool(toolName) {
    this.tool = toolName;
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  setWood(woodName) {
    this.woodType = woodName;
    this.initWoodBlock();
    if (window.retroAudio) window.retroAudio.playSwitch('panda');
  }

  resetBlock() {
    this.shavings = [];
    this.chipsCount = 0;
    this.initWoodBlock();
    const countElem = document.getElementById('wood-chips-count');
    if (countElem) countElem.textContent = '0';
    if (window.retroAudio) window.retroAudio.playPageTurn();
  }

  carveAt(x, y, dx, dy) {
    const wCtx = this.woodCtx;
    wCtx.save();

    if (this.tool === 'knife') {
      // Whittling blade: peels a thin slice
      wCtx.globalCompositeOperation = 'destination-out';
      wCtx.beginPath();
      wCtx.ellipse(x, y, 16, 8, Math.atan2(dy, dx), 0, Math.PI * 2);
      wCtx.fill();

      // Spawn curling shaving particle
      this.spawnShaving(x, y, dx, dy);
      if (Math.random() < 0.35 && window.retroAudio) {
        window.retroAudio.playWoodSlice();
      }

    } else if (this.tool === 'chisel') {
      // Chisel: deeper gouge
      wCtx.globalCompositeOperation = 'destination-out';
      wCtx.beginPath();
      wCtx.arc(x, y, 18, 0, Math.PI * 2);
      wCtx.fill();

      this.spawnShaving(x, y, dx * 1.5, dy * 1.5);
      if (Math.random() < 0.45 && window.retroAudio) {
        window.retroAudio.playWoodSlice();
      }

    } else if (this.tool === 'sandpaper') {
      // Sandpaper: smooths and softens edges
      wCtx.globalCompositeOperation = 'source-over';
      wCtx.fillStyle = 'rgba(255, 235, 180, 0.08)';
      wCtx.beginPath();
      wCtx.arc(x, y, 22, 0, Math.PI * 2);
      wCtx.fill();

      if (Math.random() < 0.25 && window.retroAudio) {
        window.retroAudio.playSwitch('silent');
      }
    }

    wCtx.restore();

    this.chipsCount++;
    const countElem = document.getElementById('wood-chips-count');
    if (countElem) countElem.textContent = this.chipsCount;
  }

  spawnShaving(x, y, dx, dy) {
    const angle = Math.atan2(dy, dx) + (Math.random() * 0.8 - 0.4);
    const speed = 2 + Math.random() * 4;

    this.shavings.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // initial upward curl
      curlAngle: Math.random() * Math.PI,
      spinSpeed: (Math.random() * 0.2 - 0.1),
      life: 1.0,
      width: 14 + Math.random() * 10,
      height: 6 + Math.random() * 4,
      color: this.woodType === 'pine' ? '#e9c46a' : this.woodType === 'mahogany' ? '#bc6c25' : '#eddcd2'
    });

    if (this.shavings.length > 80) {
      this.shavings.shift();
    }
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: (clientX - rect.left) * (this.width / rect.width),
        y: (clientY - rect.top) * (this.height / rect.height)
      };
    };

    const onStart = (e) => {
      const pos = getPos(e);
      this.isCarving = true;
      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const onMove = (e) => {
      if (!this.isCarving) return;
      e.preventDefault();
      const pos = getPos(e);
      const dx = pos.x - this.lastX;
      const dy = pos.y - this.lastY;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const steps = Math.min(Math.floor(dist / 4), 6);
        for (let i = 0; i < steps; i++) {
          const interpX = this.lastX + (dx * i) / steps;
          const interpY = this.lastY + (dy * i) / steps;
          this.carveAt(interpX, interpY, dx, dy);
        }
        this.lastX = pos.x;
        this.lastY = pos.y;
      }
    };

    const onEnd = () => {
      this.isCarving = false;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  initControls() {
    // Tool selection buttons
    const toolBtns = document.querySelectorAll('.wood-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setTool(btn.dataset.tool);
      });
    });

    // Wood type selection buttons
    const woodBtns = document.querySelectorAll('.wood-type-btn');
    woodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        woodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setWood(btn.dataset.wood);
      });
    });

    // Reset button
    const resetBtn = document.getElementById('wood-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetBlock());
    }
  }

  animate() {
    this.updateShavings();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  updateShavings() {
    for (let i = this.shavings.length - 1; i >= 0; i--) {
      const s = this.shavings[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25; // gravity
      s.curlAngle += s.spinSpeed;
      s.life -= 0.015;

      // Rest on workbench bottom
      if (s.y > this.height - 18) {
        s.y = this.height - 18;
        s.vx *= 0.6;
        s.vy = 0;
      }

      if (s.life <= 0) {
        this.shavings.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Workbench Background (Dark retro carpenter mat)
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(0, 0, this.width, this.height);

    // Workbench grid
    ctx.strokeStyle = '#282c37';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 2. Secret carved sculpture outline underneath (Guide silhouette)
    this.drawSecretGuide(ctx);

    // 3. Draw carved wood block canvas on top
    ctx.drawImage(this.woodCanvas, 0, 0);

    // 4. Draw fluttering curly wood shavings
    this.shavings.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.curlAngle);
      ctx.globalAlpha = Math.max(0, s.life);

      // Curved curled wood flake
      ctx.beginPath();
      ctx.ellipse(0, 0, s.width / 2, s.height / 2, 0, 0, Math.PI * 1.5);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#4a2810';
      ctx.stroke();

      ctx.restore();
    });

    // 5. Workbench bottom edge
    ctx.fillStyle = '#121316';
    ctx.fillRect(0, this.height - 14, this.width, 14);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.height - 14);
    ctx.lineTo(this.width, this.height - 14);
    ctx.stroke();
  }

  drawSecretGuide(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;

    const cx = this.width / 2;
    const cy = this.height / 2;

    // Zen Wooden Duck Guide
    ctx.beginPath();
    // Duck body
    ctx.ellipse(cx - 10, cy + 20, 55, 32, 0, 0, Math.PI * 2);
    // Duck head
    ctx.arc(cx + 40, cy - 20, 22, 0, Math.PI * 2);
    // Duck beak
    ctx.moveTo(cx + 60, cy - 22);
    ctx.lineTo(cx + 80, cy - 18);
    ctx.lineTo(cx + 60, cy - 12);
    ctx.stroke();

    ctx.restore();
  }
}

window.WoodCarvingToy = WoodCarvingToy;
