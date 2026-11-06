import { beforeEach, describe, expect, it, vi } from "vitest";

const reads = vi.hoisted(() => ({
  getPublicCatalogSummary: vi.fn<() => Promise<null>>().mockResolvedValue(null),
  getPublicCatalogTotals: vi.fn<() => Promise<null>>().mockResolvedValue(null),
  brandConfig: { site: "tiangong" },
}));
vi.mock("@/server/brand", () => ({ brandConfig: reads.brandConfig }));
vi.mock("@/server/data/catalog", () => ({
  getPublicCatalogSummary: reads.getPublicCatalogSummary,
}));
vi.mock("@/server/data/navigation", () => ({
  getPublicCatalogTotals: reads.getPublicCatalogTotals,
}));
vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn<(locale: string) => void>() }));
vi.mock("@/sites/home", () => ({ SiteHome: () => null }));
import HomePage from "@/app/[locale]/page";

describe("homepage data demand", () => {
  beforeEach(() => vi.clearAllMocks());
  for (const site of ["tiangong", "atlas"]) {
    it(`${site} reads only the homepage data it displays`, async () => {
      reads.brandConfig.site = site;
      await HomePage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      });
      expect(reads.getPublicCatalogSummary).toHaveBeenCalledTimes(site === "atlas" ? 0 : 1);
      expect(reads.getPublicCatalogTotals).toHaveBeenCalledTimes(1);
    });
  }
});
