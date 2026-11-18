import { useEffect, useRef, useState } from 'react';
import { PluckText } from './PluckText';
import { SITE } from '../lib/site';
import { usePreferences } from '../context/PreferencesContext';
import { useSound } from '../context/SoundContext';

function MicGlyph() {
  return (
    <svg viewBox="0 0 32 44" fill="none" aria-hidden="true" className="join-mic">
      <rect x="11" y="3" width="10" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19a10.5 10.5 0 0 0 21 0M16 29.5V38M11 41h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12.5 9h7M12.5 13h7M12.5 17h7" stroke="currentColor" strokeWidth="1" opacity=".55" />
    </svg>
  );
}

const GOALS = [
  'Singing in tune',
  'Stage fear',
  'Harmonium accompaniment',
  'Keeping taal',
  'All of it',
];

const EXPERIENCE = ['First time', 'A little', 'Returning after years'];

export function Join() {
  const { reducedMotion } = usePreferences();
  const { uiClick } = useSound();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const circleRef = useRef(null);
  const formPanelRef = useRef(null);
  const nameRef = useRef(null);
  const successRef = useRef(null);
  const localSavedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (status === 'success') successRef.current?.focus({ preventScroll: true });
        else nameRef.current?.focus({ preventScroll: true });
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, status]);

  const openForm = () => {
    setStatus('idle');
    setError('');
    setOpen(true);
    uiClick();
  };

  const closeForm = () => {
    setOpen(false);
    setError('');
    setStatus('idle');
    window.requestAnimationFrame(() => circleRef.current?.focus({ preventScroll: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    if (formData.get('company')) return;

    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      goal: String(formData.get('goal') || ''),
      experience: String(formData.get('experience') || ''),
      cohort: SITE.cohortLabel,
    };

    setStatus('submitting');
    setError('');

    try {
      if (SITE.formEndpoint) {
        const response = await fetch(SITE.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Request failed');
        localSavedRef.current = false;
      } else {
        localStorage.setItem(
          'sargam-seat-request',
          JSON.stringify({ ...payload, savedAt: new Date().toISOString() }),
        );
        localSavedRef.current = true;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setError(
        `That didn’t send. Try again, or write to ${SITE.email} and we’ll hold the seat by hand.`,
      );
    }
  };

  return (
    <section
      className="section join-section"
      id="join"
      data-mood="finale"
      aria-labelledby="join-title"
      tabIndex={-1}
    >
      <div className="wrap join-grid">
        <div className="join-copy">
          <p className="eyebrow">Final call · Winter cohort</p>
          <PluckText
            as="h2"
            id="join-title"
            className="display-heading join-heading"
            lines={[
              { text: 'The next note', italic: false },
              { text: 'is yours.', italic: true },
            ]}
          />
          <p className="join-lede">
            Eighteen seats. Six weeks. One small room in Chandigarh, and a livestream for everyone
            who is not in it. You do not need a good voice to begin. You need a Tuesday.
          </p>

          <dl className="join-meta">
            <div>
              <dt>Begins</dt>
              <dd>{SITE.cohortLabel}</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>
                {SITE.seats} · two scholarship seats
              </dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>₹8,400 · full refund until 7 days before</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{SITE.location}</dd>
            </div>
          </dl>

          <p className="join-privacy">
            No audition, no instrument on day one, and no recording of your voice. The mic on this
            page is a toy; the room is the real thing.
          </p>
        </div>

        <div className={`join-morph ${open ? 'is-open' : ''}`}>
          <button
            type="button"
            className="join-circle"
            ref={circleRef}
            onClick={openForm}
            aria-expanded={open}
            aria-controls="join-form-panel"
            inert={open}
          >
            <span className="join-ripples" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="join-grille" aria-hidden="true" />
            <span className="join-circle-inner">
              <MicGlyph />
              <span className="join-circle-kicker">Doors are open</span>
              <span className="join-circle-title">Tap to join</span>
              <span className="join-circle-sub">18 seats · 6 weeks · one baithak</span>
            </span>
            <span className="join-circle-note" aria-hidden="true">
              no audition
            </span>
          </button>

          {open && (
            <div
              className={`join-form-wrap ${reducedMotion ? 'is-reduced' : ''}`}
              id="join-form-panel"
              ref={formPanelRef}
            >
              <button
                type="button"
                className="join-close"
                onClick={closeForm}
                aria-label="Close the registration form"
              >
                <span aria-hidden="true">×</span>
              </button>

              {status === 'success' ? (
                <div
                  className="join-success"
                  ref={successRef}
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                >
                  <span className="success-note">Sa</span>
                  <p className="eyebrow">Seat request received</p>
                  <h3>You’re in the room.</h3>
                  <p>
                    {localSavedRef.current
                      ? 'This is a demo build, so your request was saved in this browser only. No server received it. Before launch, connect a form endpoint in src/lib/site.js.'
                      : 'We’ll write to the address you left with the cohort guide and the payment link.'}
                  </p>
                  <p className="join-success-soft">
                    Now go pluck a string. You already know more than you did a minute ago.
                  </p>
                  <div className="join-success-actions">
                    <button type="button" className="btn btn-ink btn-small" onClick={closeForm}>
                      Back to the page
                    </button>
                    <a className="text-link" href={`mailto:${SITE.email}`}>
                      {SITE.email}
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="join-form-head">
                    <p className="eyebrow">Winter cohort · {SITE.cohortShort}</p>
                    <h3>Put your name in the room.</h3>
                    <p>
                      Leave two details. We’ll hold a seat and send the first-week listening list —
                      no drip campaign, no sales calls.
                    </p>
                  </div>

                  <form
                    className="join-form"
                    onSubmit={handleSubmit}
                    noValidate={false}
                    aria-describedby="join-form-note"
                  >
                    <div className="form-row">
                      <label htmlFor="join-name">
                        <span className="field-label">
                          Your name <i aria-hidden="true">*</i>
                        </span>
                        <input
                          id="join-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          minLength="2"
                          ref={nameRef}
                          placeholder="Your full name"
                        />
                      </label>
                      <label htmlFor="join-email">
                        <span className="field-label">
                          Email <i aria-hidden="true">*</i>
                        </span>
                        <input
                          id="join-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="you@example.com"
                        />
                      </label>
                    </div>

                    <div className="form-row">
                      <label htmlFor="join-goal">
                        What do you want to work on?
                        <select id="join-goal" name="goal" defaultValue={GOALS[0]}>
                          {GOALS.map((goal) => (
                            <option key={goal} value={goal}>
                              {goal}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label htmlFor="join-experience">
                        Have you sung before?
                        <select id="join-experience" name="experience" defaultValue={EXPERIENCE[0]}>
                          {EXPERIENCE.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="form-honeypot" aria-hidden="true">
                      <label htmlFor="join-company">Company</label>
                      <input
                        id="join-company"
                        name="company"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div className="join-form-foot">
                      <button
                        type="submit"
                        className="btn btn-ink btn-large"
                        disabled={status === 'submitting'}
                      >
                        {status === 'submitting' ? 'Sending…' : 'Reserve my seat'}
                        <span aria-hidden="true">↗</span>
                      </button>
                      <p id="join-form-note" className="join-form-note">
                        {SITE.formEndpoint
                          ? 'No spam. No voice recording. By submitting, you agree to be contacted about this cohort only.'
                          : 'Demo build: your request is saved on this device only. Connect a form endpoint in src/lib/site.js before launch.'}
                      </p>
                    </div>

                    {error && (
                      <p className="form-error" role="alert">
                        {error}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="join-marquee" aria-hidden="true">
        <span>
          Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa&nbsp;&nbsp;&nbsp; Find the note only you can
          sing.&nbsp;&nbsp;&nbsp; Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa&nbsp;&nbsp;&nbsp; Find the
          note only you can sing.
        </span>
      </div>
    </section>
  );
}
