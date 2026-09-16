/**
 * THE FINAL SUNSET - Main Game Bootstrap & Loop
 * Orchestrates event listeners, menus, game loop, and initialization.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Initialize Engines
  const gameEngine = new GameEngine(canvas);
  window.gameEngine = gameEngine;

  // Initialize Mobile Touch Controls
  if (window.TouchControlsSystem) {
    window.touchControls = new TouchControlsSystem();
  }

  // Global touch / click audio unlocker for mobile WebAudio policies
  const unlockAudio = () => {
    if (window.audioManager) {
      window.audioManager.ensureContext();
    }
  };
  window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
  window.addEventListener('click', unlockAudio, { passive: true, once: true });

  // Setup UI Listeners & Modals
  setupUI();

  // Start Core Game Loop
  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!window.mpc || !window.mpc.isPaused) {
      gameEngine.update(dt);
      gameEngine.render();
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});

function setupUI() {
  const titleScreen = document.getElementById('title-screen');
  const btnStart = document.getElementById('btn-start');
  const btnContinue = document.getElementById('btn-continue');
  const btnChapterSelect = document.getElementById('btn-chapter-select');
  const btnSettings = document.getElementById('btn-settings');
  const hudPauseBtn = document.getElementById('hud-pause-btn');
  const hudLogBtn = document.getElementById('hud-log-btn');
  const hudAudioBtn = document.getElementById('hud-audio-btn');

  // Audio Gate Overlay
  const audioGate = document.getElementById('audio-gate');
  if (audioGate) {
    audioGate.addEventListener('click', () => {
      audioGate.style.display = 'none';
      if (window.audioManager) {
        window.audioManager.init();
        window.audioManager.playTrack('morning');
      }
    });
  }

  // Title Screen: Start Journey
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.ensureContext();
      if (titleScreen) titleScreen.style.display = 'none';
      if (window.mpc) window.mpc.startChapter(1);
    });
  }

  // Continue Game from AutoSave (Slot 0)
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.ensureContext();
      const slots = JSON.parse(localStorage.getItem('final_sunset_save_slots') || '[null,null,null]');
      if (slots[0]) {
        if (titleScreen) titleScreen.style.display = 'none';
        if (window.mpc) window.mpc.loadGame(0);
      } else {
        if (window.mpc) window.mpc.showToast("No saved game found. Starting new story...");
        if (titleScreen) titleScreen.style.display = 'none';
        if (window.mpc) window.mpc.startChapter(1);
      }
    });
  }

  // Chapter Select Menu
  if (btnChapterSelect) {
    btnChapterSelect.addEventListener('click', () => {
      openChapterSelectModal();
    });
  }

  // Settings Menu
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      openSettingsModal();
    });
  }

  // In-Game HUD: Pause
  if (hudPauseBtn) {
    hudPauseBtn.addEventListener('click', () => {
      if (window.mpc) window.mpc.togglePause();
    });
  }

  // In-Game HUD: Audio Mute Toggle
  if (hudAudioBtn) {
    hudAudioBtn.addEventListener('click', () => {
      if (window.audioManager) {
        const muted = window.audioManager.toggleMute();
        hudAudioBtn.innerHTML = muted ? `<span>🔇</span> Muted` : `<span>🎵</span> Audio`;
      }
    });
  }

  // Setup Save / Load Modal buttons
  setupSaveLoadModal();
  setupSettingsModal();
  setupPauseMenu();
  setupEndingButtons();

  // Advance dialogue on click
  const dialogueBox = document.getElementById('dialogue-box');
  if (dialogueBox) {
    dialogueBox.addEventListener('click', (e) => {
      if (!e.target.closest('.choice-btn') && window.mpc && window.mpc.isDialogueActive) {
        window.mpc.advanceDialogue();
      }
    });
  }
}

function openChapterSelectModal() {
  const modal = document.getElementById('chapter-select-modal');
  const grid = document.getElementById('chapter-grid');
  if (!modal || !grid) return;

  grid.innerHTML = '';
  const chapters = [
    { num: 1, title: 'The Silent Boy' },
    { num: 2, title: 'The Girl' },
    { num: 3, title: 'Record Note' },
    { num: 4, title: 'The Secret' },
    { num: 5, title: 'Letting Go' },
    { num: 6, title: 'College (7:30 AM Train)' },
    { num: 7, title: 'Infinity Kingdom' },
    { num: 8, title: 'Online Friendship' },
    { num: 9, title: 'Photo Exchange' },
    { num: 10, title: 'Town Festival' },
    { num: 11, title: 'Red Flag' },
    { num: 12, title: 'The Final Sunset Ending' }
  ];

  chapters.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.innerHTML = `
      <div class="chapter-card-num">CHAPTER ${ch.num <= 11 ? ch.num : 'FINALE'}</div>
      <div class="chapter-card-title">${ch.title}</div>
    `;
    card.addEventListener('click', () => {
      modal.style.display = 'none';
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) titleScreen.style.display = 'none';
      const pauseModal = document.getElementById('pause-modal');
      if (pauseModal) pauseModal.style.display = 'none';
      if (window.mpc) {
        window.mpc.isPaused = false;
        if (ch.num === 12) {
          window.mpc.triggerFinalSunsetEnding();
        } else {
          window.mpc.startChapter(ch.num);
        }
      }
    });
    grid.appendChild(card);
  });

  modal.style.display = 'flex';
}

function setupSaveLoadModal() {
  const modal = document.getElementById('saveload-modal');
  const closeBtn = document.getElementById('saveload-close-btn');
  const slotsContainer = document.getElementById('save-slots-list');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  window.openSaveLoadModal = (mode = 'save') => {
    if (!modal || !slotsContainer) return;
    const title = document.getElementById('saveload-modal-title');
    if (title) title.innerText = mode === 'save' ? 'SAVE GAME' : 'LOAD GAME';

    slotsContainer.innerHTML = '';
    const slots = JSON.parse(localStorage.getItem('final_sunset_save_slots') || '[null,null,null]');

    slots.forEach((data, idx) => {
      const card = document.createElement('div');
      card.className = 'save-slot-card';
      const slotNum = idx + 1;

      if (data) {
        card.innerHTML = `
          <div class="slot-info">
            <h4>Slot ${slotNum}: Chapter ${data.chapter}</h4>
            <p>${data.scene} • Saved: ${data.timestamp}</p>
          </div>
          <div class="slot-actions">
            <button class="slot-btn primary-action">${mode === 'save' ? 'Overwrite' : 'Load'}</button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="slot-info">
            <h4>Slot ${slotNum}: [Empty Slot]</h4>
            <p>No save data</p>
          </div>
          <div class="slot-actions">
            ${mode === 'save' ? `<button class="slot-btn primary-action">Save Here</button>` : `<span style="font-size:12px; color:#888;">Empty</span>`}
          </div>
        `;
      }

      const actionBtn = card.querySelector('.primary-action');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          if (mode === 'save') {
            if (window.mpc) window.mpc.saveGame(idx);
          } else {
            if (window.mpc) window.mpc.loadGame(idx);
          }
          modal.style.display = 'none';
          const pauseModal = document.getElementById('pause-modal');
          if (pauseModal) pauseModal.style.display = 'none';
          if (window.mpc) window.mpc.isPaused = false;
        });
      }

      slotsContainer.appendChild(card);
    });

    modal.style.display = 'flex';
  };
}

function setupPauseMenu() {
  const pauseModal = document.getElementById('pause-modal');
  const resumeBtn = document.getElementById('pause-resume');
  const saveBtn = document.getElementById('pause-save');
  const loadBtn = document.getElementById('pause-load');
  const restartBtn = document.getElementById('pause-restart');
  const chapterBtn = document.getElementById('pause-chapters');

  if (resumeBtn && pauseModal) {
    resumeBtn.addEventListener('click', () => {
      pauseModal.style.display = 'none';
      if (window.mpc) window.mpc.isPaused = false;
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (window.openSaveLoadModal) window.openSaveLoadModal('save');
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      if (window.openSaveLoadModal) window.openSaveLoadModal('load');
    });
  }

  if (chapterBtn) {
    chapterBtn.addEventListener('click', () => {
      openChapterSelectModal();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (confirm("Restart Part 1 from the beginning?")) {
        if (pauseModal) pauseModal.style.display = 'none';
        if (window.mpc) {
          window.mpc.isPaused = false;
          window.mpc.restartPart1();
        }
      }
    });
  }
}

function setupSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('settings-close-btn');
  const bgmSlider = document.getElementById('setting-bgm-volume');
  const sfxSlider = document.getElementById('setting-sfx-volume');
  const textSpeedSlider = document.getElementById('setting-text-speed');

  window.openSettingsModal = () => {
    if (modal) modal.style.display = 'flex';
  };

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (bgmSlider) {
    bgmSlider.addEventListener('input', (e) => {
      if (window.audioManager) window.audioManager.setBGMVolume(parseFloat(e.target.value));
    });
  }

  if (sfxSlider) {
    sfxSlider.addEventListener('input', (e) => {
      if (window.audioManager) window.audioManager.setSFXVolume(parseFloat(e.target.value));
    });
  }

  if (textSpeedSlider) {
    textSpeedSlider.addEventListener('input', (e) => {
      if (window.mpc) window.mpc.textSpeed = parseInt(e.target.value);
    });
  }
}

function setupEndingButtons() {
  const restartBtn = document.getElementById('ending-restart-btn');
  const titleBtn = document.getElementById('ending-title-btn');

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (window.mpc) window.mpc.restartPart1();
    });
  }

  if (titleBtn) {
    titleBtn.addEventListener('click', () => {
      const endingScreen = document.getElementById('ending-screen');
      if (endingScreen) endingScreen.style.display = 'none';
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) titleScreen.style.display = 'flex';
    });
  }
}
