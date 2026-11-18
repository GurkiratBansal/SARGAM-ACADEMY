import { useCallback } from 'react';
import { useWaveTransition } from '../context/WaveTransitionContext';
import { focusSection, getLenis, scrollToSection } from '../lib/scroll';

export function useSectionNavigate() {
  const { transition } = useWaveTransition();

  return useCallback(
    (id, { focus = true, updateHash = true } = {}) => {
      transition(() => {
        if (id === 'top') {
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(0, { immediate: true });
          else window.scrollTo({ top: 0, behavior: 'auto' });
          if (focus) {
            const main = document.getElementById('main');
            if (main) {
              main.setAttribute('tabindex', '-1');
              main.focus({ preventScroll: true });
            }
          }
          if (updateHash) history.replaceState(null, '', window.location.pathname + window.location.search);
          return;
        }

        scrollToSection(id, { immediate: true });
        if (focus) focusSection(id);
        if (updateHash) history.replaceState(null, '', `#${id}`);
      });
    },
    [transition],
  );
}
