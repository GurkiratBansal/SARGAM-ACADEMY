import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePreferences } from '../context/PreferencesContext';

/**
 * Lenis drives the page; GSAP's ticker drives Lenis so ScrollTrigger,
 * quickTo and Lenis all share one clock. Reduced motion gets native
 * scrolling â€” no smoothing, no wheel interception.
 */
export function useSmoothScroll() {
  const { reducedMotion, touch, small } = usePreferences();

  useEffect(() => {
    if (reducedMotion || (touch && small)) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling');
      return undefined;
    }

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.095,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });

    window.__amarLenis = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => {
      window.setTimeout(() => ScrollTrigger.refresh(), 1800);
    };
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => {});

    window.setTimeout(() => ScrollTrigger.refresh(), 1800);

    return () => {
      window.removeEventListener('load', refresh);
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (window.__amarLenis === lenis) window.__amarLenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling');
    };
  }, [reducedMotion, touch, small]);
}
