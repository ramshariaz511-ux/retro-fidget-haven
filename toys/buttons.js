/**
 * SATISFYING BUTTONS & SWITCHES TOY MODULE
 * Features:
 * 1. Infinite Pixel Bubble Wrap
 * 2. Mechanical Switch Tester Pad (Thock, Clicky, Panda, Silent)
 * 3. The Forbidden Big Red Button with Safety Flip Cover & Confetti
 * 4. Heavy Aircraft Toggle Switch Array with Neon LEDs
 */

class ButtonsToyModule {
  constructor() {
    this.totalPops = 0;
    this.totalSwitchClicks = 0;
    this.bigButtonPresses = 0;

    this.initBubbleWrap();
    this.initSwitchTester();
    this.initBigRedButton();
    this.initToggles();
  }

  /* ---------------- 1. BUBBLE WRAP ---------------- */
  initBubbleWrap() {
    const container = document.getElementById('bubble-wrap-grid');
    if (!container) return;

    this.renderBubbleWrap(container);

    const resetBtn = document.getElementById('bubble-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playSwitch('clicky');
        this.renderBubbleWrap(container);
      });
    }

    // Support drag-to-pop
    let isMouseDown = false;
    container.addEventListener('mousedown', () => isMouseDown = true);
    window.addEventListener('mouseup', () => isMouseDown = false);

    container.addEventListener('mouseover', (e) => {
      if (isMouseDown && e.target.classList.contains('bubble-cell') && !e.target.classList.contains('popped')) {
        this.popBubble(e.target);
      }
    });

    container.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elem && elem.classList.contains('bubble-cell') && !elem.classList.contains('popped')) {
        this.popBubble(elem);
      }
    }, { passive: true });
  }

  renderBubbleWrap(container) {
    container.innerHTML = '';
    const bubbleCount = 48; // 6 rows of 8

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble-cell';
      bubble.setAttribute('role', 'button');
      bubble.setAttribute('aria-label', 'Bubble');

      bubble.addEventListener('click', () => {
        if (!bubble.classList.contains('popped')) {
          this.popBubble(bubble);
        }
      });

      container.appendChild(bubble);
    }
  }

  popBubble(bubble) {
    bubble.classList.add('popped');
    this.totalPops++;

    // Random pitch variation for ultra satisfaction
    const pitch = 0.8 + Math.random() * 0.5;
    if (window.retroAudio) window.retroAudio.playPop(pitch);

    // Particle burst
    this.spawnPixelSparks(bubble, '#00f0ff');

    const counter = document.getElementById('bubble-pop-count');
    if (counter) counter.textContent = this.totalPops;
  }

  /* ---------------- 2. MECHANICAL SWITCH TESTER ---------------- */
  initSwitchTester() {
    const switches = document.querySelectorAll('.mech-switch-box');
    switches.forEach(sw => {
      const type = sw.dataset.switchType || 'thock';
      const keycap = sw.querySelector('.switch-keycap');
      const led = sw.querySelector('.switch-led');

      const triggerPress = () => {
        keycap.classList.add('pressed');
        if (led) led.classList.add('lit');

        if (window.retroAudio) {
          window.retroAudio.playSwitch(type);
        }
        this.totalSwitchClicks++;
        this.spawnPixelSparks(keycap, sw.dataset.color || '#00f0ff');

        setTimeout(() => {
          keycap.classList.remove('pressed');
          if (led) led.classList.remove('lit');
        }, 120);
      };

      sw.addEventListener('click', triggerPress);
    });
  }

  /* ---------------- 3. THE BIG RED BUTTON ---------------- */
  initBigRedButton() {
    const cover = document.getElementById('big-button-cover');
    const button = document.getElementById('big-red-button');
    const statusText = document.getElementById('big-button-status');
    const countDisplay = document.getElementById('big-button-count');

    if (!button) return;

    let coverOpen = false;

    if (cover) {
      cover.addEventListener('click', (e) => {
        e.stopPropagation();
        coverOpen = !coverOpen;
        cover.classList.toggle('cover-open', coverOpen);
        if (window.retroAudio) window.retroAudio.playToggle(coverOpen);
        if (statusText) {
          statusText.textContent = coverOpen ? "ARMED! DO NOT PRESS!" : "SAFETY ENGAGED";
        }
      });
    }

    const messages = [
      "BOOM! 100% STRESS DESTROYED!",
      "NUCLEAR ZEN ACTIVATED!",
      "WARNING: SERENITY OVERLOAD!",
      "CALMNESS LEVEL: CRITICAL!",
      "ALL ANXIETY ANNIHILATED!",
      "DOPAMINE SURGE DETECTED!"
    ];

    button.addEventListener('click', () => {
      if (!coverOpen && cover) {
        // Shaking warning
        cover.classList.add('shake');
        setTimeout(() => cover.classList.remove('shake'), 300);
        if (window.retroAudio) window.retroAudio.playSwitch('clicky');
        if (statusText) statusText.textContent = "LIFT COVER FIRST!";
        return;
      }

      this.bigButtonPresses++;
      if (countDisplay) countDisplay.textContent = this.bigButtonPresses;

      // Heavy explosion & chime
      if (window.retroAudio) window.retroAudio.playBigButtonBoom();

      // Screen shake effect
      const toyCard = button.closest('.toy-card');
      if (toyCard) {
        toyCard.classList.add('screen-shake');
        setTimeout(() => toyCard.classList.remove('screen-shake'), 400);
      }

      // Massive particle burst
      for (let i = 0; i < 24; i++) {
        this.spawnPixelSparks(button, ['#ff2a85', '#00f0ff', '#ffe600', '#00ff7f'][i % 4]);
      }

      if (statusText) {
        const msg = messages[this.bigButtonPresses % messages.length];
        statusText.textContent = msg;
        statusText.style.color = '#ff2a85';
        setTimeout(() => {
          if (statusText) {
            statusText.textContent = "ARMED! DO NOT PRESS!";
            statusText.style.color = '#00f0ff';
          }
        }, 2200);
      }
    });
  }

  /* ---------------- 4. AIRCRAFT TOGGLE ARRAY ---------------- */
  initToggles() {
    const toggles = document.querySelectorAll('.retro-toggle-item');
    const masterLed = document.getElementById('toggle-master-status');

    toggles.forEach(toggle => {
      const lever = toggle.querySelector('.toggle-lever');
      const led = toggle.querySelector('.toggle-led');

      toggle.addEventListener('click', () => {
        const isActive = toggle.classList.toggle('active');
        if (window.retroAudio) window.retroAudio.playToggle(isActive);

        this.spawnPixelSparks(lever, isActive ? '#00f0ff' : '#ff2a85');

        // Check if all toggles are active
        const allActive = Array.from(toggles).every(t => t.classList.contains('active'));
        if (masterLed) {
          masterLed.classList.toggle('all-systems-green', allActive);
          masterLed.textContent = allActive ? "ALL SYSTEMS CALM" : "STANDBY";
        }
      });
    });
  }

  /* ---------------- SHARED PIXEL SPARKS FX ---------------- */
  spawnPixelSparks(element, color = '#00f0ff') {
    const rect = element.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const count = 8;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'pixel-spark';
      spark.style.backgroundColor = color;
      spark.style.left = `${originX}px`;
      spark.style.top = `${originY}px`;

      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 30 + Math.random() * 45;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 500);
    }
  }
}

window.ButtonsToyModule = ButtonsToyModule;
