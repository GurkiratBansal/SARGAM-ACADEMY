import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { PluckText } from './PluckText';
import { STAGE_TIPS } from '../lib/site';
import { usePreferences } from '../context/PreferencesContext';

function MicStand() {
  return (
    <svg className="stage-mic" viewBox="0 0 160 320" fill="none" aria-hidden="true">
      <ellipse cx="80" cy="309" rx="58" ry="7" fill="#000" opacity=".45" />
      <path d="M80 62v220" stroke="#0a0708" strokeWidth="5" />
      <path d="M50 305h60" stroke="#0a0708" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 292 58 308M80 292l22 16" stroke="#0a0708" strokeWidth="4" strokeLinecap="round" />
      <rect x="62" y="26" width="36" height="52" rx="18" fill="#0a0708" />
      <path
        d="M64 38h32M63 47h34M65 56h30M66 65h28"
        stroke="#3a2b2e"
        strokeWidth="1.4"
        opacity=".9"
      />
      <path d="M99 50c9 0 14 5 14 12" stroke="#0a0708" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function StageCurtain() {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const contentRef = useRef(null);
  const hintRef = useRef(null);
  const coneRef = useRef(null);
  const poolRef = useRef(null);
  const { allowPinnedScenes, reducedMotion } = usePreferences();

  useEffect(() => {
    if (!allowPinnedScenes) return undefined;
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return undefined;

    section.classList.add('is-enhanced');
    const context = gsap.context(() => {
      gsap.set([leftRef.current, rightRef.current], { xPercent: 0 });
      gsap.set(contentRef.current, { opacity: 0.12, y: 34 });
      gsap.set(hintRef.current, { opacity: 1 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=135%',
          pin,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(leftRef.current, { xPercent: -103, ease: 'none' }, 0)
        .to(rightRef.current, { xPercent: 103, ease: 'none' }, 0)
        .to(contentRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.16)
        .to(hintRef.current, { opacity: 0, duration: 0.16, ease: 'none' }, 0.1);
    }, section);

    return () => {
      context.revert();
      section.classList.remove('is-enhanced');
      ScrollTrigger.refresh();
    };
  }, [allowPinnedScenes]);

  // A follow-spot, not a gimmick: it only exists on a fine pointer.
  useEffect(() => {
    if (!allowPinnedScenes || reducedMotion) return undefined;
    const scene = pinRef.current;
    const cone = coneRef.current;
    const pool = poolRef.current;
    if (!scene || !cone || !pool) return undefined;

    const rotateTo = gsap.quickTo(cone, 'rotation', { duration: 0.8, ease: 'power3.out' });
    const poolTo = gsap.quickTo(pool, 'x', { duration: 0.8, ease: 'power3.out' });
    gsap.set(cone, { transformOrigin: '50% 0%' });

    const onMove = (event) => {
      const rect = scene.getBoundingClientRect();
      const relative = (event.clientX - rect.left) / rect.width - 0.5;
      rotateTo(relative * 26);
      poolTo(relative * rect.width * 0.34);
    };
    scene.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      scene.removeEventListener('pointermove', onMove);
      gsap.killTweensOf([cone, pool]);
    };
  }, [allowPinnedScenes, reducedMotion]);

  return (
    <section
      className="stage-section"
      id="stage"
      data-mood="crimson"
      ref={sectionRef}
      aria-labelledby="stage-title"
      tabIndex={-1}
    >
      <div className="stage-pin" ref={pinRef}>
        <div className="stage-scene">
          <div className="stage-backdrop" aria-hidden="true" />
          <div className="stage-floor" aria-hidden="true" />
          <div className="spotlight-rig" aria-hidden="true">
            <div className="spotlight-cone" ref={coneRef} />
          </div>
          <div className="spotlight-pool" ref={poolRef} aria-hidden="true" />
          <div className="stage-silhouettes" aria-hidden="true">
            <MicStand />
          </div>

          <div className="wrap stage-content" ref={contentRef}>
            <p className="eyebrow">Performance craft · Built into every course</p>
            <PluckText
              as="h2"
              id="stage-title"
              className="display-heading stage-heading"
              lines={[
                { text: 'Fear does not leave.', italic: false },
                { text: 'It learns the song.', italic: true },
              ]}
            />
            <p className="stage-lede">
              The stage is not the opposite of fear. It is where fear learns a rhythm. We rehearse
              the first thirty seconds — the breath, the eye contact, the first quiet note — until
              your body knows what to do before your mind catches up.
            </p>

            <ol className="stage-tips">
              {STAGE_TIPS.map((tip) => (
                <li key={tip.n}>
                  <span className="tip-number">{tip.n}</span>
                  <span className="tip-title">{tip.title}</span>
                  <span className="tip-body">{tip.body}</span>
                </li>
              ))}
            </ol>

            <p className="stage-note">
              Performance preparation runs through every course — breath, mic technique, stage
              mapping and the first quiet note in front of people. You set the pace; the stage can
              wait until you are ready.
            </p>
          </div>

          <div className="stage-curtains" aria-hidden="true">
            <div className="curtain curtain-left" ref={leftRef}>
              <span className="curtain-sheen" />
            </div>
            <div className="curtain curtain-right" ref={rightRef}>
              <span className="curtain-sheen" />
            </div>
            <div className="valance" />
          </div>

          <p className="curtain-hint" ref={hintRef} aria-hidden="true">
            <span>Scroll to open the curtains</span>
            <i />
          </p>
        </div>
      </div>
    </section>
  );
}
