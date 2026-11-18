import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';
import { useSound } from '../context/SoundContext';
import { signalReveal } from '../lib/reveal';
import { SARGAM_SEQUENCE } from '../lib/notes';

const SESSION_KEY = 'sargam-loader-seen';
const NOTE_POSITIONS = [100, 186, 272, 358, 444, 530, 616, 702];

function shouldShowLoader(reduced, veryLow) {
  if (reduced || veryLow) return false;
  try {
    if (new URLSearchParams(window.location.search).get('loader') === '1') return true;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    return true;
  }
}

export function SargamLoader() {
  const { reducedMotion, veryLow } = usePreferences();
  const { playSargam } = useSound();
  const [visible, setVisible] = useState(() => shouldShowLoader(reducedMotion, veryLow));
  const overlayRef = useRef(null);
  const lineRef = useRef(null);
  const ghostRef = useRef(null);
  const noteRefs = useRef([]);
  const wordRef = useRef(null);
  const subRef = useRef(null);
  const skipRef = useRef(null);
  const timelineRef = useRef(null);
  const finishingRef = useRef(false);
  const doneRef = useRef(false);

  const markSeen = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
  };

  const releaseShell = () => {
    const shell = document.getElementById('site-shell');
    if (shell) shell.removeAttribute('inert');
  };

  const handOffFocus = () => {
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  };

  const finish = (instant = false) => {
    if (doneRef.current) return;
    doneRef.current = true;
    markSeen();
    document.documentElement.classList.remove('is-loading');
    releaseShell();
    signalReveal();
    const overlay = overlayRef.current;
    if (!overlay) {
      setVisible(false);
      handOffFocus();
      return;
    }
    if (instant) {
      overlay.style.opacity = '0';
      window.setTimeout(() => {
        setVisible(false);
        handOffFocus();
      }, 180);
      return;
    }
    overlay.classList.add('is-wiping');
    const wipe = { value: 0 };
    gsap.to(wipe, {
      value: 125,
      duration: 0.58,
      ease: 'power2.in',
      onUpdate: () => overlay.style.setProperty('--wipe', `${wipe.value}%`),
      onComplete: () => {
        overlay.style.opacity = '0';
        window.setTimeout(() => {
          setVisible(false);
          handOffFocus();
        }, 80);
      },
    });
  };

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useLayoutEffect(() => {
    if (!visible) {
      markSeen();
      signalReveal();
      return undefined;
    }

    doneRef.current = false;
    document.documentElement.classList.add('is-loading');
    document.documentElement.classList.remove('is-wiped');
    document.getElementById('site-shell')?.setAttribute('inert', '');

    const line = lineRef.current;
    const ghost = ghostRef.current;
    const overlay = overlayRef.current;
    if (!line || !ghost || !overlay) return undefined;

    const state = { amp: 0, baseY: 152, phase: 0 };

    const buildPath = (amp, baseY, phase) => {
      const points = [];
      const total = 120;
      for (let i = 0; i <= total; i += 1) {
        const x = 60 + (i / total) * 680;
        const env = Math.sin((i / total) * Math.PI) ** 1.4;
        const y = baseY + Math.sin((i / total) * Math.PI * 7 + phase) * amp * env;
        points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return points.join(' ');
    };

    line.setAttribute('d', buildPath(0, state.baseY, 0));
    ghost.setAttribute('d', buildPath(0, state.baseY, 0));
    line.style.strokeDasharray = '1';
    line.style.strokeDashoffset = '1';
    line.setAttribute('pathLength', '1');
    gsap.set(noteRefs.current, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
    gsap.set(wordRef.current, { opacity: 0, y: 12 });
    gsap.set(subRef.current, { opacity: 0, y: 6 });

    const draw = () => {
      const d = buildPath(state.amp, state.baseY, state.phase);
      line.setAttribute('d', d);
      ghost.setAttribute('d', d);
    };

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => finishRef.current(false),
    });
    timelineRef.current = timeline;

    timeline.to(line.style, { strokeDashoffset: 0, duration: 0.46, ease: 'power2.inOut' }, 0.03);
    timeline.to(state, { amp: 24, duration: 0.34, onUpdate: draw }, 0.38);
    timeline.to(state, { phase: 2.2, duration: 0.72, ease: 'sine.inOut', onUpdate: draw }, 0.38);
    timeline.to(state, { baseY: 222, amp: 0, duration: 0.4, ease: 'power2.inOut', onUpdate: draw }, 1.0);

    SARGAM_SEQUENCE.forEach((_, index) => {
      timeline.to(
        noteRefs.current[index],
        {
          opacity: 1,
          scale: 1,
          duration: 0.24,
          ease: 'back.out(2.2)',
          onStart: () => playSargam(index),
        },
        0.34 + index * 0.072,
      );
    });

    timeline.to(noteRefs.current, { opacity: 0.35, duration: 0.28 }, 1.0);
    timeline.to(wordRef.current, { opacity: 1, y: 0, duration: 0.34 }, 1.02);
    timeline.to(subRef.current, { opacity: 0.68, y: 0, duration: 0.3 }, 1.14);
    timeline.to(overlay.querySelector('.loader-ripple'), { scale: 2.4, opacity: 0, duration: 0.55 }, 1.1);
    timeline.call(() => finishRef.current(false), null, 1.48);
    timeline.to({}, { duration: 0.3 }, 1.48);

    skipRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finishRef.current(true);
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        skipRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      timeline.kill();
      timelineRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('is-loading');
      releaseShell();
      if (!doneRef.current) signalReveal();
    };
    // Loader runs once per session; sound/prefs are read at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const skip = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    timelineRef.current?.kill();
    finish(true);
  };

  return (
    <div
      className="loader"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Sargam Academy is loading"
    >
      <div className="loader-grain" aria-hidden="true" />
      <button type="button" className="loader-skip" onClick={skip} ref={skipRef}>
        Skip intro
      </button>

      <div className="loader-stage" aria-hidden="true">
        <svg viewBox="0 0 800 340" className="loader-svg">
          <defs>
            <linearGradient id="loader-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e9b44c" stopOpacity="0" />
              <stop offset="18%" stopColor="#ffd27a" />
              <stop offset="82%" stopColor="#e9b44c" />
              <stop offset="100%" stopColor="#e1557a" stopOpacity="0" />
            </linearGradient>
            <filter id="loader-glow" x="-50%" y="-200%" width="200%" height="500%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {SARGAM_SEQUENCE.map((note, index) => (
            <g
              key={`${note.name}-${index}`}
              ref={(el) => {
                noteRefs.current[index] = el;
              }}
              className="loader-note"
            >
              <circle cx={NOTE_POSITIONS[index]} cy={94} r="2.4" fill="#e9b44c" />
              <text x={NOTE_POSITIONS[index]} y={82} textAnchor="middle">
                {note.name}
              </text>
            </g>
          ))}

          <path ref={ghostRef} className="loader-line ghost" fill="none" />
          <path
            ref={lineRef}
            className="loader-line"
            fill="none"
            stroke="url(#loader-line-gradient)"
            filter="url(#loader-glow)"
          />

          <text ref={wordRef} className="loader-wordmark" x="400" y="282" textAnchor="middle">
            Sargam
          </text>
          <text ref={subRef} className="loader-submark" x="400" y="308" textAnchor="middle">
            ACADEMY · CHANDIGARH
          </text>
        </svg>

        <div className="loader-ripple" />
      </div>
    </div>
  );
}
