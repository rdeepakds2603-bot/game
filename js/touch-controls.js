/**
 * THE FINAL SUNSET - Mobile Touch Controls & Virtual Joystick
 * Adds smooth analog virtual joystick for movement, on-screen action buttons,
 * tap-to-advance dialogue, haptic feedback, and mobile orientation management.
 */

class TouchControlsSystem {
  constructor() {
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickVector = { dx: 0, dy: 0 };
    this.maxRadius = 50; // Max joystick thumb travel radius

    this.joystickZone = null;
    this.joystickBase = null;
    this.joystickThumb = null;
    this.mobileActionBtn = null;

    this.init();
  }

  init() {
    this.createMobileUI();
    this.setupJoystickEvents();
    this.setupActionEvents();
    this.setupOrientationHandler();
    this.setupFullscreenHandler();
  }

  vibrate(pattern = 15) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently catch if not allowed by browser permissions
      }
    }
  }

  createMobileUI() {
    const gameWrapper = document.getElementById('game-wrapper');
    if (!gameWrapper) return;

    // 1. Joystick Container & Action Buttons overlay
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobile-controls-overlay';
    mobileControls.innerHTML = `
      <!-- Virtual Joystick Zone (Left) -->
      <div id="joystick-zone">
        <div id="joystick-base">
          <div id="joystick-thumb"></div>
          <div class="joystick-arrow arrow-up">▲</div>
          <div class="joystick-arrow arrow-down">▼</div>
          <div class="joystick-arrow arrow-left">◀</div>
          <div class="joystick-arrow arrow-right">▶</div>
        </div>
      </div>

      <!-- Mobile Action Area (Right) -->
      <div id="mobile-action-zone">
        <button id="mobile-btn-action" class="mobile-touch-btn" aria-label="Interact">
          <span class="btn-icon">✨</span>
          <span class="btn-label">INTERACT</span>
        </button>
      </div>

      <!-- Quick Mobile Header Controls (Top Right) -->
      <div id="mobile-header-shortcuts">
        <button id="mobile-btn-fullscreen" class="mobile-icon-btn" title="Toggle Fullscreen">⛶</button>
      </div>

      <!-- Mobile Orientation Warning (Shown only in Portrait) -->
      <div id="orientation-warning">
        <div class="orientation-card">
          <div class="phone-rotate-icon">📱 ➔ 🔄</div>
          <h2>PLEASE ROTATE DEVICE</h2>
          <p>For the best cinematic anime experience, please turn your phone to <strong>Landscape</strong> mode.</p>
          <button id="btn-force-fullscreen" class="menu-btn primary">Enter Fullscreen Game</button>
        </div>
      </div>
    `;

    gameWrapper.appendChild(mobileControls);

    this.joystickZone = document.getElementById('joystick-zone');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickThumb = document.getElementById('joystick-thumb');
    this.mobileActionBtn = document.getElementById('mobile-btn-action');
  }

  setupJoystickEvents() {
    if (!this.joystickZone || !this.joystickBase || !this.joystickThumb) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      if (this.joystickActive) return;

      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.joystickActive = true;

      const rect = this.joystickZone.getBoundingClientRect();
      this.joystickCenter = {
        x: rect.left + this.joystickBase.offsetLeft + this.joystickBase.offsetWidth / 2,
        y: rect.top + this.joystickBase.offsetTop + this.joystickBase.offsetHeight / 2
      };

      this.joystickBase.classList.add('active');
      this.updateJoystickPosition(touch.clientX, touch.clientY);
      this.vibrate(10);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!this.joystickActive) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystickPosition(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.resetJoystick();
          break;
        }
      }
    };

    this.joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Also support mouse testing for desktop preview
    let isMouseDown = false;
    this.joystickZone.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      this.joystickActive = true;
      const rect = this.joystickBase.getBoundingClientRect();
      this.joystickCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this.joystickBase.classList.add('active');
      this.updateJoystickPosition(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown && this.joystickActive) {
        this.updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        this.resetJoystick();
      }
    });
  }

  updateJoystickPosition(clientX, clientY) {
    const rawDx = clientX - this.joystickCenter.x;
    const rawDy = clientY - this.joystickCenter.y;
    const distance = Math.hypot(rawDx, rawDy);

    const clampedDist = Math.min(distance, this.maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    // Calculate normalized vector with deadzone
    const deadzone = 8;
    if (distance > deadzone) {
      this.joystickVector = {
        dx: thumbX / this.maxRadius,
        dy: thumbY / this.maxRadius
      };
    } else {
      this.joystickVector = { dx: 0, dy: 0 };
    }
  }

  resetJoystick() {
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickVector = { dx: 0, dy: 0 };
    if (this.joystickThumb) this.joystickThumb.style.transform = 'translate(0px, 0px)';
    if (this.joystickBase) this.joystickBase.classList.remove('active');
  }

  setupActionEvents() {
    if (!this.mobileActionBtn) return;

    const triggerAction = (e) => {
      if (e) e.preventDefault();
      this.vibrate(20);

      // If dialogue is active, advance dialogue
      if (window.mpc && window.mpc.isDialogueActive) {
        window.mpc.advanceDialogue();
        return;
      }

      // Otherwise trigger world interaction
      if (window.gameEngine && window.gameEngine.activeInteraction && window.mpc) {
        window.mpc.triggerInteraction(window.gameEngine.activeInteraction);
      }
    };

    this.mobileActionBtn.addEventListener('touchstart', triggerAction, { passive: false });
    this.mobileActionBtn.addEventListener('click', triggerAction);

    // Global tap-to-advance dialogue on mobile screens
    const dialogueContainer = document.getElementById('dialogue-container');
    if (dialogueContainer) {
      dialogueContainer.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.choice-btn') && window.mpc && window.mpc.isDialogueActive) {
          e.preventDefault();
          this.vibrate(10);
          window.mpc.advanceDialogue();
        }
      }, { passive: false });
    }
  }

  updateActionPrompt(activeInteraction) {
    if (!this.mobileActionBtn) return;

    if (activeInteraction && (!window.mpc || !window.mpc.isDialogueActive)) {
      this.mobileActionBtn.classList.add('visible', 'pulse');
      const label = this.mobileActionBtn.querySelector('.btn-label');
      if (label) {
        label.innerText = activeInteraction.type === 'npc' ? 'TALK' : 'EXAMINE';
      }
    } else if (window.mpc && window.mpc.isDialogueActive) {
      this.mobileActionBtn.classList.add('visible');
      this.mobileActionBtn.classList.remove('pulse');
      const label = this.mobileActionBtn.querySelector('.btn-label');
      if (label) label.innerText = 'NEXT';
    } else {
      this.mobileActionBtn.classList.remove('visible', 'pulse');
    }
  }

  setupOrientationHandler() {
    const checkOrientation = () => {
      const warning = document.getElementById('orientation-warning');
      if (!warning) return;

      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
      warning.style.display = isPortrait ? 'flex' : 'none';
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 300));
    checkOrientation();

    // Force fullscreen button on warning card
    const forceBtn = document.getElementById('btn-force-fullscreen');
    if (forceBtn) {
      forceBtn.addEventListener('click', () => {
        this.toggleFullscreen();
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      });
    }
  }

  setupFullscreenHandler() {
    const fsBtn = document.getElementById('mobile-btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  }

  toggleFullscreen() {
    this.vibrate(15);
    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }
}

window.TouchControlsSystem = TouchControlsSystem;
