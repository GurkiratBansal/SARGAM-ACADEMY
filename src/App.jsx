import { Suspense, lazy, useEffect } from 'react';
import { SiteLoader } from './components/SiteLoader';
import { StageLights } from './components/StageLights';
import { CustomCursor } from './components/CustomCursor';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Admissions } from './components/Admissions';
const Outcomes = lazy(() => import('./components/Outcomes').then((m) => ({ default: m.Outcomes })));
const Guitar = lazy(() => import('./components/Guitar').then((m) => ({ default: m.Guitar })));
const SurTaal = lazy(() => import('./components/SurTaal').then((m) => ({ default: m.SurTaal })));
const StageCurtain = lazy(() => import('./components/StageCurtain').then((m) => ({ default: m.StageCurtain })));
const Instructor = lazy(() => import('./components/Instructor').then((m) => ({ default: m.Instructor })));
const Faq = lazy(() => import('./components/Faq').then((m) => ({ default: m.Faq })));
const Join = lazy(() => import('./components/Join').then((m) => ({ default: m.Join })));
const Footer = lazy(() => import('./components/Footer').then((m) => ({ default: m.Footer })));
import { SoundToast } from './components/SoundToast';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { usePreferences } from './context/PreferencesContext';
import { ScrollTrigger } from './lib/gsap';
import { focusSection, scrollToSection } from './lib/scroll';

export function App() {
  const { reducedMotion } = usePreferences();
  useSmoothScroll();

  // Shared behaviour for any in-page anchor that does not have its own handler:
  // offset for the fixed nav, Lenis where available, and real focus management.
  useEffect(() => {
    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;
      const id = decodeURIComponent(href.slice(1));
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      scrollToSection(id, { immediate: reducedMotion });
      focusSection(id);
      history.replaceState(null, '', `#${id}`);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reducedMotion]);

  // Refresh measurements after the opening sequence, late fonts and images.
  useEffect(() => {
    let frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener('amar:revealed', refresh);
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('amar:revealed', refresh);
      window.removeEventListener('load', refresh);
    };
  }, []);

  const skipToContent = (event) => {
    event.preventDefault();
    const main = document.getElementById('main');
    if (!main) return;
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    main.scrollIntoView({ block: 'start' });
  };

  return (
    <>
      <SiteLoader />
      <div id="site-shell">
        <a className="skip-link" href="#main" onClick={skipToContent}>
          Skip to content
        </a>

        <StageLights />
        <CustomCursor />
        <Nav />

        <main id="main" tabIndex={-1}>
          <Hero />
          <Admissions />
          <Suspense fallback={null}>
            <Outcomes />
            <Guitar />
            <SurTaal />
            <StageCurtain />
            <Instructor />
            <Faq />
            <Join />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <SoundToast />
      </div>
    </>
  );
}
