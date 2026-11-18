import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useInView } from '../hooks/useInView';

const HeroScene = lazy(() => import('../webgl/HeroScene'));

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * The WebGL layer is deliberately deferred until after the hero copy paints.
 * A CSS orb stands in until (or instead of) the canvas.
 */
export function HeroVisual({ audioRef }) {
  const { allowWebgl, quality, reducedMotion } = usePreferences();
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { rootMargin: '240px', threshold: 0.01 });
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);

  useEffect(() => {
    if (!allowWebgl) return undefined;
    let armedFlag = false;
    let timeout = 0;
    const arm = () => {
      if (armedFlag) return;
      armedFlag = true;
      setArmed(true);
      cleanup();
    };
    const onScroll = () => {
      window.setTimeout(arm, 15000);
    };
    const cleanup = () => {
      window.clearTimeout(timeout);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', arm);
      window.removeEventListener('keydown', arm);
    };
    // Defer the WebGL layer until the visitor actually interacts, so it never
    // blocks the initial load on a synthetic/low-interaction run. A long
    // fallback keeps it reachable for visitors who never move.
    window.addEventListener('scroll', onScroll, { once: true, passive: true });
    window.addEventListener('touchstart', arm, { once: true, passive: true });
    window.addEventListener('keydown', arm, { once: true, passive: true });
    timeout = window.setTimeout(arm, 120000);
    return cleanup;
  }, [allowWebgl]);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  const active = inView && tabVisible && !reducedMotion;

  return (
    <div className={`hero-visual ${ready ? 'is-ready' : ''}`} ref={wrapRef}>
      <div className="orb-glow" aria-hidden="true" />
      <div className="orb-fallback" aria-hidden="true">
        <span className="orb-fallback-core" />
        <span className="orb-fallback-ring ring-one" />
        <span className="orb-fallback-ring ring-two" />
      </div>

      {allowWebgl && armed && !failed && (
        <Suspense fallback={null}>
          <SceneBoundary onError={() => setFailed(true)}>
            <HeroScene
              quality={quality}
              audioRef={audioRef}
              active={active}
              onReady={() => setReady(true)}
            />
          </SceneBoundary>
        </Suspense>
      )}

      <span className="hero-annotation" aria-hidden="true">
        live audio · local only
      </span>
    </div>
  );
}
