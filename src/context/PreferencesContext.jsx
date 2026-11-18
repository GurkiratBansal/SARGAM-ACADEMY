import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PreferencesContext = createContext(null);

function detectDevice() {
  if (typeof window === 'undefined') {
    return {
      cores: 8,
      memory: 8,
      saveData: false,
      reducedData: false,
      touch: false,
      small: false,
      lowPower: false,
      veryLow: false,
    };
  }

  const nav = navigator;
  const cores = nav.hardwareConcurrency || 8;
  const memory = nav.deviceMemory || 8;
  const saveData = Boolean(nav.connection?.saveData);
  const reducedData =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-data: reduce)').matches;
  const touch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const small = window.innerWidth < 720;
  const veryLow = cores <= 2 || memory <= 2;
  const lowPower = saveData || reducedData || cores <= 2 || memory <= 4;

  return { cores, memory, saveData, reducedData, touch, small, lowPower, veryLow };
}

function readMotionPreference() {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem('sargam-motion') === 'reduced') return true;
  } catch {
    /* storage can be blocked */
  }
  return false;
}

export function PreferencesProvider({ children }) {
  const [systemReduced, setSystemReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });
  const [userReduced, setUserReduced] = useState(readMotionPreference);
  const [device, setDevice] = useState(detectDevice);

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mql) return undefined;
    const onChange = (event) => setSystemReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setDevice(detectDevice()));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const reducedMotion = systemReduced || userReduced;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.dataset.touch = device.touch ? 'true' : 'false';
    return undefined;
  }, [reducedMotion, device.touch]);

  const toggleReducedMotion = useCallback(() => {
    if (systemReduced) return;
    setUserReduced((previous) => {
      const next = !previous;
      try {
        localStorage.setItem('sargam-motion', next ? 'reduced' : 'full');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [systemReduced]);

  const value = useMemo(() => {
    const allowWebgl =
      !reducedMotion && !device.saveData && !device.reducedData && !device.veryLow;
    const quality = reducedMotion ? 'off' : device.lowPower || device.small ? 'low' : 'high';
    return {
      ...device,
      systemReduced,
      userReduced,
      reducedMotion,
      toggleReducedMotion,
      allowWebgl,
      quality,
      allowCursor: !reducedMotion && !device.touch && !device.veryLow && !device.saveData,
      allowPinnedScenes: !reducedMotion && !device.touch && !device.veryLow,
    };
  }, [device, reducedMotion, systemReduced, userReduced, toggleReducedMotion]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
