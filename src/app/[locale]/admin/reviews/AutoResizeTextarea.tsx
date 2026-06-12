"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoResizeTextarea({ onInput, ...props }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeTextarea = () => resize(textarea);
    resizeTextarea();
    window.addEventListener("resize", resizeTextarea);

    return () => window.removeEventListener("resize", resizeTextarea);
  }, []);

  return (
    <textarea
      {...props}
      onInput={(event) => {
        resize(event.currentTarget);
        onInput?.(event);
      }}
      ref={textareaRef}
    />
  );
}
