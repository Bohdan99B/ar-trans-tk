import { z } from "zod";

export type FieldErrors = Record<string, string>;

export function formDataToObject(formData: FormData) {
  const values: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const key of new Set(formData.keys())) {
    const entries = formData.getAll(key);
    values[key] = entries.length > 1 ? entries : entries[0];
  }

  return values;
}

export function getFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function validateFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { data: z.infer<T>; errors?: never } | { data?: never; errors: FieldErrors } {
  const parsed = schema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { errors: getFieldErrors(parsed.error) };
  }

  return { data: parsed.data };
}
