import styles from "@/app/[locale]/Site.module.css";

type TruckIllustrationProps = {
  compact?: boolean;
};

export function TruckIllustration({ compact = false }: TruckIllustrationProps) {
  return (
    <div className={compact ? styles.truckCompact : styles.truckScene} aria-label="Червоний тягач з білим рефрижераторним напівпричепом">
      <svg viewBox="0 0 760 390" role="img">
        <defs>
          <linearGradient id="trailerBody" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="cabBody" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ff4646" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <filter id="truckGlow" x="-20%" y="-30%" width="140%" height="170%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0.85 0 0 0 0 0.18 0 0 0 0 0.16 0 0 0 .55 0" />
            <feBlend in="SourceGraphic" mode="screen" />
          </filter>
        </defs>
        <path className={styles.routeTrace} d="M70 285 C190 215 320 218 430 166 C545 112 620 124 706 88" />
        <path className={styles.routeTraceBlue} d="M86 310 C214 276 322 312 448 254 C560 203 625 210 720 176" />
        <g className={styles.gpsDots}>
          <circle cx="118" cy="284" r="7" />
          <circle cx="428" cy="166" r="7" />
          <circle cx="706" cy="88" r="7" />
        </g>
        <g filter="url(#truckGlow)">
          <rect x="244" y="136" width="352" height="126" rx="14" fill="url(#trailerBody)" />
          <rect x="264" y="154" width="184" height="18" rx="9" fill="#e2e8f0" />
          <rect x="264" y="190" width="292" height="10" rx="5" fill="#dbeafe" />
          <rect x="470" y="212" width="78" height="24" rx="8" fill="#eff6ff" />
          <text x="494" y="230" fill="#1e5aa8" fontSize="18" fontWeight="900">-18C</text>
          <path d="M126 257h146V151h-66c-32 0-54 16-66 45l-21 51c-2 5 1 10 7 10Z" fill="url(#cabBody)" />
          <path d="M154 202c9-23 24-34 46-34h22v45h-82l14-11Z" fill="#bfdbfe" opacity=".92" />
          <path d="M124 256h498v22H124z" fill="#1f2937" />
          <circle cx="214" cy="278" r="32" fill="#0f172a" />
          <circle cx="214" cy="278" r="15" fill="#94a3b8" />
          <circle cx="536" cy="278" r="32" fill="#0f172a" />
          <circle cx="536" cy="278" r="15" fill="#94a3b8" />
          <circle cx="604" cy="278" r="26" fill="#0f172a" />
          <circle cx="604" cy="278" r="12" fill="#94a3b8" />
          <path d="M124 244h82" stroke="#ffd34d" strokeLinecap="round" strokeWidth="8" />
          <path d="M596 186h18v52h-18z" fill="#dbeafe" />
        </g>
      </svg>
      {!compact && (
        <>
          <div className={`${styles.floatBadge} ${styles.badgeEta}`}>
            <span>ETA</span>
            <strong>18:40</strong>
          </div>
          <div className={`${styles.floatBadge} ${styles.badgeTemp}`}>
            <span>Температура</span>
            <strong>-18 °C стабільно</strong>
          </div>
          <div className={`${styles.floatBadge} ${styles.badgeLive}`}>
            <span>Онлайн-відстеження</span>
            <strong>Активний маршрут</strong>
          </div>
        </>
      )}
    </div>
  );
}
