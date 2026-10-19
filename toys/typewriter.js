/**
 * VINTAGE TYPEWRITER TOY
 * Mechanical platen carriage, swinging striker bar, authentic bell DING!,
 * carriage return lever, and textured parchment paper with ink ribbon.
 */

class VintageTypewriterToy {
  constructor() {
    this.container = document.getElementById('typewriter-toy-container');
    this.paperTextElem = document.getElementById('typewriter-paper-text');
    this.carriageElem = document.getElementById('typewriter-carriage');
    this.returnLever = document.getElementById('typewriter-return-lever');
    this.inkToggle = document.getElementById('typewriter-ink-toggle');
    this.clearBtn = document.getElementById('typewriter-tear-paper');
    this.strikerElem = document.getElementById('typewriter-striker-bar');

    if (!this.container) return;

    this.charCountInLine = 0;
    this.maxLineLength = 34;
    this.bellRangThisLine = false;
    this.inkColor = '#1a1815'; // Default black ink; option for '#ba1c1c' red

    this.initKeyboard();
    this.initControls();
  }

  typeChar(char) {
    if (!this.paperTextElem) return;

    // Trigger striker animation
    if (this.strikerElem) {
      this.strikerElem.classList.remove('strike-active');
      void this.strikerElem.offsetWidth; // trigger reflow
      this.strikerElem.classList.add('strike-active');
    }

    // Play keystroke audio
    if (window.retroAudio) {
      window.retroAudio.playTypewriterKey();
    }

    // Line wrapping & bell
    if (char === '\n') {
      this.carriageReturn();
      return;
    }

    this.charCountInLine++;

    // Bell triggers when approaching the margin
    if (this.charCountInLine >= this.maxLineLength - 4 && !this.bellRangThisLine) {
      this.bellRangThisLine = true;
      if (window.retroAudio) {
        setTimeout(() => window.retroAudio.playBellDing(), 30);
      }
    }

    // Auto return if beyond margin
    if (this.charCountInLine > this.maxLineLength) {
      this.carriageReturn();
    }

    // Create stamped letter span with subtle ink scatter
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'typewriter-char';
    span.style.color = this.inkColor;
    if (Math.random() < 0.2) {
      span.style.opacity = (0.75 + Math.random() * 0.25).toFixed(2);
    }
    this.paperTextElem.appendChild(span);

    // Shift carriage left slightly as paper moves
    this.updateCarriageOffset();
  }

  carriageReturn() {
    if (window.retroAudio) {
      window.retroAudio.playCarriageReturn();
    }

    // Append newline to paper
    const br = document.createElement('br');
    this.paperTextElem.appendChild(br);

    this.charCountInLine = 0;
    this.bellRangThisLine = false;

    // Reset carriage position
    if (this.carriageElem) {
      this.carriageElem.classList.add('returning');
      this.carriageElem.style.transform = `translateX(0px)`;
      setTimeout(() => {
        if (this.carriageElem) this.carriageElem.classList.remove('returning');
      }, 250);
    }

    // Scroll paper if getting long
    const paper = document.getElementById('typewriter-paper-sheet');
    if (paper) {
      paper.scrollTop = paper.scrollHeight;
    }
  }

  updateCarriageOffset() {
    if (!this.carriageElem) return;
    const offset = Math.min(this.charCountInLine * 8, 220);
    this.carriageElem.style.transform = `translateX(-${offset}px)`;
  }

  initKeyboard() {
    // Onscreen typewriter circular keycaps
    const keys = document.querySelectorAll('.typewriter-key');
    keys.forEach(k => {
      k.addEventListener('click', (e) => {
        e.stopPropagation();
        const char = k.dataset.char;
        if (char === 'RETURN') {
          this.carriageReturn();
        } else if (char === 'SPACE') {
          this.typeChar(' ');
        } else if (char === 'BACKSPACE') {
          this.backspace();
        } else if (char) {
          this.typeChar(char);
        }
      });
    });

    // Physical keyboard input when focused or hovering over typewriter
    window.addEventListener('keydown', (e) => {
      const activeToy = document.querySelector('.toy-card.focused') || this.container.closest('.toy-card');
      if (!this.container.closest('.toy-card:hover') && !this.container.closest('.toy-card.focused')) {
        return; // Only type if interacting with this toy
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        this.carriageReturn();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.backspace();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.typeChar(' ');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        this.typeChar(e.key.toUpperCase());
      }
    });
  }

  backspace() {
    if (!this.paperTextElem.lastChild) return;
    this.paperTextElem.removeChild(this.paperTextElem.lastChild);
    if (this.charCountInLine > 0) this.charCountInLine--;
    this.updateCarriageOffset();
    if (window.retroAudio) window.retroAudio.playSwitch('thock');
  }

  initControls() {
    // Carriage return lever click
    if (this.returnLever) {
      this.returnLever.addEventListener('click', () => {
        this.returnLever.classList.add('pulled');
        this.carriageReturn();
        setTimeout(() => this.returnLever.classList.remove('pulled'), 300);
      });
    }

    // Ink ribbon color toggle (Black / Vintage Carmine)
    if (this.inkToggle) {
      this.inkToggle.addEventListener('click', () => {
        const isRed = this.inkColor === '#ba1c1c';
        this.inkColor = isRed ? '#1a1815' : '#ba1c1c';
        this.inkToggle.classList.toggle('ink-red', !isRed);
        this.inkToggle.textContent = !isRed ? "RIBBON: RED" : "RIBBON: BLACK";
        if (window.retroAudio) window.retroAudio.playToggle(!isRed);
      });
    }

    // Tear paper & fresh sheet
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playPageTurn();
        const paper = document.getElementById('typewriter-paper-sheet');
        if (paper) {
          paper.classList.add('paper-tear');
          setTimeout(() => {
            this.paperTextElem.innerHTML = '';
            this.charCountInLine = 0;
            this.bellRangThisLine = false;
            this.updateCarriageOffset();
            paper.classList.remove('paper-tear');
          }, 400);
        }
      });
    }
  }
}

window.VintageTypewriterToy = VintageTypewriterToy;
