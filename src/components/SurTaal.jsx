import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { SITE, TAAL_INFO } from '../lib/site';
import { PluckText } from './PluckText';
import { SoundNudge } from './SoundNudge';
import { usePreferences } from '../context/PreferencesContext';
import { useSound } from '../context/SoundContext';
import { useInView } from '../hooks/useInView';

const BEATS = Array.from({ length: 16 }, (_, index) => index);
const TALI = new Set([0, 4, 12]);

function polar(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function arcPath(startAngle, endAngle, radius) {
  const [x1, y1] = polar(250, 250, radius, startAngle);
  const [x2, y2] = polar(250, 250, radius, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const GROUPS = [0, 1, 2, 3].map((group) => ({
  start: group * 90 - 9,
  end: (group + 1) * 90 - 15,
  khali: group === 2,
}));

// Percentage coordinates keep the ring responsive without transform percentages
// resolving against a zero-height slot.
function beatPosition(index) {
  const radians = ((index * 22.5 - 90) * Math.PI) / 180;
  const radius = 45.5;
  return {
    left: `${(50 + radius * Math.cos(radians)).toFixed(3)}%`,
    top: `${(50 + radius * Math.sin(radians)).toFixed(3)}%`,
  };
}

export function SurTaal() {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const bpmRef = useRef(76);
  const mutedRef = useRef(Array(16).fill(false));
  const activeRef = useRef(0);
  const lastBpmEmit = useRef(0);
  const [bpm, setBpm] = useState(76);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(() => Array(16).fill(false));
  const [running, setRunning] = useState(true);
  const { reducedMotion, touch, small } = usePreferences();
  const { tabla, enabled } = useSound();
  const inView = useInView(ringRef, { threshold: 0.3 });
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (reducedMotion) setRunning(false);
  }, [reducedMotion]);

  // The pulse. Visual runs even with sound off; audio follows the sound toggle.
  useEffect(() => {
    if (!running || !inView) return undefined;
    let raf = 0;
    let next = performance.now() + 160;

    const frame = (now) => {
      raf = window.requestAnimationFrame(frame);
      if (document.hidden) return;
      if (now >= next) {
        const beat = (activeRef.current + 1) % 16;
        activeRef.current = beat;
        setActive(beat);
        if (enabledRef.current && !mutedRef.current[beat]) {
          const bol = TAAL_INFO.bols[beat];
          tabla(bol, {
            accent: beat === 0 || TALI.has(beat),
            khali: beat === 8,
          });
        }
        next = now + 60000 / bpmRef.current;
      }
    };
    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, [running, inView, tabla]);

  // Scroll scrubs the tempo, within a musical range.
  useEffect(() => {
    if (reducedMotion || (touch && small)) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const now = performance.now();
        if (now - lastBpmEmit.current < 90) return;
        lastBpmEmit.current = now;
        const next = Math.round(58 + self.progress * 92);
        setBpm((previous) => (Math.abs(previous - next) > 1 ? next : previous));
      },
    });
    return () => trigger.kill();
  }, [reducedMotion, touch, small]);

  const toggleBeat = (index) => {
    setMuted((previous) => {
      const next = [...previous];
      next[index] = !next[index];
      return next;
    });
    if (enabled && muted[index]) {
      tabla(TAAL_INFO.bols[index], { accent: TALI.has(index) || index === 0, khali: index === 8 });
    }
  };

  const activeBol = TAAL_INFO.bols[active];
  const activeLabel =
    active === 0 ? 'sam · the home beat' : active === 8 ? 'khali · open hand' : `${active + 1} of 16`;

  return (
    <section
      className="section taal-section"
      id="sur-taal"
      data-mood="rose"
      ref={sectionRef}
      aria-labelledby="taal-title"
      tabIndex={-1}
    >
      <div className="wrap taal-grid">
        <div className="taal-copy">
          <p className="eyebrow">Understand sur &amp; taal · Instrument no. 02</p>
          <PluckText
            as="h2"
            id="taal-title"
            className="display-heading"
            lines={[
              { text: 'Sixteen beats.', italic: false },
              { text: 'Four corners.', italic: true },
              { text: 'One home.', italic: false },
            ]}
          />
          <p className="taal-lede">
            Teental is a sixteen-beat cycle — four bars of four. Beat one is <strong>sam</strong>,
            the home you return to. Beat nine is <strong>khali</strong>, the open hand: the same
            cycle, heard from the other side.
          </p>
          <p>
            This is not a diagram of taal. It is a taal you can keep. Scroll through the section and
            the tempo follows you. Tap any beat to mute or unmute it. The ring keeps time even with
            sound off.
          </p>

          <div className="taal-legend">
            <span>
              <i className="legend-sam" aria-hidden="true" /> Sam · 1
            </span>
            <span>
              <i className="legend-tali" aria-hidden="true" /> Tali · 5, 13
            </span>
            <span>
              <i className="legend-khali" aria-hidden="true" /> Khali · 9
            </span>
          </div>

          <div className="taal-controls">
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setRunning((value) => !value)}
              aria-pressed={running}
            >
              {running ? 'Pause the taal' : 'Play the taal'}
            </button>
            <div className="tempo-control">
              <label htmlFor="taal-tempo">
                Tempo <span className="sr-only">in beats per minute</span>
              </label>
              <input
                id="taal-tempo"
                type="range"
                min="52"
                max="160"
                step="1"
                value={bpm}
                onChange={(event) => setBpm(Number(event.target.value))}
              />
              <output htmlFor="taal-tempo">{bpm} BPM</output>
            </div>
          </div>

          <SoundNudge label="Sound is off, so the tabla is silent." />
          {reducedMotion && (
            <p className="mono-note reduced-note">
              Reduced motion is on. The ring is still until you press play.
            </p>
          )}
        </div>

        <div className="taal-ring-wrap" ref={ringRef}>
          <div className="taal-dial">
            <svg viewBox="0 0 500 500" className="taal-svg" aria-hidden="true">
              <defs>
                <radialGradient id="taal-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="55%" stopColor="#e9b44c" stopOpacity="0" />
                  <stop offset="78%" stopColor="#e9b44c" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#e9b44c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="250" cy="250" r="238" fill="url(#taal-halo)" />
              <circle cx="250" cy="250" r="214" className="taal-track-outer" />
              <circle cx="250" cy="250" r="158" className="taal-track-inner" />
              {GROUPS.map((group, index) => (
                <path
                  key={index}
                  d={arcPath(group.start, group.end, 188)}
                  className={`taal-arc ${group.khali ? 'is-khali' : ''}`}
                />
              ))}
              {GROUPS.map((group) => {
                const [x, y] = polar(250, 250, 240, group.start + 9);
                return (
                  <text key={group.start} x={x} y={y} className="taal-mark" textAnchor="middle">
                    {group.khali ? '0' : group.start === -9 ? 'X' : group.start === 81 ? '2' : '3'}
                  </text>
                );
              })}
            </svg>

            <div className="taal-beats">
              {BEATS.map((beat) => {
                const isSam = beat === 0;
                const isKhali = beat === 8;
                const isTali = TALI.has(beat) && !isSam;
                return (
                  <button
                    key={beat}
                    type="button"
                    style={beatPosition(beat)}
                    className={`taal-beat ${isSam ? 'is-sam' : ''} ${isKhali ? 'is-khali' : ''} ${isTali ? 'is-tali' : ''} ${active === beat ? 'is-active' : ''} ${muted[beat] ? 'is-muted' : ''}`}
                    onClick={() => toggleBeat(beat)}
                    aria-pressed={!muted[beat]}
                    aria-label={`Beat ${beat + 1}${isSam ? ', sam' : ''}${isKhali ? ', khali' : ''}${isTali ? ', tali' : ''}: ${TAAL_INFO.bols[beat]}. ${muted[beat] ? 'Muted' : 'On'}`}
                  >
                    <span>{beat + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="taal-center">
              <p className="taal-center-label">{active === 0 ? 'sam' : active === 8 ? 'khali' : 'bol'}</p>
              <p className="taal-bol" aria-live="off">
                {activeBol}
              </p>
              <p className="taal-meta">{activeLabel}</p>
              <p className="taal-bpm">{bpm} bpm</p>
              {muted[active] && <p className="taal-muted-label">muted beat</p>}
            </div>
          </div>

          <p className="taal-hint">
            <span aria-hidden="true">♩</span> Scroll scrubs tempo · tap a beat to mute it
          </p>
          <p className="taal-theka">
            theka — dha dhin dhin dha · dha dhin dhin dha · dha tin tin ta · ta dhin dhin dha
          </p>
        </div>
      </div>
      <p className="taal-foot sr-only">
        The next cohort begins {SITE.cohortLabel}. {SITE.seats} seats.
      </p>
    </section>
  );
}
