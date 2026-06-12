export function getAppBaseUrl(requestUrl: string) {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(requestUrl).origin
  );
}
