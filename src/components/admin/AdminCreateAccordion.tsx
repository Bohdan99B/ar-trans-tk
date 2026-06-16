"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import styles from "./Admin.module.css";

type AdminCreateAccordionProps = {
  children: ReactNode;
  clearDraft?: boolean;
  draftStorageKey?: string;
  initialOpen?: boolean;
  title: string;
};

export function AdminCreateAccordion({
  children,
  clearDraft = false,
  draftStorageKey,
  initialOpen = false,
  title,
}: AdminCreateAccordionProps) {
  const [open, setOpen] = useState(initialOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const restoreDraft = useCallback(() => {
    if (!draftStorageKey || !contentRef.current) return;

    try {
      const storedDraft = sessionStorage.getItem(draftStorageKey);
      if (!storedDraft) return;

      const draft = JSON.parse(storedDraft) as Record<string, string>;
      const form = contentRef.current.querySelector("form");
      if (!form) return;

      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((control) => {
        const value = draft[control.name];
        if (value === undefined || control.type === "hidden") return;
        control.value = value;
        control.dispatchEvent(new Event("input", { bubbles: true }));
      });
    } catch {
      sessionStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (clearDraft && draftStorageKey) {
      sessionStorage.removeItem(draftStorageKey);
    }

    if (initialOpen && !clearDraft) {
      requestAnimationFrame(restoreDraft);
    }
  }, [clearDraft, draftStorageKey, initialOpen, restoreDraft]);

  function saveDraft(event: FormEvent<HTMLDivElement>) {
    if (!draftStorageKey) return;

    const form = event.currentTarget.querySelector("form");
    if (!form) return;

    const draft: Record<string, string> = {};
    for (const [name, value] of new FormData(form)) {
      if (typeof value === "string" && name !== "locale") {
        draft[name] = value;
      }
    }
    sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }

  function toggle() {
    setOpen((current) => {
      if (!current) requestAnimationFrame(restoreDraft);
      return !current;
    });
  }

  return (
    <article className={styles.applicationAccordion}>
      <button
        aria-expanded={open}
        className={`${styles.applicationSummary} ${styles.createAccordionSummary}`}
        onClick={toggle}
        type="button"
      >
        <span><strong>{title}</strong></span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>
      <div aria-hidden={!open} className={styles.accordionBody} data-open={open} inert={!open ? true : undefined}>
        <div className={styles.accordionInner} onChange={saveDraft} onInput={saveDraft} ref={contentRef}>
          {children}
        </div>
      </div>
    </article>
  );
}
