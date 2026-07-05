// A clean utility file to handle sound synthesizers, CDN sound effects, and Speech Synthesis

class RaceAudioManager {
  constructor() {
    this.audioContext = null;
    this.volume = 0.45;
    this.sfxMuted = false;
    this.activeAudios = {};

    // Standard high-quality open-source URLs for sound effects and music
    this.soundUrls = {
      gallop: 'https://assets.mixkit.co/active_storage/sfx/1567/1567-84.wav', // Trot/gallop loop
      crowd: '/audio/storegraphic-crowd-cheers-477401.mp3', // User chosen crowd cheers loop
      victory: '/audio/victory.mp3', // User chosen victory music (placed in public/audio/victory.mp3)
      rain: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav',    // Rain loop
      music: '/audio/bg_music.mp3', // User chosen background music (placed in public/audio/bg_music.mp3)
      intro_heroic: '/audio/intro_heroic.mp3', // User chosen intro transition music (placed in public/audio/intro_heroic.mp3)
      horse_intro: '/audio/horse_intro.mp3' // User chosen horse introduction music (placed in public/audio/horse_intro.mp3)
    };
  }

  // Get base sound volume scaling factors to keep sound mixing balanced
  getSoundFactor(key) {
    switch (key) {
      case 'gallop':
        return 0.22;
      case 'crowd':
        return 0.40; // Base factor for crowd, slightly higher than background music (0.35)
      case 'music':
        return 0.35; // Base factor for background music
      case 'rain':
        return 0.30;
      case 'intro_heroic':
        return 0.80;
      case 'horse_intro':
        return 0.45;
      case 'victory':
        return 0.75;
      default:
        return 0.75;
    }
  }

  // Initialize browser audio context upon user click to bypass autoplay policy
  initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Pre-load and play/pause all audio files during user click to unlock them
  unlockAudio() {
    this.initContext();
    
    Object.keys(this.soundUrls).forEach(key => {
      if (!this.activeAudios[key]) {
        try {
          const audio = new Audio(this.soundUrls[key]);
          audio.volume = 0; // Mute during gesture unlocking
          audio.loop = (key === 'gallop' || key === 'crowd' || key === 'music' || key === 'rain' || key === 'horse_intro');
          
          audio.play()
            .then(() => {
              if (!audio.isUserPlaying) {
                audio.pause();
                audio.currentTime = 0;
              }
              // Reset volume to correct level
              const factor = this.getSoundFactor(key);
              audio.volume = this.volume * factor;
            })
            .catch(err => {
              console.warn(`Unlocking failed for ${key}:`, err);
            });
          this.activeAudios[key] = audio;
        } catch (e) {
          console.warn(`Error pre-loading ${key}:`, e);
        }
      }
    });
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    // Update currently playing audios with custom background dampening factors
    Object.keys(this.activeAudios).forEach(key => {
      const audio = this.activeAudios[key];
      const factor = this.getSoundFactor(key);
      audio.volume = this.volume * factor;
    });
  }

  setSfxMuted(muted) {
    this.sfxMuted = muted;
    if (muted) {
      this.stopAllSfx();
    }
  }

  // Synthesize a digital sci-fi startup sound for the HUD initialization
  playSystemBoot() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;
    try {
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioContext.destination);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(150, this.audioContext.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.6);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(300, this.audioContext.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.6);

      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.12, this.audioContext.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

