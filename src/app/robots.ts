import type { MetadataRoute } from "next";

import { publicIndexingEnabled, publicSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = publicSiteUrl();
  if (!publicIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Public functional pages must be fetchable for their noindex directive to be read.
        // Parameter-link discovery is discouraged separately; robots is not access control.
        disallow: ["/r0-compat/"],
      },
    ],
    sitemap: [
      new URL("/sitemap.xml", siteUrl).toString(),
      new URL("/catalog-process-sitemap.xml", siteUrl).toString(),
      new URL("/catalog-flow-sitemap.xml", siteUrl).toString(),
    ],
  };
}
