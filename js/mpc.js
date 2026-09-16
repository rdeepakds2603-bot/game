/**
 * THE FINAL SUNSET - MPC (Main Game Controller & Story Director)
 * Manages story progression, hidden relationship variables, story flags,
 * cinematic events, dialogue sequences, choices, and save/load persistence.
 */

class MPCController {
  constructor() {
    // Hidden Relationship & Memory Variables
    this.variables = {
      friendship: 0,
      loveMemory: 0,
      charlotteConnection: 0
    };

    // Story Flags
    this.flags = {
      metFriends: false,
      noticedFirstLove: false,
      firstLoveChoice: null,
      recordNotebookScene: false,
      friendConfession: false,
      loveLetGo: false,
      collegeStarted: false,
      metCharlotte: false,
      photoExchange: false,
      festivalConversation: false,
      redFlagConversation: false,
      part1Completed: false
    };

    // Current State
    this.currentChapter = 1;
    this.currentScene = 'morning_road';
    this.isDialogueActive = false;
    this.dialogueQueue = [];
    this.currentLineIndex = 0;
    this.typewriterInterval = null;
    this.isTyping = false;
    this.currentFullText = '';
    this.textSpeed = 28; // ms per char

    this.pendingChoice = null;
    this.onDialogueComplete = null;
    this.pendingPhoneCallback = null;
    this.isPaused = false;

    // UI Cache
    this.dialogueContainer = document.getElementById('dialogue-container');
    this.speakerBadge = document.getElementById('speaker-badge');
    this.dialogueText = document.getElementById('dialogue-text');
    this.portraitBox = document.getElementById('dialogue-portrait');
    this.choicesContainer = document.getElementById('choices-container');
    this.continuePrompt = document.getElementById('dialogue-continue');
    this.transitionOverlay = document.getElementById('transition-overlay');
    this.gameWrapper = document.getElementById('game-wrapper');

    this.initSaveSlots();
  }

  // --- Story Variable & Flag Management ---

  modifyVar(name, amount) {
    if (this.variables.hasOwnProperty(name)) {
      this.variables[name] += amount;
      console.log(`[MPC Variable] ${name} changed by ${amount} -> ${this.variables[name]}`);
    }
  }

  setFlag(name, val = true) {
    this.flags[name] = val;
    console.log(`[MPC Flag] ${name} = ${val}`);
  }

  // --- Chapter Flow ---

  startChapter(chapterNum) {
    this.currentChapter = chapterNum;
    this.updateHUD();

    if (window.audioManager) {
      window.audioManager.ensureContext();
    }

    switch (chapterNum) {
      case 1:
        this.setupChapter1();
        break;
      case 2:
        this.setupChapter2();
        break;
      case 3:
        this.setupChapter3();
        break;
      case 4:
        this.setupChapter4();
        break;
      case 5:
        this.setupChapter5();
        break;
      case 6:
        this.setupChapter6();
        break;
      case 7:
        this.setupChapter7();
        break;
      case 8:
        this.setupChapter8();
        break;
      case 9:
        this.setupChapter9();
        break;
      case 10:
        this.setupChapter10();
        break;
      case 11:
        this.setupChapter11();
        break;
      default:
        this.setupChapter1();
    }

    // Auto-save at chapter start
    this.autoSave();
  }

  // --- CHAPTER IMPLEMENTATIONS ---

  setupChapter1() {
    this.fadeTransition('morning_road', { x: 180, y: 540 }, () => {
      if (window.audioManager) window.audioManager.playTrack('morning');
      if (window.gameEngine) {
        window.gameEngine.addNPC({
          id: 'friend1',
          name: 'Friend 1',
          x: 1250,
          y: 530,
          type: 'friend1',
          facing: 'left',
          prompt: 'Talk to Friend 1'
        });
        window.gameEngine.addNPC({
          id: 'friend2',
          name: 'Friend 2',
          x: 1350,
          y: 535,
          type: 'friend2',
          facing: 'left',
          prompt: 'Talk to Friend 2'
        });
      }

      this.playDialogue(STORY_DATA.chap1_intro, () => {
        this.showToast("Walk right to find your friends using [WASD] or [Arrows]");
      });
    });
  }

