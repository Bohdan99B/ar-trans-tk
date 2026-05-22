import { PageHero } from "@/components/sections/PageHero";

import styles from "../../Site.module.css";

export default function ClientCreditPage() {
  return (
    <>
      <PageHero
        eyebrow="Фінансові умови"
        text="Для постійних клієнтів доступні індивідуальні умови оплати після перевірки історії співпраці, ліміту, регулярності рейсів та партнерського формату роботи."
        title="Кредитування та партнерські умови"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <article className={styles.card}>
            <h2>Як це працює</h2>
            <p>Менеджер фіксує потребу, фінансові умови погоджуються окремо, після чого клієнт отримує затверджений формат оплати для майбутніх заявок.</p>
          </article>
        </div>
      </section>
    </>
  );
}
