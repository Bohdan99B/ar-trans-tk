export const OWNER_EMAIL = "bozheikob@gmail.com";

export function isOwnerEmail(email: string) {
  return email.trim().toLowerCase() === OWNER_EMAIL;
}
