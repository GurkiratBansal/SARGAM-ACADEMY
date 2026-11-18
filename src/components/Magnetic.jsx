import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';

/**
 * Anchor/button that leans toward a fine pointer and emits speaker rings.
 * Everything is progressively enhanced: without JS it is a normal link.
 */
export function Magnetic({ as: Tag = 'a', className = '', children, strength = 0.22, ...props }) {
  const ref = useRef(null);
  const { allowCursor } = usePreferences();

  useEffect(() => {
    if (!allowCursor) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [allowCursor, strength]);

  return (
    <Tag ref={ref} className={`magnetic ${className}`.trim()} {...props}>
      <span className="magnetic-label">{children}</span>
      <span className="speaker-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </Tag>
  );
}
