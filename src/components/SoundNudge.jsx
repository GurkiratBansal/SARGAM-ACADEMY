import { useSound } from '../context/SoundContext';

export function SoundNudge({ label = 'Sound is off. Turn it on to hear this section.', className = '' }) {
  const { enabled, enable } = useSound();
  if (enabled) return null;

  return (
    <button type="button" className={`sound-nudge ${className}`.trim()} onClick={enable}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
      <strong>Enable sound</strong>
    </button>
  );
}
