export const SA_FREQ = 261.6256; // C4

export const SARGAM_NOTES = [
  { name: 'Sa', offset: 0 },
  { name: 'Re', offset: 2 },
  { name: 'Ga', offset: 4 },
  { name: 'Ma', offset: 5 },
  { name: 'Pa', offset: 7 },
  { name: 'Dha', offset: 9 },
  { name: 'Ni', offset: 11 },
];

export const SARGAM_SEQUENCE = [
  { name: 'Sa', freq: 261.63 },
  { name: 'Re', freq: 293.66 },
  { name: 'Ga', freq: 329.63 },
  { name: 'Ma', freq: 349.23 },
  { name: 'Pa', freq: 392.0 },
  { name: 'Dha', freq: 440.0 },
  { name: 'Ni', freq: 493.88 },
  { name: "Sa'", freq: 523.25 },
];

export const NOTE_INDEX = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

const CANDIDATES = (() => {
  const out = [];
  for (let octave = 1; octave <= 6; octave += 1) {
    for (const note of SARGAM_NOTES) {
      const midi = 12 * (octave + 1) + note.offset; // C4 = 60 when octave = 4
      out.push({ name: note.name, octave, midi, freq: midiToFreq(midi) });
    }
  }
  out.push({ name: 'Sa', octave: 7, midi: 96, freq: midiToFreq(96) });
  return out;
})();

/**
 * Returns the closest sargam degree (in C) and how far the singer is from it.
 * Works across octaves, so a low Sa and a high Sa are both "Sa".
 */
export function nearestSargam(freq) {
  if (!Number.isFinite(freq) || freq <= 0) return null;
  const midi = freqToMidi(freq);
  let best = null;
  let bestDist = Infinity;
  for (const candidate of CANDIDATES) {
    const dist = Math.abs(midi - candidate.midi);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  if (!best) return null;
  return {
    ...best,
    cents: Math.round((midi - best.midi) * 100),
    index: NOTE_INDEX[best.midi % 12] ?? 0,
  };
}

/** 0 at ~80Hz, 1 at ~1.2kHz. Used to drive hue in the hero shader. */
export function pitchToNorm(freq) {
  if (!freq) return 0;
  return Math.min(1, Math.max(0, Math.log2(freq / 80) / Math.log2(1200 / 80)));
}

/** Autocorrelation pitch detection on a time-domain buffer. */
export function detectPitch(buffer, sampleRate) {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.008) return { freq: 0, rms };

  // Trim the quiet edges so the correlation is not diluted.
  let start = 0;
  const threshold = 0.2 * rms;
  while (start < size / 2 && Math.abs(buffer[start]) < threshold) start += 1;
  let end = size - 1;
  while (end > size / 2 && Math.abs(buffer[end]) < threshold) end -= 1;
  const trimmed = buffer.subarray(start, end);
  const n = trimmed.length;
  if (n < 64) return { freq: 0, rms };

  // Voice lives between ~65Hz and ~1.2kHz, so only those lags are needed.
  const minLag = Math.max(8, Math.floor(sampleRate / 1400));
  const maxLag = Math.min(n - 2, Math.floor(sampleRate / 65));
  const correlations = new Float32Array(maxLag + 1);
  for (let lag = 0; lag <= maxLag; lag += 1) {
    let sum = 0;
    for (let i = 0; i < n - lag; i += 1) sum += trimmed[i] * trimmed[i + lag];
    correlations[lag] = sum;
  }

  let d = 0;
  while (d < maxLag && correlations[d] > correlations[d + 1]) d += 1;
  let maxVal = -Infinity;
  let maxPos = -1;
  for (let lag = Math.max(d, minLag); lag <= maxLag; lag += 1) {
    if (correlations[lag] > maxVal) {
      maxVal = correlations[lag];
      maxPos = lag;
    }
  }
  if (maxPos <= 0) return { freq: 0, rms };

  // Prefer the first strong peak so we do not lock onto an octave below.
  let bestLag = maxPos;
  for (let lag = Math.max(d, minLag); lag < maxPos; lag += 1) {
    if (
      correlations[lag] > 0.88 * maxVal &&
      correlations[lag] > correlations[lag - 1] &&
      correlations[lag] >= correlations[lag + 1]
    ) {
      bestLag = lag;
      break;
    }
  }

  const y0 = correlations[bestLag - 1] ?? correlations[bestLag];
  const y1 = correlations[bestLag];
  const y2 = correlations[bestLag + 1] ?? correlations[bestLag];
  const denom = 2 * (2 * y1 - y0 - y2);
  const shift = denom !== 0 ? (y2 - y0) / denom : 0;
  const period = bestLag + shift;
  const freq = sampleRate / period;
  if (freq < 60 || freq > 1400) return { freq: 0, rms };
  return { freq, rms };
}

export function formatCountdown(ms) {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: String(Math.floor(totalSeconds / 86400)).padStart(2, '0'),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
    totalSeconds,
  };
}
