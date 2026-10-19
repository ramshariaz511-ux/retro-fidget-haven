/**
 * INTERLOCKING GEARS & CLOCKWORK TOY
 * Canvas-based mechanical simulation with meshing teeth, authentic gear ratios,
 * motorized drive, drag interaction, and mechanical tick sound effects.
 */

class GearsToy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.motorRunning = false;
    this.motorSpeed = 0.02; // rad/frame
    this.isDragging = false;
    this.draggedGear = null;
    this.lastPointerAngle = 0;
    this.lastTickTime = 0;

    // Presets
    this.gears = [];
    this.loadPreset('classic');

    this.initEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  loadPreset(name = 'classic') {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.gears = [];

    if (name === 'classic') {
      // 4 connected gears in a chain
      // Gear 1: Large drive gear (center left)
      const g1 = this.createGear(cx - 110, cy, 32, '#00f0ff', 'steel');
      // Gear 2: Medium gear meshed with g1
      const g2Dist = (32 + 20) * 2.5;
      const g2 = this.createGear(g1.x + g2Dist, cy - 35, 20, '#ff2a85', 'brass');
      // Gear 3: Small gear meshed with g2
      const g3Dist = (20 + 12) * 2.5;
      const g3 = this.createGear(g2.x + g3Dist * 0.7, g2.y + g3Dist * 0.7, 12, '#ffe600', 'copper');
      // Gear 4: Medium gear meshed with g3
      const g4Dist = (12 + 24) * 2.5;
      const g4 = this.createGear(g3.x - g4Dist * 0.3, g3.y + g4Dist * 0.95, 24, '#00ff7f', 'cyan');

      this.gears = [g1, g2, g3, g4];
    } else if (name === 'speed') {
      // Step-up ratio: Giant gear driving a tiny gear for insane RPM!
      const g1 = this.createGear(cx - 90, cy, 40, '#00f0ff', 'steel');
      const g2Dist = (40 + 10) * 2.5;
      const g2 = this.createGear(g1.x + g2Dist, cy, 10, '#ff2a85', 'brass');
      this.gears = [g1, g2];
    }

    this.solveMeshing();
  }

  createGear(x, y, teeth, color, style) {
    const toothPitch = 2.5; // module
    const radius = teeth * toothPitch;
    return {
      x,
      y,
      teeth,
      radius,
      color,
      style,
      angle: 0,
      angularVelocity: 0,
      driver: false,
      neighbors: []
    };
  }

  solveMeshing() {
    // Find all pairs of gears that are within meshing distance
    for (let i = 0; i < this.gears.length; i++) {
      this.gears[i].neighbors = [];
    }

    for (let i = 0; i < this.gears.length; i++) {
      for (let j = i + 1; j < this.gears.length; j++) {
        const g1 = this.gears[i];
        const g2 = this.gears[j];
        const dist = Math.hypot(g2.x - g1.x, g2.y - g1.y);
        const targetDist = g1.radius + g2.radius;

        // Tolerant threshold for meshing
        if (Math.abs(dist - targetDist) < 18) {
          g1.neighbors.push({ gear: g2, ratio: -g1.teeth / g2.teeth });
          g2.neighbors.push({ gear: g1, ratio: -g2.teeth / g1.teeth });
        }
      }
    }
  }

  propagateRotation(sourceGear, deltaAngle) {
    const visited = new Set();
    const queue = [{ gear: sourceGear, delta: deltaAngle }];
    visited.add(sourceGear);

    while (queue.length > 0) {
      const { gear, delta } = queue.shift();
      gear.angle += delta;

      for (const edge of gear.neighbors) {
        if (!visited.has(edge.gear)) {
          visited.add(edge.gear);
          const childDelta = delta * edge.ratio;
          queue.push({ gear: edge.gear, delta: childDelta });
        }
      }
    }

    // Tick audio
    const now = Date.now();
    if (now - this.lastTickTime > 45 && Math.abs(deltaAngle) > 0.005) {
      this.lastTickTime = now;
      if (window.retroAudio) {
        window.retroAudio.playGearTick(Math.min(Math.abs(deltaAngle) * 50, 2.5));
      }
    }
  }

  setMotor(running) {
    this.motorRunning = running;
    if (window.retroAudio) window.retroAudio.playToggle(running);
  }

  setSpeed(speedVal) {
    this.motorSpeed = speedVal;
  }

  getGearAt(x, y) {
    for (let i = this.gears.length - 1; i >= 0; i--) {
      const g = this.gears[i];
      if (Math.hypot(x - g.x, y - g.y) <= g.radius + 10) {
        return g;
      }
    }
    return null;
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const onStart = (e) => {
      const pos = getPos(e);
      const gear = this.getGearAt(pos.x, pos.y);
      if (gear) {
        this.isDragging = true;
        this.draggedGear = gear;
        this.lastPointerAngle = Math.atan2(pos.y - gear.y, pos.x - gear.x);
      }
    };

    const onMove = (e) => {
      if (!this.isDragging || !this.draggedGear) return;
      e.preventDefault();
      const pos = getPos(e);
      const currentAngle = Math.atan2(pos.y - this.draggedGear.y, pos.x - this.draggedGear.x);
      let diff = currentAngle - this.lastPointerAngle;

      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      this.propagateRotation(this.draggedGear, diff);
      this.lastPointerAngle = currentAngle;
    };

    const onEnd = () => {
      this.isDragging = false;
      this.draggedGear = null;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  animate() {
    if (this.motorRunning && !this.isDragging && this.gears.length > 0) {
      this.propagateRotation(this.gears[0], this.motorSpeed);
    }

    this.draw();
    requestAnimationFrame(this.animate);
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw retro grid background
    ctx.save();
    ctx.strokeStyle = '#22252e';
    ctx.lineWidth = 1;
    const gridStep = 24;
    for (let x = 0; x < this.canvas.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Gears
    this.gears.forEach(gear => this.drawSingleGear(gear));
  }

  drawSingleGear(g) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);

    const numTeeth = g.teeth;
    const toothHeight = 9;
    const pitchRadius = g.radius;
    const outerRadius = pitchRadius + toothHeight;
    const innerRadius = pitchRadius - toothHeight;

    // Draw Teeth outline
    ctx.beginPath();
    for (let i = 0; i < numTeeth; i++) {
      const a1 = (i * Math.PI * 2) / numTeeth;
      const a2 = a1 + (Math.PI / numTeeth) * 0.35;
      const a3 = a1 + (Math.PI / numTeeth) * 0.65;
      const a4 = a1 + (Math.PI / numTeeth);

      const x1 = Math.cos(a1) * innerRadius;
      const y1 = Math.sin(a1) * innerRadius;
      const x2 = Math.cos(a2) * outerRadius;
      const y2 = Math.sin(a2) * outerRadius;
      const x3 = Math.cos(a3) * outerRadius;
      const y3 = Math.sin(a3) * outerRadius;
      const x4 = Math.cos(a4) * innerRadius;
      const y4 = Math.sin(a4) * innerRadius;

      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
    }
    ctx.closePath();

    // Fill gear body
    ctx.fillStyle = g.style === 'brass' ? '#3d301b' : g.style === 'copper' ? '#38221c' : '#1e2129';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = g.color;
    ctx.stroke();

    // Inner rim
    const rimRadius = innerRadius * 0.72;
    ctx.beginPath();
    ctx.arc(0, 0, rimRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#14161b';
    ctx.fill();
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spokes (4 or 6 spokes)
    const spokes = g.teeth > 20 ? 6 : 4;
    for (let s = 0; s < spokes; s++) {
      const sa = (s * Math.PI * 2) / spokes;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * rimRadius, Math.sin(sa) * rimRadius);
      ctx.lineWidth = 4;
      ctx.strokeStyle = g.color;
      ctx.stroke();
    }

    // Center brass axle / bearing
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#2d323f';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = g.color;
    ctx.fill();

    ctx.restore();
  }
}

window.GearsToy = GearsToy;
