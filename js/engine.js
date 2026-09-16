/**
 * THE FINAL SUNSET - Exploration & Player Controller Engine
 * Direct character movement, boundary collisions, NPC interactions, and camera management.
 */

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.graphics = new GraphicsEngine(canvas);

    // Player (RK)
    this.player = {
      x: 180,
      y: 540,
      width: 32,
      height: 64,
      speed: 180,
      vx: 0,
      vy: 0,
      facing: 'right',
      isMoving: false,
      type: 'rk',
      state: 'idle',
      name: 'RK',
      showNameBadge: true,
      canMove: true
    };

    // World state
    this.sceneName = 'morning_road';
    this.worldBounds = { minX: 40, maxX: 2200, minY: 460, maxY: 620 };
    this.npcs = [];
    this.interactiveObjects = [];
    this.activeInteraction = null;

    // Input state
    this.keys = {};
    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.keys[e.code] = true;

      // Quick interact with E
      if (e.key === 'e' || e.key === 'E') {
        if (this.activeInteraction && window.mpc) {
          window.mpc.triggerInteraction(this.activeInteraction);
        }
      }

      // Advance dialogue with Space or Enter
      if ((e.code === 'Space' || e.code === 'Enter') && window.mpc && window.mpc.isDialogueActive) {
        window.mpc.advanceDialogue();
      }

      // Pause toggle with ESC
      if (e.key === 'Escape' && window.mpc) {
        window.mpc.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.keys[e.code] = false;
    });

    // Touch / Click on prompt support
    const promptEl = document.getElementById('interaction-prompt');
    if (promptEl) {
      promptEl.addEventListener('click', () => {
        if (this.activeInteraction && window.mpc) {
          window.mpc.triggerInteraction(this.activeInteraction);
        }
      });
    }
  }

  loadScene(sceneName, playerSpawn = { x: 180, y: 540 }) {
    this.sceneName = sceneName;
    this.player.x = playerSpawn.x;
    this.player.y = playerSpawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isMoving = false;
    this.player.state = 'idle';
    this.npcs = [];
    this.interactiveObjects = [];
    this.activeInteraction = null;

    // Configure bounds and weather according to scene
    switch (sceneName) {
      case 'morning_road':
        this.worldBounds = { minX: 60, maxX: 2300, minY: 460, maxY: 620 };
        this.graphics.setWeather('leaves');
        this.interactiveObjects.push({
          id: 'sign_school',
          x: 1800,
          y: 490,
          type: 'sign',
          label: 'School Gate Ahead',
          prompt: 'Enter School Gate'
        });
        break;

      case 'school_courtyard':
        this.worldBounds = { minX: 60, maxX: 2300, minY: 480, maxY: 640 };
        this.graphics.setWeather('leaves');
        this.interactiveObjects.push({
          id: 'courtyard_bench',
          x: 750,
          y: 530,
          type: 'bench',
          label: 'Wooden Bench',
          prompt: 'Sit on Bench'
        });
        break;

      case 'classroom':
        this.worldBounds = { minX: 100, maxX: 1500, minY: 460, maxY: 640 };
        this.graphics.setWeather('clear');
        this.interactiveObjects.push({
          id: 'record_desk',
          x: 850,
          y: 510,
          type: 'record_desk',
          label: 'Submission Desk',
          prompt: 'Submit Record Note'
        });
        break;

      case 'sunset_hill':
        this.worldBounds = { minX: 100, maxX: 1700, minY: 490, maxY: 620 };
        this.graphics.setWeather('sunset');
        this.interactiveObjects.push({
          id: 'hill_overlook',
          x: 900,
          y: 530,
          type: 'bench',
          label: 'Hill Edge',
          prompt: 'Watch the Sunset'
        });
        break;

      case 'train_interior':
        this.worldBounds = { minX: 80, maxX: 1700, minY: 490, maxY: 620 };
        this.graphics.setWeather('rain');
        this.interactiveObjects.push({
          id: 'train_window_seat',
          x: 520,
          y: 520,
          type: 'train_seat',
          label: 'Window Seat',
          prompt: 'Sit by Rainy Window'
        });
        break;

      case 'rk_room':
        this.worldBounds = { minX: 100, maxX: 1300, minY: 560, maxY: 660 };
        this.graphics.setWeather('clear');
        this.interactiveObjects.push({
          id: 'room_laptop',
          x: 750,
          y: 580,
          type: 'bench',
          label: 'Laptop',
          prompt: 'Play Infinity Kingdom'
        });
        break;

      case 'festival_street':
        this.worldBounds = { minX: 100, maxX: 1900, minY: 490, maxY: 640 };
        this.graphics.setWeather('fireflies');
        this.interactiveObjects.push({
          id: 'festival_terrace_stairs',
          x: 1600,
          y: 520,
          type: 'sign',
          label: 'Terrace Stairs',
          prompt: 'Climb up to Terrace'
        });
        break;

      case 'festival_terrace':
        this.worldBounds = { minX: 100, maxX: 1500, minY: 490, maxY: 640 };
        this.graphics.setWeather('fireworks');
        this.interactiveObjects.push({
          id: 'terrace_railing',
          x: 800,
          y: 510,
          type: 'bench',
          label: 'Terrace Railing',
          prompt: 'Send Fireworks Photo to Charlotte'
        });
        break;

      case 'split_screen_crosscut':
        this.worldBounds = { minX: 100, maxX: 540, minY: 490, maxY: 640 };
        this.graphics.setWeather('fireworks');
        break;

      case 'final_sunset_sky':
        this.worldBounds = { minX: 100, maxX: 1500, minY: 490, maxY: 640 };
        this.graphics.setWeather('sunset');
        break;

      default:
        this.worldBounds = { minX: 60, maxX: 1800, minY: 460, maxY: 620 };
        this.graphics.setWeather('clear');
    }
  }

  addNPC(npcData) {
    this.npcs.push({
      id: npcData.id,
      name: npcData.name,
      x: npcData.x,
      y: npcData.y,
      type: npcData.type || 'friend1',
      facing: npcData.facing || 'left',
      isMoving: false,
      state: npcData.state || 'idle',
      showNameBadge: true,
      dialogueKey: npcData.dialogueKey || null,
      prompt: npcData.prompt || `Talk to ${npcData.name}`
    });
  }

  update(dt = 0.016) {
    // 1. Process Player Input & Movement
    if (this.player.canMove && (!window.mpc || !window.mpc.isDialogueActive)) {
      let dx = 0;
      let dy = 0;

      // Keyboard input
      if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['a']) dx -= 1;
      if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.keys['d']) dx += 1;
      if (this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['w']) dy -= 1;
      if (this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['s']) dy += 1;

      // Virtual Joystick input
      if (window.touchControls && (window.touchControls.joystickVector.dx !== 0 || window.touchControls.joystickVector.dy !== 0)) {
        dx = window.touchControls.joystickVector.dx;
        dy = window.touchControls.joystickVector.dy;
      } else if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      this.player.vx = dx * this.player.speed;
      this.player.vy = dy * this.player.speed;

      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Apply World Boundaries
      this.player.x = Math.max(this.worldBounds.minX, Math.min(this.worldBounds.maxX, this.player.x));
      this.player.y = Math.max(this.worldBounds.minY, Math.min(this.worldBounds.maxY, this.player.y));

      this.player.isMoving = (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05);
      if (dx < -0.05) this.player.facing = 'left';
      else if (dx > 0.05) this.player.facing = 'right';

      // Play soft footstep sound periodically when moving
      if (this.player.isMoving && Math.random() < 0.08 && window.audioManager) {
        window.audioManager.playFootstep();
      }
    } else {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isMoving = false;
    }

    // 2. Check Proximity to NPCs and Interactive Objects
    this.checkInteractions();

    // 3. Camera Lerp to Follow RK Smoothly
    const targetCamX = this.player.x - this.graphics.width / 2;
    const targetCamY = (this.player.y - this.graphics.height / 2) * 0.3; // subtle vertical follow

    // Clamp camera within world bounds
    const maxCamX = Math.max(0, this.worldBounds.maxX - this.graphics.width + 100);
    const clampedCamX = Math.max(0, Math.min(maxCamX, targetCamX));

    this.graphics.camera.x += (clampedCamX - this.graphics.camera.x) * 0.08;
    this.graphics.camera.y += (targetCamY - this.graphics.camera.y) * 0.08;

    // 4. Update Graphics Engine (Particles, Fireworks, Scenery animations)
    this.graphics.update(dt);
  }

  checkInteractions() {
    let closest = null;
    let minDistance = 85; // interaction range in pixels

    // Check NPCs
    for (let npc of this.npcs) {
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist < minDistance) {
        closest = {
          type: 'npc',
          id: npc.id,
          name: npc.name,
          prompt: npc.prompt,
          dialogueKey: npc.dialogueKey,
          target: npc
        };
        minDistance = dist;
      }
    }

    // Check Objects
    for (let obj of this.interactiveObjects) {
      const dist = Math.hypot(this.player.x - obj.x, this.player.y - obj.y);
      if (dist < minDistance) {
        closest = {
          type: 'object',
          id: obj.id,
          name: obj.label,
          prompt: obj.prompt,
          target: obj
        };
        minDistance = dist;
      }
    }

    this.activeInteraction = closest;
    const promptEl = document.getElementById('interaction-prompt');
    const promptTextEl = document.getElementById('prompt-text');

    if (closest && (!window.mpc || !window.mpc.isDialogueActive)) {
      if (promptTextEl) promptTextEl.innerText = closest.prompt;
      if (promptEl) promptEl.style.display = 'flex';
    } else {
      if (promptEl) promptEl.style.display = 'none';
    }

    // Sync mobile floating action button prompt
    if (window.touchControls) {
      window.touchControls.updateActionPrompt(closest);
    }
  }

  render() {
    this.graphics.render(
      this.sceneName,
      this.player,
      this.npcs,
      this.interactiveObjects
    );
  }
}

window.GameEngine = GameEngine;
