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
  const [started, setStarted] = useState(false);
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
      setStarted(true);
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
      setStarted(false);
      setNotice('Audio is unavailable in this browser. Everything else still works.');
      return false;
    }
    setEnabled(next);
    setStarted(next);
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
      setStarted(true);
      return true;
    }
    const ok = audioEngine.setEnabled(true);
    if (ok) {
      setEnabled(true);
      setStarted(true);
      setNotice('Sound on. Every tone is synthesised live in your browser.');
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(''), 5200);
    }
    return ok;
  }, []);

  // Enable audio on the first user interaction (browser autoplay policy).
  // Capture phase so the very first pluck already has sound.
  useEffect(() => {
    if (audioEngine.enabled) return undefined;
    const handler = (event) => {
      // The sound toggle handles its own state; letting the global auto-enable
      // run first would make its click immediately toggle the new sound back off.
      if (event.target instanceof Element && event.target.closest('.sound-toggle')) return;
      tryAutoEnable();
    };
    document.addEventListener('pointerdown', handler, { capture: true });
    document.addEventListener('keydown', handler, { capture: true });
    document.addEventListener('touchstart', handler, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', handler, { capture: true });
      document.removeEventListener('keydown', handler, { capture: true });
      document.removeEventListener('touchstart', handler, { capture: true });
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
      started,
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
    [enabled, started, toggle, enable, playSargam, pluck, harmonium, tabla, whoosh, uiClick, notice, clearNotice],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used inside SoundProvider');
  return ctx;
}