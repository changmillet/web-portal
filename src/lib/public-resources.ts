import type { PortalLocale } from "@/i18n/routing";

/** Public destinations retain each site's own language and publication boundaries. */
export function publicResources(locale: PortalLocale) {
  const docsLocale = locale === "zh-CN" ? "zh" : locale;
  const docsHome = locale === "zh-CN" ? "/" : `/${locale}/`;
  return {
    docs: `https://docs.tiangong.earth${docsHome}`,
    dataGuide: `https://docs.tiangong.earth/${docsLocale}/docs/user-guide/data-use/`,
    tidas: `https://tidas.tiangong.earth${docsHome}`,
    pcr: `https://pcr.tiangong.earth${locale === "zh-CN" ? "/" : "/en/"}`,
    lcdn: "https://lcdn.tiangong.earth/",
  } as const;
}
