import { useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext';

const INTERACTIVE = 'a, button, [role="button"], summary, input, select, textarea, [data-cursor]';

export function CustomCursor() {
  const { allowCursor } = usePreferences();
  const canvasRef = useRef(null);
  const forkRef = useRef(null);

  useEffect(() => {
    if (!allowCursor) return undefined;
    const canvas = canvasRef.current;
    const fork = forkRef.current;
    if (!canvas || !fork) return undefined;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      visible: false,
      hovering: false,
      rings: [],
      lastSpawnX: 0,
      lastSpawnY: 0,
      lastHoverCheck: 0,
      lastFrame: performance.now(),
      raf: 0,
      vx: 0,
      vy: 0,
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawn = (x, y, strength = 1) => {
      state.rings.push({ x, y, age: 0, life: 780 + Math.random() * 320, strength });
      if (state.rings.length > 36) state.rings.shift();
    };

    const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      if (!state.visible) {
        state.x = event.clientX;
        state.y = event.clientY;
        state.visible = true;
        fork.style.opacity = '1';
      }
      state.targetX = event.clientX;
      state.targetY = event.clientY;

      const dx = event.clientX - state.lastSpawnX;
      const dy = event.clientY - state.lastSpawnY;
      if (dx * dx + dy * dy > 300) {
        state.lastSpawnX = event.clientX;
        state.lastSpawnY = event.clientY;
        spawn(event.clientX, event.clientY, state.hovering ? 1.5 : 0.8);
      }

      const now = performance.now();
      if (now - state.lastHoverCheck > 100) {
        state.lastHoverCheck = now;
        const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
        const hovering = Boolean(target);
        if (hovering !== state.hovering) {
          state.hovering = hovering;
          fork.classList.toggle('is-hovering', hovering);
        }
      }
    };

    const onPointerLeave = () => {
      state.visible = false;
      fork.style.opacity = '0';
    };
    const onPointerEnter = () => {
      state.visible = true;
      fork.style.opacity = '1';
    };
    const onPointerDown = (event) => {
      if (event.pointerType === 'touch') return;
      spawn(event.clientX, event.clientY, 2.2);
      spawn(event.clientX, event.clientY, 1.4);
      fork.classList.add('is-pressed');
    };
    const onPointerUp = () => fork.classList.remove('is-pressed');
    const onDocumentLeave = () => {
      state.visible = false;
      fork.style.opacity = '0';
    };

    const draw = (now) => {
      state.raf = window.requestAnimationFrame(draw);
      if (document.hidden) return;
      const dt = Math.min(48, now - state.lastFrame);
      state.lastFrame = now;

      const previousX = state.x;
      const previousY = state.y;
      const ease = 1 - Math.pow(0.82, dt / 16.67);
      state.x += (state.targetX - state.x) * ease;
      state.y += (state.targetY - state.y) * ease;
      state.vx = state.x - previousX;
      state.vy = state.y - previousY;

      const tilt = Math.max(-12, Math.min(12, state.vx * 0.7));
      fork.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = state.rings.length - 1; i >= 0; i -= 1) {
        const ring = state.rings[i];
        ring.age += dt;
        if (ring.age >= ring.life) {
          state.rings.splice(i, 1);
          continue;
        }
        const progress = ring.age / ring.life;
        const alpha = Math.pow(1 - progress, 2) * 0.32 * ring.strength;
        const radius = 7 + progress * 48 * ring.strength;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(233, 180, 76, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, radius * 0.58, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 210, 122, ${alpha * 0.55})`;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointerleave', onDocumentLeave);
    document.addEventListener('pointerenter', onPointerEnter);
    window.addEventListener('resize', resize, { passive: true });
    state.raf = window.requestAnimationFrame(draw);

    return () => {
      root.classList.remove('has-custom-cursor');
      window.cancelAnimationFrame(state.raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerleave', onDocumentLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      window.removeEventListener('resize', resize);
    };
  }, [allowCursor]);

  if (!allowCursor) return null;

  return (
    <>
      <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />
      <div ref={forkRef} className="cursor-fork" aria-hidden="true">
        <svg viewBox="0 0 32 40" fill="none">
          <path
            d="M8 3v13.5a8 8 0 0 0 16 0V3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M16 24.5V35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="37" r="2.1" fill="currentColor" />
          <path d="M6 3h4M22 3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 20.6h10" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
        </svg>
      </div>
    </>
  );
}
