export const NAV_OFFSET = -76;

export function getLenis() {
  return typeof window !== 'undefined' ? window.__amarLenis : null;
}

export function sectionTop(el) {
  if (!el) return 0;
  return el.getBoundingClientRect().top + window.scrollY;
}

export function scrollToSection(id, { immediate = false } = {}) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, {
      offset: NAV_OFFSET,
      immediate,
      duration: immediate ? 0 : 1.15,
      lock: false,
    });
  } else {
    window.scrollTo({
      top: Math.max(0, sectionTop(el) + NAV_OFFSET),
      behavior: immediate ? 'auto' : 'smooth',
    });
  }
}

export function focusSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}
