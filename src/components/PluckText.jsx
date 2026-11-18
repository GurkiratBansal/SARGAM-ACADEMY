import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';
import { onReveal } from '../lib/reveal';
import { useInView } from '../hooks/useInView';

/**
 * Headline type whose letters behave like plucked strings.
 * - cursor proximity drives a spring displacement and variable-weight shift
 * - on scroll-in, letters are "tuned" from scattered offsets into alignment
 * Falls back to plain text for reduced motion, touch and low-power devices.
 */
export function PluckText({
  as: Tag = 'h2',
  text,
  lines,
  className = '',
  id,
  revealOn = false,
  radius = 140,
  strength = 1,
}) {
  const allLines = lines || [{ text, italic: false }];
  const fullText = allLines.map((line) => line.text).join(' ');
  const headingRef = useRef(null);
  const dataRef = useRef([]);
  const { allowCursor, reducedMotion } = usePreferences();
  const inView = useInView(headingRef, { rootMargin: '80px', threshold: 0.01 });

  const measure = () => {
    // Width locking only matters for the cursor-spring effect, which is
    // disabled on touch/reduced-motion/low-power. Skipping measurement there
    // avoids a costly forced reflow on mobile.
    if (!allowCursor) return;
    const heading = headingRef.current;
    if (!heading) return;
    const letters = Array.from(heading.querySelectorAll('.pluck-letter'));
    if (!letters.length) return;

    letters.forEach((letter) => {
      letter.style.width = '';
      letter.style.fontWeight = '';
      letter.style.transform = '';
    });

    const rects = letters.map((letter) => letter.getBoundingClientRect());
    letters.forEach((letter, index) => {
      const rect = rects[index];
      if (rect.width > 0) letter.style.width = `${rect.width.toFixed(2)}px`;
    });

    dataRef.current = letters.map((letter, index) => {
      const rect = rects[index];
      return {
        el: letter,
        baseX: rect.left + window.scrollX + rect.width / 2,
        baseY: rect.top + window.scrollY + rect.height / 2,
        width: rect.width,
        curX: 0,
        curY: 0,
        vx: 0,
        vy: 0,
        lastWeight: 0,
        touched: false,
      };
    });
  };

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize, { passive: true });
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor-as-bow: spring each letter away from the pointer.
  useEffect(() => {
    if (!allowCursor || !inView) return undefined;
    const heading = headingRef.current;
    if (!heading) return undefined;

    const pointer = { clientX: -9999, clientY: -9999, inside: false };
    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    let raf = 0;
    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (document.hidden) return;
      const pointerX = pointer.clientX + window.scrollX;
      const pointerY = pointer.clientY + window.scrollY;
      const spring = 0.18;
      const damping = 0.8;

      dataRef.current.forEach((letter) => {
        if (!letter.el.isConnected) return;
        const dx = letter.baseX - pointerX;
        const dy = letter.baseY - pointerY;
        const distance = Math.hypot(dx, dy);
        let targetX = 0;
        let targetY = 0;
        let force = 0;
        if (distance < radius && distance > 0.01) {
          force = 1 - distance / radius;
          const nx = dx / distance;
          const ny = dy / distance;
          targetX = nx * force * 18 * strength;
          targetY = ny * force * 13 * strength;
        }

        letter.vx += (targetX - letter.curX) * spring;
        letter.vy += (targetY - letter.curY) * spring;
        letter.vx *= damping;
        letter.vy *= damping;
        letter.curX += letter.vx;
        letter.curY += letter.vy;

        const settled =
          Math.abs(letter.curX) < 0.04 &&
          Math.abs(letter.curY) < 0.04 &&
          Math.abs(letter.vx) < 0.04 &&
          Math.abs(letter.vy) < 0.04;

        if (force > 0.01 || !settled) {
          letter.el.style.transform = `translate3d(${letter.curX.toFixed(2)}px, ${letter.curY.toFixed(2)}px, 0)`;
          const weight = Math.round(340 + Math.pow(force, 0.65) * 360);
          if (Math.abs(weight - letter.lastWeight) > 8) {
            letter.el.style.fontWeight = String(weight);
            letter.lastWeight = weight;
          }
          letter.touched = true;
        } else if (letter.touched) {
          letter.el.style.transform = '';
          letter.el.style.fontWeight = '';
          letter.curX = 0;
          letter.curY = 0;
          letter.vx = 0;
          letter.vy = 0;
          letter.lastWeight = 0;
          letter.touched = false;
        }
      });
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      measure();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowCursor, inView, radius, strength]);

  // Tune the letters from scattered offsets into place.
  useEffect(() => {
    if (reducedMotion || !allowCursor) return undefined;
    const heading = headingRef.current;
    if (!heading) return undefined;
    let cancelled = false;
    let trigger = null;

    const start = () => {
      if (cancelled) return;
      const chars = heading.querySelectorAll('.pluck-char');
      if (!chars.length) return;
      trigger = ScrollTrigger.create({
        trigger: heading,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            chars,
            {
              y: () => gsap.utils.random(-70, 70),
              x: () => gsap.utils.random(-26, 26),
              rotate: () => gsap.utils.random(-9, 9),
              opacity: 0,
              filter: 'blur(7px)',
            },
            {
              y: 0,
              x: 0,
              rotate: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: 'power3.out',
              stagger: { each: 0.012, from: 'random' },
              clearProps: 'filter,transform',
            },
          );
        },
      });
    };

    let unsubscribe = null;
    if (revealOn) {
      unsubscribe = onReveal(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
      trigger?.kill();
      if (heading) gsap.killTweensOf(heading.querySelectorAll('.pluck-char'));
    };
  }, [reducedMotion, revealOn]);

  return (
    <Tag className={`pluck-text ${className}`.trim()} ref={headingRef} id={id}>
      <span className="sr-only">{fullText}</span>
      <span className="pluck-visual" aria-hidden="true">
        {allLines.map((line, lineIndex) => (
          <span className={`pluck-line ${line.italic ? 'is-italic' : ''}`.trim()} key={lineIndex}>
            {line.text.split(' ').map((word, wordIndex, words) => (
              <span className="pluck-word" key={`${word}-${wordIndex}`}>
                {Array.from(word).map((char, index) => (
                  <span className="pluck-letter" key={`${char}-${index}`}>
                    <span className="pluck-char">{char}</span>
                  </span>
                ))}
                {wordIndex < words.length - 1 ? ' ' : null}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
