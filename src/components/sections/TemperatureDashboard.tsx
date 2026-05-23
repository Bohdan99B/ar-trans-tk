import styles from "@/app/[locale]/Site.module.css";

export function TemperatureDashboard() {
  return (
    <div className={styles.temperaturePanel} aria-label="Панель контролю температури">
      <div className={styles.panelHeader}>
        <span>LIVE CONTROL</span>
      </div>
      <div className={styles.tempZones}>
        <div>
          <span>Камера</span>
          <strong>-20 . . . +20</strong>
        </div>
      </div>
    </div>
  );
}
