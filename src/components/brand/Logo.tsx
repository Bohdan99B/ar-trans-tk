import Image from "next/image";

import styles from "./Logo.module.css";

type LogoProps = {
  compact?: boolean;
  imageUrl?: string;
};

export function Logo({ compact = false, imageUrl }: LogoProps) {
  return (
    <span className={styles.logo} aria-label="AR-TRANS">
      {imageUrl ? <Image alt="AR-TRANS" className={styles.mark} height={78} src={imageUrl} width={148} /> : <svg className={styles.mark} viewBox="0 0 148 78" role="img" aria-hidden="true">
        <rect width="148" height="78" rx="12" fill="#123f90" />
        <path
          d="M17 54c9-26 28-38 57-38 16 0 30 4 42 12"
          fill="none"
          stroke="#ffd34d"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M19 59h15l6-18h20l6 18h15L58 18H43L19 59Zm25-28 6-1 6 1-6 18-6-18Z"
          fill="#ffd34d"
        />
        <path
          d="M70 59V24h28c9 0 15 5 15 13 0 6-3 10-8 12l12 10H99L88 49h-4v10H70Zm14-21h12c2 0 4-1 4-3s-2-3-4-3H84v6Z"
          fill="#f8fafc"
        />
        <path d="M110 30h24v7h-8v22h-8V37h-8v-7Z" fill="#ffd34d" />
      </svg>}
      {!compact && (
        <span className={styles.word}>
          <strong>AR-TRANS</strong>
          <small>transport company</small>
        </span>
      )}
    </span>
  );
}
