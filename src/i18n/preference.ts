import { isPortalLocale, type PortalLocale } from "./routing";

/** This cookie records explicit choices only; URL visits and negotiation never write it. */
export const LOCALE_PREFERENCE_COOKIE = "portal_locale";
export const BROWSER_FALLBACK_LOCALE: PortalLocale = "en";

export function matchBrowserLocale(value: string): PortalLocale | undefined {
  try {
    const language = new Intl.Locale(value.trim()).language;
    const locale = language === "zh" ? "zh-CN" : language;
    return isPortalLocale(locale) ? locale : undefined;
  } catch {
    return undefined;
  }
}

export function readLocalePreference(cookie: string): PortalLocale | undefined {
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_PREFERENCE_COOKIE}=`))
    ?.slice(LOCALE_PREFERENCE_COOKIE.length + 1);
  return value && isPortalLocale(value) ? value : undefined;
}

/** Accept-Language weights express browser preference order; q=0 is never a candidate. */
export function resolveEntryLocale(cookie: string, acceptLanguage: string): PortalLocale {
  const saved = readLocalePreference(cookie);
  if (saved) return saved;

  const candidates = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag = "", ...parameters] = entry.trim().split(";");
      const quality = parameters.find((parameter) => /^\s*q\s*=/iu.test(parameter));
      const match = quality?.match(/^\s*q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)\s*$/iu);
      return { tag, weight: quality === undefined ? 1 : match ? Number(match[1]) : 0 };
    })
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of candidates) {
    const locale = matchBrowserLocale(tag);
    if (locale) return locale;
  }
  return BROWSER_FALLBACK_LOCALE;
}

export function rememberLocale(
  locale: PortalLocale,
  target: Pick<Document, "cookie">,
  secure: boolean,
): void {
  try {
    target.cookie = `${LOCALE_PREFERENCE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`;
  } catch {
    // A blocked cookie must not prevent navigating to the explicitly selected language.
  }
}
