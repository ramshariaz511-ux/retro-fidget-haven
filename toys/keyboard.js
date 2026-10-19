/**
 * MECHANICAL KEYBOARD PLAYGROUND
 * 60% Interactive Pixel Mechanical Keyboard with custom switch sound profiles,
 * RGB lighting animations, physical key listening, and zen typing feedback.
 */

class MechanicalKeyboardToy {
  constructor() {
    this.container = document.getElementById('mech-keyboard-container');
    if (!this.container) return;

    this.currentSwitchSound = 'thock'; // 'thock', 'clicky', 'panda', 'silent'
    this.currentRgbMode = 'cyan'; // 'cyan', 'rainbow', 'ripple', 'amber'
    this.currentKeycapTheme = 'cyber'; // 'cyber', 'vintage', 'charcoal'

    this.totalKeystrokes = 0;
    this.keystrokeTimes = [];
    this.currentWPM = 0;

    this.keyMap = new Map();

    this.initLayout();
    this.initControls();
    this.initKeyListeners();
  }

  initLayout() {
    // 60% keyboard layout rows
    const rows = [
      [
        { code: 'Backquote', label: '` ~', w: 1 },
        { code: 'Digit1', label: '1 !', w: 1 },
        { code: 'Digit2', label: '2 @', w: 1 },
        { code: 'Digit3', label: '3 #', w: 1 },
        { code: 'Digit4', label: '4 $', w: 1 },
        { code: 'Digit5', label: '5 %', w: 1 },
        { code: 'Digit6', label: '6 ^', w: 1 },
        { code: 'Digit7', label: '7 &', w: 1 },
        { code: 'Digit8', label: '8 *', w: 1 },
        { code: 'Digit9', label: '9 (', w: 1 },
        { code: 'Digit0', label: '0 )', w: 1 },
        { code: 'Minus', label: '- _', w: 1 },
        { code: 'Equal', label: '= +', w: 1 },
        { code: 'Backspace', label: 'BACK', w: 2 }
      ],
      [
        { code: 'Tab', label: 'TAB', w: 1.5 },
        { code: 'KeyQ', label: 'Q', w: 1 },
        { code: 'KeyW', label: 'W', w: 1 },
        { code: 'KeyE', label: 'E', w: 1 },
        { code: 'KeyR', label: 'R', w: 1 },
        { code: 'KeyT', label: 'T', w: 1 },
        { code: 'KeyY', label: 'Y', w: 1 },
        { code: 'KeyU', label: 'U', w: 1 },
        { code: 'KeyI', label: 'I', w: 1 },
        { code: 'KeyO', label: 'O', w: 1 },
        { code: 'KeyP', label: 'P', w: 1 },
        { code: 'BracketLeft', label: '[ {', w: 1 },
        { code: 'BracketRight', label: '] }', w: 1 },
        { code: 'Backslash', label: '\\ |', w: 1.5 }
      ],
      [
        { code: 'CapsLock', label: 'CAPS', w: 1.75 },
        { code: 'KeyA', label: 'A', w: 1 },
        { code: 'KeyS', label: 'S', w: 1 },
        { code: 'KeyD', label: 'D', w: 1 },
        { code: 'KeyF', label: 'F', w: 1 },
        { code: 'KeyG', label: 'G', w: 1 },
        { code: 'KeyH', label: 'H', w: 1 },
        { code: 'KeyJ', label: 'J', w: 1 },
        { code: 'KeyK', label: 'K', w: 1 },
        { code: 'KeyL', label: 'L', w: 1 },
        { code: 'Semicolon', label: '; :', w: 1 },
        { code: 'Quote', label: '\' "', w: 1 },
        { code: 'Enter', label: 'ENTER', w: 2.25 }
      ],
      [
        { code: 'ShiftLeft', label: 'SHIFT', w: 2.25 },
        { code: 'KeyZ', label: 'Z', w: 1 },
        { code: 'KeyX', label: 'X', w: 1 },
        { code: 'KeyC', label: 'C', w: 1 },
        { code: 'KeyV', label: 'V', w: 1 },
        { code: 'KeyB', label: 'B', w: 1 },
        { code: 'KeyN', label: 'N', w: 1 },
        { code: 'KeyM', label: 'M', w: 1 },
        { code: 'Comma', label: ', <', w: 1 },
        { code: 'Period', label: '. >', w: 1 },
        { code: 'Slash', label: '/ ?', w: 1 },
        { code: 'ShiftRight', label: 'SHIFT', w: 2.75 }
      ],
      [
        { code: 'ControlLeft', label: 'CTRL', w: 1.25 },
        { code: 'MetaLeft', label: 'WIN', w: 1.25 },
        { code: 'AltLeft', label: 'ALT', w: 1.25 },
        { code: 'Space', label: 'THOCK SPACE', w: 6.25 },
        { code: 'AltRight', label: 'ALT', w: 1.25 },
        { code: 'MetaRight', label: 'FN', w: 1.25 },
        { code: 'ControlRight', label: 'CTRL', w: 1.25 }
      ]
    ];

    const keyboardCase = document.getElementById('kb-board-grid');
    if (!keyboardCase) return;

    keyboardCase.innerHTML = '';

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kb-row';

      row.forEach(k => {
        const keyElem = document.createElement('div');
        keyElem.className = 'kb-key';
        keyElem.dataset.code = k.code;
        keyElem.style.flexGrow = k.w;
        keyElem.textContent = k.label;

        // Keycap press interaction
        keyElem.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.triggerKeyPress(k.code, keyElem);
        });

        this.keyMap.set(k.code, keyElem);
        rowDiv.appendChild(keyElem);
      });

      keyboardCase.appendChild(rowDiv);
    });
  }

  triggerKeyPress(code, keyElem = null) {
    const elem = keyElem || this.keyMap.get(code);
    if (elem) {
      elem.classList.add('active-press');
      setTimeout(() => elem.classList.remove('active-press'), 130);

      if (this.currentRgbMode === 'ripple') {
        this.triggerRipple(elem);
      }
    }

    // Play switch sound
    if (window.retroAudio) {
      window.retroAudio.playSwitch(this.currentSwitchSound);
    }

    // Track stats
    this.totalKeystrokes++;
    const now = Date.now();
    this.keystrokeTimes.push(now);

    // Keep keystrokes in last 5 seconds for WPM calculation
    this.keystrokeTimes = this.keystrokeTimes.filter(t => now - t < 5000);
    const wordsInWindow = this.keystrokeTimes.length / 5;
    this.currentWPM = Math.round((wordsInWindow / 5) * 60);

    const countElem = document.getElementById('kb-keystroke-count');
    const wpmElem = document.getElementById('kb-wpm-count');
    if (countElem) countElem.textContent = this.totalKeystrokes;
    if (wpmElem) wpmElem.textContent = this.currentWPM;

    // Echo to zen typing preview box if available
    const echoBox = document.getElementById('kb-preview-stream');
    if (echoBox && elem) {
      const text = elem.textContent.split(' ')[0];
      const charSpan = document.createElement('span');
      charSpan.textContent = text.length === 1 ? text : ' ';
      charSpan.className = 'kb-stream-char';
      echoBox.appendChild(charSpan);
      if (echoBox.children.length > 30) {
        echoBox.removeChild(echoBox.firstChild);
      }
    }
  }

  triggerRipple(sourceElem) {
    const sourceRect = sourceElem.getBoundingClientRect();
    const sx = sourceRect.left + sourceRect.width / 2;
    const sy = sourceRect.top + sourceRect.height / 2;

    this.keyMap.forEach((targetElem) => {
      const rect = targetElem.getBoundingClientRect();
      const tx = rect.left + rect.width / 2;
      const ty = rect.top + rect.height / 2;
      const dist = Math.hypot(tx - sx, ty - sy);

      setTimeout(() => {
        targetElem.classList.add('glow-ripple');
        setTimeout(() => targetElem.classList.remove('glow-ripple'), 200);
      }, dist * 0.45);
    });
  }

  initKeyListeners() {
    window.addEventListener('keydown', (e) => {
      // If typing inside an input/textarea outside the toys, skip
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (this.keyMap.has(e.code)) {
        // Prevent default space/tab page scrolling when playing with keyboard toy
        const isHoveringKb = this.container.closest('.toy-card:hover') || this.container.closest('.toy-card.focused');
        if (isHoveringKb) {
          if (['Space', 'Tab', 'Backspace'].includes(e.code)) {
            e.preventDefault();
          }
        }
        this.triggerKeyPress(e.code);
      }
    });
  }

  initControls() {
    // Sound switch selector (Thock, Clicky, Panda, Silent)
    const soundSelects = document.querySelectorAll('.kb-sound-btn');
    soundSelects.forEach(btn => {
      btn.addEventListener('click', () => {
        soundSelects.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.currentSwitchSound = btn.dataset.sound;
        if (window.retroAudio) window.retroAudio.playSwitch(this.currentSwitchSound);
      });
    });

    // RGB Lighting toggle
    const rgbSelects = document.querySelectorAll('.kb-rgb-btn');
    const kbBoard = document.getElementById('kb-board-grid');
    rgbSelects.forEach(btn => {
      btn.addEventListener('click', () => {
        rgbSelects.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.currentRgbMode = btn.dataset.rgb;
        if (kbBoard) {
          kbBoard.className = `kb-board-grid rgb-${this.currentRgbMode}`;
        }
        if (window.retroAudio) window.retroAudio.playToggle(true);
      });
    });
  }
}

window.MechanicalKeyboardToy = MechanicalKeyboardToy;
