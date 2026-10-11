import type { PortalLocale } from "@/i18n/routing";
import type messages from "@/i18n/messages/en.json";
import type { SiteId } from "./config";
import { atlasInformation } from "./atlas/information";
import { atlasCopy } from "./atlas/copy";

/** Presentation copy only. Authored data and named source institutions are never rebranded. */
export function siteMessages(
  base: typeof messages,
  locale: PortalLocale,
  site: SiteId,
): typeof messages {
  if (site === "tiangong") return base;
  const copy = atlasCopy[locale];
  const info = atlasInformation[locale];
  return {
    ...base,
    Common: {
      ...base.Common,
      brandName: copy.metadataTitle,
      team: info.aboutLabel,
      productFamily: copy.name,
      footerDescription: copy.footer,
    },
    Team: { ...base.Team, metadataTitle: info.team.title, description: info.team.description },
    Community: {
      ...base.Community,
      metadataTitle: info.community.title,
      description: info.community.description,
    },
    Methodology: { ...base.Methodology, description: info.dataDescription },
    DatabaseGuide: {
      ...base.DatabaseGuide,
      title: info.dataTitle,
      description: info.dataDescription,
      catalogTitle: copy.index,
      catalogBody: copy.description,
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
