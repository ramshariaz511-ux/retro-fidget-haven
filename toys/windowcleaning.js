/**
 * WINDOW CLEANING & CONDENSATION SQUEEGEE TOY
 * Rainy night pixel city skyline, thick steamy window condensation,
 * rubber squeegee wiping mechanics with authentic squeaks, and finger doodle steam art.
 */

class WindowCleaningToy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.currentTool = 'squeegee'; // 'squeegee', 'finger'
    this.isWiping = false;
    this.lastX = 0;
    this.lastY = 0;
    this.lastWipeAudio = 0;

    // Raindrops running down glass
    this.raindrops = [];

    // Offscreen condensation fog canvas
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = this.width;
    this.fogCanvas.height = this.height;
    this.fogCtx = this.fogCanvas.getContext('2d');

    // Cityscape background pre-render
    this.initCityScape();
    this.breatheFog();
    this.initRain();
    this.initEvents();
    this.initControls();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCityScape() {
    this.cityCanvas = document.createElement('canvas');
    this.cityCanvas.width = this.width;
    this.cityCanvas.height = this.height;
    const cCtx = this.cityCanvas.getContext('2d');

    // Twilight dark gradient
    const skyGrad = cCtx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#0a0d18');
    skyGrad.addColorStop(0.6, '#181e30');
    skyGrad.addColorStop(1, '#2c223b');
    cCtx.fillStyle = skyGrad;
    cCtx.fillRect(0, 0, this.width, this.height);

    // Distant stars / moon
    cCtx.fillStyle = '#fff';
    for (let i = 0; i < 25; i++) {
      const sx = Math.random() * this.width;
      const sy = Math.random() * (this.height * 0.4);
      cCtx.fillRect(sx, sy, 2, 2);
    }

    // Moon
    cCtx.fillStyle = '#fef08a';
    cCtx.beginPath();
    cCtx.arc(this.width - 70, 50, 22, 0, Math.PI * 2);
    cCtx.fill();

    // Pixel Skyscrapers Silhouette
    const buildings = [
      { x: 10, w: 50, h: 140 },
      { x: 55, w: 70, h: 190 },
      { x: 120, w: 45, h: 120 },
      { x: 160, w: 60, h: 220 },
      { x: 215, w: 55, h: 160 },
      { x: 265, w: 75, h: 200 },
      { x: 335, w: 50, h: 150 },
      { x: 380, w: 60, h: 180 }
    ];

    buildings.forEach(b => {
      // Building body
      cCtx.fillStyle = '#11131a';
      cCtx.fillRect(b.x, this.height - b.h, b.w, b.h);

      // Glowing pixel windows
      for (let wy = this.height - b.h + 15; wy < this.height - 15; wy += 16) {
        for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 12) {
          if (Math.random() < 0.65) {
            cCtx.fillStyle = Math.random() < 0.5 ? '#ffe600' : '#00f0ff';
            cCtx.fillRect(wx, wy, 5, 8);
          }
        }
      }
    });

    // Window Frame Trim (Dark grey beveled wood/aluminum frame)
    cCtx.strokeStyle = '#22252e';
    cCtx.lineWidth = 14;
    cCtx.strokeRect(0, 0, this.width, this.height);
  }

  initRain() {
    this.raindrops = [];
    for (let i = 0; i < 40; i++) {
      this.raindrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 8 + Math.random() * 14,
        speed: 4 + Math.random() * 6
      });
    }
  }

  breatheFog() {
    const fCtx = this.fogCtx;
    fCtx.clearRect(0, 0, this.width, this.height);

    // Thick translucent steam layer
    fCtx.fillStyle = 'rgba(215, 230, 245, 0.88)';
    fCtx.fillRect(0, 0, this.width, this.height);

    // Micro condensation texture specks
    fCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      fCtx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    if (window.retroAudio) {
      window.retroAudio.playPop(1.1);
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  wipe(x, y, lx, ly) {
    const fCtx = this.fogCtx;
    fCtx.save();
    fCtx.globalCompositeOperation = 'destination-out';

    if (this.currentTool === 'squeegee') {
      // Wide rubber blade stroke (50px wide horizontal wiper)
      const squeegeeWidth = 52;
      fCtx.lineWidth = squeegeeWidth;
      fCtx.lineCap = 'square';
      fCtx.beginPath();
      fCtx.moveTo(lx, ly);
      fCtx.lineTo(x, y);
      fCtx.stroke();

    } else if (this.currentTool === 'finger') {
      // Finger doodle line
      fCtx.lineWidth = 14;
      fCtx.lineCap = 'round';
      fCtx.lineJoin = 'round';
      fCtx.beginPath();
      fCtx.moveTo(lx, ly);
      fCtx.lineTo(x, y);
      fCtx.stroke();
    }

    fCtx.restore();

    // Squeegee / finger squeak sound
    const now = Date.now();
    if (now - this.lastWipeAudio > 140 && window.retroAudio) {
      this.lastWipeAudio = now;
      window.retroAudio.playSqueegeeWipe();
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
      this.isWiping = true;
      this.lastX = pos.x;
      this.lastY = pos.y;
      this.wipe(pos.x, pos.y, pos.x, pos.y);
    };

    const onMove = (e) => {
      if (!this.isWiping) return;
      e.preventDefault();
      const pos = getPos(e);
      this.wipe(pos.x, pos.y, this.lastX, this.lastY);
      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const onEnd = () => {
      this.isWiping = false;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  initControls() {
    const toolBtns = document.querySelectorAll('.window-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.setTool(btn.dataset.tool);
      });
    });

    const breathBtn = document.getElementById('window-breathe-btn');
    if (breathBtn) {
      breathBtn.addEventListener('click', () => this.breatheFog());
    }
  }

  animate() {
    this.updateRain();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  updateRain() {
    this.raindrops.forEach(r => {
      r.y += r.speed;
      r.x -= 0.5; // slight wind
      if (r.y > this.height) {
        r.y = -r.len;
        r.x = Math.random() * this.width;
      }
    });
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Cityscape background
    ctx.drawImage(this.cityCanvas, 0, 0);

    // 2. Draw Falling Rain streaks in the background
    ctx.strokeStyle = 'rgba(165, 215, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.raindrops.forEach(r => {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 1, r.y + r.len);
    });
    ctx.stroke();

    // 3. Draw Steam Condensation Layer on the glass
    ctx.drawImage(this.fogCanvas, 0, 0);

    // 4. Window Frame Crossbar & Bevel
    ctx.strokeStyle = '#181b22';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, this.width - 8, this.height - 8);

    ctx.fillStyle = '#222630';
    ctx.fillRect(this.width / 2 - 3, 0, 6, this.height); // vertical divider
  }
}

window.WindowCleaningToy = WindowCleaningToy;
