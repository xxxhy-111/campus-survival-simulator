/* ==========================================================
   校园生存模拟器 - 音效系统
   使用 Web Audio API 合成音效，无需外部音频文件
   ========================================================== */

const gameAudio = (function() {
  let audioCtx = null;
  let muted = false;
  let bgmEnabled = true;
  let bgmVolume = 0.6;
  let sfxVolume = 0.8;

  // 从 localStorage 读取设置
  try {
    muted = localStorage.getItem('audio_muted') === '1';
    bgmEnabled = localStorage.getItem('bgm_enabled') !== '0';
    const savedBgmVol = parseFloat(localStorage.getItem('bgm_volume'));
    if (!isNaN(savedBgmVol)) bgmVolume = savedBgmVol;
    const savedSfxVol = parseFloat(localStorage.getItem('sfx_volume'));
    if (!isNaN(savedSfxVol)) sfxVolume = savedSfxVol;
  } catch (e) {}

  // BGM 相关变量
  let bgmPlaying = false;
  let bgmInterval = null;
  let bgmStartTime = 0;
  let bgmGain = null;
  let sfxGain = null;
  let bgmOscillators = []; // 存储所有BGM音符的oscillator引用，用于停止时清理

  function ensureCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    // 浏览器策略要求用户交互后才能恢复
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /* ===== 基础音色合成 ===== */

  // 播放单个音符
  // type: 'sine'|'square'|'triangle'|'sawtooth'
  function tone(freq, startTime, duration, type = 'square', volume = 0.15) {
    const ctx = audioCtx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * sfxVolume, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(sfxGain || ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // 频率扫描（滑音）
  function slide(freqStart, freqEnd, startTime, duration, type = 'square', volume = 0.15) {
    const ctx = audioCtx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), startTime + duration);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * sfxVolume, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(sfxGain || ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // 噪声（用于翻书、键盘等）
  function noise(startTime, duration, volume = 0.08, filterFreq = 2000) {
    const ctx = audioCtx;
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * sfxVolume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain || ctx.destination);
    src.start(startTime);
    src.stop(startTime + duration + 0.02);
  }

  /* ===== 具体音效 ===== */
  const SFX = {
    // 按钮点击：短促方波
    click() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(880, t, 0.06, 'square', 0.12);
    },
    // 打开界面：升调
    open() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(660, t, 0.08, 'triangle', 0.14);
      tone(990, t + 0.07, 0.1, 'triangle', 0.14);
    },
    // 关闭界面：降调
    close() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(880, t, 0.08, 'triangle', 0.12);
      tone(550, t + 0.07, 0.1, 'triangle', 0.12);
    },
    // 对话：温和提示音
    talk() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(523, t, 0.1, 'sine', 0.14);
      tone(659, t + 0.08, 0.12, 'sine', 0.14);
    },
    // 好感度增加：上升音阶 C-E-G
    favor() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(523, t, 0.1, 'triangle', 0.14);
      tone(659, t + 0.09, 0.1, 'triangle', 0.14);
      tone(784, t + 0.18, 0.18, 'triangle', 0.16);
    },
    // 上课钟声
    classBell() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      // 多个频率叠加模拟钟声
      tone(880, t, 0.4, 'sine', 0.12);
      tone(1320, t, 0.4, 'sine', 0.08);
      tone(660, t + 0.25, 0.4, 'sine', 0.1);
      tone(990, t + 0.25, 0.4, 'sine', 0.06);
    },
    // 错误/禁止：下降方波
    error() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      slide(440, 180, t, 0.25, 'square', 0.12);
    },
    // 成功：上升音阶 C-E-G-C
    success() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(523, t, 0.1, 'triangle', 0.14);
      tone(659, t + 0.09, 0.1, 'triangle', 0.14);
      tone(784, t + 0.18, 0.1, 'triangle', 0.14);
      tone(1047, t + 0.27, 0.2, 'triangle', 0.16);
    },
    // 游戏失败：悲伤下降 C-A-F
    fail() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(523, t, 0.25, 'triangle', 0.16);
      tone(440, t + 0.2, 0.25, 'triangle', 0.16);
      tone(349, t + 0.4, 0.5, 'triangle', 0.16);
    },
    // 休息：柔和正弦
    rest() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(392, t, 0.2, 'sine', 0.14);
      tone(523, t + 0.15, 0.3, 'sine', 0.12);
    },
    // 学习：翻书声
    study() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      noise(t, 0.1, 0.08, 1500);
      tone(660, t + 0.08, 0.12, 'sine', 0.1);
    },
    // 写代码：键盘声
    code() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      noise(t, 0.04, 0.06, 3000);
      noise(t + 0.08, 0.04, 0.06, 3000);
      noise(t + 0.16, 0.04, 0.06, 3000);
      tone(784, t + 0.2, 0.15, 'square', 0.08);
    },
    // 吃饭/外卖：轻快上升
    eat() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      slide(523, 784, t, 0.15, 'triangle', 0.14);
      tone(880, t + 0.15, 0.15, 'triangle', 0.12);
    },
    // 存档：确认音
    save() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(784, t, 0.1, 'triangle', 0.14);
      tone(1047, t + 0.1, 0.2, 'triangle', 0.14);
    },
    // 时间流逝：钟表滴答
    tick() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(1000, t, 0.03, 'square', 0.08);
      tone(800, t + 0.12, 0.03, 'square', 0.06);
    },
    // 步行：轻微节拍
    step() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      noise(t, 0.03, 0.04, 800);
    },
    // 购买/交易
    buy() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(784, t, 0.08, 'triangle', 0.12);
      tone(988, t + 0.07, 0.08, 'triangle', 0.12);
      tone(1319, t + 0.14, 0.15, 'triangle', 0.14);
    },
    // 拾取物品：轻快上升
    pickup() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(660, t, 0.06, 'sine', 0.12);
      tone(880, t + 0.05, 0.08, 'sine', 0.14);
      tone(1100, t + 0.1, 0.1, 'sine', 0.12);
    },
    // 健康下降警告
    warn() {
      const ctx = ensureCtx(); if (!ctx || muted) return;
      const t = ctx.currentTime;
      tone(330, t, 0.15, 'sawtooth', 0.1);
      tone(247, t + 0.15, 0.25, 'sawtooth', 0.1);
    }
  };

  /* ===== 背景音乐系统 ===== */

  // C大调音符频率
  const NOTES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
    'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
  };

  // 和弦定义（C大调 I-V-vi-IV）
  const CHORDS = [
    [NOTES.C4, NOTES.E4, NOTES.G4],   // C大三和弦
    [NOTES.G4, NOTES.B4, NOTES.D5],   // G大三和弦
    [NOTES.A4, NOTES.C5, NOTES.E5],   // Am小三和弦
    [NOTES.F4, NOTES.A4, NOTES.C5]    // F大三和弦
  ];

  // 旋律片段（轻快的校园风格）
  const MELODY = [
    { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 0.5 }, { note: 'A5', dur: 1 },
    { note: 'G5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'D5', dur: 1 },
    { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'E5', dur: 1 },
    { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 1 },
    { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 1 },
    { note: 'E5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 1 },
    { note: 'E5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 1 },
    { note: 'B4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 1 }
  ];

  // 播放单个和弦（持续2秒）
  function playChord(chordFreqs, startTime, duration = 2) {
    const ctx = audioCtx;
    if (!ctx) return;
    chordFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.015, startTime + 0.1);
      gain.gain.setValueAtTime(0.015, startTime + duration - 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(bgmGain || ctx.destination);
      // 保存引用以便停止时清理
      bgmOscillators.push(osc);
      osc.onended = () => {
        const idx = bgmOscillators.indexOf(osc);
        if (idx !== -1) bgmOscillators.splice(idx, 1);
      };
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  // 播放旋律音符
  function playMelodyNote(noteName, startTime, duration) {
    const ctx = audioCtx;
    if (!ctx) return;
    const freq = NOTES[noteName];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.02, startTime + 0.05);
    gain.gain.setValueAtTime(0.02, startTime + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(bgmGain || ctx.destination);
    // 保存引用以便停止时清理
    bgmOscillators.push(osc);
    osc.onended = () => {
      const idx = bgmOscillators.indexOf(osc);
      if (idx !== -1) bgmOscillators.splice(idx, 1);
    };
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // 播放BGM循环片段（8秒一个循环）
  function playBgmLoop() {
    const ctx = audioCtx;
    if (!ctx || !bgmEnabled || !bgmPlaying) return;

    const t = ctx.currentTime;

    // 和弦进行（每2秒一个和弦）
    CHORDS.forEach((chord, i) => {
      playChord(chord, t + i * 2, 2);
    });

    // 旋律（每0.5秒一个音符）
    MELODY.forEach((item, i) => {
      playMelodyNote(item.note, t + i * 0.5, item.dur);
    });

    // 安排下一个循环
    bgmInterval = setTimeout(() => {
      if (bgmPlaying) playBgmLoop();
    }, 8000);
  }

  // 启动BGM
  function startBgm() {
    const ctx = ensureCtx();
    if (!ctx || !bgmEnabled || bgmPlaying) return;

    // 创建BGM主音量控制器
    if (!bgmGain) {
      bgmGain = ctx.createGain();
      bgmGain.gain.value = bgmVolume;
      bgmGain.connect(ctx.destination);
    } else {
      // 恢复音量
      const t = ctx.currentTime;
      bgmGain.gain.cancelScheduledValues(t);
      bgmGain.gain.setValueAtTime(bgmVolume, t);
    }

    bgmPlaying = true;
    bgmStartTime = ctx.currentTime;
    playBgmLoop();
  }

  // 停止BGM
  function stopBgm() {
    bgmPlaying = false;
    if (bgmInterval) {
      clearTimeout(bgmInterval);
      bgmInterval = null;
    }
    // 立即停止所有正在播放的BGM音符
    while (bgmOscillators.length > 0) {
      const osc = bgmOscillators.pop();
      try {
        osc.stop(audioCtx.currentTime);
      } catch (e) {}
    }
  }

  // 设置BGM开关
  function setBgmEnabled(enabled) {
    bgmEnabled = !!enabled;
    try { localStorage.setItem('bgm_enabled', bgmEnabled ? '1' : '0'); } catch (e) {}
    if (bgmEnabled) {
      startBgm();
    } else {
      stopBgm();
    }
  }

  // 设置BGM音量（0-1）
  function setBgmVolume(vol) {
    bgmVolume = Math.max(0, Math.min(1, vol));
    try { localStorage.setItem('bgm_volume', bgmVolume.toString()); } catch (e) {}
    if (bgmGain && audioCtx) {
      bgmGain.gain.setValueAtTime(bgmVolume, audioCtx.currentTime);
    }
  }

  // 设置音效音量（0-1）
  function setSfxVolume(vol) {
    sfxVolume = Math.max(0, Math.min(1, vol));
    try { localStorage.setItem('sfx_volume', sfxVolume.toString()); } catch (e) {}
    if (sfxGain && audioCtx) {
      sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
    }
  }

  // 初始化音效音量控制器
  function ensureSfxGain() {
    const ctx = ensureCtx();
    if (!ctx || sfxGain) return;
    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxVolume;
    sfxGain.connect(ctx.destination);
  }

  /* ===== 公共接口 ===== */
  return {
    play(name) {
      if (muted) return;
      ensureSfxGain();
      const fn = SFX[name];
      if (fn) fn();
    },
    setMuted(m) {
      muted = !!m;
      try { localStorage.setItem('audio_muted', muted ? '1' : '0'); } catch (e) {}
    },
    isMuted() { return muted; },
    // BGM 控制
    startBgm,
    stopBgm,
    setBgmEnabled,
    isBgmEnabled() { return bgmEnabled; },
    setBgmVolume,
    getBgmVolume() { return bgmVolume; },
    // 音效音量控制
    setSfxVolume,
    getSfxVolume() { return sfxVolume; },
    // 首次用户交互时初始化音频上下文
    init() { ensureCtx(); }
  };
})();

// 暴露到全局
window.gameAudio = gameAudio;
