import { SARGAM_SEQUENCE } from './notes';
import { GUITAR_STRINGS } from './site';

const MASTER_LEVEL = 0.3;

/**
 * Every sound in the site is synthesised here with the Web Audio API.
 * No audio files, no network requests. The context is only created after
 * the visitor turns sound on (a user gesture).
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.enabled = false;
    this.lastPluck = [];
    this.suspendTimer = 0;
    this.reedWave = null;
    this.noiseBuffer = null;
  }

  ensure() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -14;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 5;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.24;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0001;
      this.master.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.noiseBuffer = this.makeNoiseBuffer(1.4);
      this.reedWave = this.makeReedWave();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  makeNoiseBuffer(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  makeReedWave() {
    const harmonics = [0, 1, 0.52, 0.34, 0.22, 0.16, 0.11, 0.08, 0.055, 0.04, 0.03, 0.02];
    const real = new Float32Array(harmonics.length);
    const imag = new Float32Array(harmonics);
    return this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  setEnabled(on) {
    this.enabled = Boolean(on);
    window.clearTimeout(this.suspendTimer);

    if (this.enabled) {
      const ctx = this.ensure();
      if (!ctx) {
        this.enabled = false;
        return false;
      }
      const now = ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(MASTER_LEVEL, now + 0.12);
      this.chime();
      return true;
    }

    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      this.suspendTimer = window.setTimeout(() => {
        if (!this.enabled && this.ctx?.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      }, 900);
    }
    return true;
  }

  /** Soft bell used when sound is switched on. */
  chime() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523.25, 783.99];
    notes.forEach((freq, i) => {
      this.tone(freq, {
        duration: 0.9,
        gain: 0.045,
        type: 'sine',
        attack: 0.01,
        when: this.ctx.currentTime + i * 0.08,
      });
    });
  }

  tone(freq, options = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const {
      duration = 0.6,
      gain = 0.06,
      type = 'sine',
      attack = 0.012,
      release = null,
      detune = 0,
      when = ctx.currentTime,
      pan = 0,
    } = options;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    const peak = Math.max(0.0002, gain);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + attack);
    const tail = release ?? duration;
    g.gain.exponentialRampToValueAtTime(0.0001, when + attack + tail);

    osc.connect(g);
    if (panner) {
      panner.pan.value = pan;
      g.connect(panner);
      panner.connect(this.master);
    } else {
      g.connect(this.master);
    }

    osc.start(when);
    osc.stop(when + attack + tail + 0.05);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
      if (panner) panner.disconnect();
    };
  }

  sargam(index = 0) {
    const note = SARGAM_SEQUENCE[index % SARGAM_SEQUENCE.length];
    if (!note) return;
    this.tone(note.freq, { duration: 0.55, gain: 0.05, type: 'sine', pan: (index - 3.5) * 0.08 });
    this.tone(note.freq * 2, { duration: 0.35, gain: 0.014, type: 'triangle' });
  }

  /** Karplus–Strong plucked string. */
  pluck(stringIndex = 0) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const last = this.lastPluck[stringIndex];
    // The AudioContext clock starts at 0, so a missing timestamp must not be
    // treated as a recent pluck — otherwise the very first pluck is swallowed.
    if (last !== undefined && now - last < 0.055) return;
    this.lastPluck[stringIndex] = now;

    const string = GUITAR_STRINGS[stringIndex];
    if (!string) return;
    const freq = string.freq;
    const sr = ctx.sampleRate;
    const seconds = freq < 120 ? 3.6 : freq < 200 ? 3.2 : 2.8;
    const length = Math.floor(sr * seconds);
    const period = Math.max(2, Math.round(sr / freq));
    const data = new Float32Array(length);

    // Excitation: low-passed noise, normalised so every string speaks at
    // the same level regardless of pitch.
    let lp = 0;
    let excitationPeak = 0;
    for (let i = 0; i < period; i += 1) {
      lp = 0.56 * lp + 0.44 * (Math.random() * 2 - 1);
      data[i] = lp;
      excitationPeak = Math.max(excitationPeak, Math.abs(lp));
    }
    if (excitationPeak > 0) {
      const scale = 1 / excitationPeak;
      for (let i = 0; i < period; i += 1) data[i] *= scale;
    }

    // Karplus–Strong delay line. The previous sample wraps to the last
    // excitation sample when the delay line closes. Reading index -1 here
    // used to fill the buffer with NaN, which the browser renders as silence.
    const damping = 0.9968 - Math.min(0.004, freq * 0.000006);
    for (let i = period; i < length; i += 1) {
      const delay = i - period;
      const previous = delay === 0 ? data[period - 1] : data[delay - 1];
      data[i] = damping * 0.5 * (data[delay] + previous);
    }

    // Fade the tail so the buffer cannot click when it ends.
    const fade = Math.min(3200, length >> 1);
    for (let i = 0; i < fade; i += 1) {
      data[length - 1 - i] *= i / fade;
    }

    const buffer = ctx.createBuffer(1, length, sr);
    buffer.copyToChannel(data, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const body = ctx.createBiquadFilter();
    body.type = 'lowpass';
    body.frequency.value = 1800 + stringIndex * 520;
    body.Q.value = 0.9;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 62;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3 - stringIndex * 0.012, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.09 - stringIndex * 0.008, now + 0.32);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds * 0.96);

    source.connect(body);
    body.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.master);
    source.start(now);
    source.stop(now + seconds);
    source.onended = () => {
      source.disconnect();
      body.disconnect();
      highpass.disconnect();
      gain.disconnect();
    };
  }

  /** Harmonium-ish reed tone for the outcome keys. */
  harmonium(index = 0, strength = 1) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.reedWave) return;
    const freq = SARGAM_SEQUENCE[index % SARGAM_SEQUENCE.length].freq;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.setPeriodicWave(this.reedWave);
    osc.frequency.value = freq;

    const detuned = ctx.createOscillator();
    detuned.setPeriodicWave(this.reedWave);
    detuned.frequency.value = freq;
    detuned.detune.value = 3.5;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    const peak = 0.075 * strength;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

    osc.connect(filter);
    detuned.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    detuned.start(now);
    osc.stop(now + 1.2);
    detuned.stop(now + 1.2);
    osc.onended = () => {
      osc.disconnect();
      detuned.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /** A soft, synthesised tabla bol. */
  tabla(bol = 'dha', options = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const { accent = false, khali = false, gainScale = 1 } = options;
    const now = ctx.currentTime;
    const isHigh = khali || bol === 'tin' || bol === 'ta';

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = isHigh ? (bol === 'ta' ? 420 : 330) : bol === 'dhin' ? 190 : 148;
    const endFreq = isHigh ? startFreq * 0.78 : accent ? 68 : 92;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isHigh ? 0.055 : 0.14));

    const gain = ctx.createGain();
    const peak = (isHigh ? 0.05 : accent ? 0.13 : 0.09) * gainScale;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isHigh ? 0.16 : accent ? 0.55 : 0.32));

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.7);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = isHigh ? 3600 : accent ? 1500 : 2600;
      band.Q.value = isHigh ? 1.4 : 0.8;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(isHigh ? 0.022 : 0.04, now + 0.003);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + (isHigh ? 0.08 : 0.13));
      noise.connect(band);
      band.connect(ng);
      ng.connect(this.master);
      noise.start(now, Math.random() * 0.4, 0.2);
      noise.onended = () => {
        noise.disconnect();
        band.disconnect();
        ng.disconnect();
      };
    }
  }

  /** Page-transition whoosh. Quiet and only if sound is already on. */
  whoosh() {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.28);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.65);
    filter.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(now);
    src.stop(now + 0.75);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
  }

  uiClick() {
    if (!this.enabled) return;
    this.tone(880, { duration: 0.12, gain: 0.025, type: 'triangle' });
  }

  dispose() {
    window.clearTimeout(this.suspendTimer);
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
      this.compressor = null;
    }
    this.enabled = false;
  }
}

export const audioEngine = new SoundEngine();
