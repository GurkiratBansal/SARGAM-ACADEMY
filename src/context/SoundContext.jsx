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
  // Sound is on by default (UI). The AudioContext is only actually started
  // after the first user interaction, per browser autoplay policy.
  const [enabled, setEnabled] = useState(true);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(0);
  const autoEnabledRef = useRef(false);

  const clearNotice = useCallback(() => setNotice(''), []);

  const tryAutoEnable = useCallback(() => {
    if (autoEnabledRef.current || audioEngine.enabled) return;
    autoEnabledRef.current = true;
    const ok = audioEngine.setEnabled(true);
    setEnabled(ok);
    if (ok) {
      setNotice('Sound on. Every tone is synthesised live in your browser.');
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(''), 5200);
    } else {
      setEnabled(false);
    }
  }, []);

  const toggle = useCallback(() => {
    autoEnabledRef.current = true; // prevent auto-enable race
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
    autoEnabledRef.current = true;
    if (audioEngine.enabled) {
      setEnabled(true);
      return true;
    }
    const ok = audioEngine.setEnabled(true);
    if (ok) {
      setEnabled(true);
      setNotice('Sound on. Every tone is synthesised live in your browser.');
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(''), 5200);
    }
    return ok;
  }, []);

  // Enable audio on the first user interaction (browser autoplay policy).
  useEffect(() => {
    if (audioEngine.enabled) return undefined;
    const handler = () => tryAutoEnable();
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [tryAutoEnable]);

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