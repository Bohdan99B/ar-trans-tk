import styles from "@/app/[locale]/Site.module.css";

export function OfficeMap() {
  return (
    <div className={styles.officeMap}>
      <iframe
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=23.474%2C49.255%2C23.542%2C49.295&layer=mapnik&marker=49.278%2C23.505"
        title="Офіс ПП АР-Транс, Трускавець, Львівська область"
      />
      <div className={styles.mapOverlay}>
        <span>Офіс</span>
        <strong>Трускавець, Львівська область</strong>
      </div>
    </div>
  );
}
