import "server-only";

import { resolveEntryLocale } from "@/i18n/preference";

export function redirectToDefaultLocale(request: Request): Response {
  const requestUrl = new URL(request.url);
  const locale = resolveEntryLocale(
    request.headers.get("cookie") ?? "",
    request.headers.get("accept-language") ?? "",
  );
  const path = requestUrl.pathname === "/" ? "" : requestUrl.pathname;
  const location = `/${locale}${path}${requestUrl.search}`;

  return new Response(null, {
    headers: {
      "cache-control": "no-store",
      vary: "Accept-Language, Cookie",
      location,
    },
    status: 307,
  });
}
