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

  // Active continuous loop sound nodes (for boiling, sizzling)
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

  function persistSettings() {
    if (window.DebugDapur.StorageManager) {
      window.DebugDapur.StorageManager.updateSettings({
        sfxVolume,
        musicVolume,
        sfxMuted,
        musicMuted
      });
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
        if (sfxMuted || sfxVolume <= 0) {
          stopAllContinuousSounds();
        }
        if (musicMuted || musicVolume <= 0) {
          if (bgmTimer) {
            clearTimeout(bgmTimer);
            bgmTimer = null;
          }
        } else if (bgmIsPlaying && !bgmTimer) {
          scheduleBgmNote();
        }
      }
    }
  }

  function createNoiseBuffer(durationSec) {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Sound Effects Generators using pure synthesis
  function playClick() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  function playSuccess() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  function playBugError() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    // Two descending cartoon "bonk" tones (clean, non-harsh)
    [260, 175].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const t = now + idx * 0.13;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, t + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);

      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  function playWaterPour() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.42);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(1350, now + 0.35);
    filter.Q.value = 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);

    // Subtle water bubble plops
    [0.08, 0.19, 0.3].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const bGain = ctx.createGain();
      const t = now + offset;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360 + i * 80, t);
      osc.frequency.exponentialRampToValueAtTime(680 + i * 90, t + 0.05);
      bGain.gain.setValueAtTime(0.1, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(bGain);
      bGain.connect(sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  function playOilPour() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.linearRampToValueAtTime(850, now + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.34);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);
  }

  function playEggCrack() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;

    // Crisp shell tap
    const tap = ctx.createBufferSource();
    tap.buffer = createNoiseBuffer(0.05);
    const tapFilter = ctx.createBiquadFilter();
    tapFilter.type = 'bandpass';
    tapFilter.frequency.setValueAtTime(2200, now);
    tapFilter.Q.value = 3.0;
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(0.35, now);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    tap.connect(tapFilter);
    tapFilter.connect(tapGain);
    tapGain.connect(sfxGain);
    tap.start(now);

    // Soft wet plop into pan
    const osc = ctx.createOscillator();
    const pGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
    pGain.gain.setValueAtTime(0.2, now + 0.07);
    pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(pGain);
    pGain.connect(sfxGain);
    osc.start(now + 0.07);
    osc.stop(now + 0.18);
  }

  function playIngredientDrop() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.09);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  function playSeasoningSprinkle() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    [0, 0.08].forEach(offset => {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(0.07);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, now + offset);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.065);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);
      noise.start(now + offset);
    });
  }

  function playStir() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    // Soft pan-stirring brush/swish noise
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.18);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.09);
    filter.frequency.linearRampToValueAtTime(800, now + 0.17);
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.17);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);
  }

  function playSpatulaFlip() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    // Quick swoosh + gentle pan tap
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.14);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.11);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.13);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);

    const osc = ctx.createOscillator();
    const tapGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
    tapGain.gain.setValueAtTime(0.16, now + 0.08);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(tapGain);
    tapGain.connect(sfxGain);
    osc.start(now + 0.08);
    osc.stop(now + 0.16);
  }

  function playIgnite() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;

    // Crisp piezo igniter click (short noise impulse)
    const click = ctx.createBufferSource();
    click.buffer = createNoiseBuffer(0.03);
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(2400, now);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(sfxGain);
    click.start(now);

    // Warm whoosh of gas flame
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.24);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now + 0.02);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.02, now + 0.02);
    nGain.gain.linearRampToValueAtTime(0.28, now + 0.06);
    nGain.gain.exponentialRampToValueAtTime(0.005, now + 0.23);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(sfxGain);
    noise.start(now + 0.02);
  }

  function playLevelComplete() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
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

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
    });
  }

  function playStar() {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now); // E6
    osc.frequency.exponentialRampToValueAtTime(1760.00, now + 0.15); // A6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Continuous Sound Loops (Boiling & Sizzling)
  function startContinuousSound(type) {
    initContext();
    if (sfxMuted || sfxVolume <= 0 || !ctx || activeLoops[type]) return;

    if (type === 'boiling') {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(2.0);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);
      noise.start();

      // Periodic gentle bubble pops so it sounds like boiling water, not radio static
      const bubbleTimer = setInterval(() => {
        if (!activeLoops['boiling'] || sfxMuted || sfxVolume <= 0 || !ctx || ctx.state !== 'running') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const bGain = ctx.createGain();
        const baseFreq = 260 + Math.random() * 240;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.7, now + 0.055);
        bGain.gain.setValueAtTime(0.06, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(bGain);
        bGain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.07);
      }, 170);

      activeLoops[type] = { source: noise, gain: gain, timer: bubbleTimer };
    } else if (type === 'sizzling') {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(2.0);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3400, ctx.currentTime);
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(sfxGain);
      noise.start();

      // Gentle crackle pops for realistic pan sizzle
      const crackleTimer = setInterval(() => {
        if (!activeLoops['sizzling'] || sfxMuted || sfxVolume <= 0 || !ctx || ctx.state !== 'running') return;
        const now = ctx.currentTime;
        const pop = ctx.createBufferSource();
        pop.buffer = createNoiseBuffer(0.025);
        const pFilter = ctx.createBiquadFilter();
        pFilter.type = 'bandpass';
        pFilter.frequency.setValueAtTime(2800 + Math.random() * 2200, now);
        pFilter.Q.value = 2.5;
        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(0.07, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        pop.connect(pFilter);
        pFilter.connect(pGain);
        pGain.connect(sfxGain);
        pop.start(now);
      }, 140);

      activeLoops[type] = { source: noise, gain: gain, timer: crackleTimer };
    }
  }

  function stopContinuousSound(type) {
    if (activeLoops[type]) {
      if (activeLoops[type].timer) {
        clearInterval(activeLoops[type].timer);
      }
      try {
        activeLoops[type].source.stop();
        activeLoops[type].source.disconnect();
        if (activeLoops[type].gain) activeLoops[type].gain.disconnect();
      } catch (e) {}
      delete activeLoops[type];
    }
  }

  function stopAllContinuousSounds() {
    Object.keys(activeLoops).forEach(type => stopContinuousSound(type));
  }

  // Cozy Kitchen Background Music Synthesizer
  const bgmMelody = [
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
    if (!bgmIsPlaying || !ctx || musicMuted || musicVolume <= 0) {
      bgmTimer = null;
      return;
    }

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
    if (!musicMuted && musicVolume > 0 && !bgmTimer) {
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
    if (sfxVolume <= 0) {
      stopAllContinuousSounds();
    }
    persistSettings();
  }

  function setMusicVolume(val) {
    musicVolume = Math.max(0, Math.min(1, val));
    if (musicGain && ctx) {
      musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
    }
    if (musicVolume <= 0 && bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    } else if (musicVolume > 0 && !musicMuted && bgmIsPlaying && !bgmTimer) {
      scheduleBgmNote();
    }
    persistSettings();
  }

  function setMuted(muted) {
    sfxMuted = !!muted;
    musicMuted = !!muted;
    if (sfxGain && ctx) {
      sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
    }
    if (musicGain && ctx) {
      musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
    }
    if (sfxMuted) {
      stopAllContinuousSounds();
    }
    if (musicMuted) {
      if (bgmTimer) {
        clearTimeout(bgmTimer);
        bgmTimer = null;
      }
    } else if (bgmIsPlaying && !bgmTimer && musicVolume > 0) {
      scheduleBgmNote();
    }
    persistSettings();
    return sfxMuted;
  }

  function toggleSfxMute() {
    sfxMuted = !sfxMuted;
    if (sfxGain && ctx) {
      sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVolume, ctx.currentTime);
    }
    if (sfxMuted) {
      stopAllContinuousSounds();
    }
    persistSettings();
    return sfxMuted;
  }

  function toggleMusicMute() {
    musicMuted = !musicMuted;
    if (musicGain && ctx) {
      musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVolume, ctx.currentTime);
    }
    if (musicMuted) {
      if (bgmTimer) {
        clearTimeout(bgmTimer);
        bgmTimer = null;
      }
    } else if (bgmIsPlaying && !bgmTimer && musicVolume > 0) {
      scheduleBgmNote();
    }
    persistSettings();
    return musicMuted;
  }

  return {
    initContext,
    applySettings,
    playClick,
    playSuccess,
    playBugError,
    playWaterPour,
    playOilPour,
    playEggCrack,
    playIngredientDrop,
    playSeasoningSprinkle,
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
    setMuted,
    toggleSfxMute,
    toggleMusicMute,
    isSfxMuted: () => sfxMuted,
    isMusicMuted: () => musicMuted,
    getSfxVolume: () => sfxVolume,
    getMusicVolume: () => musicVolume
  };
})();
