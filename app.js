/**
 * MAIN APP CONTROLLER
 * Category filtering, Stress-o-meter, Zen breathing guide,
 * ambient sound mixer, CRT scanline toggle, and focus mode.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Audio Engine on first interaction
  const unlockAudio = () => {
    if (window.retroAudio) {
      window.retroAudio.ensureContext();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // 2. Instantiate all toys
  initToys();

  // 3. Category Filter Tabs
  initCategories();

  // 4. Stress Relief & Zen Tracker
  initZenTracker();

  // 5. Zen Breathing Orb Guide
  initBreathingGuide();

  // 6. Header Audio & Screen Controls (Volume, CRT, Ambient)
  initHeaderControls();

  // 7. Focus / Maximize Toy Mode
  initFocusMode();
});

function initToys() {
  // Fidget Spinner
  const rpmElem = document.getElementById('spinner-rpm');
  const peakElem = document.getElementById('spinner-peak');
  const rotElem = document.getElementById('spinner-rotations');
  window.spinnerToy = new FidgetSpinnerToy('spinner-canvas', {
    rpm: rpmElem,
    peak: peakElem,
    rotations: rotElem
  });

  // Buttons & Switches
  window.buttonsToy = new ButtonsToyModule();

  // Interlocking Gears
  window.gearsToy = new GearsToy('gears-canvas');

  // Vintage Typewriter
  window.typewriterToy = new VintageTypewriterToy();

  // Mechanical Keyboard
  window.mechKeyboardToy = new MechanicalKeyboardToy();

  // Wood Carving
  window.woodToy = new WoodCarvingToy('wood-canvas');

  // Wall Painting
  window.wallToy = new WallPaintingToy('wall-canvas');

  // Car Cleaning
  window.carToy = new CarCleaningToy('car-canvas');

  // Window Cleaning
  window.windowToy = new WindowCleaningToy('window-canvas');

  // Book Page Turner
  window.bookToy = new BookPageTurnerToy();

  // Spinner UI buttons
  const flickCw = document.getElementById('spinner-flick-cw');
  const flickCcw = document.getElementById('spinner-flick-ccw');
  const stopSpin = document.getElementById('spinner-stop-btn');
  if (flickCw) flickCw.addEventListener('click', () => window.spinnerToy.flick(1, 0.45));
  if (flickCcw) flickCcw.addEventListener('click', () => window.spinnerToy.flick(-1, 0.45));
  if (stopSpin) stopSpin.addEventListener('click', () => window.spinnerToy.stop());

  const skinBtns = document.querySelectorAll('.spinner-skin-btn');
  skinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skinBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.spinnerToy.setSkin(btn.dataset.skin);
    });
  });

  const bearingBtns = document.querySelectorAll('.spinner-bearing-btn');
  bearingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bearingBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.spinnerToy.setBearing(btn.dataset.bearing);
    });
  });

  // Gears UI buttons
  const motorToggle = document.getElementById('gears-motor-toggle');
  if (motorToggle) {
    motorToggle.addEventListener('click', () => {
      const isRunning = !window.gearsToy.motorRunning;
      window.gearsToy.setMotor(isRunning);
      motorToggle.classList.toggle('active', isRunning);
      motorToggle.textContent = isRunning ? "MOTOR: ACTIVE" : "MOTOR: OFF";
    });
  }

  const gearSpeedSlider = document.getElementById('gears-speed-slider');
  if (gearSpeedSlider) {
    gearSpeedSlider.addEventListener('input', (e) => {
      window.gearsToy.setSpeed(parseFloat(e.target.value));
    });
  }

  const gearPresetBtns = document.querySelectorAll('.gears-preset-btn');
  gearPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gearPresetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.gearsToy.loadPreset(btn.dataset.preset);
      if (window.retroAudio) window.retroAudio.playSwitch('thock');
    });
  });
}

function initCategories() {
  const tabs = document.querySelectorAll('.cat-pill');
  const cards = document.querySelectorAll('.toy-card');
  const currentCatTitle = document.getElementById('current-category-label');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCat = tab.dataset.category;
      if (currentCatTitle) {
        currentCatTitle.textContent = tab.textContent.trim();
      }

      cards.forEach(card => {
        const cardCats = (card.dataset.category || '').split(' ');
        if (selectedCat === 'all' || cardCats.includes(selectedCat)) {
          card.style.display = 'flex';
          card.classList.remove('card-hidden');
        } else {
          card.style.display = 'none';
          card.classList.add('card-hidden');
        }
      });

      if (window.retroAudio) {
        window.retroAudio.playSwitch('thock');
      }
    });
  });

  // Random toy / Panic Zen button
  const randomBtn = document.getElementById('random-toy-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
      const randomCard = visibleCards[Math.floor(Math.random() * visibleCards.length)];
      if (randomCard) {
        randomCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        randomCard.classList.add('highlight-pulse');
        setTimeout(() => randomCard.classList.remove('highlight-pulse'), 1200);
        if (window.retroAudio) window.retroAudio.playChime();
      }
    });
  }
}

function initZenTracker() {
  let stressLevel = 100;
  let totalZenClicks = 0;

  const stressElem = document.getElementById('stress-level-value');
  const stressBar = document.getElementById('stress-level-bar');
  const clicksElem = document.getElementById('zen-clicks-value');

  window.addEventListener('click', (e) => {
    // Only track clicks inside toy cards or interactive controls
    if (!e.target.closest('.toy-card') && !e.target.closest('.header-controls')) return;

    totalZenClicks++;
    if (clicksElem) clicksElem.textContent = totalZenClicks;

    if (stressLevel > 0) {
      stressLevel = Math.max(0, stressLevel - 1);
      if (stressElem) stressElem.textContent = `${stressLevel}%`;
      if (stressBar) stressBar.style.width = `${stressLevel}%`;

      if (stressLevel === 0 && totalZenClicks % 25 === 0) {
        if (window.retroAudio) window.retroAudio.playChime();
      }
    }
  });
}

function initBreathingGuide() {
  const orb = document.getElementById('breathing-orb');
  const text = document.getElementById('breathing-phase-text');
  if (!orb || !text) return;

  const phases = [
    { text: "BREATHE IN...", class: "phase-inhale", duration: 4000 },
    { text: "HOLD...", class: "phase-hold", duration: 4000 },
    { text: "BREATHE OUT...", class: "phase-exhale", duration: 4000 }
  ];

  let currentPhase = 0;

  function runCycle() {
    const p = phases[currentPhase];
    text.textContent = p.text;
    orb.className = `breathing-orb ${p.class}`;

    setTimeout(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      runCycle();
    }, p.duration);
  }

  runCycle();
}

function initHeaderControls() {
  // Master Mute
  const muteBtn = document.getElementById('master-mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        const muted = window.retroAudio.toggleMute();
        muteBtn.classList.toggle('muted', muted);
        muteBtn.textContent = muted ? "🔇 MUTED" : "🔊 SOUND ON";
      }
    });
  }

  // Master Volume Slider
  const volSlider = document.getElementById('master-volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      if (window.retroAudio) {
        window.retroAudio.setMasterVolume(parseFloat(e.target.value));
      }
    });
  }

  // CRT Scanlines Toggle
  const crtBtn = document.getElementById('crt-toggle-btn');
  const crtOverlay = document.getElementById('crt-scanline-overlay');
  if (crtBtn && crtOverlay) {
    crtBtn.addEventListener('click', () => {
      const active = crtOverlay.classList.toggle('active');
      crtBtn.classList.toggle('selected', active);
      crtBtn.textContent = active ? "CRT: ON" : "CRT: OFF";
      if (window.retroAudio) window.retroAudio.playToggle(active);
    });
  }

  // Ambient sound buttons
  const rainBtn = document.getElementById('ambient-rain-btn');
  if (rainBtn) {
    rainBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        const active = window.retroAudio.toggleAmbientRain();
        rainBtn.classList.toggle('active', active);
      }
    });
  }

  const vinylBtn = document.getElementById('ambient-vinyl-btn');
  if (vinylBtn) {
    vinylBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        const active = window.retroAudio.toggleAmbientVinyl();
        vinylBtn.classList.toggle('active', active);
      }
    });
  }

  const chimesBtn = document.getElementById('ambient-chimes-btn');
  if (chimesBtn) {
    chimesBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        const active = window.retroAudio.toggleAmbientChimes();
        chimesBtn.classList.toggle('active', active);
      }
    });
  }
}

function initFocusMode() {
  const focusBtns = document.querySelectorAll('.focus-toy-btn');
  const modal = document.getElementById('focus-modal');
  const modalContent = document.getElementById('focus-modal-content');
  const modalClose = document.getElementById('focus-modal-close');

  if (!modal || !modalContent) return;

  focusBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.toy-card');
      if (!card) return;

      const isAlreadyFocused = card.classList.contains('focused');
      document.querySelectorAll('.toy-card').forEach(c => c.classList.remove('focused'));

      if (!isAlreadyFocused) {
        card.classList.add('focused');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (window.retroAudio) window.retroAudio.playToggle(!isAlreadyFocused);
    });
  });
}
