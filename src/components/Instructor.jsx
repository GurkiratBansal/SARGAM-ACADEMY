import { useRef } from 'react';
import { INSTRUCTOR, SITE } from '../lib/site';
import { PluckText } from './PluckText';
import { useSectionNavigate } from '../hooks/useSectionNavigate';

function Tonearm() {
  return (
    <svg className="tonearm" viewBox="0 0 200 240" fill="none" aria-hidden="true">
      <circle cx="154" cy="42" r="22" fill="#1b1618" stroke="#6d5b4b" strokeWidth="1" />
      <circle cx="154" cy="42" r="9" fill="#0b090a" stroke="#c79a5e" strokeWidth="1" />
      <path d="M146 58 88 154" stroke="#a98d6d" strokeWidth="7" strokeLinecap="round" />
      <path d="M148 56 90 152" stroke="#e1c39a" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="m78 162 22-8 6 14-20 8-12-4Z" fill="#2b2422" stroke="#8f765d" strokeWidth="1" />
      <path d="M86 168l-6 12" stroke="#e9b44c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Instructor() {
  const dialogRef = useRef(null);
  const navigate = useSectionNavigate();

  const openReel = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  };

  const closeReel = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  const goJoin = (event) => {
    event.preventDefault();
    closeReel();
    navigate('join');
  };

  return (
    <section
      className="section instructor"
      id="instructor"
      data-mood="magenta"
      aria-labelledby="instructor-title"
      tabIndex={-1}
    >
      <div className="wrap">
        <div className="section-head instructor-head">
          <div>
            <p className="eyebrow">Your instructor · Side A</p>
            <PluckText
              as="h2"
              id="instructor-title"
              className="display-heading"
              lines={[
                { text: 'Still nervous.', italic: false },
                { text: 'That is a good sign.', italic: true },
              ]}
            />
          </div>
          <div className="section-intro">
            <p>
              Meera has spent fourteen years teaching the unglamorous part: the first note, the
              shaky breath, the Wednesday when nothing sounds right. The stage comes later. The
              practice comes first.
            </p>
            <p className="mono-note">Chandigarh · Hindustani vocal · harmonium</p>
          </div>
        </div>

        <div className="instructor-grid">
          <figure className="vinyl-figure">
            <div className="vinyl">
              <div className="vinyl-disc">
                <div className="vinyl-grooves" aria-hidden="true" />
                <div className="vinyl-label">
                  <img
                    src="/media/instructor-portrait.svg"
                    alt="Illustrated portrait of Meera Kaur, eyes closed, in magenta and gold."
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="label-ring" aria-hidden="true" />
                </div>
                <span className="vinyl-hole" aria-hidden="true" />
              </div>
              <Tonearm />
            </div>
            <figcaption className="vinyl-caption">
              <span className="mono-label">Side A · 33⅓ rpm</span>
              <span>Hover the record. It leans into the needle.</span>
            </figcaption>
          </figure>

          <div className="instructor-copy">
            <div className="instructor-name">
              <p className="instructor-role">{INSTRUCTOR.role}</p>
              <p className="instructor-fullname">{INSTRUCTOR.name}</p>
            </div>

            <blockquote className="instructor-quote">
              <span className="quote-mark" aria-hidden="true">
                “
              </span>
              {INSTRUCTOR.quote}
            </blockquote>

            <p className="instructor-bio">{INSTRUCTOR.bio}</p>

            <dl className="instructor-stats">
              {INSTRUCTOR.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              className="reel-card"
              onClick={openReel}
              aria-haspopup="dialog"
              aria-label="Open the intro reel, Inside a Sunday class"
            >
              <span className="reel-still">
                <img
                  src="/media/reel-poster.svg"
                  alt=""
                  width="1200"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="reel-play" aria-hidden="true">
                <span className="reel-scratch" />
                <span className="play-disc">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                  </svg>
                </span>
                <span className="reel-play-caption">
                  <span>Inside a Sunday class</span>
                  <em>01:12</em>
                </span>
              </span>
              <span className="reel-label">
                <span className="mono-label">Play the reel</span>
                <span className="reel-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
            </button>

            <p className="instructor-cta-line">
              Six weeks from now, you could be the person who sings at the baithak.
              <a
                href="#join"
                onClick={goJoin}
                className="text-link"
              >
                Take the seat <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>
      </div>

      <dialog
        className="reel-dialog"
        ref={dialogRef}
        aria-labelledby="reel-dialog-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeReel();
        }}
      >
        <div className="reel-dialog-inner">
          <button
            type="button"
            className="dialog-close"
            onClick={closeReel}
            aria-label="Close the intro reel"
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="reel-dialog-media">
            {SITE.reelSrc ? (
              <video controls poster="/media/reel-poster.svg" preload="none">
                <source src={SITE.reelSrc} />
              </video>
            ) : (
              <>
                <img
                  src="/media/reel-poster.svg"
                  alt="Warmly lit music room with a harmonium and two musicians."
                  width="1200"
                  height="675"
                />
                <div className="reel-dialog-note">
                  <span className="play-disc" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                    </svg>
                  </span>
                  <p>The reel is still in the edit.</p>
                </div>
              </>
            )}
          </div>

          <div className="reel-dialog-copy">
            <p className="eyebrow">Inside the riyaz room · 01:12</p>
            <h3 id="reel-dialog-title">A Sunday class, unedited.</h3>
            <p>
              No polished stage, no perfect take. A room, a tanpura, a harmonium and six people
              learning where their Sa actually lives. The full reel opens with a note from Meera.
            </p>
            <p className="mono-note">
              {SITE.reelSrc
                ? 'Sound on for the room tone.'
                : 'The film is being colour-graded. Ask for it when you write to us.'}
            </p>
            <div className="reel-dialog-actions">
              <a href="#join" onClick={goJoin} className="btn btn-gold btn-small">
                Join the winter cohort
              </a>
              <a className="text-link" href={`mailto:${SITE.email}?subject=Intro%20reel`}>
                Request the reel <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
