/**
 * WALL PAINTING & GRAFFITI ROLLER TOY
 * Canvas-based brick wall painting: satisfying wide paint rollers, aerosol spray cans
 * with realistic hiss & drip physics, stencils, and power-wash clean.
 */

class WallPaintingToy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.currentTool = 'roller'; // 'roller', 'spray', 'washer'
    this.currentColor = '#00f0ff'; // Neon Cyan default
    this.brushSize = 36; // Roller width

    this.isPainting = false;
    this.lastX = 0;
    this.lastY = 0;

    // Drips collection
    this.drips = [];

    // Paint layer offscreen canvas
    this.paintCanvas = document.createElement('canvas');
    this.paintCanvas.width = this.width;
    this.paintCanvas.height = this.height;
    this.paintCtx = this.paintCanvas.getContext('2d');

    // Brick wall background pre-render
    this.initBrickWall();
    this.initEvents();
    this.initControls();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initBrickWall() {
    this.brickCanvas = document.createElement('canvas');
    this.brickCanvas.width = this.width;
    this.brickCanvas.height = this.height;
    const bCtx = this.brickCanvas.getContext('2d');

    // Dark vintage mortar
    bCtx.fillStyle = '#181a1f';
    bCtx.fillRect(0, 0, this.width, this.height);

    const brickW = 48;
    const brickH = 22;
    const mortar = 4;

    for (let y = 0; y < this.height; y += brickH + mortar) {
      const rowIndex = Math.floor(y / (brickH + mortar));
      const xOffset = (rowIndex % 2) * (brickW / 2);

      for (let x = -brickW; x < this.width + brickW; x += brickW + mortar) {
        const px = x + xOffset;

        // Brick color variation (Dark slate retro brick)
        const tone = 36 + Math.floor(Math.random() * 12);
        bCtx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 10})`;
        bCtx.fillRect(px, y, brickW, brickH);

        // Brick pixel highlight & shadow
        bCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        bCtx.fillRect(px, y, brickW, 2);
        bCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        bCtx.fillRect(px, y + brickH - 2, brickW, 2);
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  setColor(color) {
    this.currentColor = color;
    if (window.retroAudio) window.retroAudio.playSwitch('panda');
  }

  clearWall() {
    this.paintCtx.clearRect(0, 0, this.width, this.height);
    this.drips = [];
    if (window.retroAudio) window.retroAudio.playPageTurn();
  }

  paintStroke(x, y, lx, ly) {
    const pCtx = this.paintCtx;

    if (this.currentTool === 'roller') {
      pCtx.save();
      pCtx.strokeStyle = this.currentColor;
      pCtx.lineWidth = this.brushSize;
      pCtx.lineCap = 'butt';
      pCtx.lineJoin = 'round';

      pCtx.beginPath();
      pCtx.moveTo(lx, ly);
      pCtx.lineTo(x, y);
      pCtx.stroke();

      // Roller texture speckles at edges
      for (let i = 0; i < 4; i++) {
        const offsetX = (Math.random() - 0.5) * this.brushSize;
        const offsetY = (Math.random() - 0.5) * this.brushSize;
        pCtx.fillStyle = this.currentColor;
        pCtx.fillRect(x + offsetX, y + offsetY, 3, 3);
      }
      pCtx.restore();

      if (Math.random() < 0.2 && window.retroAudio) {
        window.retroAudio.playWoodSlice();
      }

    } else if (this.currentTool === 'spray') {
      pCtx.save();
      const radius = 24;
      const density = 25;

      for (let i = 0; i < density; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 1.6) * radius;
        const dotX = x + Math.cos(a) * r;
        const dotY = y + Math.sin(a) * r;

        pCtx.fillStyle = this.currentColor;
        pCtx.globalAlpha = 0.25 + Math.random() * 0.4;
        pCtx.fillRect(Math.floor(dotX), Math.floor(dotY), 2, 2);
      }
      pCtx.restore();

      // Chance of paint drip
      if (Math.random() < 0.04) {
        this.drips.push({
          x: x + (Math.random() * 8 - 4),
          y: y,
          speed: 0.8 + Math.random() * 1.5,
          length: 0,
          maxLength: 25 + Math.random() * 60,
          color: this.currentColor,
          width: 2 + Math.random() * 2
        });
      }

    } else if (this.currentTool === 'washer') {
      // Power wash cleaner
      pCtx.save();
      pCtx.globalCompositeOperation = 'destination-out';
      pCtx.beginPath();
      pCtx.arc(x, y, 22, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
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
      this.isPainting = true;
      this.lastX = pos.x;
      this.lastY = pos.y;

      if (this.currentTool === 'spray' && window.retroAudio) {
        window.retroAudio.startSprayHiss();
      } else if (this.currentTool === 'washer' && window.retroAudio) {
        window.retroAudio.startWaterPressure();
      }

      this.paintStroke(pos.x, pos.y, pos.x, pos.y);
    };

    const onMove = (e) => {
      if (!this.isPainting) return;
      e.preventDefault();
      const pos = getPos(e);

      this.paintStroke(pos.x, pos.y, this.lastX, this.lastY);
      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const onEnd = () => {
      this.isPainting = false;
      if (window.retroAudio) {
        window.retroAudio.stopSprayHiss();
        window.retroAudio.stopWaterPressure();
      }
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  initControls() {
    // Tool buttons
    const toolBtns = document.querySelectorAll('.wall-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setTool(btn.dataset.tool);
      });
    });

    // Color swatches
    const colorBtns = document.querySelectorAll('.wall-color-swatch');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setColor(btn.dataset.color);
      });
    });

    // Clean button
    const cleanBtn = document.getElementById('wall-clean-btn');
    if (cleanBtn) {
      cleanBtn.addEventListener('click', () => this.clearWall());
    }
  }

  animate() {
    this.updateDrips();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  updateDrips() {
    const pCtx = this.paintCtx;
    for (let i = this.drips.length - 1; i >= 0; i--) {
      const d = this.drips[i];
      if (d.length < d.maxLength) {
        pCtx.save();
        pCtx.fillStyle = d.color;
        pCtx.fillRect(Math.floor(d.x), Math.floor(d.y + d.length), d.width, d.speed + 1);
        pCtx.restore();

        d.length += d.speed;
        d.speed *= 0.985;
      } else {
        this.drips.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Brick Wall background
    ctx.drawImage(this.brickCanvas, 0, 0);

    // 2. Draw Painted layer
    ctx.drawImage(this.paintCanvas, 0, 0);

    // 3. Vintage vignette shadow
    ctx.save();
    const grad = ctx.createRadialGradient(this.width/2, this.height/2, this.width*0.35, this.width/2, this.height/2, this.width*0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}

window.WallPaintingToy = WallPaintingToy;
