import { OrderForm } from "@/components/forms/OrderForm";
import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function OrderPage() {
  return (
    <>
      <PageHero
        eyebrow="Заявка"
        text="Заповніть форму, і заявка буде збережена в базі. Email менеджеру надсилається автоматично, але навіть у разі помилки пошти заявка залишиться в адмінці."
        title="Замовити перевезення / отримати розрахунок"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <OrderForm />
        </div>
      </section>
    </>
  );
}
