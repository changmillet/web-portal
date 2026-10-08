/** Public presentation identity. Never selects a backend, permissions or data scope. */
export type SiteId = "tiangong" | "atlas";

export function readSiteId(environment: Record<string, string | undefined> = process.env): SiteId {
  const site = environment.PORTAL_BRAND ?? "tiangong";
  if (site !== "tiangong" && site !== "atlas") {
    throw new Error(`Invalid PORTAL_BRAND: ${site}. Expected tiangong or atlas.`);
  }
  return site;
}

export const atlasBrandDefaults: Record<string, string> = {
  PORTAL_LIGHT_PRIMARY: "#765A12",
  PORTAL_DARK_PRIMARY: "#E8BC47",
  PORTAL_BRAND_VERSION: "atlas-v1",
  PORTAL_LIGHT_LOGO: "/brand/atlas/logo.png",
  PORTAL_DARK_LOGO: "/brand/atlas/logo.png",
  PORTAL_FAVICON: "/brand/atlas/logo.png",
  PORTAL_LOGO_ALT_ZH: "Atlas",
  PORTAL_LOGO_ALT_EN: "Atlas",
  PORTAL_LOGO_ALT_DE: "Atlas",
  PORTAL_LOGO_ALT_FR: "Atlas",
  PORTAL_LOGO_WIDTH: "257",
  PORTAL_LOGO_HEIGHT: "87",
  PORTAL_SOCIAL_IMAGE: "/brand/atlas/logo.png",
  PORTAL_SOCIAL_WIDTH: "257",
  PORTAL_SOCIAL_HEIGHT: "87",
};
