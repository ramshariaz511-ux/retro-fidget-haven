/**
 * RETRO ZEN AUDIO SYNTHESIZER (Web Audio API)
 * 100% Procedurally Synthesized Audio Engine - Zero external audio files required!
 */

class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.ambientVolume = 0.35;

    // Ambient loop handles
    this.ambientNodes = {
      rain: null,
      vinyl: null,
      chimesTimer: null
    };
    this.ambientActive = {
      rain: false,
      vinyl: false,
      chimes: false
    };

    // Continuous sound nodes
    this.continuous = {
      spinner: null,
      spray: null,
      washer: null,
      roller: null
    };
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /* ---------------- SFX METHODS ---------------- */

  // 1. Bubble Wrap Pop
  playPop(pitchMult = 1.0) {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = (400 + Math.random() * 250) * pitchMult;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    // Pop snap transient
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(baseFreq * 2.5, t);
    snapOsc.frequency.exponentialRampToValueAtTime(150, t + 0.03);
    snapGain.gain.setValueAtTime(0.5, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(t);
    snapOsc.stop(t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 2. Mechanical Switches (Thock, Clicky, Panda, Silent)
  playSwitch(type = 'thock') {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;

    if (type === 'clicky') {
      // Crisp clicky switch (like Cherry Blue)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800 + Math.random() * 300, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.025);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.035);

      // Low bottom-out clack
      const clack = this.ctx.createOscillator();
      const clackGain = this.ctx.createGain();
      clack.type = 'sine';
      clack.frequency.setValueAtTime(220, t + 0.01);
      clack.frequency.exponentialRampToValueAtTime(50, t + 0.06);
      clackGain.gain.setValueAtTime(0.35, t + 0.01);
      clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      clack.connect(clackGain);
      clackGain.connect(this.sfxGain);
      clack.start(t + 0.01);
      clack.stop(t + 0.08);

    } else if (type === 'thock') {
      // Deep lubed linear thock (Gateron Oil King / Ink Black)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.07);
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      // Subtle woody punch
      const punch = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();
      punch.type = 'triangle';
      punch.frequency.setValueAtTime(320, t);
      punch.frequency.exponentialRampToValueAtTime(90, t + 0.035);
      pGain.gain.setValueAtTime(0.4, t);
      pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      punch.connect(pGain);
      pGain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.09);
      punch.start(t);
      punch.stop(t + 0.05);

    } else if (type === 'panda') {
      // Tactile Holy Panda (two distinct bump clicks)
      this.playSwitch('thock');
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(1200, now);
        o.frequency.exponentialRampToValueAtTime(300, now + 0.02);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(now);
        o.stop(now + 0.03);
      }, 15);

    } else {
      // Muted / Silent switch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 + Math.random() * 15, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.05);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  // 3. Vintage Typewriter Keystroke
  playTypewriterKey() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;

    // Metal striker snap
    const snap = this.ctx.createOscillator();
    const snapG = this.ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(1800 + Math.random() * 400, t);
    snap.frequency.exponentialRampToValueAtTime(300, t + 0.025);
    snapG.gain.setValueAtTime(0.3, t);
    snapG.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    snap.connect(snapG);
    snapG.connect(this.sfxGain);
    snap.start(t);
    snap.stop(t + 0.035);

    // Heavy mechanical body thud
    const thud = this.ctx.createOscillator();
    const thudG = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(180, t + 0.005);
    thud.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    thudG.gain.setValueAtTime(0.6, t + 0.005);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    thud.connect(thudG);
    thudG.connect(this.sfxGain);
    thud.start(t + 0.005);
    thud.stop(t + 0.1);

    // Spring rattle noise burst
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3500;
    filter.Q.value = 3.0;

    const noiseG = this.ctx.createGain();
    noiseG.gain.setValueAtTime(0.2, t + 0.01);
    noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(noiseG);
    noiseG.connect(this.sfxGain);
    noise.start(t + 0.01);
  }

  // 4. Typewriter Carriage Return Lever (ratchet zip + heavy clunk)
  playCarriageReturn() {
    this.ensureContext();
    if (this.isMuted) return;

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500 + i * 80, t);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.025);
      }, i * 28);
    }

    setTimeout(() => {
      this.playSwitch('thock');
    }, 200);
  }

  // 5. Authentic Typewriter Brass Bell "DING!"
  playBellDing() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;

    const freqs = [2180, 4360, 6540];
    const amps = [0.45, 0.2, 0.08];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const decay = 1.6 - idx * 0.35;
      gain.gain.setValueAtTime(amps[idx], t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // 6. Gear Tick / Ratchet Mesh
  playGearTick(speedFactor = 1.0) {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900 * speedFactor + Math.random() * 150, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.015);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.025);
  }

  // 7. Wood Carving Slice / Shaving Curl
  playWoodSlice() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + Math.random() * 400, t);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  // 8. Squeegee Rubber Wipe
  playSqueegeeWipe() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const startF = 1800 + Math.random() * 400;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.linearRampToValueAtTime(startF - 500, t + 0.09);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // 9. Book Page Turn (Crisp paper rustle)
  playPageTurn() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * Math.pow(env, 1.5);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.2);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.21);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  // 10. The Big Red Button / Epic Retro Explosion
  playBigButtonBoom() {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;

    // Laser zap down
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);

    // Deep sub bass boom
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, t + 0.05);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    subG.gain.setValueAtTime(0.9, t + 0.05);
    subG.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    sub.connect(subG);
    subG.connect(this.sfxGain);
    sub.start(t + 0.05);
    sub.stop(t + 0.7);

    // Retro triumphant chime chord
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const cg = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now);
        cg.gain.setValueAtTime(0.25, now);
        cg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        o.connect(cg);
        cg.connect(this.sfxGain);
        o.start(now);
        o.stop(now + 0.45);
      }, 100 + idx * 70);
    });
  }

  // 11. Toggle Switch Snap
  playToggle(state = true) {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(state ? 1600 : 1100, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // 12. Pentatonic Zen Chime
  playChime(noteIndex = null) {
    this.ensureContext();
    if (this.isMuted) return;

    const t = this.ctx.currentTime;
    // Pentatonic scale (C major pentatonic / D minor pentatonic):
    const pentatonic = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = noteIndex !== null 
      ? pentatonic[noteIndex % pentatonic.length]
      : pentatonic[Math.floor(Math.random() * pentatonic.length)];

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Warm overtone
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, t); // Metallic non-harmonic chime vibe

    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc2.connect(g2);
    g2.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 2.6);
    osc2.start(t);
    osc2.stop(t + 1.3);
  }

  /* ---------------- CONTINUOUS SOUND HANDLERS ---------------- */

  // Fidget Spinner Dynamic Whir
  updateSpinnerWhir(rpm) {
    this.ensureContext();
    if (this.isMuted || rpm < 20) {
      if (this.continuous.spinner) {
        this.continuous.spinner.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      }
      return;
    }

    const t = this.ctx.currentTime;
    const normalizedRPM = Math.min(rpm / 1200, 1.0);

    if (!this.continuous.spinner) {
      // Create continuous noise + low hum
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);

      gain.gain.setValueAtTime(0.01, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();

      this.continuous.spinner = { osc, filter, gain };
    }

    const targetFreq = 70 + normalizedRPM * 380;
    const targetFilter = 200 + normalizedRPM * 800;
    const targetGain = 0.05 + normalizedRPM * 0.35;

    this.continuous.spinner.osc.frequency.setTargetAtTime(targetFreq, t, 0.05);
    this.continuous.spinner.filter.frequency.setTargetAtTime(targetFilter, t, 0.05);
    this.continuous.spinner.gain.gain.setTargetAtTime(targetGain, t, 0.05);
  }

  stopSpinnerWhir() {
    if (this.continuous.spinner && this.ctx) {
      this.continuous.spinner.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
    }
  }

  // Spray Can Hiss (Graffiti / Wall Painting)
  startSprayHiss() {
    this.ensureContext();
    if (this.isMuted || this.continuous.spray) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3800, t);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();

    this.continuous.spray = { noise, gain };
  }

  stopSprayHiss() {
    if (this.continuous.spray && this.ctx) {
      const t = this.ctx.currentTime;
      this.continuous.spray.gain.gain.linearRampToValueAtTime(0.001, t + 0.05);
      const ref = this.continuous.spray;
      setTimeout(() => {
        try { ref.noise.stop(); } catch(e) {}
      }, 70);
      this.continuous.spray = null;
    }
  }

  // High-Pressure Water Jet (Car Washing / Power Washer)
  startWaterPressure() {
    this.ensureContext();
    if (this.isMuted || this.continuous.washer) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    // Motor rumble underneath
    const motor = this.ctx.createOscillator();
    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(110, t);
    const motorGain = this.ctx.createGain();
    motorGain.gain.setValueAtTime(0.12, t);
    motor.connect(motorGain);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    motorGain.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    motor.start();

    this.continuous.washer = { noise, motor, gain };
  }

  stopWaterPressure() {
    if (this.continuous.washer && this.ctx) {
      const t = this.ctx.currentTime;
      this.continuous.washer.gain.gain.linearRampToValueAtTime(0.001, t + 0.08);
      const ref = this.continuous.washer;
      setTimeout(() => {
        try {
          ref.noise.stop();
          ref.motor.stop();
        } catch(e) {}
      }, 100);
      this.continuous.washer = null;
    }
  }

  /* ---------------- AMBIENT SOUND GENERATORS ---------------- */

  toggleAmbientRain(enable = null) {
    this.ensureContext();
    const shouldEnable = enable !== null ? enable : !this.ambientActive.rain;
    this.ambientActive.rain = shouldEnable;

    if (shouldEnable) {
      if (this.ambientNodes.rain) return true;

      // Soft rain generator (filtered pinkish noise with subtle volume modulation)
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2) * 0.18;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      noise.start();

      this.ambientNodes.rain = { noise, gain };
      return true;
    } else {
      if (this.ambientNodes.rain) {
        const t = this.ctx.currentTime;
        this.ambientNodes.rain.gain.gain.linearRampToValueAtTime(0.001, t + 0.8);
        const ref = this.ambientNodes.rain;
        setTimeout(() => {
          try { ref.noise.stop(); } catch(e) {}
        }, 900);
        this.ambientNodes.rain = null;
      }
      return false;
    }
  }

  toggleAmbientVinyl(enable = null) {
    this.ensureContext();
    const shouldEnable = enable !== null ? enable : !this.ambientActive.vinyl;
    this.ambientActive.vinyl = shouldEnable;

    if (shouldEnable) {
      if (this.ambientNodes.vinyl) return true;

      // Vinyl crackle and warm tape hiss
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // base tape hiss
        let sample = (Math.random() * 2 - 1) * 0.05;
        // random pops / crackles
        if (Math.random() < 0.002) {
          sample += (Math.random() * 2 - 1) * 0.8;
        }
        data[i] = sample;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, this.ctx.currentTime);
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      noise.start();

      this.ambientNodes.vinyl = { noise, gain };
      return true;
    } else {
      if (this.ambientNodes.vinyl) {
        const t = this.ctx.currentTime;
        this.ambientNodes.vinyl.gain.gain.linearRampToValueAtTime(0.001, t + 0.5);
        const ref = this.ambientNodes.vinyl;
        setTimeout(() => {
          try { ref.noise.stop(); } catch(e) {}
        }, 600);
        this.ambientNodes.vinyl = null;
      }
      return false;
    }
  }

  toggleAmbientChimes(enable = null) {
    this.ensureContext();
    const shouldEnable = enable !== null ? enable : !this.ambientActive.chimes;
    this.ambientActive.chimes = shouldEnable;

    if (shouldEnable) {
      if (this.ambientNodes.chimesTimer) return true;

      const triggerRandomChime = () => {
        if (!this.ambientActive.chimes) return;
        this.playChime();
        const nextTime = 2500 + Math.random() * 4500;
        this.ambientNodes.chimesTimer = setTimeout(triggerRandomChime, nextTime);
      };
      triggerRandomChime();
      return true;
    } else {
      if (this.ambientNodes.chimesTimer) {
        clearTimeout(this.ambientNodes.chimesTimer);
        this.ambientNodes.chimesTimer = null;
      }
      return false;
    }
  }
}

// Global audio singleton
window.retroAudio = new RetroAudioEngine();
