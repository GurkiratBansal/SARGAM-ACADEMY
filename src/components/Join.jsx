import { PluckText } from './PluckText';
import { SITE } from '../lib/site';
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

export function Join() {
  const { uiClick } = useSound();
  const groupFee = `₹${SITE.fees.group[0].toLocaleString('en-IN')}`;

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
          <p className="eyebrow">Admissions · Free demo</p>
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
            Group classes from {groupFee} a month. Two classes a week, online or in Ludhiana. Start
            with a free 15–30 minute demo — no audition, no instrument needed on day one.
          </p>

          <dl className="join-meta">
            <div>
              <dt>Demo</dt>
              <dd>Free · {SITE.demo.duration}</dd>
            </div>
            <div>
              <dt>Classes</dt>
              <dd>
                {SITE.fees.classesPerWeek} a week · about {SITE.fees.classesPerMonth} a month
              </dd>
            </div>
            <div>
              <dt>Fees</dt>
              <dd>From {groupFee}/month · individual on enquiry</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{SITE.location}</dd>
            </div>
          </dl>

          <p className="join-privacy">
            No audition, no instrument needed on day one, and no recording of your voice. The
            registration form opens in a new tab.
          </p>
          <p className="join-privacy">
            Prefer to talk?{' '}
            <a className="text-link" href={`tel:${SITE.phoneHref}`}>
              {SITE.phone}
            </a>
          </p>
        </div>

        <div className="join-morph">
          <a
            className="join-circle"
            href={SITE.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={uiClick}
            aria-label="Open the Amar Music Academy registration form in a new tab"
          >
            <span className="join-ripples" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="join-grille" aria-hidden="true" />
            <span className="join-circle-inner">
              <MicGlyph />
              <span className="join-circle-kicker">Free demo · admissions open</span>
              <span className="join-circle-title">Book a demo</span>
              <span className="join-circle-sub">15–30 min · no audition</span>
            </span>
            <span className="join-circle-note" aria-hidden="true">
              opens the form ↗
            </span>
          </a>
        </div>
      </div>

      <div className="join-marquee" aria-hidden="true">
        <span>
          Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa&nbsp;&nbsp;&nbsp; We create
          performers.&nbsp;&nbsp;&nbsp; Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa&nbsp;&nbsp;&nbsp; We
          create performers.
        </span>
      </div>
    </section>
  );
}