  setupChapter2() {
    this.fadeTransition('school_courtyard', { x: 200, y: 560 }, () => {
      if (window.audioManager) window.audioManager.playTrack('school');
      if (window.gameEngine) {
        window.gameEngine.addNPC({
          id: 'firstlove',
          name: 'Girl',
          x: 1100,
          y: 540,
          type: 'firstlove',
          facing: 'left',
          prompt: 'Look at the Girl'
        });
      }
      this.showToast("Explore the courtyard...");
    });
  }

  triggerChapter2Cinematic() {
    if (this.flags.noticedFirstLove) return;
    this.setFlag('noticedFirstLove', true);

    // Enter cinematic camera slow-mo
    this.setCinematicMode(true);
    if (window.gameEngine) {
      window.gameEngine.graphics.camera.targetZoom = 1.35;
      window.gameEngine.player.state = 'shy';
    }
    if (window.audioManager) {
      window.audioManager.playHeartbeat();
      window.audioManager.playTrack('firstlove');
    }

    this.playDialogue(STORY_DATA.chap2_notice_girl, () => {
      this.presentChoice(STORY_DATA.chap2_choice, (choice) => {
        this.setFlag('firstLoveChoice', choice.text);
        if (choice.effect) {
          Object.entries(choice.effect).forEach(([k, v]) => {
            if (typeof v === 'number') this.modifyVar(k, v);
            else this.setFlag(k, v);
          });
        }
        this.playDialogue(STORY_DATA[choice.next], () => {
          this.setCinematicMode(false);
          if (window.gameEngine) {
            window.gameEngine.graphics.camera.targetZoom = 1.0;
            window.gameEngine.player.state = 'idle';
          }
          this.showToast("Chapter 2 Complete. Proceeding to Classroom...");
          setTimeout(() => this.startChapter(3), 2500);
        });
      });
    });
  }

  setupChapter3() {
    this.fadeTransition('classroom', { x: 200, y: 550 }, () => {
      if (window.audioManager) window.audioManager.playTrack('school');
      if (window.gameEngine) {
        window.gameEngine.addNPC({
          id: 'firstlove_desk',
          name: 'Girl',
          x: 880,
          y: 505,
          type: 'firstlove',
          facing: 'left',
          prompt: 'Approach the Submission Desk'
        });
      }
      this.playDialogue(STORY_DATA.chap3_intro, () => {
        this.showToast("Walk to the front desk to submit your record note.");
      });
    });
  }

  triggerChapter3Submission() {
    if (this.flags.recordNotebookScene) return;
    this.setFlag('recordNotebookScene', true);

    this.setCinematicMode(true);
    if (window.gameEngine) {
      window.gameEngine.graphics.camera.targetZoom = 1.4;
      window.gameEngine.player.state = 'shy';
    }
    if (window.audioManager) {
      window.audioManager.playHeartbeat();
    }

    this.playDialogue(STORY_DATA.chap3_approach, () => {
      this.modifyVar('loveMemory', 2);
      this.setCinematicMode(false);
      if (window.gameEngine) {
        window.gameEngine.graphics.camera.targetZoom = 1.0;
        window.gameEngine.player.state = 'idle';
      }
      this.showToast("Chapter 3 Complete.");
      setTimeout(() => this.startChapter(4), 2500);
    });
  }

  setupChapter4() {
    this.fadeTransition('school_courtyard', { x: 600, y: 560 }, () => {
      if (window.audioManager) window.audioManager.playTrack('secret');
      if (window.gameEngine) {
        window.gameEngine.addNPC({
          id: 'friend1_confess',
          name: 'Friend 1',
          x: 750,
          y: 540,
          type: 'friend1',
          facing: 'left',
          prompt: 'Listen to Friend 1'
        });
      }
      this.showToast("Friend 1 has something important to tell you.");
    });
  }

