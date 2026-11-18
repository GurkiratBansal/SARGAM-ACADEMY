import { useSound } from '../context/SoundContext';

export function SoundToast() {
  const { notice, clearNotice } = useSound();

  if (!notice) return null;

  return (
    <div className="sound-toast" role="status" aria-live="polite">
      <span className="sound-toast-icon" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <p>{notice}</p>
      <button type="button" className="sound-toast-close" onClick={clearNotice} aria-label="Dismiss">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
