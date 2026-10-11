import { describe, expect, it } from "vitest";
import { catalogCoverage } from "@/config/catalog-coverage";
import { readPortalDataBrandScope } from "@/config/data-brands";

describe("static catalog coverage", () => {
  it("uses the deployment data scope independently of visual branding", () => {
    expect(catalogCoverage(readPortalDataBrandScope({ PORTAL_BRAND: "atlas" }))).toEqual({
      region: 154,
      source: 35,
      asOf: "2026-10-11",
    });
    expect(
      catalogCoverage(
        readPortalDataBrandScope({
          PORTAL_BRAND: "tiangong",
          PORTAL_DATA_BRANDS: "worldsteel,uslci,bafu,tiangong_lca,bafu",
        }),
      ),
    ).toEqual({ region: 226, source: 38, asOf: "2026-10-11" });
  });
  it("does not present another scope's counts for an unmeasured deployment", () => {
    expect(catalogCoverage(readPortalDataBrandScope({ PORTAL_DATA_BRANDS: "bafu" }))).toBeNull();
  });
});
