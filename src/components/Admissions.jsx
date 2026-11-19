import { SITE } from '../lib/site';

const CARDS = [
  {
    label: 'Demo class',
    value: 'Free',
    copy: '15–30 minutes, online or in person. No audition, no instrument needed.',
  },
  {
    label: 'Group classes',
    value: `₹${SITE.fees.group[0].toLocaleString('en-IN')}+`,
    copy: `Per month, by level: ${SITE.fees.group
      .map((fee) => `₹${fee.toLocaleString('en-IN')}`)
      .join(' / ')}.`,
  },
  {
    label: 'Class rhythm',
    value: '2 / week',
    copy: `About ${SITE.fees.classesPerMonth} classes a month.`,
  },
  {
    label: 'Levels',
    value: 'Beginner → Advanced',
    copy: 'Vocal, guitar, harmonium, tabla, Gurbani and folk.',
  },
];

export function Admissions() {
  return (
    <section className="countdown-section" data-mood="warm" aria-labelledby="admissions-title">
      <div className="wrap">
        <div className="countdown-head">
          <div>
            <p className="eyebrow">Admissions · Free demo</p>
            <h2 id="admissions-title" className="countdown-title">
              Start with a free demo. Stay for the practice.
            </h2>
          </div>
          <p className="countdown-date">
            <span className="mono-label">Monthly classes</span>
            Group fees from ₹{SITE.fees.group[0].toLocaleString('en-IN')}/month
            <span className="countdown-seats">Ishar Nagar, Ludhiana · Online</span>
          </p>
        </div>

        <div className="admission-grid">
          {CARDS.map((card) => (
            <div className="admission-card" key={card.label}>
              <p className="admission-label">{card.label}</p>
              <p className="admission-value">{card.value}</p>
              <p className="admission-copy">{card.copy}</p>
            </div>
          ))}
        </div>

        <div className="countdown-foot">
          <p className="countdown-note">
            Demo classes are free. Course fees are indicative and confirmed before enrolment.
          </p>
          <a
            className="text-link"
            href={SITE.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a free demo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
