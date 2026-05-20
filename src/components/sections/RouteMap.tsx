import styles from "@/app/[locale]/Site.module.css";

export function RouteMap() {
  return (
    <div className={styles.map} aria-label="Стилізована карта маршрутів AR-TRANS">
      <svg viewBox="0 0 680 360" role="img">
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#1e5aa8" stopOpacity=".38" />
            <stop offset="100%" stopColor="#0b111a" stopOpacity=".1" />
          </radialGradient>
        </defs>
        <rect fill="#0b111a" height="360" rx="24" width="680" />
        <rect fill="url(#mapGlow)" height="360" rx="24" width="680" />
        <path
          d="M126 106c55-38 120-51 202-34 82 18 132 5 194-28 38-20 78-21 112-8v278H58V170c20-20 42-41 68-64Z"
          fill="#172033"
          opacity=".72"
        />
        <path
          d="M83 260c48-36 118-42 188-28 67 14 119 7 179-33 61-40 117-49 174-25"
          fill="none"
          stroke="#334155"
          strokeLinecap="round"
          strokeWidth="48"
          opacity=".28"
        />
        <path
          d="M110 190 C210 130 320 120 410 150 C500 180 540 120 600 92"
          fill="none"
          stroke="#ffd34d"
          strokeDasharray="8 10"
          strokeLinecap="round"
          strokeWidth="5"
          className={styles.mapRoute}
        />
        <path
          d="M112 192 C210 225 325 230 430 205 C520 184 560 220 618 246"
          fill="none"
          stroke="#3b82f6"
          strokeDasharray="8 10"
          strokeLinecap="round"
          strokeWidth="4"
          className={styles.mapRouteAlt}
        />
        {[
          ["Центр України", 112, 192],
          ["Захід України", 245, 142],
          ["Італія", 410, 150],
          ["Іспанія", 618, 246],
          ["Франція", 520, 185],
          ["Австрія / Чехія / Угорщина", 600, 92],
          ["Молдова", 430, 205],
        ].map(([label, x, y]) => (
          <g key={label as string}>
            <circle cx={x as number} cy={y as number} fill="#ffd34d" r="16" opacity=".16" />
            <circle cx={x as number} cy={y as number} fill="#ffd34d" r="7" />
            <text fill="#f8fafc" fontSize="15" fontWeight="800" x={(x as number) + 12} y={(y as number) - 12}>
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
