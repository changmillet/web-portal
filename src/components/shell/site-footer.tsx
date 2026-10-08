import { brandConfig } from "@/server/brand";
import type { PortalLocale } from "@/i18n/routing";
import { TiangongFooter } from "@/sites/tiangong/site-footer";
import { AtlasFooter } from "@/sites/atlas/shell";

/** @import import { SiteFooter } from "@/components/shell/site-footer"; */
export async function SiteFooter({ locale }: { locale: PortalLocale }) {
  return brandConfig.site === "atlas"
    ? AtlasFooter({ locale, brand: brandConfig })
    : TiangongFooter({ locale });
}
