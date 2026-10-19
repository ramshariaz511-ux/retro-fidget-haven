/**
 * FIDGET SPINNER TOY
 * High-precision angular physics, momentum flicking, customizable pixel skins,
 * RPM speedometer, and Web Audio API dynamic bearing whir.
 */

class FidgetSpinnerToy {
  constructor(canvasId, statsElements) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stats = statsElements;

    // Physics state
    this.angle = 0;
    this.angularVelocity = 0; // radians per frame
    this.friction = 0.993; // Ceramic bearing default
    this.maxVelocity = 0.85;

    // Stats
    this.totalRotations = 0;
    this.lastAngle = 0;
    this.peakRPM = 0;
    this.currentRPM = 0;
    this.isSpinning = false;
    this.spinStartTime = null;

    // Interaction state
    this.isDragging = false;
    this.lastPointerAngle = 0;
    this.pointerVelocities = [];
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) * 0.82;

    // Customization
    this.currentSkin = 'classic'; // 'classic', 'shuriken', 'neon', 'clockwork'
    this.bearingType = 'ceramic'; // 'ceramic', 'steel', 'heavy'

    this.initEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setSkin(skinName) {
    this.currentSkin = skinName;
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  setBearing(bearingName) {
    this.bearingType = bearingName;
    if (bearingName === 'ceramic') this.friction = 0.994;
    else if (bearingName === 'steel') this.friction = 0.988;
    else if (bearingName === 'heavy') this.friction = 0.981;
    if (window.retroAudio) window.retroAudio.playSwitch('panda');
  }

  flick(direction = 1, impulse = 0.45) {
    this.angularVelocity += direction * impulse;
    if (Math.abs(this.angularVelocity) > this.maxVelocity) {
      this.angularVelocity = Math.sign(this.angularVelocity) * this.maxVelocity;
    }
    if (!this.isSpinning) {
      this.isSpinning = true;
      this.spinStartTime = Date.now();
    }
    if (window.retroAudio) window.retroAudio.playPop(1.4);
  }

  stop() {
    this.angularVelocity = 0;
    this.currentRPM = 0;
    if (window.retroAudio) {
      window.retroAudio.stopSpinnerWhir();
      window.retroAudio.playSwitch('thock');
    }
  }

  getPointerAngle(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX - this.centerX;
    const y = (clientY - rect.top) * scaleY - this.centerY;
    return Math.atan2(y, x);
  }

  getPointerDist(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX - this.centerX;
    const y = (clientY - rect.top) * scaleY - this.centerY;
    return Math.sqrt(x * x + y * y);
  }

  initEvents() {
    const onStart = (e) => {
      const dist = this.getPointerDist(e);
      // Bearing cap click
      if (dist < 32) {
        if (window.retroAudio) window.retroAudio.playPop(1.8);
        return;
      }
      if (dist > this.radius * 1.25) return;

      this.isDragging = true;
      this.lastPointerAngle = this.getPointerAngle(e);
      this.pointerVelocities = [];
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const currentAngle = this.getPointerAngle(e);
      let diff = currentAngle - this.lastPointerAngle;

      // Handle -PI to PI wrap
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      this.angle += diff;
      this.pointerVelocities.push(diff);
      if (this.pointerVelocities.length > 5) this.pointerVelocities.shift();

      this.lastPointerAngle = currentAngle;
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      if (this.pointerVelocities.length > 0) {
        const avgVel = this.pointerVelocities.reduce((a, b) => a + b, 0) / this.pointerVelocities.length;
        this.angularVelocity = avgVel * 1.4;
        if (Math.abs(this.angularVelocity) > this.maxVelocity) {
          this.angularVelocity = Math.sign(this.angularVelocity) * this.maxVelocity;
        }
      }
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    // Mouse wheel to spin
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const impulse = e.deltaY > 0 ? 0.08 : -0.08;
      this.flick(impulse > 0 ? 1 : -1, Math.abs(impulse));
    }, { passive: false });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  update() {
    if (!this.isDragging) {
      this.angle += this.angularVelocity;
      this.angularVelocity *= this.friction;

      if (Math.abs(this.angularVelocity) < 0.0002) {
        this.angularVelocity = 0;
        this.isSpinning = false;
      } else {
        this.isSpinning = true;
      }
    }

    // Calculate RPM: (vel / 2PI) * 60 frames * 60 sec
    const radPerSec = Math.abs(this.angularVelocity) * 60;
    this.currentRPM = Math.round((radPerSec / (Math.PI * 2)) * 60);

    if (this.currentRPM > this.peakRPM) {
      this.peakRPM = this.currentRPM;
    }

    // Rotations tracker
    const rotDelta = Math.abs(this.angle - this.lastAngle) / (Math.PI * 2);
    this.totalRotations += rotDelta;
    this.lastAngle = this.angle;

    // Dynamic Sound
    if (window.retroAudio) {
      window.retroAudio.updateSpinnerWhir(this.currentRPM);
    }

    // Update stats UI
    if (this.stats) {
      if (this.stats.rpm) this.stats.rpm.textContent = this.currentRPM;
      if (this.stats.peak) this.stats.peak.textContent = this.peakRPM;
      if (this.stats.rotations) this.stats.rotations.textContent = Math.floor(this.totalRotations);
    }
  }

  draw() {
    const { ctx, centerX, centerY, radius, angle } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw background speed trails / motion blur when fast
    if (this.currentRPM > 400) {
      ctx.save();
      const alpha = Math.min((this.currentRPM - 400) / 1000, 0.35);
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 42, 133, ${alpha * 0.7})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Rotate spinner
    ctx.rotate(angle);

    if (this.currentSkin === 'classic') {
      this.drawClassicSkin(ctx, radius);
    } else if (this.currentSkin === 'shuriken') {
      this.drawShurikenSkin(ctx, radius);
    } else if (this.currentSkin === 'neon') {
      this.drawNeonSkin(ctx, radius);
    } else if (this.currentSkin === 'clockwork') {
      this.drawClockworkSkin(ctx, radius);
    }

    // Center Bearing Cap (Always visible)
    this.drawCenterBearing(ctx);

    ctx.restore();
  }

  drawClassicSkin(ctx, r) {
    const numWings = 3;
    const wingLen = r * 0.85;
    const wingRadius = r * 0.32;

    for (let i = 0; i < numWings; i++) {
      const a = (i * Math.PI * 2) / numWings;
      ctx.save();
      ctx.rotate(a);

      // Wing Body (Dark Slate with Cyan border)
      ctx.beginPath();
      ctx.moveTo(-wingRadius * 0.6, 0);
      ctx.lineTo(-wingRadius * 0.8, wingLen);
      ctx.arc(0, wingLen, wingRadius, 0, Math.PI);
      ctx.lineTo(wingRadius * 0.8, wingLen);
      ctx.lineTo(wingRadius * 0.6, 0);
      ctx.closePath();

      ctx.fillStyle = '#22252e';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      // Wing tip weight ring (Pixelated neon ring)
      ctx.beginPath();
      ctx.arc(0, wingLen, wingRadius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#16171b';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = i === 0 ? '#ff2a85' : i === 1 ? '#ffe600' : '#00ff7f';
      ctx.stroke();

      // Inner weight center
      ctx.beginPath();
      ctx.arc(0, wingLen, wingRadius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#3a3f4d';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.restore();
    }
  }

  drawShurikenSkin(ctx, r) {
    const blades = 4;
    const length = r * 0.95;

    for (let i = 0; i < blades; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / blades);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, length * 0.3);
      ctx.lineTo(-24, length * 0.85);
      ctx.lineTo(0, length);
      ctx.lineTo(12, length * 0.7);
      ctx.lineTo(10, length * 0.3);
      ctx.closePath();

      ctx.fillStyle = i % 2 === 0 ? '#2a2d36' : '#1c1e24';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      // Cyan blade edge highlight
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, length);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawNeonSkin(ctx, r) {
    // Futuristic glowing vortex disc
    const ringRadius = r * 0.75;

    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#181a20';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    // 6 angled energy cutouts
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 6);

      ctx.beginPath();
      ctx.rect(ringRadius * 0.35, -9, ringRadius * 0.5, 18);
      ctx.fillStyle = i % 2 === 0 ? '#ff2a85' : '#00f0ff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.restore();
    }
  }

  drawClockworkSkin(ctx, r) {
    // Steampunk brass pixel cog spinner
    const teeth = 8;
    const innerR = r * 0.7;
    const outerR = r * 0.9;

    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const curR = i % 2 === 0 ? outerR : innerR;
      const curA = (i * Math.PI) / teeth;
      const x = Math.cos(curA) * curR;
      const y = Math.sin(curA) * curR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = '#3a2d1d';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e6af2e';
    ctx.stroke();

    // Inner brass rivets
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      const rx = Math.cos(a) * innerR * 0.55;
      const ry = Math.sin(a) * innerR * 0.55;
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd15c';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }
  }

  drawCenterBearing(ctx) {
    // Core bearing cylinder
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0f1013';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    // Bearing finger cap
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#2d323f';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Center dot indicator
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
  }
}

window.FidgetSpinnerToy = FidgetSpinnerToy;
