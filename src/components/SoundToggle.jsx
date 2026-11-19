import { useSound } from '../context/SoundContext';

export function SoundToggle({ className = '' }) {
  const { enabled, started, toggle } = useSound();
  const playing = enabled && started;
  const label = !enabled ? 'Sound off' : started ? 'Sound on' : 'Sound ready';
  const action = !enabled ? 'Turn sound on' : started ? 'Turn sound off' : 'Start sound';

  return (
    <button
      type="button"
      className={`sound-toggle ${playing ? 'is-on' : ''} ${className}`.trim()}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={action}
      title={playing ? 'Sound on — every tone is synthesised' : enabled ? 'Sound ready — tap to start' : 'Sound off'}
    >
      <span className="sound-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {enabled ? (
            <>
              <path d="M15.2 9a4.2 4.2 0 0 1 0 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 6.4a7.6 7.6 0 0 1 0 11.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </span>
      <span className="sound-label">{label}</span>
    </button>
  );
}