      osc1.start(this.audioContext.currentTime);
      osc2.start(this.audioContext.currentTime);
      osc1.stop(this.audioContext.currentTime + 0.6);
      osc2.stop(this.audioContext.currentTime + 0.6);
    } catch(e) {
      console.warn("System boot sound error:", e);
    }
  }

  // Synthesize a small digital tick for slide panel entries
  playSlideTick() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;
    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, this.audioContext.currentTime);
      
      gain.gain.setValueAtTime(this.volume * 0.06, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
      
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + 0.08);
    } catch(e) {
      console.warn("Slide tick sound error:", e);
    }
  }

  // Synthesize digital beep for countdown
  playCountdownBeep(isGo = false) {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      // Low beep for ticks, high beep for GO
      const freq = isGo ? 1200 : 700;
      const duration = isGo ? 0.45 : 0.18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.12, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Synthesizer error:", e);
    }
  }

  // Synthesize sports whistle when flagging a violation
  playWhistle() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;

    try {
      const osc = this.audioContext.createOscillator();
      const lfo = this.audioContext.createOscillator(); // vibrato to simulate ball inside whistle
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Main whistle frequency (2000Hz - 2500Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, this.audioContext.currentTime);

      // Vibrato frequency (40Hz) and depth (150Hz)
      lfo.frequency.setValueAtTime(40, this.audioContext.currentTime);
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.setValueAtTime(120, this.audioContext.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Highpass filter to make it sound sharper
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);

      // Play with quick volume envelope
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.22, this.audioContext.currentTime + 0.05);
      gain.gain.setValueAtTime(this.volume * 0.22, this.audioContext.currentTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.55);

      osc.start(this.audioContext.currentTime);
      lfo.start(this.audioContext.currentTime);
      
      osc.stop(this.audioContext.currentTime + 0.55);
      lfo.stop(this.audioContext.currentTime + 0.55);
    } catch (e) {
      console.warn("Whistle synthesizer error:", e);
    }
  }

  // Synthesize a beautiful double arpeggio chime when a horse is introduced
  playIntroChime() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;

    try {
      const playSweep = (delay, baseFreq) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'triangle'; // triangle has soft digital timbre
        osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + delay + 0.18);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, this.audioContext.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + 0.18);
        
        osc.start(this.audioContext.currentTime + delay);
        osc.stop(this.audioContext.currentTime + delay + 0.18);
      };
      
      playSweep(0, 523.25);   // C5 sweep
      playSweep(0.08, 659.25); // E5 sweep
    } catch (e) {
      console.warn("Intro synthesizer error:", e);
    }
  }

  // Synthesize a metallic double bell ring for finish line crossings
  playFinishBell() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.audioContext) return;
    try {
      const playTone = (freq, duration, delay) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + delay);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(this.volume * 0.25, this.audioContext.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + duration);

        osc.start(this.audioContext.currentTime + delay);
        osc.stop(this.audioContext.currentTime + delay + duration);
      };
      
      // Dual high-pitch bell harmony (C6 & G6)
      playTone(1046.5, 1.2, 0);
      playTone(1568.0, 1.0, 0.05);
    } catch(e) {
      console.warn("Finish bell sound error:", e);
    }
  }

  // Play/Loop audio files from URLs
  playSfx(key, loop = false) {
    if (this.sfxMuted) return;
    const url = this.soundUrls[key];
    if (!url) return;

    try {
      let audio = this.activeAudios[key];
      if (audio) {
        audio.isUserPlaying = true;
        audio.loop = loop;
        const factor = this.getSoundFactor(key);
        audio.volume = this.volume * factor;
        if (!audio.paused) return;
        audio.play().catch(() => {});
        return;
      }

      audio = new Audio(url);
      audio.isUserPlaying = true;
      const factor = this.getSoundFactor(key);
      audio.volume = this.volume * factor;
      audio.loop = loop;

      this.activeAudios[key] = audio;
      audio.play().catch(err => {
        console.warn(`Failed to play audio ${key}:`, err);
      });
    } catch (e) {
      console.warn(`Audio play error for ${key}:`, e);
    }
  }

  // Set specific audio volume multiplier
  setSfxVolume(key, volMultiplier) {
    const audio = this.activeAudios[key];
    if (audio) {
      const factor = this.getSoundFactor(key);
      audio.volume = this.volume * factor * volMultiplier;
    }
  }

  stopSfx(key) {
    const audio = this.activeAudios[key];
    if (audio) {
      audio.isUserPlaying = false;
      audio.pause();
      audio.currentTime = 0;
      delete this.activeAudios[key];
    }
  }

  stopAllSfx() {
    Object.keys(this.activeAudios).forEach(key => {
      this.stopSfx(key);
    });
  }
}

export const audioManager = new RaceAudioManager();
