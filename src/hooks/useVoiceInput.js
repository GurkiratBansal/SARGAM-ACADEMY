import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPitch, nearestSargam, pitchToNorm } from '../lib/notes';

const SILENCE = { live: false, level: 0, pitch: 0.12, freq: 0, note: null };

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Optional microphone input. Audio never leaves this component:
 * getUserMedia -> AnalyserNode. No recording, no upload, no destination routing.
 */
export function useVoiceInput(sharedRef) {
  const [status, setStatus] = useState('idle');
  const [note, setNote] = useState(null);
  const [level, setLevel] = useState(0);
  const [message, setMessage] = useState('');

  const sessionRef = useRef(0);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(0);
  const bufferRef = useRef(null);
  const dsRef = useRef(null);
  const mountedRef = useRef(true);
  const pitchHistory = useRef([]);
  const smoothLevel = useRef(0);
  const lastUi = useRef(0);
  const lastAnalysis = useRef(0);

  const resetShared = useCallback(() => {
    if (sharedRef) sharedRef.current = { ...SILENCE };
  }, [sharedRef]);

  const teardown = useCallback(
    (nextStatus = 'idle', nextMessage = '') => {
      sessionRef.current += 1;
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          /* noop */
        }
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch {
          /* noop */
        }
        analyserRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      bufferRef.current = null;
      dsRef.current = null;
      pitchHistory.current = [];
      smoothLevel.current = 0;
      resetShared();
      if (mountedRef.current) {
        setLevel(0);
        setNote(null);
        setStatus(nextStatus);
        setMessage(nextMessage);
      }
    },
    [resetShared],
  );

  const start = useCallback(async () => {
    if (status === 'live' || status === 'requesting') return;
    setMessage('');

    if (!window.isSecureContext) {
      setStatus('unsupported');
      setMessage('The mic demo needs a secure (https) connection. It stays off.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setMessage('This browser cannot open a microphone. The instrument will idle on its own.');
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      setStatus('unsupported');
      setMessage('Web Audio is unavailable here. The instrument will idle on its own.');
      return;
    }

    const token = sessionRef.current + 1;
    sessionRef.current = token;
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (token !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const ctx = new AudioCtx({ latencyHint: 'interactive' });
      await ctx.resume();
      if (token !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        ctx.close().catch(() => {});
        return;
      }
      ctxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.45;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser); // Deliberately not connected to destination: no feedback.
      sourceRef.current = source;
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);
      dsRef.current = new Float32Array(analyser.fftSize / 2);

      setStatus('live');
      setMessage('Listening locally. Nothing is recorded or uploaded.');
      lastAnalysis.current = 0;
      lastUi.current = 0;

      const tick = (time) => {
        if (!analyserRef.current) return;
        rafRef.current = window.requestAnimationFrame(tick);
        if (document.hidden) return;
        if (time - lastAnalysis.current < 48) return;
        lastAnalysis.current = time;

        const buffer = bufferRef.current;
        const ds = dsRef.current;
        analyserRef.current.getFloatTimeDomainData(buffer);

        let rms = 0;
        for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / buffer.length);

        if (rms > 0.006) {
          for (let i = 0; i < ds.length; i += 1) {
            ds[i] = (buffer[i * 2] + buffer[i * 2 + 1]) * 0.5;
          }
        }

        let freq = 0;
        if (rms > 0.006) {
          const detected = detectPitch(ds, ctx.sampleRate / 2);
          freq = detected.freq;
        }

        const normalized = Math.min(1, Math.max(0, (rms - 0.004) * 9));
        smoothLevel.current = smoothLevel.current * 0.72 + normalized * 0.28;

        if (freq > 0) {
          pitchHistory.current.push(freq);
          if (pitchHistory.current.length > 5) pitchHistory.current.shift();
        } else if (pitchHistory.current.length) {
          pitchHistory.current.shift();
        }

        const stableFreq = median(pitchHistory.current);
        const info = stableFreq > 0 ? nearestSargam(stableFreq) : null;

        if (sharedRef) {
          sharedRef.current = {
            live: true,
            level: smoothLevel.current,
            pitch: stableFreq > 0 ? pitchToNorm(stableFreq) : 0.18,
            freq: stableFreq,
            note: info?.name ?? null,
          };
        }

        if (time - lastUi.current > 120) {
          lastUi.current = time;
          setLevel(Math.round(smoothLevel.current * 10));
          setNote((previous) => {
            if (!info) return null;
            if (
              previous &&
              previous.name === info.name &&
              previous.octave === info.octave &&
              Math.abs(previous.cents - info.cents) < 4
            ) {
              return previous;
            }
            return {
              name: info.name,
              octave: info.octave,
              cents: info.cents,
              index: info.index,
            };
          });
        }
      };

      rafRef.current = window.requestAnimationFrame(tick);
    } catch (error) {
      if (token !== sessionRef.current) return;
      teardown();
      const denied =
        error?.name === 'NotAllowedError' ||
        error?.name === 'SecurityError' ||
        error?.name === 'PermissionDeniedError';
      if (denied) {
        setStatus('denied');
        setMessage(
          'Microphone access was declined. No problem — the instrument will idle on its own. You can still use every other part of the page.',
        );
      } else if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
        setStatus('unsupported');
        setMessage('No microphone was found. The instrument will idle on its own.');
      } else {
        setStatus('error');
        setMessage('The microphone could not start. The instrument will idle on its own.');
      }
    }
  }, [status, teardown, sharedRef]);

  const stop = useCallback(() => {
    teardown('idle', 'Microphone off. Nothing was recorded.');
  }, [teardown]);

  useEffect(() => {
    mountedRef.current = true;
    const onVisibility = () => {
      if (document.hidden) {
        teardown('idle', 'Microphone paused while the tab is hidden. Nothing was recorded.');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', onVisibility);
      teardown('idle', '');
    };
    // teardown is stable; re-running would stop a live mic on parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    note,
    level,
    message,
    start,
    stop,
    isLive: status === 'live',
    isRequesting: status === 'requesting',
  };
}
