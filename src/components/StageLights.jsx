import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';

const MOODS = {
  hero: {
    gold: { x: '22vw', y: '-12vh', opacity: 0.5, scale: 1.08 },
    rose: { x: '-24vw', y: '18vh', opacity: 0.16, scale: 0.92 },
    blue: { x: '8vw', y: '38vh', opacity: 0.08, scale: 1 },
    teal: { x: '-12vw', y: '-38vh', opacity: 0.12, scale: 0.9 },
  },
  warm: {
    gold: { x: '-20vw', y: '8vh', opacity: 0.42, scale: 1.02 },
    rose: { x: '26vw', y: '-4vh', opacity: 0.22, scale: 0.98 },
    blue: { x: '12vw', y: '36vh', opacity: 0.07, scale: 0.9 },
    teal: { x: '-6vw', y: '-30vh', opacity: 0.1, scale: 0.85 },
  },
  amber: {
    gold: { x: '-26vw', y: '-8vh', opacity: 0.44, scale: 1.05 },
    rose: { x: '28vw', y: '16vh', opacity: 0.24, scale: 0.96 },
    blue: { x: '0vw', y: '40vh', opacity: 0.06, scale: 0.9 },
    teal: { x: '20vw', y: '-34vh', opacity: 0.1, scale: 0.9 },
  },
  ember: {
    gold: { x: '28vw', y: '16vh', opacity: 0.48, scale: 1.04 },
    rose: { x: '-18vw', y: '-10vh', opacity: 0.36, scale: 1.02 },
    blue: { x: '-4vw', y: '38vh', opacity: 0.06, scale: 0.9 },
    teal: { x: '10vw', y: '-30vh', opacity: 0.08, scale: 0.85 },
  },
  rose: {
    gold: { x: '4vw', y: '24vh', opacity: 0.22, scale: 1 },
    rose: { x: '-24vw', y: '-8vh', opacity: 0.36, scale: 1.06 },
    blue: { x: '26vw', y: '-14vh', opacity: 0.14, scale: 0.96 },
    teal: { x: '12vw', y: '36vh', opacity: 0.16, scale: 0.95 },
  },
  crimson: {
    gold: { x: '0vw', y: '26vh', opacity: 0.38, scale: 1.08 },
    rose: { x: '0vw', y: '-10vh', opacity: 0.46, scale: 1.12 },
    blue: { x: '-28vw', y: '20vh', opacity: 0.07, scale: 0.9 },
    teal: { x: '30vw', y: '5vh', opacity: 0.05, scale: 0.9 },
  },
  magenta: {
    gold: { x: '-26vw', y: '22vh', opacity: 0.2, scale: 0.98 },
    rose: { x: '22vw', y: '-6vh', opacity: 0.52, scale: 1.12 },
    blue: { x: '-14vw', y: '-32vh', opacity: 0.1, scale: 0.9 },
    teal: { x: '-30vw', y: '30vh', opacity: 0.1, scale: 0.9 },
  },
  blue: {
    gold: { x: '-18vw', y: '-26vh', opacity: 0.1, scale: 0.9 },
    rose: { x: '26vw', y: '28vh', opacity: 0.12, scale: 0.92 },
    blue: { x: '16vw', y: '-10vh', opacity: 0.46, scale: 1.1 },
    teal: { x: '-24vw', y: '18vh', opacity: 0.22, scale: 1 },
  },
  finale: {
    gold: { x: '2vw', y: '8vh', opacity: 0.56, scale: 1.14 },
    rose: { x: '-28vw', y: '16vh', opacity: 0.18, scale: 0.96 },
    blue: { x: '28vw', y: '-24vh', opacity: 0.1, scale: 0.9 },
    teal: { x: '-8vw', y: '-34vh', opacity: 0.12, scale: 0.9 },
  },
};

export function StageLights() {
  const rootRef = useRef(null);
  const { reducedMotion } = usePreferences();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const lights = {
      gold: root.querySelector('.light-gold'),
      rose: root.querySelector('.light-rose'),
      blue: root.querySelector('.light-blue'),
      teal: root.querySelector('.light-teal'),
    };
    let current = '';

    const setMood = (name, duration = 1.6) => {
      const mood = MOODS[name] || MOODS.hero;
      if (current === name) return;
      current = name;
      Object.entries(lights).forEach(([key, el]) => {
        if (!el) return;
        const config = mood[key];
        gsap.to(el, {
          x: config.x,
          y: config.y,
          opacity: config.opacity,
          scale: config.scale,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    setMood('hero', 0);

    if (reducedMotion) {
      return () => {
        gsap.killTweensOf(Object.values(lights));
      };
    }

    const triggers = [];
    document.querySelectorAll('[data-mood]').forEach((section) => {
      const name = section.dataset.mood;
      if (!MOODS[name]) return;
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 62%',
        end: 'bottom 42%',
        onEnter: () => setMood(name),
        onEnterBack: () => setMood(name),
      });
      triggers.push(trigger);
    });

    const field = root.querySelector('.light-field');
    let parallax;
    if (field) {
      parallax = gsap.to(field, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });
    }

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      parallax?.scrollTrigger?.kill();
      parallax?.kill();
      gsap.killTweensOf(Object.values(lights));
    };
  }, [reducedMotion]);

  return (
    <div className="stage-lights" aria-hidden="true" ref={rootRef}>
      <div className="light-field">
        <div className="stage-light light-gold" />
        <div className="stage-light light-rose" />
        <div className="stage-light light-blue" />
        <div className="stage-light light-teal" />
      </div>
      <div className="stage-vignette" />
    </div>
  );
}
