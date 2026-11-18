import { useCallback, useEffect, useRef, useState } from 'react';
import { GUITAR_STRINGS } from '../lib/site';
import { PluckText } from './PluckText';
import { SoundNudge } from './SoundNudge';
import { useSound } from '../context/SoundContext';
import { usePreferences } from '../context/PreferencesContext';

const SVG_W = 1000;
const SVG_H = 360;
const STRING_X_START = 46;
const STRING_X_END = 954;
const STRING_Y = [54, 100, 146, 192, 238, 284];

function straightPath(y) {
  return `M ${STRING_X_START} ${y} L ${STRING_X_END} ${y}`;
}

export function Guitar() {
  const sectionRef = useRef(null);
  const boardRef = useRef(null);
  const pathRefs = useRef([]);
  const plucksRef = useRef(Array.from({ length: GUITAR_STRINGS.length }, () => []));
  const lastTriggered = useRef(Array(GUITAR_STRINGS.length).fill(0));
  const startLoopRef = useRef(() => {});
  const strumTimers = useRef([]);
  const [last, setLast] = useState(null);
  const [strumming, setStrumming] = useState(false);
  const { pluck } = useSound();
  const { reducedMotion } = usePreferences();

  const drawString = useCallback((index, offset) => {
    const path = pathRefs.current[index];
    if (!path) return;
    const baseY = STRING_Y[index];
    const segments = 54;
    let d = `M ${STRING_X_START} ${baseY}`;
    for (let i = 1; i <= segments; i += 1) {
      const t = i / segments;
      const shape = Math.sin(Math.PI * t);
      const y = baseY + offset * shape;
      d += ` L ${(STRING_X_START + t * (STRING_X_END - STRING_X_START)).toFixed(1)} ${y.toFixed(2)}`;
    }
    path.setAttribute('d', d);
  }, []);

  // Damped standing-wave loop. It only runs while a string is moving.
  useEffect(() => {
    let raf = 0;
    let running = false;

    const frame = () => {
      let active = false;
      for (let index = 0; index < GUITAR_STRINGS.length; index += 1) {
        const now = performance.now();
        const list = plucksRef.current[index].filter((entry) => now - entry.start < 2200);
        plucksRef.current[index] = list;
        let offset = 0;
        list.forEach((entry) => {
          const age = (now - entry.start) / 1000;
          const envelope = Math.exp(-3.2 * age);
          offset += Math.sin(Math.PI * 2 * entry.freq * age + entry.phase) * entry.amp * envelope;
        });
        if (list.length) active = true;
        drawString(index, offset);
      }
      if (active) {
        raf = window.requestAnimationFrame(frame);
      } else {
        running = false;
        raf = 0;
        for (let index = 0; index < GUITAR_STRINGS.length; index += 1) drawString(index, 0);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    };
    startLoopRef.current = start;

    return () => {
      window.cancelAnimationFrame(raf);
      startLoopRef.current = () => {};
    };
  }, [drawString]);

  useEffect(() => {
    return () => {
      strumTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const trigger = useCallback(
    (index, strength = 0.6) => {
      const now = performance.now();
      if (now - lastTriggered.current[index] < 95) return;
      lastTriggered.current[index] = now;
      pluck(index);
      if (!reducedMotion) {
        plucksRef.current[index].push({
          start: now,
          amp: 8 + strength * 22,
          freq: 7.2 + index * 1.15,
          phase: Math.random() * Math.PI,
        });
        startLoopRef.current();
      }
      setLast({ ...GUITAR_STRINGS[index], index });
    },
    [pluck, reducedMotion],
  );

  const strum = () => {
    if (strumming) return;
    setStrumming(true);
    strumTimers.current.forEach((timer) => window.clearTimeout(timer));
    strumTimers.current = GUITAR_STRINGS.map((_, index) =>
      window.setTimeout(() => trigger(index, 0.75), index * 105),
    );
    strumTimers.current.push(
      window.setTimeout(() => setStrumming(false), GUITAR_STRINGS.length * 105 + 260),
    );
  };

  const hoverString = useRef(-1);

  const nearestString = (clientY) => {
    const board = boardRef.current;
    if (!board) return 0;
    const rect = board.getBoundingClientRect();
    const y = ((clientY - rect.top) / rect.height) * SVG_H;
    let nearest = 0;
    let best = Infinity;
    STRING_Y.forEach((stringY, index) => {
      const distance = Math.abs(stringY - y);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    return nearest;
  };

  const onBoardPointerDown = (event) => {
    const index = nearestString(event.clientY);
    hoverString.current = index;
    trigger(index, 0.85);
  };

  const onBoardPointerMove = (event) => {
    if (event.pointerType === 'touch') return;
    const index = nearestString(event.clientY);
    if (index !== hoverString.current) {
      hoverString.current = index;
      trigger(index, 0.42);
    }
  };

  const onBoardPointerLeave = () => {
    hoverString.current = -1;
  };

  return (
    <section
      className="section guitar"
      id="guitar"
      data-mood="ember"
      ref={sectionRef}
      aria-labelledby="guitar-title"
      tabIndex={-1}
    >
      <div className="wrap">
        <div className="section-head guitar-head">
          <div>
            <p className="eyebrow">Learn with guitar · Instrument no. 01</p>
            <PluckText
              as="h2"
              id="guitar-title"
              className="display-heading"
              lines={[
                { text: 'Six strings.', italic: false },
                { text: 'No recordings.', italic: true },
              ]}
            />
          </div>
          <div className="section-intro">
            <p>
              Pluck a string. The vibration you see is a damped standing wave; the note you hear is
              generated live by a Karplus–Strong string model. There is no audio file on this page.
            </p>
            <p className="mono-note">E2 · A2 · D3 · G3 · B3 · E4</p>
          </div>
        </div>

        <div
          className="guitar-board"
          ref={boardRef}
          onPointerDown={onBoardPointerDown}
          onPointerMove={onBoardPointerMove}
          onPointerLeave={onBoardPointerLeave}
        >
          <div className="guitar-glow" aria-hidden="true" />
          <div className="soundhole" aria-hidden="true">
            <span />
          </div>
          <div className="frets" aria-hidden="true">
            {[18, 33, 46, 58, 69, 79, 88].map((left) => (
              <span key={left} style={{ left: `${left}%` }} />
            ))}
          </div>
          <div className="bridge" aria-hidden="true" />

          <svg
            className="string-svg"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="string-gradient"
                gradientUnits="userSpaceOnUse"
                x1={STRING_X_START}
                y1="0"
                x2={STRING_X_END}
                y2="0"
              >
                <stop offset="0%" stopColor="#f8ecd9" stopOpacity="0.35" />
                <stop offset="18%" stopColor="#f8ecd9" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#ffd27a" />
                <stop offset="88%" stopColor="#f8ecd9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f8ecd9" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {GUITAR_STRINGS.map((string, index) => (
              <path
                key={`${string.note}-${index}`}
                ref={(el) => {
                  pathRefs.current[index] = el;
                }}
                d={straightPath(STRING_Y[index])}
                fill="none"
                stroke="url(#string-gradient)"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: string.thickness }}
              />
            ))}
          </svg>

          <div className="string-hits">
            {GUITAR_STRINGS.map((string, index) => (
              <button
                key={`hit-${string.note}-${index}`}
                type="button"
                className={`string-hit ${last?.index === index ? 'is-last' : ''}`}
                style={{ top: `${(STRING_Y[index] / SVG_H) * 100}%` }}
                onClick={(event) => {
                  // Keyboard activation only; pointer events are handled by the
                  // board so the entire surface is pluckable.
                  if (event.detail === 0) trigger(index, 0.85);
                }}
                aria-label={`Pluck ${string.label} string: ${string.note}${string.octave}, sargam ${string.sargam}, ${string.freq.toFixed(2)} hertz`}
              />
            ))}
          </div>

          <div className="string-tags" aria-hidden="true">
            {GUITAR_STRINGS.map((string, index) => (
              <span
                key={`tag-${index}`}
                className={last?.index === index ? 'is-active' : ''}
                style={{ top: `${(STRING_Y[index] / SVG_H) * 100}%` }}
              >
                <strong>{string.note}</strong>
                <em>{string.sargam}</em>
              </span>
            ))}
          </div>
        </div>

        <div className="guitar-controls">
          <button type="button" className="btn btn-ghost btn-small" onClick={strum} disabled={strumming}>
            {strumming ? 'Strumming…' : 'Strum all six'}
          </button>
          <div className="guitar-readout" aria-live="polite">
            <span className="readout-note">
              {last ? `${last.note}${last.octave}` : '—'}
            </span>
            <span className="readout-detail">
              {last
                ? `${last.freq.toFixed(2)} Hz · sargam ${last.sargam} · ${last.label}`
                : 'Hover, drag, or tap a string'}
            </span>
            <span className="readout-tech">Karplus–Strong · 0 samples</span>
          </div>
          <SoundNudge label="Sound is off, so the strings are silent." />
        </div>

        <p className="guitar-hint">
          Move across a string to pluck it. Keyboard: <kbd>Tab</kbd> to a string, then{' '}
          <kbd>Enter</kbd>. Touch: tap any string. Every note is tuned to the six open strings of a
          guitar — E A D G B E.
        </p>
      </div>
    </section>
  );
}
