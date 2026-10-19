/**
 * VINTAGE BOOK PAGE TURNER TOY
 * Open leather-bound journal with smooth 3D page curl transitions,
 * authentic paper rustle audio, interactive ink scribbling, and zen parables.
 */

class BookPageTurnerToy {
  constructor() {
    this.container = document.getElementById('book-toy-container');
    this.bookElement = document.getElementById('vintage-book');
    this.leftPageContent = document.getElementById('book-page-left');
    this.rightPageContent = document.getElementById('book-page-right');
    this.prevBtn = document.getElementById('book-prev-btn');
    this.nextBtn = document.getElementById('book-next-btn');
    this.pageIndicator = document.getElementById('book-page-number');

    if (!this.container) return;

    this.currentPagePair = 0; // 0 = pages 1-2, 1 = pages 3-4, 2 = pages 5-6, 3 = pages 7-8

    this.pages = [
      // Spread 0: Intro & The Zen Stone
      {
        left: `
          <div class="book-chapter">I. THE RIVER & STONE</div>
          <p class="book-text">The river does not push the boulder with anger; it simply flows around it with patience.</p>
          <div class="book-pixel-divider">✦ ✦ ✦</div>
          <p class="book-text">Whatever weighs heavily upon your mind today, let it rest in the cool water of this moment.</p>
          <div class="book-quote">"Nothing in nature blooms all year round. Be patient with yourself."</div>
        `,
        right: `
          <div class="book-chapter">II. INNER HARBOR</div>
          <p class="book-text">Take one slow, deep breath in through your nose... hold it gently... and release.</p>
          <div class="book-pixel-illustration">
            <div class="zen-circle-art"></div>
          </div>
          <p class="book-text center-align">Notice how quiet the world becomes when you stop chasing tomorrow.</p>
        `
      },
      // Spread 1: The 4-7-8 Rhythm & Forest Haiku
      {
        left: `
          <div class="book-chapter">III. THE 4-7-8 ANCHOR</div>
          <div class="breath-guide-box">
            <div class="step-line"><span class="step-num">4s</span> Breathe in slowly</div>
            <div class="step-line"><span class="step-num">7s</span> Hold in serenity</div>
            <div class="step-line"><span class="step-num">8s</span> Exhale all tension</div>
          </div>
          <p class="book-text">The body follows the breath; the mind follows the body. Peace is a rhythm you already own.</p>
        `,
        right: `
          <div class="book-chapter">IV. EVENING CANOPY</div>
          <div class="haiku-box">
            <p>Rain taps on pine boughs,</p>
            <p>Lantern glow upon dark stone,</p>
            <p>Rest your weary hands.</p>
          </div>
          <div class="book-pixel-divider">◈ ◈ ◈</div>
          <p class="book-text">Turn the next page to reach the ink drawing studio, where you may sketch freely upon parchment.</p>
        `
      },
      // Spread 2: Interactive Ink Scribble Parchment
      {
        left: `
          <div class="book-chapter">V. THE EMPTY PARCHMENT</div>
          <p class="book-text">Draw, scribble, or sketch your thoughts on the right page. Every line grounds your focus.</p>
          <button id="book-clear-ink-btn" class="retro-btn-sm cyan-glow" style="margin-top: 14px;">WIPE INK CLEAN</button>
        `,
        right: `
          <div class="book-chapter">VI. FOUNTAIN PEN DOODLE</div>
          <canvas id="book-ink-canvas" width="220" height="240"></canvas>
        `
      },
      // Spread 3: Golden Wisdom
      {
        left: `
          <div class="book-chapter">VII. THE UNBURDENED MIND</div>
          <p class="book-text">You have clicked, spun, turned, and released.</p>
          <p class="book-text">The screen before you is made of pixels, but the calm within you is real.</p>
          <div class="book-pixel-divider">✦ ✦ ✦</div>
          <p class="book-quote">"Peace is not the absence of storm, but the calm at its center."</p>
        `,
        right: `
          <div class="book-chapter">VIII. RETRO BLESSING</div>
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 28px; color: #ff2a85;">♥ ⚡ ☕</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #00f0ff; margin-top: 12px; line-height: 1.8;">
              STRESS LEVEL: 0%<br>ZEN LEVEL: MAX<br>BATTERY: 100%
            </div>
          </div>
          <p class="book-text center-align">Bookmark tucked safely. Return here whenever life moves too fast.</p>
        `
      }
    ];

    this.renderCurrentSpread();
    this.initControls();
  }

  renderCurrentSpread() {
    if (!this.leftPageContent || !this.rightPageContent) return;

    const spread = this.pages[this.currentPagePair];
    this.leftPageContent.innerHTML = spread.left;
    this.rightPageContent.innerHTML = spread.right;

    if (this.pageIndicator) {
      const p1 = this.currentPagePair * 2 + 1;
      const p2 = this.currentPagePair * 2 + 2;
      this.pageIndicator.textContent = `PAGES ${p1} - ${p2} / 8`;
    }

    // If on ink scribble page, init ink canvas
    if (this.currentPagePair === 2) {
      this.initInkCanvas();
    }

    if (this.prevBtn) this.prevBtn.disabled = this.currentPagePair === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentPagePair === this.pages.length - 1;
  }

  turnPage(direction = 1) {
    const nextPair = this.currentPagePair + direction;
    if (nextPair < 0 || nextPair >= this.pages.length) return;

    // Trigger curl animation on book
    if (this.bookElement) {
      const animClass = direction > 0 ? 'flipping-forward' : 'flipping-backward';
      this.bookElement.classList.add(animClass);

      if (window.retroAudio) {
        window.retroAudio.playPageTurn();
      }

      setTimeout(() => {
        this.currentPagePair = nextPair;
        this.renderCurrentSpread();
        this.bookElement.classList.remove(animClass);
      }, 260);
    }
  }

  initInkCanvas() {
    const canvas = document.getElementById('book-ink-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let lx = 0, ly = 0;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0].clientX);
      const cy = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: cx - rect.left,
        y: cy - rect.top
      };
    };

    const onStart = (e) => {
      const pos = getPos(e);
      isDrawing = true;
      lx = pos.x;
      ly = pos.y;
    };

    const onMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);

      ctx.strokeStyle = '#2b221b'; // Antique sepia fountain pen ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lx = pos.x;
      ly = pos.y;

      if (Math.random() < 0.2 && window.retroAudio) {
        window.retroAudio.playSwitch('silent');
      }
    };

    const onEnd = () => isDrawing = false;

    canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    // Clear ink button
    const clearBtn = document.getElementById('book-clear-ink-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (window.retroAudio) window.retroAudio.playPageTurn();
      });
    }
  }

  initControls() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.turnPage(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.turnPage(1));
    }

    // Click corner of right page to turn forward, left page to turn back
    if (this.rightPageContent) {
      this.rightPageContent.addEventListener('click', (e) => {
        // Only if clicking near outer corner and not on ink canvas/buttons
        if (e.target.tagName !== 'CANVAS' && e.target.tagName !== 'BUTTON') {
          const rect = this.rightPageContent.getBoundingClientRect();
          if (e.clientX > rect.right - 55 && e.clientY > rect.bottom - 55) {
            this.turnPage(1);
          }
        }
      });
    }

    if (this.leftPageContent) {
      this.leftPageContent.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
          const rect = this.leftPageContent.getBoundingClientRect();
          if (e.clientX < rect.left + 55 && e.clientY > rect.bottom - 55) {
            this.turnPage(-1);
          }
        }
      });
    }
  }
}

window.BookPageTurnerToy = BookPageTurnerToy;
