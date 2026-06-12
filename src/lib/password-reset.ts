import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MINUTES = 60;
export const PASSWORD_RESET_COOLDOWN_SECONDS = 60;
export const MANAGER_RESET_REQUEST_TTL_DAYS = 7;

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiresAt() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
}

export function getManagerResetRequestExpiresAt() {
  return new Date(Date.now() + MANAGER_RESET_REQUEST_TTL_DAYS * 24 * 60 * 60 * 1000);
}
