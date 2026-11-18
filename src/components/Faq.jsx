import { FAQS, SITE } from '../lib/site';
import { PluckText } from './PluckText';

export function Faq() {
  return (
    <section
      className="section faq-section"
      id="faq"
      data-mood="blue"
      aria-labelledby="faq-title"
      tabIndex={-1}
    >
      <div className="wrap faq-grid">
        <div className="faq-intro">
          <p className="eyebrow">Before you ask</p>
          <PluckText
            as="h2"
            id="faq-title"
            className="display-heading"
            lines={[
              { text: 'The questions', italic: false },
              { text: 'everyone asks', italic: true },
              { text: 'quietly.', italic: false },
            ]}
          />
          <p>
            If yours is not here, write to us. A real person answers — usually between riyaz and
            the school run.
          </p>
          <a href={`mailto:${SITE.email}`} className="text-link">
            {SITE.email} <span aria-hidden="true">↗</span>
          </a>
          <div className="faq-aside">
            <span className="mono-label">The short version</span>
            <p>
              No audition. No instrument needed on day one. No recording of your voice. Six weeks,
              {` ${SITE.seats} `}people, one small stage at the end.
            </p>
          </div>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, index) => (
            <details key={faq.q} name="sargam-faq" open={index === 0}>
              <summary>
                <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-question">{faq.q}</span>
                <span className="faq-plus" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </summary>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
          <div className="faq-end">
            <p>
              Still deciding? Come to the free listening session on the first Sunday of the month.
              No slides, no sales pitch — just a room and a note.
            </p>
            <a href="#join" className="btn btn-gold btn-small">
              Reserve a seat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
