/**
 * THE FINAL SUNSET - Anime Graphics & Procedural Renderer Engine
 * Renders lush anime-style hand-painted environments, dynamic characters,
 * expressive portrait sprites, parallax backgrounds, and weather particle systems.
 */

class GraphicsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = 1280;
    this.height = canvas.height = 720;

    // Particle manager
    this.particles = [];
    this.weatherType = 'clear'; // 'clear', 'leaves', 'rain', 'fireflies', 'fireworks', 'sunset'
    this.time = 0;

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      shake: 0
    };

    // Parallax & environment details
    this.currentScene = 'morning_road';
    this.trainOffset = 0;
    this.fireworks = [];

    // Pre-rendered portrait cache
    this.portraitCache = {};
    this.initPortraits();
  }

  setWeather(type) {
    this.weatherType = type;
    this.particles = [];
    const count = type === 'rain' ? 120 : (type === 'leaves' ? 40 : 30);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    return {
      x: Math.random() * (this.width + 400) - 200,
      y: randomY ? Math.random() * this.height : -20,
      size: Math.random() * 3 + 2,
      speedX: this.weatherType === 'rain' ? -1.5 : (Math.random() * 1.5 - 0.5),
      speedY: this.weatherType === 'rain' ? (Math.random() * 8 + 12) : (Math.random() * 1.2 + 0.8),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      opacity: Math.random() * 0.6 + 0.4,
      color: this.getParticleColor()
    };
  }

  getParticleColor() {
    switch (this.weatherType) {
      case 'rain': return 'rgba(180, 220, 255, 0.7)';
      case 'leaves': return 'rgba(255, 180, 190, 0.75)'; // cherry blossom pink
      case 'fireflies': return 'rgba(255, 235, 120, 0.8)';
      case 'sunset': return 'rgba(255, 200, 150, 0.5)';
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  }

  addFirework(x, y) {
    const colors = ['#ff4081', '#7c4dff', '#00e676', '#ffd700', '#00e5ff', '#ff6e40'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.2);
      const speed = Math.random() * 4 + 2;
      this.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.012,
        size: Math.random() * 2.5 + 1.5
      });
    }
  }

  update(dt = 0.016) {
    this.time += dt;

    // Camera shake decay
    if (this.camera.shake > 0) {
      this.camera.shake = Math.max(0, this.camera.shake - dt * 10);
    }

    // Camera zoom lerp
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;

    // Train passing scenery motion
    if (this.currentScene === 'train_interior') {
      this.trainOffset += dt * 450;
    }

    // Update weather particles
    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > this.height + 20 || p.x < -200 || p.x > this.width + 200) {
        Object.assign(p, this.createParticle(false));
      }
    }

    // Update fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.04; // gravity
      fw.alpha -= fw.decay;
      if (fw.alpha <= 0) {
        this.fireworks.splice(i, 1);
      }
    }
  }

  // --- Rendering Pipeline ---

  render(sceneName, player, npcs = [], interactiveObjects = []) {
    this.currentScene = sceneName;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Apply Camera Transform & Screen Shake
    const shakeX = (Math.random() - 0.5) * this.camera.shake * 8;
    const shakeY = (Math.random() - 0.5) * this.camera.shake * 8;

    ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.width / 2 - this.camera.x, -this.height / 2 - this.camera.y);

    // 1. Draw Environmental Background
    this.drawSceneBackground(sceneName);

    // 2. Draw Interactive Environmental Objects (Desks, Benches, Signs, etc.)
    for (let obj of interactiveObjects) {
      this.drawInteractiveObject(obj);
    }

    // 3. Draw NPCs
    for (let npc of npcs) {
      this.drawCharacter(npc);
    }

    // 4. Draw Player (RK)
    if (player) {
      this.drawCharacter(player);
    }

    // 5. Draw Foreground Details & Lighting
    this.drawSceneForeground(sceneName);

    ctx.restore();

    // 6. Draw Weather Particles (Overlay Layer)
    this.drawWeatherParticles();

    // 7. Draw Fireworks (if active)
    this.drawFireworks();

    // 8. Draw Vignette & Cinematic Color Grading
    this.drawCinematicLighting(sceneName);
  }

  // --- Anime Backgrounds ---

  drawSceneBackground(scene) {
    const ctx = this.ctx;

    switch (scene) {
      case 'morning_road':
        this.drawMorningRoad();
        break;
      case 'school_courtyard':
        this.drawSchoolCourtyard();
        break;
      case 'classroom':
        this.drawClassroom();
        break;
      case 'sunset_hill':
        this.drawSunsetHill();
        break;
      case 'train_interior':
        this.drawTrainInterior();
        break;
      case 'rk_room':
        this.drawRKRoom();
        break;
      case 'festival_street':
        this.drawFestivalStreet();
        break;
      case 'festival_terrace':
        this.drawFestivalTerrace();
        break;
      case 'split_screen_crosscut':
        this.drawSplitScreen();
        break;
      case 'final_sunset_sky':
        this.drawFinalSunsetSky();
        break;
      default:
        this.drawMorningRoad();
    }
  }

  drawMorningRoad() {
    const ctx = this.ctx;
    // Sky gradient: Crisp morning blue to golden peach
    const sky = ctx.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, '#5b92e5');
    sky.addColorStop(0.6, '#9ac8eb');
    sky.addColorStop(1, '#ffe0b2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 2400, 720);

    // Distant mountains / town skyline silhouette
    ctx.fillStyle = '#7986cb';
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.bezierCurveTo(400, 300, 800, 380, 1200, 320);
    ctx.bezierCurveTo(1600, 290, 2000, 350, 2400, 310);
    ctx.lineTo(2400, 500);
    ctx.lineTo(0, 500);
    ctx.fill();

    // Distant Houses & Brick School walls
    ctx.fillStyle = '#9fa8da';
    ctx.fillRect(100, 280, 200, 100);
    ctx.fillRect(400, 260, 260, 120);
    ctx.fillRect(800, 270, 300, 110);
    ctx.fillRect(1300, 250, 400, 130);

    // Green Foliage / Anime Trees
    this.drawAnimeTree(200, 340, 110, '#388e3c', '#81c784');
    this.drawAnimeTree(520, 320, 140, '#2e7d32', '#66bb6a');
    this.drawAnimeTree(980, 330, 130, '#1b5e20', '#4caf50');
    this.drawAnimeTree(1550, 310, 160, '#2e7d32', '#81c784');

    // Road & Pavement
    ctx.fillStyle = '#616161';
    ctx.fillRect(0, 440, 2400, 280);

    // Sidewalk
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(0, 410, 2400, 40);
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    for (let x = 0; x < 2400; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 410);
      ctx.lineTo(x, 450);
      ctx.stroke();
    }

    // Road White Markings
    ctx.fillStyle = '#ffffff';
    for (let x = 40; x < 2400; x += 140) {
      ctx.fillRect(x, 560, 70, 8);
    }

    // Telephone Poles & Wires
    this.drawTelephonePole(350, 150);
    this.drawTelephonePole(900, 150);
    this.drawTelephonePole(1500, 150);
  }

  drawSchoolCourtyard() {
    const ctx = this.ctx;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, '#42a5f5');
    sky.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 2400, 720);

    // School Main Building (Anime Aesthetic with large glass windows)
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(150, 140, 1600, 320);

    // Roof border
    ctx.fillStyle = '#5c6bc0';
    ctx.fillRect(130, 120, 1640, 25);

    // Windows with sky reflection
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 12; c++) {
        const wx = 200 + c * 130;
        const wy = 170 + r * 80;
        ctx.fillStyle = '#1e88e5';
        ctx.fillRect(wx, wy, 80, 50);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 40, wy);
        ctx.lineTo(wx + 20, wy + 50);
        ctx.lineTo(wx, wy + 50);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx, wy, 80, 50);
      }
    }

    // Courtyard Ground (Brick cobblestone path & garden lawns)
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, 460, 2400, 260);

    // Stone pathway
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(0, 490, 2400, 140);
    ctx.strokeStyle = '#bcaaa4';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 2400; x += 40) {
      ctx.strokeRect(x, 490, 40, 70);
      ctx.strokeRect(x + 20, 560, 40, 70);
    }

    // Cherry Blossom Trees
    this.drawSakuraTree(320, 380, 140);
    this.drawSakuraTree(1100, 370, 150);
    this.drawSakuraTree(1800, 390, 135);
  }

  drawClassroom() {
    const ctx = this.ctx;
    // Classroom wooden floor & pastel walls
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(0, 0, 1600, 450);

    // Large Window on Left looking outside
    ctx.fillStyle = '#81d4fa';
    ctx.fillRect(60, 60, 380, 280);
    // Passing anime clouds outside window
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(160 + (this.time * 8) % 300, 140, 35, 0, Math.PI * 2);
    ctx.arc(200 + (this.time * 8) % 300, 130, 45, 0, Math.PI * 2);
    ctx.arc(240 + (this.time * 8) % 300, 145, 30, 0, Math.PI * 2);
    ctx.fill();

    // Window frame
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, 380, 280);
    ctx.beginPath();
    ctx.moveTo(250, 60); ctx.lineTo(250, 340);
    ctx.moveTo(60, 200); ctx.lineTo(440, 200);
    ctx.stroke();

    // Green Blackboard at front
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(520, 80, 550, 220);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 6;
    ctx.strokeRect(520, 80, 550, 220);

    // Chalk writings on blackboard
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px sans-serif';
    ctx.fillText("Semester Final Project - Record Submission", 550, 130);
    ctx.fillText("Signature Deadline: Today 4:00 PM", 550, 170);

    // Polished Wooden Floor
    const wood = ctx.createLinearGradient(0, 450, 0, 720);
    wood.addColorStop(0, '#d7ccc8');
    wood.addColorStop(1, '#a1887f');
    ctx.fillStyle = wood;
    ctx.fillRect(0, 450, 1600, 270);

    // Floor planks
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    for (let y = 450; y < 720; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1600, y);
      ctx.stroke();
    }
  }

  drawSunsetHill() {
    const ctx = this.ctx;
    // Breathtaking sunset sky: Orange, purple, crimson
    const sunset = ctx.createLinearGradient(0, 0, 0, 500);
    sunset.addColorStop(0, '#311b92');
    sunset.addColorStop(0.3, '#7b1fa2');
    sunset.addColorStop(0.6, '#e64a19');
    sunset.addColorStop(0.85, '#ff8f00');
    sunset.addColorStop(1, '#ffe082');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, 1800, 720);

    // Giant Glowing Sun
    const sunGrad = ctx.createRadialGradient(900, 380, 10, 900, 380, 140);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#ffe082');
    sunGrad.addColorStop(0.7, 'rgba(255, 112, 67, 0.4)');
    sunGrad.addColorStop(1, 'rgba(255, 112, 67, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(900, 380, 140, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = '#261b36';
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.bezierCurveTo(300, 380, 600, 460, 900, 400);
    ctx.bezierCurveTo(1200, 350, 1500, 430, 1800, 390);
    ctx.lineTo(1800, 720);
    ctx.lineTo(0, 720);
    ctx.fill();

    // Hill foreground
    ctx.fillStyle = '#180f24';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.bezierCurveTo(450, 470, 900, 530, 1800, 480);
    ctx.lineTo(1800, 720);
    ctx.lineTo(0, 720);
    ctx.fill();

    // Silhouette Tree on Hill
    this.drawSilhouetteTree(1350, 480, 160);
  }

  drawTrainInterior() {
    const ctx = this.ctx;
    // 1. Passing Landscape Outside Train Window (Parallax scrolling)
    const sky = ctx.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, '#546e7a');
    sky.addColorStop(1, '#90a4ae');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1800, 720);

    // Passing Hills outside (offset)
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    const off = (this.trainOffset * 0.3) % 800;
    ctx.moveTo(-off, 340);
    for (let x = -800; x < 2600; x += 400) {
      ctx.quadraticCurveTo(x + 200 - off, 260, x + 400 - off, 340);
    }
    ctx.lineTo(2600, 500);
    ctx.lineTo(-800, 500);
    ctx.fill();

    // Passing Green Countryside & Trees
    ctx.fillStyle = '#37474f';
    const treeOff = this.trainOffset % 600;
    for (let x = -600; x < 2400; x += 250) {
      this.drawAnimeTree(x - treeOff, 380, 90, '#263238', '#455a64');
    }

    // 2. Train Interior Coach Structure
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(0, 0, 1800, 120); // Train ceiling
    ctx.fillRect(0, 440, 1800, 280); // Train floor

    // Train Window Pillars
    ctx.fillStyle = '#cfd8dc';
    for (let x = 0; x < 1800; x += 420) {
      ctx.fillRect(x, 0, 60, 480);
    }

    // Rain Streaks on Glass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 47 + this.time * 20) % 1800;
      const ry = (i * 31 + this.time * 120) % 320 + 120;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 22);
      ctx.stroke();
    }

    // Train Passenger Blue Plush Seats
    for (let x = 80; x < 1800; x += 420) {
      // Seat Back
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(x, 320, 140, 130);
      // Seat Cushion
      ctx.fillStyle = '#1565c0';
      ctx.fillRect(x - 10, 430, 160, 45);
      // Metal Leg
      ctx.fillStyle = '#78909c';
      ctx.fillRect(x + 60, 475, 20, 60);
    }

    // Soft overhead warm light
    const trainLight = ctx.createLinearGradient(0, 120, 0, 400);
    trainLight.addColorStop(0, 'rgba(255, 249, 196, 0.25)');
    trainLight.addColorStop(1, 'rgba(255, 249, 196, 0)');
    ctx.fillStyle = trainLight;
    ctx.fillRect(0, 120, 1800, 280);
  }

  drawRKRoom() {
    const ctx = this.ctx;
    // Dark cozy bedroom at night
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1400, 720);

    // Window on wall showing deep starry night
    ctx.fillStyle = '#020617';
    ctx.fillRect(100, 80, 320, 260);
    // Stars in window
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const sx = 120 + ((i * 37) % 280);
      const sy = 100 + ((i * 23) % 220);
      ctx.fillRect(sx, sy, 2, 2);
    }
    // Window frame
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(100, 80, 320, 260);

    // Desk & Laptop
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(500, 380, 500, 180);
    // Laptop Screen Glowing
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(660, 300, 180, 110);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(670, 310, 160, 90);
    // Text on laptop (Infinity Kingdom)
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '10px sans-serif';
    ctx.fillText("INFINITY KINGDOM ONLINE", 680, 340);
    ctx.fillText("Player: Charlotte (Online)", 680, 360);

    // Warm Desk Lamp Light
    const lampGlow = ctx.createRadialGradient(580, 320, 10, 580, 320, 220);
    lampGlow.addColorStop(0, 'rgba(255, 213, 79, 0.6)');
    lampGlow.addColorStop(1, 'rgba(255, 213, 79, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(580, 320, 220, 0, Math.PI * 2);
    ctx.fill();

    // Wooden floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 560, 1400, 160);
  }

  drawFestivalStreet() {
    const ctx = this.ctx;
    // Night sky
    const night = ctx.createLinearGradient(0, 0, 0, 400);
    night.addColorStop(0, '#0a0a23');
    night.addColorStop(1, '#1b1b42');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, 2000, 720);

    // Town Festival Lanterns String across sky
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.bezierCurveTo(500, 240, 1000, 180, 1500, 230);
    ctx.lineTo(2000, 170);
    ctx.stroke();

    // Glowing Yellow & Orange Lanterns
    for (let x = 60; x < 2000; x += 110) {
      const ly = 160 + Math.sin(x * 0.005) * 35;
      // Glow
      const lGlow = ctx.createRadialGradient(x, ly, 5, x, ly, 35);
      lGlow.addColorStop(0, 'rgba(255, 183, 77, 0.8)');
      lGlow.addColorStop(1, 'rgba(255, 183, 77, 0)');
      ctx.fillStyle = lGlow;
      ctx.beginPath();
      ctx.arc(x, ly, 35, 0, Math.PI * 2);
      ctx.fill();

      // Lantern body
      ctx.fillStyle = '#ff7043';
      ctx.fillRect(x - 10, ly - 14, 20, 28);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(x - 6, ly - 8, 12, 16);
    }

    // Wooden Festival Stalls
    for (let x = 120; x < 2000; x += 440) {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(x, 320, 200, 160);
      // Striped awning
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(x - 10, 290, 220, 35);
      ctx.fillStyle = '#fff';
      for (let s = 0; s < 220; s += 40) {
        ctx.fillRect(x - 10 + s, 290, 20, 35);
      }
    }

    // Cobblestone ground
    ctx.fillStyle = '#37474f';
    ctx.fillRect(0, 480, 2000, 240);
  }

  drawFestivalTerrace() {
    const ctx = this.ctx;
    // Night sky overlooking glowing town
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, '#090814');
    sky.addColorStop(0.7, '#1b1335');
    sky.addColorStop(1, '#3b1c54');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1600, 720);

    // Distant glowing town lights
    for (let i = 0; i < 60; i++) {
      const tx = (i * 27) % 1600;
      const ty = 400 + ((i * 19) % 80);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 0, 0.7)' : 'rgba(255, 100, 100, 0.7)';
      ctx.fillRect(tx, ty, 4, 4);
    }

    // Rooftop Terrace Floor & Railing
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 480, 1600, 240);

    // Metallic Terrace Railing
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 440); ctx.lineTo(1600, 440);
    ctx.moveTo(0, 470); ctx.lineTo(1600, 470);
    ctx.stroke();
    for (let x = 40; x < 1600; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 440);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
  }

  drawSplitScreen() {
    const ctx = this.ctx;
    // Split screen: Left = India Terrace (RK), Right = Philippines Room (Charlotte)
    const midX = 640;

    // LEFT HALF: India Terrace
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, midX, 720);
    ctx.clip();
    this.drawFestivalTerrace();
    // India text badge
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(30, 30, 130, 32);
    ctx.fillStyle = '#ffb74d';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText("INDIA • 10:45 PM", 42, 51);
    ctx.restore();

    // RIGHT HALF: Philippines Room
    ctx.save();
    ctx.beginPath();
    ctx.rect(midX, 0, 640, 720);
    ctx.clip();
    // Warm pastel bedroom in Manila
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(midX, 0, 640, 720);
    // Window with tropical palm silhouettes
    ctx.fillStyle = '#0d0a1a';
    ctx.fillRect(midX + 220, 80, 240, 260);
    ctx.strokeStyle = '#4a3b5a';
    ctx.lineWidth = 4;
    ctx.strokeRect(midX + 220, 80, 240, 260);
    // Soft Pink/Warm Lamp glow
    const pGlow = ctx.createRadialGradient(midX + 160, 360, 10, midX + 160, 360, 200);
    pGlow.addColorStop(0, 'rgba(244, 143, 177, 0.45)');
    pGlow.addColorStop(1, 'rgba(244, 143, 177, 0)');
    ctx.fillStyle = pGlow;
    ctx.beginPath();
    ctx.arc(midX + 160, 360, 200, 0, Math.PI * 2);
    ctx.fill();
    // Floor
    ctx.fillStyle = '#2d2438';
    ctx.fillRect(midX, 480, 640, 240);

    // Philippines text badge
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(midX + 30, 30, 170, 32);
    ctx.fillStyle = '#f48fb1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText("PHILIPPINES • 1:15 AM", midX + 42, 51);
    ctx.restore();

    // Center Glowing Neon Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, 720);
    ctx.stroke();
  }

  drawFinalSunsetSky() {
    const ctx = this.ctx;
    // Spectacular cinematic masterpiece sunset gradient
    const sunset = ctx.createLinearGradient(0, 0, 0, 720);
    sunset.addColorStop(0, '#1a0826');
    sunset.addColorStop(0.25, '#4a154b');
    sunset.addColorStop(0.5, '#ad2459');
    sunset.addColorStop(0.75, '#e65100');
    sunset.addColorStop(0.9, '#f57c00');
    sunset.addColorStop(1, '#ffe082');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, 1600, 720);

    // Volumetric Light Rays (God Rays)
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#fff';
    for (let a = -0.6; a <= 0.6; a += 0.2) {
      ctx.beginPath();
      ctx.moveTo(800, 520);
      ctx.lineTo(800 + Math.sin(a) * 1200, 0);
      ctx.lineTo(800 + Math.sin(a + 0.1) * 1200, 0);
      ctx.fill();
    }
    ctx.restore();

    // Multi-layer anime clouds
    this.drawAnimeCloud(250, 280, 220, 'rgba(255, 171, 145, 0.7)');
    this.drawAnimeCloud(850, 220, 280, 'rgba(244, 143, 177, 0.6)');
    this.drawAnimeCloud(1280, 320, 240, 'rgba(255, 204, 128, 0.65)');

    // Birds flying toward horizon
    ctx.strokeStyle = '#261b36';
    ctx.lineWidth = 2;
    const birdTime = this.time * 20;
    [[450, 180], [480, 165], [520, 190], [560, 175]].forEach(([bx, by]) => {
      const curX = (bx + birdTime) % 1800;
      const wing = Math.sin(this.time * 6) * 6;
      ctx.beginPath();
      ctx.moveTo(curX - 10, by + wing);
      ctx.quadraticCurveTo(curX - 5, by - 4, curX, by);
      ctx.quadraticCurveTo(curX + 5, by - 4, curX + 10, by + wing);
      ctx.stroke();
    });
  }

  // --- Character Rendering System ---

  drawCharacter(char) {
    const ctx = this.ctx;
    const { x, y, type = 'rk', isMoving = false, facing = 'right', state = 'idle' } = char;

    ctx.save();
    ctx.translate(x, y);
    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Character shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking leg bob & bounce
    const walkCycle = isMoving ? Math.sin(this.time * 10) : 0;
    const bob = isMoving ? Math.abs(Math.sin(this.time * 10)) * 4 : Math.sin(this.time * 2) * 1.5;

    ctx.translate(0, -bob);

    // Render by Character Type
    switch (type) {
      case 'rk':
        this.renderRKSprite(ctx, walkCycle, state);
        break;
      case 'friend1':
        this.renderFriend1Sprite(ctx, walkCycle, state);
        break;
      case 'friend2':
        this.renderFriend2Sprite(ctx, walkCycle, state);
        break;
      case 'firstlove':
        this.renderFirstLoveSprite(ctx, walkCycle, state);
        break;
      case 'charlotte':
        this.renderCharlotteSprite(ctx, walkCycle, state);
        break;
      default:
        this.renderRKSprite(ctx, walkCycle, state);
    }

    // Name badge indicator above character
    if (char.showNameBadge) {
      ctx.save();
      if (facing === 'left') ctx.scale(-1, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-35, -100, 70, 18);
      ctx.fillStyle = '#ffe082';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(char.name || 'RK', 0, -87);
      ctx.restore();
    }

    ctx.restore();
  }

  renderRKSprite(ctx, walk, state) {
    // RK: 21, Black neat anime hair, dark blue jacket/shirt, dark pants, beige backpack
    // Legs
    ctx.fillStyle = '#263238'; // pants
    ctx.fillRect(-10, -32, 8, 32 + walk * 6);
    ctx.fillRect(2, -32, 8, 32 - walk * 6);

    // Shoes
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-12, -2 + walk * 6, 11, 6);
    ctx.fillRect(0, -2 - walk * 6, 11, 6);

    // Torso / Shirt & Jacket
    ctx.fillStyle = '#1e3a5f'; // Navy jacket
    ctx.fillRect(-14, -62, 28, 32);
    ctx.fillStyle = '#eceff1'; // Inner white t-shirt collar
    ctx.fillRect(-4, -62, 8, 12);

    // Backpack straps
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-11, -60, 4, 28);
    ctx.fillRect(7, -60, 4, 28);

    // Arms
    if (state === 'phone') {
      // Holding phone in front
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(4, -54, 16, 8);
      ctx.fillStyle = '#0284c7'; // Phone
      ctx.fillRect(16, -58, 6, 12);
    } else if (state === 'shy') {
      // Hand touching neck / looking away
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(-8, -54, 8, 20);
      ctx.fillRect(4, -58, 10, 16);
    } else {
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(-16, -60, 6, 24 - walk * 4);
      ctx.fillRect(10, -60, 6, 24 + walk * 4);
    }

    // Head / Face
    ctx.fillStyle = '#ffdfba'; // Soft anime skin tone
    ctx.beginPath();
    ctx.arc(0, -72, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e293b';
    if (state === 'shy') {
      // Shy glancing away
      ctx.fillRect(2, -74, 3, 4);
      // Soft blush
      ctx.fillStyle = 'rgba(255, 138, 128, 0.7)';
      ctx.fillRect(-4, -70, 4, 2);
      ctx.fillRect(4, -70, 4, 2);
    } else {
      ctx.fillRect(2, -74, 3, 4);
      ctx.fillRect(7, -74, 3, 4);
    }

    // Anime Hair (Messy, styled black bangs)
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(0, -76, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    // Front bangs
    ctx.beginPath();
    ctx.moveTo(-13, -76);
    ctx.lineTo(-4, -68);
    ctx.lineTo(2, -75);
    ctx.lineTo(8, -67);
    ctx.lineTo(13, -76);
    ctx.fill();
  }

  renderFriend1Sprite(ctx, walk, state) {
    // Energetic Friend 1: Orange/red hoodie, spiky hair
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-10, -32, 8, 32 + walk * 6);
    ctx.fillRect(2, -32, 8, 32 - walk * 6);

    ctx.fillStyle = '#ff7043'; // Bright hoodie
    ctx.fillRect(-14, -62, 28, 32);

    ctx.fillStyle = '#ffdfba';
    ctx.beginPath();
    ctx.arc(0, -72, 12, 0, Math.PI * 2);
    ctx.fill();

    // Spiky Brown Hair
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(-14, -75);
    ctx.lineTo(-6, -88);
    ctx.lineTo(0, -78);
    ctx.lineTo(8, -90);
    ctx.lineTo(14, -75);
    ctx.fill();

    // Cheerful Eyes & Smile
    ctx.fillStyle = '#212121';
    ctx.fillRect(2, -74, 3, 3);
    ctx.fillRect(7, -74, 3, 3);
  }

  renderFriend2Sprite(ctx, walk, state) {
    // Calm Friend 2: Green jacket, glasses, neat dark hair
    ctx.fillStyle = '#263238';
    ctx.fillRect(-10, -32, 8, 32 + walk * 6);
    ctx.fillRect(2, -32, 8, 32 - walk * 6);

    ctx.fillStyle = '#2e7d32'; // Forest green jacket
    ctx.fillRect(-14, -62, 28, 32);

    ctx.fillStyle = '#ffdfba';
    ctx.beginPath();
    ctx.arc(0, -72, 12, 0, Math.PI * 2);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, -76, 5, 4);
    ctx.strokeRect(8, -76, 5, 4);

    // Neat Hair
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(0, -76, 13, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  renderFirstLoveSprite(ctx, walk, state) {
    // First Love Girl: Elegant navy skirt, cream sweater, long flowing dark hair, pink hairclip
    // Legs & White socks
    ctx.fillStyle = '#ffdfba';
    ctx.fillRect(-9, -32, 7, 32 + walk * 6);
    ctx.fillRect(2, -32, 7, 32 - walk * 6);

    // Skirt
    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.moveTo(-12, -38);
    ctx.lineTo(12, -38);
    ctx.lineTo(16, -26);
    ctx.lineTo(-16, -26);
    ctx.fill();

    // Cream Knit Sweater
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(-13, -62, 26, 26);

    // Flowing Long Hair (Back)
    ctx.fillStyle = '#212121';
    ctx.fillRect(-14, -75, 28, 45);

    // Face
    ctx.fillStyle = '#ffdfba';
    ctx.beginPath();
    ctx.arc(0, -72, 12, 0, Math.PI * 2);
    ctx.fill();

    // Elegant Eyes & Blush
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(2, -74, 3, 4);
    ctx.fillRect(7, -74, 3, 4);
    ctx.fillStyle = 'rgba(255, 128, 171, 0.8)';
    ctx.fillRect(-4, -69, 4, 2);
    ctx.fillRect(4, -69, 4, 2);

    // Front Hair & Cute Hairclip
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, -76, 13, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4081'; // Pink hairclip
    ctx.fillRect(8, -80, 4, 4);
  }

  renderCharlotteSprite(ctx, walk, state) {
    // Charlotte: Warm lavender/coral oversized sweater, long hair with soft side-braid
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-9, -32, 7, 32 + walk * 6);
    ctx.fillRect(2, -32, 7, 32 - walk * 6);

    // Cozy Lavender Sweater
    ctx.fillStyle = '#ce93d8';
    ctx.fillRect(-14, -62, 28, 32);

    // Long Soft Brown Hair
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-14, -75, 28, 48);

    // Face
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.arc(0, -72, 12, 0, Math.PI * 2);
    ctx.fill();

    // Gentle mature anime eyes
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(2, -74, 3, 4);
    ctx.fillRect(7, -74, 3, 4);

    // Warm smile
    ctx.strokeStyle = '#d81b60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(5, -68, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Hair Ribbon
    ctx.fillStyle = '#f48fb1';
    ctx.fillRect(10, -56, 6, 6);
  }

  // --- Scenery Helpers ---

  drawAnimeTree(x, y, radius, darkColor, lightColor) {
    const ctx = this.ctx;
    // Trunk
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(x - 14, y, 28, 120);

    // Foliage puffs
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.arc(x - radius * 0.5, y - radius * 0.3, radius * 0.6, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.5, y - radius * 0.3, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(x - 10, y - 20, radius * 0.7, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.3, y - radius * 0.4, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSakuraTree(x, y, radius) {
    this.drawAnimeTree(x, y, radius, '#f48fb1', '#f8bbd0');
  }

  drawSilhouetteTree(x, y, radius) {
    const ctx = this.ctx;
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(x - 10, y, 20, 140);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.arc(x - radius * 0.4, y - radius * 0.2, radius * 0.5, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.4, y - radius * 0.2, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAnimeCloud(x, y, size, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTelephonePole(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#37474f';
    ctx.fillRect(x - 4, y, 8, 300);
    ctx.fillRect(x - 30, y + 20, 60, 6);
    ctx.fillRect(x - 20, y + 50, 40, 6);

    // Power line cables
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 20);
    ctx.quadraticCurveTo(x + 300, y + 80, x + 600, y + 20);
    ctx.stroke();
  }

  drawInteractiveObject(obj) {
    const ctx = this.ctx;
    const { x, y, type, label } = obj;

    switch (type) {
      case 'record_desk':
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x - 30, y - 25, 60, 40);
        // Record notebook
        ctx.fillStyle = '#d32f2f'; // Red hardcover notebook
        ctx.fillRect(x - 12, y - 18, 24, 18);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 10, y - 16, 20, 14);
        break;
      case 'train_seat':
        // Seat highlight
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 25, y - 30, 50, 50);
        break;
      case 'bench':
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(x - 35, y - 15, 70, 25);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(x - 30, y + 10, 10, 15);
        ctx.fillRect(x + 20, y + 10, 10, 15);
        break;
      default:
        break;
    }
  }

  drawSceneForeground(scene) {
    // Optional scene foreground elements
  }

  drawWeatherParticles() {
    const ctx = this.ctx;
    for (let p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (this.weatherType === 'leaves') {
        // Oval cherry blossom petal
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.weatherType === 'rain') {
        // Rain streak
        ctx.fillRect(0, 0, 1.5, p.size * 4);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawFireworks() {
    const ctx = this.ctx;
    for (let fw of this.fireworks) {
      ctx.save();
      ctx.globalAlpha = fw.alpha;
      ctx.fillStyle = fw.color;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawCinematicLighting(scene) {
    const ctx = this.ctx;
    // Vignette
    const vig = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.35,
      this.width / 2, this.height / 2, this.width * 0.7
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // --- High-Quality Character Portraits for Dialogue Box ---

  initPortraits() {
    const characters = ['rk', 'friend1', 'friend2', 'firstlove', 'charlotte', 'narrator'];
    characters.forEach(char => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 180;
      pCanvas.height = 180;
      const pCtx = pCanvas.getContext('2d');
      this.renderDetailedPortrait(pCtx, char);
      this.portraitCache[char] = pCanvas;
    });
  }

  renderDetailedPortrait(ctx, char) {
    // Draw rich anime bust portrait on 180x180 canvas
    ctx.clearRect(0, 0, 180, 180);

    // Soft gradient background for portrait frame
    const bg = ctx.createRadialGradient(90, 90, 20, 90, 90, 90);
    bg.addColorStop(0, '#1e293b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 180, 180);

    ctx.save();
    ctx.translate(90, 110);

    if (char === 'rk') {
      // RK Bust
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(-45, 10, 90, 70); // Jacket
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(-15, 10, 30, 25); // Shirt

      ctx.fillStyle = '#ffdfba'; // Neck & Face
      ctx.fillRect(-12, -10, 24, 25);
      ctx.beginPath();
      ctx.ellipse(0, -35, 36, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.arc(0, -42, 42, Math.PI, Math.PI * 2);
      ctx.fill();
      // Bangs
      ctx.beginPath();
      ctx.moveTo(-40, -40); ctx.lineTo(-15, -20); ctx.lineTo(5, -35); ctx.lineTo(25, -18); ctx.lineTo(40, -40);
      ctx.fill();

      // Expressive quiet eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, -38, 10, 12);
      ctx.fillRect(8, -38, 10, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-14, -36, 4, 4);
      ctx.fillRect(12, -36, 4, 4);

    } else if (char === 'friend1') {
      // Friend 1 Bust
      ctx.fillStyle = '#ff7043';
      ctx.fillRect(-45, 10, 90, 70);

      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.ellipse(0, -35, 36, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spiky Hair
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.moveTo(-40, -40); ctx.lineTo(-20, -75); ctx.lineTo(0, -50); ctx.lineTo(25, -78); ctx.lineTo(40, -40);
      ctx.fill();

      // Lively Eyes & Grin
      ctx.fillStyle = '#212121';
      ctx.fillRect(-18, -38, 10, 10);
      ctx.fillRect(8, -38, 10, 10);
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 8, 0, Math.PI);
      ctx.stroke();

    } else if (char === 'friend2') {
      // Friend 2 Bust
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(-45, 10, 90, 70);

      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.ellipse(0, -35, 36, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.arc(0, -42, 40, Math.PI, Math.PI * 2);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-22, -42, 18, 14);
      ctx.strokeRect(4, -42, 18, 14);
      ctx.beginPath(); ctx.moveTo(-4, -35); ctx.lineTo(4, -35); ctx.stroke();

    } else if (char === 'firstlove') {
      // First Love Bust
      ctx.fillStyle = '#fff9c4';
      ctx.fillRect(-45, 10, 90, 70);

      // Back flowing dark hair
      ctx.fillStyle = '#212121';
      ctx.fillRect(-42, -45, 84, 90);

      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.ellipse(0, -35, 35, 44, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft blush
      ctx.fillStyle = 'rgba(255, 128, 171, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-18, -25, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(18, -25, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elegant eyes
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-18, -38, 10, 14);
      ctx.fillRect(8, -38, 10, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-15, -36, 4, 5);
      ctx.fillRect(11, -36, 4, 5);

      // Front hair & Pink hairclip
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(0, -42, 40, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4081';
      ctx.fillRect(20, -55, 10, 10);

    } else if (char === 'charlotte') {
      // Charlotte Bust
      ctx.fillStyle = '#ce93d8';
      ctx.fillRect(-45, 10, 90, 70);

      // Soft Brown Waves
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-42, -45, 84, 90);

      ctx.fillStyle = '#ffe0b2';
      ctx.beginPath();
      ctx.ellipse(0, -35, 36, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm mature eyes
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-18, -38, 10, 14);
      ctx.fillRect(8, -38, 10, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-15, -36, 4, 5);
      ctx.fillRect(11, -36, 4, 5);

      // Warm smile
      ctx.strokeStyle = '#c2185b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Front Hair & Ribbon
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.arc(0, -42, 41, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f48fb1';
      ctx.fillRect(22, -25, 12, 12);

    } else {
      // MPC / Narrator icon
      ctx.fillStyle = '#d1c4e9';
      ctx.font = '36px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText("MPC", 0, -25);
    }

    ctx.restore();
  }

  getPortrait(name) {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.portraitCache[key] || this.portraitCache['narrator'];
  }
}

// Global graphics reference
window.GraphicsEngine = GraphicsEngine;