  triggerChapter4Secret() {
    if (this.flags.friendConfession) return;
    this.setFlag('friendConfession', true);

    this.setCinematicMode(true);
    this.playDialogue(STORY_DATA.chap4_intro, () => {
      this.modifyVar('friendship', 2);
      this.modifyVar('loveMemory', 1);
      this.setCinematicMode(false);
      this.showToast("Chapter 4 Complete.");
      setTimeout(() => this.startChapter(5), 2500);
    });
  }

  setupChapter5() {
    this.fadeTransition('sunset_hill', { x: 300, y: 550 }, () => {
      if (window.audioManager) window.audioManager.playTrack('sunset');
      if (window.gameEngine) {
        window.gameEngine.addNPC({
          id: 'friend1_letgo',
          name: 'Friend 1',
          x: 700,
          y: 535,
          type: 'friend1',
          facing: 'left',
          prompt: 'Talk to Friend'
        });
      }
      this.showToast("Walk with your friend toward the sunset hill.");
    });
  }

  triggerChapter5LetGo() {
    if (this.flags.loveLetGo) return;
    this.setFlag('loveLetGo', true);

    this.setCinematicMode(true);
    if (window.gameEngine) {
      window.gameEngine.graphics.camera.targetZoom = 1.25;
    }

    this.playDialogue(STORY_DATA.chap5_intro, () => {
      this.setCinematicMode(false);
      if (window.gameEngine) {
        window.gameEngine.graphics.camera.targetZoom = 1.0;
      }
      this.showToast("Years pass... College begins.");
      setTimeout(() => this.startChapter(6), 3000);
    });
  }

  setupChapter6() {
    this.setFlag('collegeStarted', true);
    this.fadeTransition('train_interior', { x: 200, y: 540 }, () => {
      if (window.audioManager) window.audioManager.playTrack('train');
      this.playDialogue(STORY_DATA.chap6_intro, () => {
        this.showToast("Walk through the train coach and find a window seat.");
      });
    });
  }

  triggerChapter6WindowSeat() {
    this.setCinematicMode(true);
    if (window.gameEngine) {
      window.gameEngine.graphics.camera.targetZoom = 1.35;
      window.gameEngine.player.state = 'idle';
    }

    this.playDialogue(STORY_DATA.chap6_window_seat, () => {
      this.setCinematicMode(false);
      if (window.gameEngine) {
        window.gameEngine.graphics.camera.targetZoom = 1.0;
      }
      this.showToast("Evening arrives at RK's home.");
      setTimeout(() => this.startChapter(7), 3000);
    });
  }

  setupChapter7() {
    this.fadeTransition('rk_room', { x: 300, y: 600 }, () => {
      if (window.audioManager) window.audioManager.playTrack('infinity');
      this.playDialogue(STORY_DATA.chap7_intro, () => {
        this.showToast("Approach the laptop to play Infinity Kingdom [E]");
      });
    });
  }

  triggerChapter7InfinityKingdom() {
    if (window.smartphone) {
      window.smartphone.openInfinityKingdom();
      window.smartphone.addIKChatMessage("Charlotte", "Hello! Are you doing the night quest too?", true);
    }

    this.playDialogue(STORY_DATA.chap7_chat, () => {
      this.setFlag('metCharlotte', true);
      this.modifyVar('charlotteConnection', 2);
      if (window.smartphone) {
        setTimeout(() => window.smartphone.closeInfinityKingdom(), 1500);
      }
      this.showToast("A new friendship begins...");
      setTimeout(() => this.startChapter(8), 3000);
    });
  }

