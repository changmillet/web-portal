import type { PortalLocale } from "@/i18n/routing";
import type messages from "@/i18n/messages/en.json";
import type { SiteId } from "./config";
import { atlasCopy } from "./atlas/copy";

/** Presentation copy only. Authored data and named source institutions are never rebranded. */
export function siteMessages(
  base: typeof messages,
  locale: PortalLocale,
  site: SiteId,
): typeof messages {
  if (site === "tiangong") return base;
  const copy = atlasCopy[locale];
  return {
    ...base,
    Common: {
      ...base.Common,
      brandName: copy.metadataTitle,
      productFamily: copy.name,
      footerDescription: copy.footer,
    },
    Home: { ...base.Home, eyebrow: copy.metadataTitle },
    BrandHome: {
      ...base.BrandHome,
      titleLead: copy.title,
      titleFocus: copy.emphasis,
      eyebrow: copy.eyebrow,
      description: copy.description,
      metadataTitle: copy.metadataTitle,
      catalogTitle: copy.index,
      catalogDescription: copy.indexDescription,
      databaseAction: copy.explore,
    },
  };
}
