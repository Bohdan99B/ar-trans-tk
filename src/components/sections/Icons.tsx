type IconProps = {
  label: string;
};

export function SectionIcon({ label }: IconProps) {
  return (
    <svg aria-hidden="true" focusable="false" height="24" viewBox="0 0 24 24" width="24">
      {label === "GPS" ? (
        <>
          <path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="10" fill="currentColor" r="2.2" />
        </>
      ) : label === "CMR" ? (
        <>
          <path d="M7 3h8l3 3v15H7V3Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M14 3v5h5M10 12h6M10 16h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      ) : label === "TEMP" || label === "LIVE" ? (
        <>
          <path d="M10 14.2V5a3 3 0 0 1 6 0v9.2a5 5 0 1 1-6 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M13 7v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <circle cx="13" cy="18" fill="currentColor" r="2" />
        </>
      ) : (
        <>
          <path d="M4 15h11l3-5h2v5h-2.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M4 15V7h10v8M7 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}
