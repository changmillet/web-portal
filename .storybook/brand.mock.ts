import { readBrandConfig } from "../src/config/brand";
import type { SiteId } from "../src/sites/config";

// Only controlled preview identity is exposed, never deployment environment values.
export let brandConfig = readBrandConfig({});
export function setStoryBrand(site: SiteId) {
  brandConfig = readBrandConfig({ PORTAL_BRAND: site });
}
