import type { UserRole } from "@prisma/client";

const defaultLocale = "uk";
const supportedLocales = ["uk", "en"];

function getLocaleFromPath(path?: string | null) {
  const locale = path?.split("/")[1];
  return supportedLocales.includes(locale ?? "") ? locale : defaultLocale;
}

function getSafePath(callbackUrl?: string | null) {
  if (!callbackUrl) {
    return null;
  }

  try {
    if (callbackUrl.startsWith("/")) {
      return callbackUrl;
    }

    const parsed = new URL(callbackUrl);
    return parsed.pathname + parsed.search;
  } catch {
    return null;
  }
}

export function getPostLoginPath(role?: UserRole | null, callbackUrl?: string | null) {
  const safePath = getSafePath(callbackUrl);
  const locale = getLocaleFromPath(safePath);

  if (role === "ADMIN") {
    return safePath?.match(/^\/(uk|en)\/admin(\/|$)/) ? safePath : `/${locale}/admin`;
  }

  if (role === "MANAGER") {
    return `/${locale}/manager`;
  }

  return `/${locale}`;
}
