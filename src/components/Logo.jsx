export function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 34 34" fill="none">
          <path
            d="M4 20c3.2 0 3.8-9 7-9s3.8 13 7 13 3.8-16 7-16 3.8 8 5 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M4 27h26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".4" />
        </svg>
      </span>
      <span className="logo-word">
        <span className="logo-name">Amar Music</span>
        <span className="logo-sub">academy</span>
      </span>
    </span>
  );
}
