import { brandConfig } from "@/server/brand";
import type { PortalLocale } from "@/i18n/routing";
import { TiangongHeader } from "@/sites/tiangong/site-header";
import { AtlasHeader } from "@/sites/atlas/shell";

/** @import import { SiteHeader } from "@/components/shell/site-header"; */
export async function SiteHeader({ locale }: { locale: PortalLocale }) {
  return brandConfig.site === "atlas"
    ? AtlasHeader({ locale, brand: brandConfig })
    : TiangongHeader({ locale });
}
