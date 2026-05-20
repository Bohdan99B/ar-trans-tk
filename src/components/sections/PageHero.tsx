import styles from "@/app/[locale]/Site.module.css";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  text: string;
};

export function PageHero({ eyebrow, text, title }: PageHeroProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{text}</p>
      </div>
    </section>
  );
}
