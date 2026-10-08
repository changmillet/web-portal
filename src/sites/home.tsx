import { brandConfig } from "@/server/brand";
import { BrandHome, type BrandHomeProps } from "@/components/brand/brand-home";
import { AtlasHome } from "./atlas/home";

/** Route loaders own data; presentation modules receive the same public DTOs.
 * @import import { SiteHome } from "@/sites/home";
 */
export async function SiteHome(props: BrandHomeProps) {
  return brandConfig.site === "atlas" ? <AtlasHome {...props} /> : <BrandHome {...props} />;
}
