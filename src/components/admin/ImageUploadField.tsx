"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./Admin.module.css";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const accept = allowedTypes.join(",");
const maxSize = 5 * 1024 * 1024;

type ImageUploadFieldProps = {
  currentAlt?: string;
  currentImageUrl?: string | null;
  deleteAction?: (data: FormData) => void | Promise<void>;
  deleteConfirmMessage?: string;
  deleteLabel?: string;
  emptyText?: string;
  helperText?: string;
  inputName: string;
  label: string;
  previewKind?: "fleet" | "logo";
};

function validate(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return "Можна завантажувати тільки зображення JPEG, PNG, WEBP або AVIF";
  }

  if (file.size > maxSize) {
    return "Максимальний розмір фото — 5MB";
  }

  return "";
}

export function ImageUploadField({
  currentAlt = "Поточне зображення",
  currentImageUrl,
  deleteAction,
  deleteConfirmMessage = "Видалити фото?",
  deleteLabel = "Видалити фото",
  emptyText,
  helperText,
  inputName,
  label,
  previewKind = "fleet",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearLocalPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileName("");
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const visiblePreview = previewUrl ?? currentImageUrl ?? null;
  const hasLocalPreview = Boolean(previewUrl);
  const canDeleteSaved = Boolean(currentImageUrl && deleteAction && !hasLocalPreview);
  const previewClassName = previewKind === "logo" ? styles.logoPreviewBox : styles.previewBox;
  const imageClassName = previewKind === "logo" ? styles.logoPreviewImage : styles.previewImage;
  const deleteButton = hasLocalPreview ? (
    <button className={styles.secondaryButton} onClick={clearLocalPreview} type="button">
      {deleteLabel}
    </button>
  ) : canDeleteSaved ? (
    <button
      className={styles.dangerButton}
      formAction={deleteAction}
      onClick={(event) => {
        if (!window.confirm(deleteConfirmMessage)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {deleteLabel}
    </button>
  ) : null;

  return (
    <div className={styles.imageField}>
      <div className={styles.fileControl}>
        <span className={styles.fileControlLabel}>{label}</span>
        <div className={styles.fileActionRow}>
          <label className={styles.fileButton}>
            Вибрати файл
            <input
              accept={accept}
              className={styles.fileInput}
              name={inputName}
              onChange={(event) => {
                setError("");
                const file = event.currentTarget.files?.[0];
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                if (!file) return;

                const validationError = validate(file);
                if (validationError) {
                  setError(validationError);
                  event.currentTarget.value = "";
                  return;
                }

                setFileName(file.name);
                setPreviewUrl(URL.createObjectURL(file));
              }}
              ref={inputRef}
              type="file"
            />
          </label>
          {deleteButton}
        </div>
        {fileName ? <span className={styles.fileName}>{fileName}</span> : null}
      </div>
      {helperText ? <p className={styles.helperText}>{helperText}</p> : null}
      {visiblePreview ? (
        <div className={previewClassName}>
          {/* Blob previews are intentionally rendered as a plain image to avoid Next Image sizing warnings. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={hasLocalPreview ? "Preview нового зображення" : currentAlt} className={imageClassName} src={visiblePreview} />
        </div>
      ) : emptyText ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : null}
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}
