import { getRequestConfig } from "next-intl/server";

import { brandConfig } from "@/server/brand";
import { siteMessages } from "@/sites/messages";

import { defaultLocale, isPortalLocale } from "./routing";

export default getRequestConfig(async ({ locale: explicitLocale, requestLocale }) => {
  const requestedLocale = explicitLocale ?? (await requestLocale);
  const locale =
    requestedLocale && isPortalLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: siteMessages(
      (await import(`./messages/${locale}.json`)).default,
      locale,
      brandConfig.site,
    ),
    timeZone: "UTC",
  };
});
