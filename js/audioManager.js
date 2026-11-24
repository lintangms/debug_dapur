/**
 * DEBUG DAPUR - Audio Manager
 * Synthesizes all sound effects and background music using pure HTML5 Web Audio API.
 * 100% self-contained, 0 external audio files needed!
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.AudioManager = (function() {
  let ctx = null;
  let sfxVolume = 0.8;
  let musicVolume = 0.4;
  let sfxMuted = false;
  let musicMuted = false;

  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;

  // Background music scheduler
  let bgmIsPlaying = false;
  let bgmTimer = null;
  let bgmStep = 0;

  // Active continuous loop sound nodes (for boiling, stove fire, sizzling)
  const activeLoops = {};

  function initContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
        masterGain.connect(ctx.destination);

        sfxGain = ctx.createGain();
        sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
        sfxGain.connect(masterGain);

        musicGain = ctx.createGain();
        musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
        musicGain.connect(masterGain);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // Load settings from storage
  function applySettings() {
    if (window.DebugDapur.StorageManager) {
      const data = window.DebugDapur.StorageManager.getData();
      if (data && data.settings) {
        sfxVolume = data.settings.sfxVolume !== undefined ? data.settings.sfxVolume : 0.8;
        musicVolume = data.settings.musicVolume !== undefined ? data.settings.musicVolume : 0.4;
        sfxMuted = !!data.settings.sfxMuted;
        musicMuted = !!data.settings.musicMuted;

        if (sfxGain && ctx) {
          sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
        }
        if (musicGain && ctx) {
          musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
        }
      }
    }
  }

  // Sound Effects Generators using pure synthesis
  function playClick() {
    initContext();
    if (sfxMuted || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playSuccess() {
    initContext();
    if (sfxMuted || !ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  function playBugError() {
    initContext();
    if (sfxMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  function playWaterPour() {
    initContext();
    if (sfxMuted || !ctx) return;
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);

    noise.start();
  }

  function playStir() {
    initContext();
    if (sfxMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  function playSpatulaFlip() {
    initContext();
    if (sfxMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  function playIgnite() {
    initContext();
    if (sfxMuted || !ctx) return;
    const now = ctx.currentTime;
    // Click spark
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);

    // Whoosh of gas
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.3, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(sfxGain);
    noise.start(now);
  }

  function playLevelComplete() {
    initContext();
    if (sfxMuted || !ctx) return;
    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.30, d: 0.20 },
      { f: 1046.50, t: 0.50, d: 0.45 }
    ];
    fanfare.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + note.t;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
    });
  }

  function playStar() {
    initContext();
    if (sfxMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now); // E6
    osc.frequency.exponentialRampToValueAtTime(1760.00, now + 0.15); // A6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Continuous Sound Loops (Boiling & Sizzling)
  function startContinuousSound(type) {
    initContext();
    if (sfxMuted || !ctx || activeLoops[type]) return;

    if (type === 'boiling') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.value = 5.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);

      noise.start();
      activeLoops[type] = { source: noise, gain: gain };
    } else if (type === 'sizzling') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2500, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);

      noise.start();
      activeLoops[type] = { source: noise, gain: gain };
    }
  }

  function stopContinuousSound(type) {
    if (activeLoops[type]) {
      try {
        activeLoops[type].source.stop();
        activeLoops[type].source.disconnect();
      } catch (e) {}
      delete activeLoops[type];
    }
  }

  function stopAllContinuousSounds() {
    Object.keys(activeLoops).forEach(type => stopContinuousSound(type));
  }

  // Cozy Kitchen Background Music Synthesizer
  // A playful, charming marimba/acoustic-like pentatonic progression
  const bgmMelody = [
    // [noteFreq, durationInSteps, isChordRoot]
    [261.63, 2], [329.63, 2], [392.00, 2], [523.25, 2],
    [440.00, 2], [392.00, 2], [329.63, 2], [293.66, 2],
    [329.63, 2], [392.00, 2], [440.00, 2], [523.25, 2],
    [587.33, 2], [523.25, 2], [392.00, 2], [329.63, 2],

    [261.63, 2], [329.63, 2], [392.00, 2], [440.00, 2],
    [523.25, 4], [440.00, 2], [392.00, 2],
    [349.23, 2], [392.00, 2], [440.00, 2], [392.00, 2],
    [329.63, 4], [261.63, 4]
  ];

  function scheduleBgmNote() {
    if (!bgmIsPlaying || !ctx || musicMuted) return;

    const note = bgmMelody[bgmStep % bgmMelody.length];
    const freq = note[0];
    const durSteps = note[1];
    const now = ctx.currentTime;
    const durSec = durSteps * 0.18;

    // Lead marimba note
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warm envelope
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc.connect(gain);
    gain.connect(musicGain);

    osc.start(now);
    osc.stop(now + durSec + 0.05);

    // Soft bass pulse every 4 steps
    if (bgmStep % 4 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(freq / 2, now);
      bassGain.gain.setValueAtTime(0.12, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bassOsc.connect(bassGain);
      bassGain.connect(musicGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.36);
    }

    bgmStep++;
    bgmTimer = setTimeout(scheduleBgmNote, durSec * 950);
  }

  function startBgm() {
    initContext();
    if (bgmIsPlaying) return;
    bgmIsPlaying = true;
    bgmStep = 0;
    if (!musicMuted) {
      scheduleBgmNote();
    }
  }

  function stopBgm() {
    bgmIsPlaying = false;
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
  }

  function setSfxVolume(val) {
    sfxVolume = Math.max(0, Math.min(1, val));
    if (sfxGain && ctx) {
      sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
    }
  }

  function setMusicVolume(val) {
    musicVolume = Math.max(0, Math.min(1, val));
    if (musicGain && ctx) {
      musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
    }
  }

  function toggleSfxMute() {
    sfxMuted = !sfxMuted;
    if (sfxGain && ctx) {
      sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
    }
    return sfxMuted;
  }

  function toggleMusicMute() {
    musicMuted = !musicMuted;
    if (musicGain && ctx) {
      musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
    }
    if (!musicMuted && bgmIsPlaying && !bgmTimer) {
      scheduleBgmNote();
    }
    return musicMuted;
  }

  return {
    initContext,
    applySettings,
    playClick,
    playSuccess,
    playBugError,
    playWaterPour,
    playStir,
    playSpatulaFlip,
    playIgnite,
    playLevelComplete,
    playStar,
    startContinuousSound,
    stopContinuousSound,
    stopAllContinuousSounds,
    startBgm,
    stopBgm,
    setSfxVolume,
    setMusicVolume,
    toggleSfxMute,
    toggleMusicMute,
    isSfxMuted: () => sfxMuted,
    isMusicMuted: () => musicMuted,
    getSfxVolume: () => sfxVolume,
    getMusicVolume: () => musicVolume
  };
})();