  setupChapter8() {
    this.fadeTransition('rk_room', { x: 600, y: 600 }, () => {
      if (window.audioManager) window.audioManager.playTrack('chat');
      if (window.gameEngine) {
        window.gameEngine.player.state = 'phone';
      }

      this.playDialogue(STORY_DATA.chap8_intro, () => {
        if (window.smartphone) {
          window.smartphone.openPhone('Charlotte');
          window.smartphone.clearChat();
          window.smartphone.addMessage('Charlotte', 'Good morning RK! It is 9:00 AM here in Manila already. 🌸');
          window.smartphone.addMessage('RK', 'Good morning. It is 6:30 AM here. Getting ready for train.');
          window.smartphone.addMessage('Charlotte', 'May your travel path be strictly untangled and peaceful.', null, 'Translated from Tagalog / English');
          window.smartphone.addMessage('RK', 'Strictly untangled? Haha... what does that mean?');
          window.smartphone.addMessage('Charlotte', 'Oh no! The translator made it so serious! 😂 Have a smooth ride!');
        }

        this.playDialogue(STORY_DATA.chap8_dialogue, () => {
          this.modifyVar('charlotteConnection', 3);
          if (window.smartphone) window.smartphone.closePhone();
          if (window.gameEngine) window.gameEngine.player.state = 'idle';
          this.showToast("Chapter 8 Complete. Days continue to pass.");
          setTimeout(() => this.startChapter(9), 2500);
        });
      });
    });
  }

  setupChapter9() {
    this.fadeTransition('rk_room', { x: 600, y: 600 }, () => {
      if (window.audioManager) window.audioManager.playTrack('chat');
      if (window.gameEngine) {
        window.gameEngine.player.state = 'phone';
      }

      this.playDialogue(STORY_DATA.chap9_intro, () => {
        this.presentChoice(STORY_DATA.chap9_choice, (choice) => {
          if (choice.effect) {
            Object.entries(choice.effect).forEach(([k, v]) => {
              if (typeof v === 'number') this.modifyVar(k, v);
              else this.setFlag(k, v);
            });
          }

          if (window.smartphone) {
            window.smartphone.openPhone('Charlotte');
            window.smartphone.clearChat();
            const rkPhoto = window.smartphone.generateRKPhoto();
            const charlottePhoto = window.smartphone.generateCharlottePhoto();
            window.smartphone.addMessage('RK', 'Here is a photo from the train station yesterday.', rkPhoto);
            window.smartphone.addMessage('Charlotte', 'Aww, you look really kind and thoughtful! You have warm eyes.');
            window.smartphone.addMessage('Charlotte', 'Here is a photo of me with my camera during sunset in Manila 📸', charlottePhoto);
          }

          this.playDialogue(STORY_DATA[choice.next], () => {
            if (window.smartphone) window.smartphone.closePhone();
            if (window.gameEngine) window.gameEngine.player.state = 'idle';
            this.showToast("Chapter 9 Complete.");
            setTimeout(() => this.startChapter(10), 2500);
          });
        });
      });
    });
  }

  setupChapter10() {
    this.fadeTransition('festival_street', { x: 200, y: 550 }, () => {
      if (window.audioManager) window.audioManager.playTrack('festival');
      this.playDialogue(STORY_DATA.chap10_intro, () => {
        this.showToast("Walk through the festival street to reach your terrace.");
      });
    });
  }

  triggerChapter10Terrace() {
    // Switch to parallel split screen view: India Terrace (RK) vs Philippines Room (Charlotte)
    this.fadeTransition('split_screen_crosscut', { x: 280, y: 540 }, () => {
      this.setCinematicMode(true);
      if (window.audioManager) {
        // Trigger periodic festival fireworks
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            if (window.gameEngine && window.gameEngine.graphics) {
              window.gameEngine.graphics.addFirework(
                Math.random() * 500 + 50,
                Math.random() * 250 + 80
              );
            }
            if (window.audioManager) window.audioManager.playFirework();
          }, i * 1400);
        }
      }

