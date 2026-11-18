import { NAV_LINKS, SITE } from '../lib/site';
import { usePreferences } from '../context/PreferencesContext';
import { useSectionNavigate } from '../hooks/useSectionNavigate';
import { SoundToggle } from './SoundToggle';
import { Logo } from './Logo';

function MotionIcon({ reduced }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {reduced ? (
        <>
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M7 9v6M12 7v10M17 9v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity=".35"
          />
        </>
      ) : (
        <>
          <path
            d="M3 12c2.4-5 4.2-5 6.6 0s4.2 5 6.6 0 4.2-5 4.8-3.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3 17c2.4-3 4.2-3 6.6 0s4.2 3 6.6 0 4.2-3 4.8-2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity=".4"
          />
        </>
      )}
    </svg>
  );
}

export function Footer() {
  const { reducedMotion, systemReduced, toggleReducedMotion } = usePreferences();
  const navigate = useSectionNavigate();

  const go = (event, id) => {
    event.preventDefault();
    navigate(id);
  };

  const motionLabel = systemReduced
    ? 'OS motion off'
    : reducedMotion
      ? 'Motion reduced'
      : 'Motion on';

  return (
    <footer className="footer" aria-label="Sargam Academy footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a
            className="brand-link footer-logo"
            href="#top"
            onClick={(event) => go(event, 'top')}
            aria-label="Sargam Academy, back to top"
          >
            <Logo />
          </a>
          <p className="footer-lede">
            A small room, a tanpura, and the note you have been circling for years. Six weeks in
            Chandigarh and online.
          </p>
          <a className="footer-mail" href={`mailto:${SITE.email}`}>
            {SITE.email}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <p className="mono-label">The page</p>
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(event) => go(event, link.id)}>
              {link.label}
            </a>
          ))}
          <a href="#join" onClick={(event) => go(event, 'join')}>
            Register
          </a>
        </nav>

        <div className="footer-practical">
          <p className="mono-label">Practical</p>
          <p>
            Winter cohort
            <br />
            {SITE.cohortLabel}
          </p>
          <p>
            {SITE.location}
            <br />
            ₹8,400 · {SITE.seats} seats
          </p>
          <p className="footer-small">
            Full refund until seven days before the first session. Two scholarship seats held for
            people who need them.
          </p>
        </div>

        <div className="footer-prefs">
          <p className="mono-label">Comfort settings</p>
          <div className="footer-toggle-row">
            <SoundToggle />
          </div>
          <div className="footer-toggle-row">
            <button
              type="button"
              className={`pref-toggle ${reducedMotion ? 'is-on' : ''}`}
              onClick={toggleReducedMotion}
              aria-pressed={reducedMotion}
              disabled={systemReduced}
              title={
                systemReduced
                  ? 'Your operating system asks for reduced motion. This setting follows it.'
                  : 'Turn off cursor springs, pinned scenes and heavy animation.'
              }
            >
              <MotionIcon reduced={reducedMotion} />
              <span>{motionLabel}</span>
            </button>
          </div>
          <p className="footer-small">
            {systemReduced
              ? 'Your system preference is being respected. Motion stays reduced.'
              : 'Motion switches off cursor springs, the pinned curtain and the vinyl spin.'}
          </p>
        </div>
      </div>

      <div className="wrap footer-word-wrap" aria-hidden="true">
        <p className="footer-word">Sargam</p>
      </div>

      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} Sargam Academy · Chandigarh, India</p>
        <p className="footer-privacy">
          No audio files. No analytics. Mic audio is processed in your browser and never leaves it.
        </p>
        <a href="#top" onClick={(event) => go(event, 'top')} className="footer-top-link">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
