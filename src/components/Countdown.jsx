import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';
import { formatCountdown } from '../lib/notes';
import { SITE } from '../lib/site';

const MASKS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
};

function Digit({ value }) {
  const mask = MASKS[value] || MASKS[0];
  return (
    <span className="eq-digit">
      {mask.map((row, rowIndex) =>
        Array.from(row).map((cell, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className={`eq-cell ${cell === '1' ? 'is-on' : ''}`}
            style={{
              '--h': `${7 + ((rowIndex * 3 + colIndex * 5 + Number(value)) % 5) * 1.1}px`,
              '--delay': `${(rowIndex + colIndex) * 8}ms`,
            }}
          />
        )),
      )}
    </span>
  );
}

function TimeUnit({ value, label }) {
  return (
    <div className="count-unit">
      <div className="count-digits">
        <Digit value={value[0]} />
        <Digit value={value[1]} />
      </div>
      <span className="count-label">{label}</span>
    </div>
  );
}

export function Countdown() {
  const { reducedMotion } = usePreferences();
  const target = new Date(SITE.cohortDate).getTime();
  const [now, setNow] = useState(() => Date.now());
  const displayRef = useRef(null);

  useEffect(() => {
    let timeout = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setNow(Date.now());
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const time = formatCountdown(target - now);
  const isPast = target - now <= 0;
  const finalMinute = !isPast && time.totalSeconds < 60;

  useEffect(() => {
    if (reducedMotion || !displayRef.current) return;
    const bars = displayRef.current.querySelectorAll('.eq-cell.is-on');
    gsap.fromTo(
      bars,
      { scaleY: 0.55, y: 3 },
      {
        scaleY: 1,
        y: 0,
        duration: finalMinute ? 0.55 : 0.38,
        ease: finalMinute ? 'elastic.out(1.3, 0.35)' : 'elastic.out(1, 0.5)',
        stagger: 0.003,
        overwrite: true,
      },
    );
  }, [time.seconds, reducedMotion, finalMinute]);

  const readable = isPast
    ? 'The winter cohort has started. Ask about the next cohort.'
    : `${time.days} days, ${time.hours} hours and ${time.minutes} minutes until the cohort begins.`;

  return (
    <section className="countdown-section" data-mood="warm" aria-labelledby="countdown-title">
      <div className="wrap">
        <div className="countdown-head">
          <div>
            <p className="eyebrow">Doors close</p>
            <h2 id="countdown-title" className="countdown-title">
              The winter cohort is tuning up.
            </h2>
          </div>
          <p className="countdown-date">
            <span className="mono-label">First session</span>
            {SITE.cohortLabel}
            <span className="countdown-seats">{SITE.seats} seats · 2 scholarship seats</span>
          </p>
        </div>

        <div
          className={`countdown-display ${finalMinute ? 'is-final-minute' : ''} ${isPast ? 'is-past' : ''}`}
          ref={displayRef}
          aria-hidden="true"
        >
          <TimeUnit value={time.days} label="days" />
          <span className="count-sep">
            <i />
            <i />
          </span>
          <TimeUnit value={time.hours} label="hrs" />
          <span className="count-sep">
            <i />
            <i />
          </span>
          <TimeUnit value={time.minutes} label="min" />
          <span className="count-sep">
            <i />
            <i />
          </span>
          <TimeUnit value={time.seconds} label="sec" />
        </div>

        <div className="countdown-foot">
          <p className="sr-only" role="timer" aria-live="off">
            {readable}
          </p>
          <p className="countdown-note">
            {isPast
              ? 'The room is already singing. Write to us about the next cohort.'
              : finalMinute
                ? 'Last minute. Bring your voice.'
                : 'Every second is a metronome. Nothing here is a stock animation.'}
          </p>
          <a className="text-link" href="#join">
            Reserve a seat <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
