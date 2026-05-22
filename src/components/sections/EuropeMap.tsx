import styles from "@/app/[locale]/Site.module.css";

const countries = [
  { code: "UA", name: "Україна", x: 455, y: 215, w: 100, h: 48 },
  { code: "IT", name: "Італія", x: 315, y: 250, w: 72, h: 78, featured: true },
  { code: "DE", name: "Німеччина", x: 315, y: 160, w: 72, h: 54 },
  { code: "FR", name: "Франція", x: 245, y: 205, w: 78, h: 62 },
  { code: "ES", name: "Іспанія", x: 160, y: 270, w: 88, h: 58 },
  { code: "BE", name: "Бельгія", x: 286, y: 178, w: 30, h: 24 },
  { code: "NL", name: "Нідерланди", x: 292, y: 142, w: 34, h: 28 },
  { code: "CZ", name: "Чехія", x: 365, y: 180, w: 52, h: 30 },
  { code: "AT", name: "Австрія", x: 360, y: 218, w: 60, h: 30 },
];

export function EuropeMap() {
  return (
    <div className={styles.europeMap} aria-label="Інтерактивна карта напрямків перевезень у Європі">
      <svg role="img" viewBox="0 0 680 420">
        <defs>
          <linearGradient id="countryFill" x1="0" x2="1">
            <stop offset="0%" stopColor="#1f2a3d" />
            <stop offset="100%" stopColor="#243b5f" />
          </linearGradient>
          <filter id="routeGlow">
            <feGaussianBlur result="blur" stdDeviation="3" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect fill="#07101c" height="420" rx="24" width="680" />
        <path d="M94 308c78-110 145-173 262-204 103-27 180 6 252 72v194H94Z" fill="#101a2a" />
        {countries.map((country) => (
          <g className={country.featured ? styles.countryFeatured : styles.country} key={country.code} tabIndex={0}>
            <rect height={country.h} rx="12" width={country.w} x={country.x} y={country.y} />
            <text x={country.x + country.w / 2} y={country.y + country.h / 2 + 5}>
              {country.code}
            </text>
            <title>{country.name}</title>
          </g>
        ))}
        {[
          "M493 238 C430 245 375 246 350 285",
          "M493 238 C420 210 365 190 315 191",
          "M493 238 C410 235 315 235 208 297",
          "M493 238 C420 205 360 170 309 156",
        ].map((path) => (
          <path className={styles.routeArc} d={path} fill="none" filter="url(#routeGlow)" key={path} />
        ))}
        <circle className={styles.routePulse} cx="493" cy="238" r="7" />
        <text className={styles.mapLabel} x="36" y="55">AR-TRANS Europe Routes</text>
        <text className={styles.mapNote} x="36" y="82">Італія виділена як пріоритетний напрямок</text>
      </svg>
    </div>
  );
}
