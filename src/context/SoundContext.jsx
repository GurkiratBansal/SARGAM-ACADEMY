import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { audioEngine } from '../lib/audio';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(0);

  const clearNotice = useCallback(() => setNotice(''), []);

  const toggle = useCallback(() => {
    const next = !audioEngine.enabled;
    const ok = audioEngine.setEnabled(next);
    if (!ok && next) {
      setEnabled(false);
      setNotice('Audio is unavailable in this browser. Everything else still works.');
      return false;
    }
    setEnabled(next);
    window.clearTimeout(noticeTimer.current);
    if (next) {
      setNotice('Sound on. Every tone is synthesised live in your browser.');
      noticeTimer.current = window.setTimeout(() => setNotice(''), 5200);
    } else {
      setNotice('');
    }
    return next;
  }, []);

  const enable = useCallback(() => {
    if (audioEngine.enabled) return true;
    const ok = audioEngine.setEnabled(true);
    if (ok) {
      setEnabled(true);
      setNotice('Sound on. Every tone is synthesised live in your browser.');
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(''), 5200);
    }
    return ok;
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const playSargam = useCallback((index) => audioEngine.sargam(index), []);
  const pluck = useCallback((index) => audioEngine.pluck(index), []);
  const harmonium = useCallback((index, strength) => audioEngine.harmonium(index, strength), []);
  const tabla = useCallback((bol, options) => audioEngine.tabla(bol, options), []);
  const whoosh = useCallback(() => audioEngine.whoosh(), []);
  const uiClick = useCallback(() => audioEngine.uiClick(), []);

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      enable,
      playSargam,
      pluck,
      harmonium,
      tabla,
      whoosh,
      uiClick,
      notice,
      clearNotice,
    }),
    [enabled, toggle, enable, playSargam, pluck, harmonium, tabla, whoosh, uiClick, notice, clearNotice],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used inside SoundProvider');
  return ctx;
}
