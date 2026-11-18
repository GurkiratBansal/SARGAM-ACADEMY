import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap } from '../lib/gsap';
import { usePreferences } from './PreferencesContext';
import { useSound } from './SoundContext';

const WaveTransitionContext = createContext(null);

const INK = '#0a080c';
const GOLD = '#e9b44c';

function wavePath(ctx, width, baseY, amplitude, phase, peaks = 3) {
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  const steps = Math.max(48, Math.round(width / 12));
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    const taper = Math.sin((i / steps) * Math.PI);
    const y =
      baseY +
      Math.sin((i / steps) * Math.PI * 2 * peaks + phase) * amplitude * taper;
    ctx.lineTo(x, y);
  }
}

function drawFrame(ctx, width, height, state) {
  ctx.clearRect(0, 0, width, height);
  const covering = state.reveal <= 0.001;
  const p = covering ? state.cover : state.reveal;
  if (p <= 0.0001) return;

  if (covering) {
    const top = height * (1 - p);
    const amp = Math.max(3, height * 0.024 * (1 - p * 0.7));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, top);
    const steps = Math.max(48, Math.round(width / 14));
    for (let i = 0; i <= steps; i += 1) {
      const x = (i / steps) * width;
      const taper = Math.sin((i / steps) * Math.PI);
      const y = top + Math.sin((i / steps) * Math.PI * 6 + p * 4) * amp * taper;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.restore();

    // Soft parallel waveforms under the leading edge.
    for (let line = 0; line < 3; line += 1) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const x = (i / steps) * width;
        const taper = Math.sin((i / steps) * Math.PI);
        const y =
          top +
          (line + 1) * (14 + line * 6) +
          Math.sin((i / steps) * Math.PI * 6 + p * 4 + line) * amp * taper * (1 - line * 0.22);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(233,180,76,${0.26 - line * 0.07})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    wavePath(ctx, width, top, amp, p * 4, 6);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    const bottom = height * (1 - state.reveal);
    const amp = Math.max(3, height * 0.024 * state.reveal);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, bottom);
    const steps = Math.max(48, Math.round(width / 14));
    for (let i = steps; i >= 0; i -= 1) {
      const x = (i / steps) * width;
      const taper = Math.sin((i / steps) * Math.PI);
      const y =
        bottom + Math.sin((i / steps) * Math.PI * 6 + state.reveal * 4) * amp * taper;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.restore();

    for (let line = 0; line < 2; line += 1) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const x = (i / steps) * width;
        const taper = Math.sin((i / steps) * Math.PI);
        const y =
          bottom -
          (line + 1) * 14 +
          Math.sin((i / steps) * Math.PI * 6 + state.reveal * 4 + line) * amp * taper * 0.7;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(233,180,76,${0.22 - line * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    wavePath(ctx, width, bottom, amp, state.reveal * 4, 6);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function WaveTransitionProvider({ children }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ cover: 0, reveal: 0 });
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const timelineRef = useRef(null);
  const busyRef = useRef(false);
  const [running, setRunning] = useState(false);
  const { reducedMotion } = usePreferences();
  const { whoosh } = useSound();

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    sizeRef.current = { width, height, dpr };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(ctx, width, height, stateRef.current);
    }
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      timelineRef.current?.kill();
      busyRef.current = false;
    };
  }, [resize]);

  const transition = useCallback(
    (action) => {
      if (typeof action !== 'function') return;
      if (reducedMotion) {
        action();
        return;
      }
      if (busyRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        action();
        return;
      }

      busyRef.current = true;
      setRunning(true);
      canvas.style.visibility = 'visible';
      canvas.style.pointerEvents = 'auto';
      resize();
      whoosh();

      const state = stateRef.current;
      state.cover = 0;
      state.reveal = 0;

      const render = () => {
        const { width, height } = sizeRef.current;
        drawFrame(ctx, width, height, state);
      };

      const timeline = gsap.timeline({
        onComplete: () => {
          canvas.style.visibility = 'hidden';
          canvas.style.pointerEvents = 'none';
          state.cover = 0;
          state.reveal = 0;
          const clearCtx = canvas.getContext('2d');
          if (clearCtx) clearCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          setRunning(false);
          busyRef.current = false;
          timelineRef.current = null;
        },
      });
      timelineRef.current = timeline;

      timeline.to(state, {
        cover: 1,
        duration: 0.42,
        ease: 'power2.inOut',
        onUpdate: render,
      });
      timeline.call(() => {
        action();
      });
      timeline.to(state, {
        reveal: 1,
        duration: 0.58,
        ease: 'power2.inOut',
        onUpdate: render,
      });
    },
    [reducedMotion, resize, whoosh],
  );

  const value = useMemo(() => ({ transition }), [transition]);

  return (
    <WaveTransitionContext.Provider value={value}>
      {children}
      <canvas
        ref={canvasRef}
        className={`wave-transition${running ? ' is-running' : ''}`}
        aria-hidden="true"
      />
    </WaveTransitionContext.Provider>
  );
}

export function useWaveTransition() {
  const ctx = useContext(WaveTransitionContext);
  if (!ctx) throw new Error('useWaveTransition must be used inside WaveTransitionProvider');
  return ctx;
}