      this.playDialogue(STORY_DATA.chap10_terrace, () => {
        this.setFlag('festivalConversation', true);
        this.modifyVar('charlotteConnection', 4);
        this.setCinematicMode(false);
        this.showToast("Chapter 10 Complete.");
        setTimeout(() => this.startChapter(11), 3000);
      });
    });
  }

  setupChapter11() {
    this.fadeTransition('rk_room', { x: 600, y: 600 }, () => {
      if (window.audioManager) window.audioManager.playTrack('redflag');
      if (window.gameEngine) {
        window.gameEngine.player.state = 'phone';
      }

      this.playDialogue(STORY_DATA.chap11_intro, () => {
        if (window.smartphone) {
          window.smartphone.openPhone('Charlotte');
          window.smartphone.clearChat();
          window.smartphone.addMessage('Charlotte', 'You know what, RK? Because you never get angry and always listen so patiently...');
          window.smartphone.addMessage('Charlotte', 'You\'re totally a red flag! 😂');
          window.smartphone.addMessage('RK', 'Red flag? What does that mean? Is it dangerous?');
          window.smartphone.addMessage('Charlotte', 'Haha! No! It means you are too good to be true. Just teasing you!');
          window.smartphone.addMessage('RK', 'Goodnight Charlotte.');
          window.smartphone.addMessage('Charlotte', 'Goodnight, my favorite red flag. Talk to you tomorrow! 🌸');
        }

        this.playDialogue(STORY_DATA.chap11_dialogue, () => {
          this.setFlag('redFlagConversation', true);
          if (window.smartphone) window.smartphone.closePhone();
          if (window.gameEngine) window.gameEngine.player.state = 'idle';
          this.triggerFinalSunsetEnding();
        });
      });
    });
  }

  triggerFinalSunsetEnding() {
    this.setFlag('part1Completed', true);
    this.setCinematicMode(true);

    // Fade to sunset sky
    this.fadeTransition('final_sunset_sky', { x: 750, y: 550 }, () => {
      if (window.audioManager) window.audioManager.playTrack('finalsunset');
      if (window.gameEngine) {
        window.gameEngine.graphics.camera.targetZoom = 1.15;
      }

      this.playDialogue(STORY_DATA.ending_sequence, () => {
        // Show Ending Credits Screen
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
          endingScreen.style.display = 'flex';
          setTimeout(() => endingScreen.classList.add('visible'), 50);

          // Update final stats display
          const fEl = document.getElementById('stat-friendship');
          const lEl = document.getElementById('stat-love');
          const cEl = document.getElementById('stat-charlotte');
          if (fEl) fEl.innerText = this.variables.friendship;
          if (lEl) lEl.innerText = this.variables.loveMemory;
          if (cEl) cEl.innerText = this.variables.charlotteConnection;
        }
      });
    });
  }

  // --- Interaction Router ---

  triggerInteraction(interaction) {
    if (this.isDialogueActive) return;

    if (interaction.type === 'npc') {
      if (interaction.id === 'friend1' || interaction.id === 'friend2') {
        this.setFlag('metFriends', true);
        this.modifyVar('friendship', 1);
        this.playDialogue(STORY_DATA.chap1_meet_friends, () => {
          this.showToast("Proceed to School Courtyard [Chapter 2]");
          setTimeout(() => this.startChapter(2), 2000);
        });
      } else if (interaction.id === 'firstlove') {
        this.triggerChapter2Cinematic();
      } else if (interaction.id === 'firstlove_desk') {
        this.triggerChapter3Submission();
      } else if (interaction.id === 'friend1_confess') {
        this.triggerChapter4Secret();
      } else if (interaction.id === 'friend1_letgo') {
        this.triggerChapter5LetGo();
      }
    } else if (interaction.type === 'object') {
      if (interaction.id === 'sign_school') {
        this.startChapter(2);
      } else if (interaction.id === 'record_desk') {
        this.triggerChapter3Submission();
      } else if (interaction.id === 'train_window_seat') {
        this.triggerChapter6WindowSeat();
      } else if (interaction.id === 'room_laptop') {
        this.triggerChapter7InfinityKingdom();
      } else if (interaction.id === 'festival_terrace_stairs' || interaction.id === 'terrace_railing') {
        this.triggerChapter10Terrace();
      }
    }
  }

  // --- Dialogue Presentation System ---

  playDialogue(lines, onComplete = null) {
    if (!lines || lines.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.dialogueQueue = lines;
    this.currentLineIndex = 0;
    this.isDialogueActive = true;
    this.onDialogueComplete = onComplete;

    if (this.dialogueContainer) {
      this.dialogueContainer.style.display = 'flex';
    }
    this.showCurrentLine();
  }

  showCurrentLine() {
    if (this.currentLineIndex >= this.dialogueQueue.length) {
      this.closeDialogue();
      return;
    }

    const item = this.dialogueQueue[this.currentLineIndex];
    if (this.speakerBadge) this.speakerBadge.innerText = item.speaker;
    this.updatePortrait(item.portrait || item.speaker);

    if (this.continuePrompt) this.continuePrompt.style.opacity = '0';
    this.currentFullText = item.text;
    this.startTypewriter(item.text);
  }

  startTypewriter(text) {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    this.isTyping = true;
    let charIndex = 0;
    if (this.dialogueText) this.dialogueText.innerText = '';

    this.typewriterInterval = setInterval(() => {
      if (charIndex < text.length) {
        if (this.dialogueText) this.dialogueText.innerText += text[charIndex];
        if (window.audioManager && charIndex % 2 === 0) {
          window.audioManager.playTypeBlip(text[charIndex]);
        }
        charIndex++;
      } else {
        this.finishTypewriter();
      }
    }, this.textSpeed);
  }

  finishTypewriter() {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    this.isTyping = false;
    if (this.dialogueText) this.dialogueText.innerText = this.currentFullText;
    if (this.continuePrompt) this.continuePrompt.style.opacity = '1';
  }

  advanceDialogue() {
    if (this.pendingChoice) return; // Must pick choice

    if (this.isTyping) {
      this.finishTypewriter();
      return;
    }

    this.currentLineIndex++;
    this.showCurrentLine();
  }

  closeDialogue() {
    this.isDialogueActive = false;
    if (this.dialogueContainer) this.dialogueContainer.style.display = 'none';
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);

    if (this.onDialogueComplete) {
      const cb = this.onDialogueComplete;
      this.onDialogueComplete = null;
      cb();
    }
  }

  updatePortrait(speakerKey) {
    if (!this.portraitBox || !window.gameEngine || !window.gameEngine.graphics) return;
    this.portraitBox.innerHTML = '';
    const pCanvas = window.gameEngine.graphics.getPortrait(speakerKey);
    if (pCanvas) {
      this.portraitBox.appendChild(pCanvas);
    }
  }

  presentChoice(choiceData, onSelected) {
    this.pendingChoice = choiceData;
    if (this.dialogueContainer) this.dialogueContainer.style.display = 'flex';
    if (this.choicesContainer) {
      this.choicesContainer.innerHTML = '';
      this.choicesContainer.style.display = 'flex';
    }

    choiceData.choices.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span>${c.text}</span><span class="choice-arrow">➔</span>`;
      btn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playChoiceSelect();
        if (this.choicesContainer) this.choicesContainer.style.display = 'none';
        this.pendingChoice = null;
        onSelected(c);
      });
      this.choicesContainer.appendChild(btn);
    });
  }

  // --- Cinematic Transitions ---

  setCinematicMode(enable) {
    if (this.gameWrapper) {
      if (enable) this.gameWrapper.classList.add('cinematic-mode');
      else this.gameWrapper.classList.remove('cinematic-mode');
    }
  }

  fadeTransition(targetScene, playerPos, onFinish = null) {
    if (!this.transitionOverlay) {
      if (window.gameEngine) window.gameEngine.loadScene(targetScene, playerPos);
      if (onFinish) onFinish();
      return;
    }

    this.transitionOverlay.className = 'fade-black';
    setTimeout(() => {
      if (window.gameEngine) {
        window.gameEngine.loadScene(targetScene, playerPos);
      }
      this.currentScene = targetScene;
      setTimeout(() => {
        this.transitionOverlay.className = '';
        if (onFinish) onFinish();
      }, 500);
    }, 500);
  }

  // --- HUD & Toast Helpers ---

  updateHUD() {
    const numEl = document.getElementById('hud-chapter-num');
    const titleEl = document.getElementById('hud-chapter-title');
    const chapterTitles = {
      1: "The Silent Boy",
      2: "The Girl",
      3: "Record Note",
      4: "The Secret",
      5: "Letting Go",
      6: "College (7:30 AM)",
      7: "Infinity Kingdom",
      8: "Online Friendship",
      9: "Photo Exchange",
      10: "Town Festival",
      11: "Red Flag"
    };

    if (numEl) numEl.innerText = `CHAPTER ${this.currentChapter}`;
    if (titleEl) titleEl.innerText = chapterTitles[this.currentChapter] || "The Journey";
  }

  showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // --- Save / Load / Persistence ---

  initSaveSlots() {
    if (!localStorage.getItem('final_sunset_save_slots')) {
      const defaultSlots = [null, null, null];
      localStorage.setItem('final_sunset_save_slots', JSON.stringify(defaultSlots));
    }
  }

  saveGame(slotIndex = 0) {
    const saveData = {
      chapter: this.currentChapter,
      scene: this.currentScene,
      variables: { ...this.variables },
      flags: { ...this.flags },
      playerPos: window.gameEngine ? { x: window.gameEngine.player.x, y: window.gameEngine.player.y } : { x: 180, y: 540 },
      timestamp: new Date().toLocaleString()
    };

    const slots = JSON.parse(localStorage.getItem('final_sunset_save_slots') || '[null,null,null]');
    slots[slotIndex] = saveData;
    localStorage.setItem('final_sunset_save_slots', JSON.stringify(slots));
    this.showToast(`Game Saved to Slot ${slotIndex + 1}!`);
  }

  loadGame(slotIndex = 0) {
    const slots = JSON.parse(localStorage.getItem('final_sunset_save_slots') || '[null,null,null]');
    const data = slots[slotIndex];
    if (!data) {
      this.showToast(`Slot ${slotIndex + 1} is empty!`);
      return false;
    }

    this.currentChapter = data.chapter;
    this.variables = { ...data.variables };
    this.flags = { ...data.flags };
    this.currentScene = data.scene;

    this.startChapter(this.currentChapter);
    this.showToast(`Game Loaded from Slot ${slotIndex + 1}!`);
    return true;
  }

  autoSave() {
    this.saveGame(0);
  }

  restartPart1() {
    this.variables = { friendship: 0, loveMemory: 0, charlotteConnection: 0 };
    this.flags = {
      metFriends: false,
      noticedFirstLove: false,
      firstLoveChoice: null,
      recordNotebookScene: false,
      friendConfession: false,
      loveLetGo: false,
      collegeStarted: false,
      metCharlotte: false,
      photoExchange: false,
      festivalConversation: false,
      redFlagConversation: false,
      part1Completed: false
    };

    const endingScreen = document.getElementById('ending-screen');
    if (endingScreen) endingScreen.style.display = 'none';

    this.startChapter(1);
    this.showToast("Story restarted from Chapter 1.");
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      pauseModal.style.display = this.isPaused ? 'flex' : 'none';
    }
  }
}

window.mpc = new MPCController();
