import type { LinkProps } from "next/link";

/** Keep native navigation while discouraging discovery of non-indexable functional URLs.
 * This is a crawler hint, not a request limit or a substitute for the destination's noindex.
 * Catalog, exact-version and external links retain their caller-supplied relationship.
 */
export function functionalLinkRel(href: LinkProps["href"], rel?: string): string | undefined {
  const path = typeof href === "string" ? href : href.pathname;
  if (typeof href !== "string" && (href.host || href.hostname || href.protocol)) return rel;
  if (!path || !/^\/(?:zh-CN|en|de|fr)\/(?:search|compare|collections)\/?(?:[?#]|$)/u.test(path))
    return rel;
  const tokens = rel?.split(/\s+/u).filter(Boolean) ?? [];
  return tokens.some((token) => token.toLowerCase() === "nofollow")
    ? rel
    : [...tokens, "nofollow"].join(" ");
}
