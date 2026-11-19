import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { OUTCOMES } from '../lib/site';
import { PluckText } from './PluckText';
import { usePreferences } from '../context/PreferencesContext';
import { useSound } from '../context/SoundContext';

const MELODY = [0, 1, 2, 4, 3, 2, 1, 0];

export function Outcomes() {
  const sectionRef = useRef(null);
  const keyRefs = useRef([]);
  const lastPlayed = useRef(0);
  const { reducedMotion, touch, small } = usePreferences();
  const { harmonium, enabled } = useSound();
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playKey = (index, strength = 0.8) => {
    const now = performance.now();
    if (now - lastPlayed.current < 140) return;
    lastPlayed.current = now;
    harmonium(index, strength);
  };

  useEffect(() => {
    if (reducedMotion || (touch && small)) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;

    const keys = keyRefs.current.filter(Boolean);
    if (!keys.length) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 58%',
          once: true,
        },
      });

      MELODY.forEach((keyIndex, step) => {
        const key = keys[keyIndex];
        if (!key) return;
        const glow = key.querySelector('.key-glow');
        const at = step * 0.24;
        timeline
          .call(
            () => {
              if (enabledRef.current) harmonium(keyIndex, 0.55);
            },
            null,
            at,
          )
          .to(key, { y: 7, duration: 0.1, ease: 'power2.in' }, at)
          .to(glow, { opacity: 0.9, duration: 0.08 }, at)
          .to(key, { y: 0, duration: 0.34, ease: 'elastic.out(1, 0.45)' }, at + 0.1)
          .to(glow, { opacity: 0, duration: 0.35 }, at + 0.14);
      });
    }, section);

    return () => {
      context.revert();
      keys.forEach((key) => gsap.set(key, { clearProps: 'transform' }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, touch, small, harmonium]);

  return (
    <section
      className="section outcomes"
      id="outcomes"
      data-mood="amber"
      ref={sectionRef}
      aria-labelledby="outcomes-title"
      tabIndex={-1}
    >
      <div className="wrap">
        <div className="section-head outcomes-head">
          <div>
            <p className="eyebrow">Six course streams · One academy</p>
            <PluckText
              as="h2"
              id="outcomes-title"
              className="display-heading"
              lines={[
                { text: 'Six streams.', italic: false },
                { text: 'One method.', italic: true },
                { text: 'Start anywhere.', italic: false },
              ]}
            />
          </div>
          <div className="section-intro">
            <p>
              Every course runs from beginner to advanced, with practical training and individual
              guidance. Hover or tap a key to press it. With sound on, each key plays a harmonium
              tone — and the section plays itself once as you arrive.
            </p>
            <p className="mono-note">Sa · Re · Ga · Ma · Pa · Dha</p>
          </div>
        </div>

        <div className="keybed-shell">
          <div className="keybed-top" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="keybed-scroll">
            <div className="keybed">
              {OUTCOMES.map((outcome, index) => (
                <button
                  type="button"
                  className="outcome-key"
                  key={outcome.title}
                  ref={(el) => {
                    keyRefs.current[index] = el;
                  }}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') playKey(index, 0.65);
                  }}
                  onClick={() => playKey(index, 0.85)}
                >
                  <span className="key-glow" aria-hidden="true" />
                  <span className="key-face">
                    <span className="key-meta">
                      <span className="key-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="key-note">{outcome.note}</span>
                    </span>
                    <span className="key-title">{outcome.title}</span>
                    <span className="key-body">{outcome.body}</span>
                    <span className="key-detail">{outcome.detail}</span>
                    <span className="key-press" aria-hidden="true">
                      press
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="keybed-hint mono-note">
            <span aria-hidden="true">←</span> swipe / drag the keys on a small screen
            <span aria-hidden="true">→</span>
          </div>
        </div>

        <p className="outcomes-footnote">
          Every key is also a real harmonium note. Turn sound on in the nav to hear what you press.
          <span className="ornament" aria-hidden="true">
            ✺
          </span>
        </p>
      </div>
    </section>
  );
}
