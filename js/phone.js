/**
 * THE FINAL SUNSET - Smartphone Messenger & Infinity Kingdom Engine
 * Simulates RK's smartphone OS, messaging apps, photo exchanges, translator quirks,
 * and the fictional online game "Infinity Kingdom".
 */

class SmartphoneSystem {
  constructor() {
    this.phoneModal = document.getElementById('phone-modal');
    this.chatBody = document.getElementById('phone-chat-body');
    this.contactName = document.getElementById('phone-contact-name');
    this.contactAvatar = document.getElementById('phone-contact-avatar');
    this.closeBtn = document.getElementById('phone-close-btn');

    this.ikModal = document.getElementById('ik-modal');
    this.ikCanvas = document.getElementById('ik-viewport-canvas');
    this.ikChat = document.getElementById('ik-chat-messages');

    this.isOpen = false;
    this.isIKOpen = false;

    this.messages = [];
    this.ikLoop = null;

    this.setupListeners();
  }

  setupListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closePhone());
    }
  }

  openPhone(contact = 'Charlotte') {
    this.isOpen = true;
    if (this.phoneModal) this.phoneModal.style.display = 'flex';
    if (this.contactName) this.contactName.innerText = contact;
    if (this.contactAvatar) {
      this.contactAvatar.innerText = contact === 'Charlotte' ? '🌸' : '🎒';
    }
  }

  closePhone() {
    this.isOpen = false;
    if (this.phoneModal) this.phoneModal.style.display = 'none';
    if (window.mpc && window.mpc.pendingPhoneCallback) {
      const cb = window.mpc.pendingPhoneCallback;
      window.mpc.pendingPhoneCallback = null;
      cb();
    }
  }

  clearChat() {
    this.messages = [];
    if (this.chatBody) this.chatBody.innerHTML = '';
  }

  addMessage(sender, text, photoData = null, translatorNote = null) {
    const isOutgoing = sender === 'RK';
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`;

    let html = `<div>${text}</div>`;

    if (photoData) {
      html += `<img src="${photoData}" class="chat-photo-attachment" alt="Photo Attachment" />`;
    }

    if (translatorNote) {
      html += `<div class="translator-note">🌐 ${translatorNote}</div>`;
    }

    bubble.innerHTML = html;

    if (this.chatBody) {
      this.chatBody.appendChild(bubble);
      this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    if (window.audioManager) {
      window.audioManager.playNotification();
    }
  }

  // --- Photo Generators using Procedural Canvas ---

  generateRKPhoto() {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 240;
    const ctx = c.getContext('2d');

    // Background: Train station platform at sunrise
    const bg = ctx.createLinearGradient(0, 0, 0, 240);
    bg.addColorStop(0, '#64b5f6');
    bg.addColorStop(1, '#ffe0b2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 320, 240);

    // Train on track
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 100, 140, 110);
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(10, 120, 50, 40);

    // Platform
    ctx.fillStyle = '#757575';
    ctx.fillRect(0, 190, 320, 50);

    // RK Candid Selfie
    ctx.save();
    ctx.translate(220, 170);

    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(-35, 10, 70, 70); // Jacket

    ctx.fillStyle = '#ffdfba';
    ctx.beginPath();
    ctx.arc(0, -25, 28, 0, Math.PI * 2);
    ctx.fill();

    // Black Hair & Bangs
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(0, -30, 32, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-30, -30); ctx.lineTo(-10, -15); ctx.lineTo(10, -28); ctx.lineTo(30, -30);
    ctx.fill();

    // Shy gentle eyes & small smile
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -28, 8, 8);
    ctx.fillRect(6, -28, 8, 8);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();

    // Timestamp watermark
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px sans-serif';
    ctx.fillText("Station Platform • 7:28 AM", 12, 226);

    return c.toDataURL('image/png');
  }

  generateCharlottePhoto() {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 240;
    const ctx = c.getContext('2d');

    // Background: Manila Bay sunset
    const bg = ctx.createLinearGradient(0, 0, 0, 240);
    bg.addColorStop(0, '#512da8');
    bg.addColorStop(0.4, '#d81b60');
    bg.addColorStop(0.75, '#fb8c00');
    bg.addColorStop(1, '#ffe082');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 320, 240);

    // Ocean horizon
    ctx.fillStyle = '#283593';
    ctx.fillRect(0, 160, 320, 80);

    // Sun reflection on water
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.fillRect(130, 160, 60, 80);

    // Charlotte with camera in foreground
    ctx.save();
    ctx.translate(160, 165);

    // Lavender sweater
    ctx.fillStyle = '#ce93d8';
    ctx.fillRect(-40, 15, 80, 70);

    // Long brown wavy hair
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-38, -35, 76, 80);

    // Face
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.arc(0, -22, 28, 0, Math.PI * 2);
    ctx.fill();

    // Warm eyes & happy smile
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-14, -25, 7, 9);
    ctx.fillRect(7, -25, 7, 9);
    ctx.strokeStyle = '#c2185b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -10, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Hair ribbon
    ctx.fillStyle = '#f48fb1';
    ctx.fillRect(18, -15, 10, 10);

    // Vintage Camera hanging around neck
    ctx.fillStyle = '#212121';
    ctx.fillRect(-18, 25, 36, 22);
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(0, 36, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '11px sans-serif';
    ctx.fillText("Manila Bay Sunset • 6:15 PM", 12, 226);

    return c.toDataURL('image/png');
  }

  // --- Infinity Kingdom Game-Within-a-Game ---

  openInfinityKingdom() {
    this.isIKOpen = true;
    if (this.ikModal) this.ikModal.style.display = 'flex';
    this.initIKViewport();
  }

  closeInfinityKingdom() {
    this.isIKOpen = false;
    if (this.ikModal) this.ikModal.style.display = 'none';
    if (this.ikLoop) cancelAnimationFrame(this.ikLoop);
  }

  initIKViewport() {
    if (!this.ikCanvas) return;
    const ctx = this.ikCanvas.getContext('2d');
    this.ikCanvas.width = 460;
    this.ikCanvas.height = 420;

    let time = 0;
    const renderIK = () => {
      if (!this.isIKOpen) return;
      time += 0.02;

      // Fantasy galaxy sky
      const sky = ctx.createLinearGradient(0, 0, 0, 420);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.5, '#311042');
      sky.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 460, 420);

      // Floating crystal island
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(230, 280, 180, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.ellipse(230, 275, 175, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing magical crystal
      const cGlow = ctx.createRadialGradient(230, 210, 5, 230, 210, 50);
      cGlow.addColorStop(0, '#a5f3fc');
      cGlow.addColorStop(0.6, 'rgba(129, 140, 248, 0.4)');
      cGlow.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = cGlow;
      ctx.beginPath();
      ctx.arc(230, 210, 50, 0, Math.PI * 2);
      ctx.fill();

      // Crystal polygon
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(230, 175);
      ctx.lineTo(245, 210);
      ctx.lineTo(230, 245);
      ctx.lineTo(215, 210);
      ctx.fill();

      // Chibi RK Hero Avatar (Blue cloak)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(160, 240, 20, 28);
      ctx.fillStyle = '#ffe0b2';
      ctx.beginPath(); ctx.arc(170, 232, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px sans-serif';
      ctx.fillText("RK [Lv.14]", 150, 220);

      // Chibi Charlotte Hero Avatar (Pink Mage)
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(290, 240, 20, 28);
      ctx.fillStyle = '#ffe0b2';
      ctx.beginPath(); ctx.arc(300, 232, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f9a8d4';
      ctx.fillText("Charlotte [Lv.18]", 270, 220);

      this.ikLoop = requestAnimationFrame(renderIK);
    };

    renderIK();
  }

  addIKChatMessage(author, text, isCharlotte = false) {
    if (!this.ikChat) return;
    const line = document.createElement('div');
    line.className = 'ik-chat-line';
    line.innerHTML = `<span class="ik-chat-author ${isCharlotte ? 'charlotte' : 'rk'}">[${author}]:</span> ${text}`;
    this.ikChat.appendChild(line);
    this.ikChat.scrollTop = this.ikChat.scrollHeight;
  }
}

window.smartphone = new SmartphoneSystem();
