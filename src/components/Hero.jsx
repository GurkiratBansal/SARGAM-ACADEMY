import { useRef } from 'react';
import { HeroVisual } from './HeroVisual';
import { PluckText } from './PluckText';
import { Magnetic } from './Magnetic';
import { HERO_LINES, SITE } from '../lib/site';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useSectionNavigate } from '../hooks/useSectionNavigate';

const STATUS_COPY = {
  idle: 'Mic off · simulated instrument',
  requesting: 'Waiting for permission…',
  live: 'Listening · processed locally',
  denied: 'Mic declined · instrument idling',
  unsupported: 'Mic unavailable · instrument idling',
  error: 'Mic error · instrument idling',
};

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mic-icon">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Hero() {
  const audioRef = useRef({ live: false, level: 0, pitch: 0.12, freq: 0, note: null });
  const { status, note, level, message, start, stop, isLive, isRequesting } = useVoiceInput(audioRef);
  const navigate = useSectionNavigate();

  const go = (event, id) => {
    event.preventDefault();
    navigate(id);
  };

  const cents = note?.cents ?? 0;
  const tuning =
    Math.abs(cents) <= 12 ? 'in tune' : cents > 0 ? `${Math.abs(cents)} cents sharp` : `${Math.abs(cents)} cents flat`;

  return (
    <section className="hero" id="hero" data-mood="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Six-week live cohort · 18 seats
          </p>

          <PluckText
            as="h1"
            id="hero-title"
            className="hero-title"
            lines={HERO_LINES}
            revealOn
            radius={160}
            strength={1.15}
          />

          <p className="hero-lede">
            Sur, taal and stagecraft for beginners who were told they were “tone deaf” — and for
            singers who still freeze at the microphone. Two live sessions a week, six weeks, one
            small room.
          </p>

          <div className="hero-actions">
            <Magnetic
              className="btn btn-gold btn-large"
              href="#join"
              onClick={(event) => go(event, 'join')}
              data-cursor="strong"
            >
              Take a seat
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </Magnetic>
            <a className="text-link" href="#guitar" onClick={(event) => go(event, 'guitar')}>
              Or pluck a string first
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="hero-meta">
            {SITE.cohortShort} · ₹8,400 · {SITE.location} · two scholarship seats
          </p>

          <div className={`voice-panel ${isLive ? 'is-live' : ''}`}>
            <div className="voice-panel-head">
              <div>
                <p className="voice-status">
                  <span className={`status-dot ${isLive ? 'is-live' : ''}`} aria-hidden="true" />
                  {STATUS_COPY[status]}
                </p>
                <p className="voice-privacy">
                  Optional. The mic is processed in your browser with Web Audio — never recorded,
                  stored or uploaded.
                </p>
              </div>
              {isLive ? (
                <button type="button" className="btn btn-ghost btn-small voice-button" onClick={stop}>
                  Stop mic
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-small voice-button"
                  onClick={start}
                  disabled={isRequesting || status === 'unsupported'}
                >
                  <MicIcon />
                  {isRequesting ? 'Asking…' : status === 'denied' ? 'Try again' : 'Sing a note'}
                </button>
              )}
            </div>
            {isLive && (
              <div className="voice-meter" aria-hidden="true">
                <span style={{ transform: `scaleX(${Math.min(1, level / 10)})` }} />
              </div>
            )}
            {message && (
              <p className="voice-message" role="status">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="hero-stage">
          <HeroVisual audioRef={audioRef} />

          <div className={`orb-readout ${isLive ? 'is-live' : ''}`}>
            <p className="orb-kicker">{isLive ? 'Your nearest note' : 'The home note'}</p>
            <p className="orb-note" aria-hidden="true">
              {note?.name ?? 'Sa'}
              <span className="orb-octave">{note?.octave ?? 4}</span>
            </p>
            <p className="orb-sub" aria-hidden="true">
              {isLive ? (note ? tuning : 'sing, hold, listen') : 'press “Sing a note”'}
            </p>
            <span className="sr-only" aria-live="polite">
              {isLive && note ? `Nearest sargam note: ${note.name}, ${tuning}.` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="wrap hero-stats" aria-label="Cohort facts">
        <div>
          <span className="stat-value">18</span>
          <span className="stat-label">seats, no more</span>
        </div>
        <div>
          <span className="stat-value">6</span>
          <span className="stat-label">weeks, live</span>
        </div>
        <div>
          <span className="stat-value">16</span>
          <span className="stat-label">beats you will own</span>
        </div>
        <div>
          <span className="stat-value">0</span>
          <span className="stat-label">audio files on this page</span>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-line" />
        <span>scroll to tune</span>
      </div>
    </section>
  );
}
