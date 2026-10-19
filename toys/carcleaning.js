/**
 * RETRO CAR DETAILING & PRESSURE WASHER TOY
 * Multi-layer wash simulation: foam cannon, wash sponge, high-pressure rinse lance,
 * microfiber polish buffer with sparkle FX, and a real-time cleanliness meter!
 */

class CarCleaningToy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.currentTool = 'washer'; // 'foam', 'sponge', 'washer', 'buffer'
    this.isWashing = false;
    this.sparkles = [];
    this.cleanliness = 0;
    this.hasCelebrated = false;

    // Offscreen layers
    this.carCanvas = document.createElement('canvas');
    this.carCanvas.width = this.width;
    this.carCanvas.height = this.height;

    this.dirtCanvas = document.createElement('canvas');
    this.dirtCanvas.width = this.width;
    this.dirtCanvas.height = this.height;
    this.dirtCtx = this.dirtCanvas.getContext('2d');

    this.foamCanvas = document.createElement('canvas');
    this.foamCanvas.width = this.width;
    this.foamCanvas.height = this.height;
    this.foamCtx = this.foamCanvas.getContext('2d');

    this.initCarArtwork();
    this.splatterMud();
    this.initEvents();
    this.initControls();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCarArtwork() {
    const cCtx = this.carCanvas.getContext('2d');
    const cx = this.width / 2;
    const cy = this.height / 2 + 10;

    cCtx.clearRect(0, 0, this.width, this.height);

    // Draw Garage Bay Floor
    cCtx.fillStyle = '#1c1f26';
    cCtx.fillRect(0, 0, this.width, this.height);

    // Floor tiles
    cCtx.strokeStyle = '#282d38';
    cCtx.lineWidth = 2;
    for (let x = 0; x < this.width; x += 40) {
      cCtx.beginPath();
      cCtx.moveTo(x, cy + 50);
      cCtx.lineTo(x, this.height);
      cCtx.stroke();
    }
    cCtx.beginPath();
    cCtx.moveTo(0, cy + 50);
    cCtx.lineTo(this.width, cy + 50);
    cCtx.stroke();

    // Car Shadow
    cCtx.fillStyle = 'rgba(0,0,0,0.6)';
    cCtx.beginPath();
    cCtx.ellipse(cx, cy + 48, 140, 20, 0, 0, Math.PI * 2);
    cCtx.fill();

    // 1. Car Body - Vintage Sports Coupe (Electric Cyan / Deep Teal)
    cCtx.fillStyle = '#05a5b5';
    cCtx.beginPath();
    cCtx.roundRect(cx - 130, cy + 5, 260, 42, 6);
    cCtx.fill();

    // Car Cabin / Roof
    cCtx.fillStyle = '#07b8ca';
    cCtx.beginPath();
    cCtx.moveTo(cx - 85, cy + 5);
    cCtx.lineTo(cx - 50, cy - 35);
    cCtx.lineTo(cx + 45, cy - 35);
    cCtx.lineTo(cx + 85, cy + 5);
    cCtx.closePath();
    cCtx.fill();

    // Windows (Tinted glass)
    cCtx.fillStyle = '#14202c';
    cCtx.beginPath();
    cCtx.moveTo(cx - 45, cy - 30);
    cCtx.lineTo(cx - 75, cy + 2);
    cCtx.lineTo(cx + 75, cy + 2);
    cCtx.lineTo(cx + 40, cy - 30);
    cCtx.closePath();
    cCtx.fill();

    // Window Pillar
    cCtx.fillStyle = '#05a5b5';
    cCtx.fillRect(cx - 2, cy - 32, 6, 35);

    // Specular body reflection stripe
    cCtx.fillStyle = '#8cf5ff';
    cCtx.fillRect(cx - 120, cy + 10, 240, 4);

    // Headlights (Retro Pop-ups or Round lights)
    cCtx.fillStyle = '#ffe600';
    cCtx.fillRect(cx - 130, cy + 14, 10, 14);
    cCtx.fillStyle = '#ff2a85'; // Tail light
    cCtx.fillRect(cx + 120, cy + 14, 10, 14);

    // Chrome Bumpers
    cCtx.fillStyle = '#e2e8f0';
    cCtx.fillRect(cx - 134, cy + 26, 8, 16);
    cCtx.fillRect(cx + 126, cy + 26, 8, 16);

    // Wheels (Front & Rear)
    const drawWheel = (wx, wy) => {
      // Tire
      cCtx.fillStyle = '#0d0e12';
      cCtx.beginPath();
      cCtx.arc(wx, wy, 26, 0, Math.PI * 2);
      cCtx.fill();

      // Rim
      cCtx.fillStyle = '#cbd5e1';
      cCtx.beginPath();
      cCtx.arc(wx, wy, 15, 0, Math.PI * 2);
      cCtx.fill();

      // Hub
      cCtx.fillStyle = '#00f0ff';
      cCtx.beginPath();
      cCtx.arc(wx, wy, 6, 0, Math.PI * 2);
      cCtx.fill();
    };

    drawWheel(cx - 80, cy + 45);
    drawWheel(cx + 80, cy + 45);
  }

  splatterMud() {
    const dCtx = this.dirtCtx;
    dCtx.clearRect(0, 0, this.width, this.height);

    // Coat with thick mud layer
    dCtx.fillStyle = '#4a2f13';
    dCtx.fillRect(50, 70, this.width - 100, this.height - 120);

    // Mud texture specks and dark grime patches
    for (let i = 0; i < 400; i++) {
      const x = 50 + Math.random() * (this.width - 100);
      const y = 70 + Math.random() * (this.height - 120);
      const r = 5 + Math.random() * 22;

      dCtx.fillStyle = Math.random() < 0.5 ? '#36210b' : '#5e3e1c';
      dCtx.beginPath();
      dCtx.arc(x, y, r, 0, Math.PI * 2);
      dCtx.fill();
    }

    this.foamCtx.clearRect(0, 0, this.width, this.height);
    this.cleanliness = 0;
    this.hasCelebrated = false;
    this.updateCleanlinessMeter();
  }

  setTool(tool) {
    this.currentTool = tool;
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  applyCleaning(x, y) {
    if (this.currentTool === 'washer') {
      // Pressure washer: blasts off dirt & foam cleanly
      this.dirtCtx.save();
      this.dirtCtx.globalCompositeOperation = 'destination-out';
      this.dirtCtx.beginPath();
      this.dirtCtx.arc(x, y, 22, 0, Math.PI * 2);
      this.dirtCtx.fill();
      this.dirtCtx.restore();

      this.foamCtx.save();
      this.foamCtx.globalCompositeOperation = 'destination-out';
      this.foamCtx.beginPath();
      this.foamCtx.arc(x, y, 28, 0, Math.PI * 2);
      this.foamCtx.fill();
      this.foamCtx.restore();

    } else if (this.currentTool === 'foam') {
      // Snow Foam Cannon: sprays fluffy white suds
      this.foamCtx.save();
      this.foamCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      for (let i = 0; i < 6; i++) {
        const ox = (Math.random() - 0.5) * 35;
        const oy = (Math.random() - 0.5) * 35;
        const r = 8 + Math.random() * 12;
        this.foamCtx.beginPath();
        this.foamCtx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        this.foamCtx.fill();
      }
      this.foamCtx.restore();

      if (Math.random() < 0.2 && window.retroAudio) {
        window.retroAudio.playPop(2.0);
      }

    } else if (this.currentTool === 'sponge') {
      // Wash mitt / sponge: softens dirt and lathers
      this.dirtCtx.save();
      this.dirtCtx.globalCompositeOperation = 'destination-out';
      this.dirtCtx.beginPath();
      this.dirtCtx.arc(x, y, 14, 0, Math.PI * 2);
      this.dirtCtx.fill();
      this.dirtCtx.restore();

      if (Math.random() < 0.25 && window.retroAudio) {
        window.retroAudio.playSwitch('silent');
      }

    } else if (this.currentTool === 'buffer') {
      // Buffer / polish: spawn sparkling stars on clean paint
      if (Math.random() < 0.4) {
        this.spawnSparkle(x, y);
        if (Math.random() < 0.3 && window.retroAudio) {
          window.retroAudio.playChime();
        }
      }
    }

    this.checkCleanliness();
  }

  spawnSparkle(x, y) {
    this.sparkles.push({
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 16 - 8),
      size: 6 + Math.random() * 10,
      life: 1.0,
      color: Math.random() < 0.6 ? '#00f0ff' : '#ffffff'
    });
  }

  checkCleanliness() {
    // Sample a 10x10 grid on dirt canvas to calculate cleanliness
    const sampleSize = 10;
    const stepX = (this.width - 120) / sampleSize;
    const stepY = (this.height - 140) / sampleSize;
    let cleanPoints = 0;
    const totalPoints = sampleSize * sampleSize;

    const imgData = this.dirtCtx.getImageData(60, 70, this.width - 120, this.height - 140);
    const data = imgData.data;

    for (let sy = 0; sy < sampleSize; sy++) {
      for (let sx = 0; sx < sampleSize; sx++) {
        const px = Math.floor(sx * stepX);
        const py = Math.floor(sy * stepY);
        const index = (py * imgData.width + px) * 4;
        const alpha = data[index + 3];
        if (alpha < 50) cleanPoints++;
      }
    }

    this.cleanliness = Math.round((cleanPoints / totalPoints) * 100);
    this.updateCleanlinessMeter();

    if (this.cleanliness >= 95 && !this.hasCelebrated) {
      this.hasCelebrated = true;
      if (window.retroAudio) {
        window.retroAudio.playBigButtonBoom();
      }
      for (let i = 0; i < 20; i++) {
        this.spawnSparkle(this.width / 2 + (Math.random() * 200 - 100), this.height / 2 + (Math.random() * 60 - 30));
      }
    }
  }

  updateCleanlinessMeter() {
    const meter = document.getElementById('car-clean-percent');
    const bar = document.getElementById('car-clean-bar');
    if (meter) meter.textContent = `${this.cleanliness}%`;
    if (bar) bar.style.width = `${this.cleanliness}%`;
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
      this.isWashing = true;

      if (this.currentTool === 'washer' && window.retroAudio) {
        window.retroAudio.startWaterPressure();
      }

      this.applyCleaning(pos.x, pos.y);
    };

    const onMove = (e) => {
      if (!this.isWashing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.applyCleaning(pos.x, pos.y);
    };

    const onEnd = () => {
      this.isWashing = false;
      if (window.retroAudio) {
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
    const toolBtns = document.querySelectorAll('.car-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setTool(btn.dataset.tool);
      });
    });

    const mudBtn = document.getElementById('car-mud-btn');
    if (mudBtn) {
      mudBtn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playPop(0.8);
        this.splatterMud();
      });
    }
  }

  animate() {
    this.updateSparkles();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  updateSparkles() {
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.life -= 0.025;
      if (s.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw clean gleaming car base
    ctx.drawImage(this.carCanvas, 0, 0);

    // 2. Draw dirt / grime layer
    ctx.drawImage(this.dirtCanvas, 0, 0);

    // 3. Draw snow foam soap layer
    ctx.drawImage(this.foamCanvas, 0, 0);

    // 4. Draw sparkle stars
    this.sparkles.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;

      // 4-point pixel sparkle star
      const sz = s.size;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.3, -sz * 0.3);
      ctx.lineTo(sz, 0);
      ctx.lineTo(sz * 0.3, sz * 0.3);
      ctx.lineTo(0, sz);
      ctx.lineTo(-sz * 0.3, sz * 0.3);
      ctx.lineTo(-sz, 0);
      ctx.lineTo(-sz * 0.3, -sz * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }
}

window.CarCleaningToy = CarCleaningToy;
