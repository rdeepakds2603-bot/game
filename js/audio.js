/**
 * THE FINAL SUNSET - Audio Engine
 * Web Audio API procedural synthesizer for dynamic background music and sound effects.
 * Zero external asset dependencies, zero lag, smooth scene fading.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.bgmInterval = null;
    this.bgmVolume = 0.7;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.isInitialized = false;

    // Ambient loop nodes
    this.ambientNodes = {};
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setBGMVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.isMuted ? 0 : this.bgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.isMuted ? 0 : this.bgmVolume, this.ctx.currentTime, 0.05);
      this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // --- Sound Effects (SFX) ---

  playTypeBlip(char) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Gentle warm blip
      osc.type = 'sine';
      const freq = 440 + ((char.charCodeAt(0) % 7) * 30);
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  playHeartbeat() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Double thump (lub-dub)
      [0, 0.22].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 68 : 56, now + offset);
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, now + offset);

        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch(e) {}
  }

  playNotification() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.4);
      });
    } catch(e) {}
  }

  playChoiceSelect() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch(e) {}
  }

  playCameraShutter() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // White noise click + lens click
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch(e) {}
  }

  playFirework() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Whistle up
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);

      oscGain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.43);

      // Boom burst
      const boomTime = now + 0.42;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, boomTime);
      filter.frequency.linearRampToValueAtTime(80, boomTime + 0.6);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5 * this.sfxVolume, boomTime);
      gain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.75);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(boomTime);
    } catch(e) {}
  }

  playFootstep() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

      gain.gain.setValueAtTime(0.06 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch(e) {}
  }

  // --- Dynamic Piano & Ambient Synthesizer Engine ---

  playPianoNote(freq, time, duration = 1.8, velocity = 0.3) {
    if (!this.ctx || this.isMuted) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Fundamental + slight harmonic overtone for warm electric/acoustic anime piano
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * this.bgmVolume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);
  }

  playPadChord(freqs, time, duration = 4.0, volume = 0.12) {
    if (!this.ctx || this.isMuted) return;
    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume * this.bgmVolume, time + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + duration + 0.1);
    });
  }

  // --- Dynamic Theme Tracks ---

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentTrack = null;
    this.stopAmbience();
  }

  playTrack(trackName) {
    this.ensureContext();
    if (this.currentTrack === trackName) return;
    this.stopBGM();
    this.currentTrack = trackName;

    switch (trackName) {
      case 'morning':
        this.startMorningTheme();
        this.startBirdAmbience();
        break;
      case 'school':
        this.startSchoolTheme();
        break;
      case 'firstlove':
        this.startFirstLoveTheme();
        break;
      case 'secret':
        this.startSecretTheme();
        break;
      case 'sunset':
        this.startSunsetTheme();
        break;
      case 'train':
        this.startTrainTheme();
        this.startRainAmbience();
        break;
      case 'infinity':
        this.startInfinityTheme();
        break;
      case 'chat':
        this.startChatTheme();
        break;
      case 'festival':
        this.startFestivalTheme();
        break;
      case 'redflag':
        this.startRedFlagTheme();
        break;
      case 'finalsunset':
        this.startFinalSunsetTheme();
        break;
      default:
        this.startMorningTheme();
    }
  }

  startMorningTheme() {
    // Key: D Major / Peaceful warm morning progression: D - A - Bm - G
    const chords = [
      { pad: [146.83, 220.00, 293.66, 369.99], arp: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] },
      { pad: [110.00, 164.81, 220.00, 277.18], arp: [220.00, 277.18, 329.63, 440.00, 329.63, 277.18] },
      { pad: [123.47, 185.00, 246.94, 293.66], arp: [246.94, 293.66, 369.99, 493.88, 369.99, 293.66] },
      { pad: [98.00, 146.83, 196.00, 246.94], arp: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94] }
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'morning') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur.pad, now, 3.8, 0.09);
      cur.arp.forEach((note, idx) => {
        this.playPianoNote(note, now + idx * 0.55, 1.4, 0.18);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 3600);
  }

  startSchoolTheme() {
    // School courtyard: contemplative, gentle nostalgic piano
    const chords = [
      { pad: [130.81, 196.00, 261.63, 329.63], mel: [523.25, 493.88, 392.00, 329.63] },
      { pad: [146.83, 220.00, 293.66, 349.23], mel: [440.00, 392.00, 349.23, 293.66] },
      { pad: [110.00, 164.81, 220.00, 261.63], mel: [329.63, 392.00, 440.00, 523.25] },
      { pad: [98.00, 146.83, 196.00, 246.94], mel: [392.00, 329.63, 293.66, 261.63] }
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'school') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur.pad, now, 4.0, 0.1);
      cur.mel.forEach((note, idx) => {
        this.playPianoNote(note, now + idx * 0.9, 2.0, 0.22);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4000);
  }

  startFirstLoveTheme() {
    // Delicate, tender, heartbeat-adjacent slow yearning
    const motifs = [
      [329.63, 392.00, 493.88, 587.33, 493.88],
      [293.66, 369.99, 440.00, 554.37, 440.00],
      [261.63, 329.63, 392.00, 523.25, 392.00],
      [246.94, 311.13, 369.99, 493.88, 369.99]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'firstlove') return;
      const now = this.ctx.currentTime;
      const motif = motifs[step % motifs.length];
      this.playPadChord([130.81, 196.00, 246.94], now, 4.2, 0.08);
      motif.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.75, 2.2, 0.25);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4200);
  }

  startSecretTheme() {
    // Bittersweet minor chords: RK suppresses feelings for friend
    const progressions = [
      [110.00, 164.81, 220.00, 261.63], // Am
      [87.31, 130.81, 174.61, 220.00],  // F
      [130.81, 196.00, 261.63, 329.63], // C
      [98.00, 146.83, 196.00, 246.94]   // G
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'secret') return;
      const now = this.ctx.currentTime;
      const chord = progressions[step % progressions.length];
      this.playPadChord(chord, now, 4.2, 0.12);
      this.playPianoNote(chord[2] * 2, now + 0.4, 2.5, 0.2);
      this.playPianoNote(chord[3] * 2, now + 1.8, 2.5, 0.22);
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4000);
  }

  startSunsetTheme() {
    // Golden evening sky, warm bittersweet resolving theme
    const chords = [
      [146.83, 220.00, 293.66, 369.99, 440.00], // D
      [110.00, 164.81, 220.00, 277.18, 329.63], // A
      [123.47, 185.00, 246.94, 293.66, 369.99], // Bm
      [98.00, 146.83, 196.00, 246.94, 293.66]   // G
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'sunset') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur, now, 4.6, 0.14);
      this.playPianoNote(cur[3] * 1.5, now + 0.6, 2.8, 0.25);
      this.playPianoNote(cur[4] * 1.5, now + 2.0, 2.8, 0.22);
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4400);
  }

  startTrainTheme() {
    // Rainy train ride: gentle lo-fi electric chords + rhythmic peace
    const chords = [
      [130.81, 196.00, 246.94, 329.63],
      [110.00, 164.81, 220.00, 293.66],
      [87.31, 130.81, 174.61, 261.63],
      [98.00, 146.83, 196.00, 246.94]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'train') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur, now, 3.8, 0.1);
      // Soft gentle arpeggio
      this.playPianoNote(cur[2] * 2, now + 0.3, 1.8, 0.2);
      this.playPianoNote(cur[3] * 2, now + 1.2, 1.8, 0.18);
      this.playPianoNote(cur[1] * 2, now + 2.1, 1.8, 0.15);
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 3600);
  }

  startInfinityTheme() {
    // Dreamy celestial 8-bit / crystal fantasy theme
    const notes = [
      [523.25, 659.25, 783.99, 1046.50],
      [440.00, 523.25, 659.25, 880.00],
      [349.23, 440.00, 523.25, 698.46],
      [392.00, 493.88, 587.33, 783.99]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'infinity') return;
      const now = this.ctx.currentTime;
      const chord = notes[step % notes.length];
      this.playPadChord([130.81, 196.00, 261.63], now, 3.2, 0.08);
      chord.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.35, 1.2, 0.18);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 3000);
  }

  startChatTheme() {
    // Cozy nighttime online connection
    const chords = [
      [146.83, 220.00, 277.18, 369.99],
      [123.47, 185.00, 246.94, 329.63],
      [98.00, 146.83, 196.00, 293.66],
      [110.00, 164.81, 220.00, 277.18]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'chat') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur, now, 3.6, 0.09);
      this.playPianoNote(cur[2] * 2, now + 0.4, 2.0, 0.2);
      this.playPianoNote(cur[3] * 2, now + 1.6, 2.0, 0.18);
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 3600);
  }

  startFestivalTheme() {
    // Warm town festival: vibrant, warm lights, distant bells
    const notes = [
      [293.66, 369.99, 440.00, 587.33],
      [329.63, 392.00, 493.88, 659.25],
      [369.99, 440.00, 554.37, 739.99],
      [440.00, 554.37, 659.25, 880.00]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'festival') return;
      const now = this.ctx.currentTime;
      const cur = notes[step % notes.length];
      this.playPadChord([146.83, 220.00, 293.66], now, 3.0, 0.12);
      cur.forEach((f, i) => {
        this.playPianoNote(f, now + i * 0.4, 1.2, 0.22);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 2800);
  }

  startRedFlagTheme() {
    // Subtle, tender, slightly mysterious and poignant
    const chords = [
      [110.00, 164.81, 207.65, 261.63], // Am(maj7) feel
      [98.00, 146.83, 196.00, 246.94],
      [87.31, 130.81, 164.81, 220.00],
      [73.42, 110.00, 146.83, 220.00]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'redflag') return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];
      this.playPadChord(cur, now, 4.4, 0.1);
      this.playPianoNote(cur[2] * 2, now + 0.8, 2.5, 0.2);
      this.playPianoNote(cur[3] * 2, now + 2.2, 2.5, 0.18);
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4200);
  }

  startFinalSunsetTheme() {
    // Main cinematic crescendo theme for Part 1 Finale
    const motifs = [
      { pad: [146.83, 220.00, 293.66, 369.99], mel: [587.33, 554.37, 440.00, 369.99, 440.00, 587.33] },
      { pad: [123.47, 185.00, 246.94, 293.66], mel: [493.88, 440.00, 369.99, 293.66, 369.99, 493.88] },
      { pad: [98.00, 146.83, 196.00, 246.94], mel: [392.00, 440.00, 493.88, 587.33, 493.88, 392.00] },
      { pad: [110.00, 164.81, 220.00, 277.18], mel: [440.00, 554.37, 659.25, 739.99, 659.25, 554.37] }
    ];
    let step = 0;
    const playStep = () => {
      if (!this.ctx || this.currentTrack !== 'finalsunset') return;
      const now = this.ctx.currentTime;
      const cur = motifs[step % motifs.length];
      this.playPadChord(cur.pad, now, 4.8, 0.18);
      cur.mel.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.7, 2.2, 0.28);
      });
      step++;
    };
    playStep();
    this.bgmInterval = setInterval(playStep, 4500);
  }

  // --- Ambient Background Noise (Rain, Birds, Wind) ---

  startBirdAmbience() {
    const playBirdChirp = () => {
      if (!this.ctx || this.currentTrack !== 'morning' || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 200, now + 0.16);

      gain.gain.setValueAtTime(0.04 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    };

    this.ambientNodes['birds'] = setInterval(() => {
      if (Math.random() > 0.4) playBirdChirp();
    }, 2500);
  }

  startRainAmbience() {
    if (!this.ctx || this.ambientNodes['rain']) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      this.ambientNodes['rain'] = { source: noise, gain: gain };
    } catch(e) {}
  }

  stopAmbience() {
    if (this.ambientNodes['birds']) {
      clearInterval(this.ambientNodes['birds']);
      delete this.ambientNodes['birds'];
    }
    if (this.ambientNodes['rain']) {
      try {
        this.ambientNodes['rain'].source.stop();
      } catch(e) {}
      delete this.ambientNodes['rain'];
    }
  }
}

// Global instance
window.audioManager = new AudioManager();
