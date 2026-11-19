import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { SoundToggle } from './SoundToggle';
import { Magnetic } from './Magnetic';
import { NAV_LINKS, SITE } from '../lib/site';
import { useSectionNavigate } from '../hooks/useSectionNavigate';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const menuButtonRef = useRef(null);
  const navigate = useSectionNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['hero', ...NAV_LINKS.map((link) => link.id)];
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target.id === 'hero' ? null : visible.target.id);
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const mql = window.matchMedia('(min-width: 900px)');
    const onChange = () => {
      if (mql.matches) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    mql.addEventListener('change', onChange);
    const first = document.querySelector('#mobile-menu a');
    first?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      mql.removeEventListener('change', onChange);
    };
  }, [open]);

  const go = (event, id) => {
    event.preventDefault();
    setOpen(false);
    navigate(id);
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner">
        <a
          className="brand-link"
          href="#top"
          onClick={(event) => go(event, 'top')}
          aria-label="Amar Music Academy, back to top"
        >
          <Logo />
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => go(event, link.id)}
              aria-current={active === link.id ? 'true' : undefined}
              className={active === link.id ? 'is-active' : ''}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <SoundToggle />
          <Magnetic
            className="btn btn-small btn-gold nav-register"
            href={SITE.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="strong"
          >
            Register
            <span aria-hidden="true" className="arrow">
              ↗
            </span>
          </Magnetic>
          <button
            type="button"
            className={`menu-toggle ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            ref={menuButtonRef}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(event) => go(event, link.id)}>
              <span>{link.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          <a
            href={SITE.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span>Book a demo</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p className="mobile-menu-note">Ludhiana · Online · Free demo</p>
      </div>
    </header>
  );
}
