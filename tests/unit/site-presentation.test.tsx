import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readBrandConfig } from "@/config/brand";
import { readSiteId } from "@/sites/config";
import { siteMessages } from "@/sites/messages";
import { atlasCopy } from "@/sites/atlas/copy";
import { PresentationProvider } from "@/sites/presentation";
import { CatalogResultRow } from "@/features/catalog/catalog-result-row";
import { dictionaries } from "../../.storybook/fixtures";
import { locales } from "@/i18n/routing";

describe("deployment-owned site presentation", () => {
  it("keeps TianGong as default and rejects unknown/empty selectors", () => {
    expect(readSiteId({})).toBe("tiangong");
    for (const PORTAL_BRAND of ["", "Atlas", "unknown", "../atlas"]) {
      expect(() => readBrandConfig({ PORTAL_BRAND })).toThrow("Invalid PORTAL_BRAND");
    }
  });
  it("provides coherent Atlas assets, metadata and accessible palettes with explicit overrides", () => {
    const config = readBrandConfig({ PORTAL_BRAND: "atlas" });
    expect(config.site).toBe("atlas");
    expect(config.alt).toEqual({ "zh-CN": "Atlas", en: "Atlas", de: "Atlas", fr: "Atlas" });
    expect(config.lightLogo).toBe("/brand/atlas/logo.png");
    const png = readFileSync(resolve(`public${config.socialImage}`));
    expect(png.readUInt32BE(16)).toBe(config.socialWidth);
    expect(png.readUInt32BE(20)).toBe(config.socialHeight);
    expect(
      readBrandConfig({ PORTAL_BRAND: "atlas", PORTAL_LIGHT_PRIMARY: "#006699" }).lightPrimary,
    ).toBe("#006699");
  });
  it.each(locales)(
    "localizes %s presentation without relabeling source institutions or scientific content",
    (locale) => {
      const base = dictionaries[locale];
      const atlas = siteMessages(base, locale, "atlas");
      expect(atlas.Common.productFamily).toBe("Atlas");
      expect(atlas.BrandHome.metadataTitle).toBe(atlasCopy[locale].metadataTitle);
      expect(Object.keys(atlas)).toEqual(Object.keys(base));
      expect(Object.keys(atlas.BrandHome)).toEqual(Object.keys(base.BrandHome));
      expect(atlas.Team).toBe(base.Team);
      expect(atlas.Detail).toBe(base.Detail);
      expect(atlas.Compare).toBe(base.Compare);
      expect(siteMessages(base, locale, "tiangong")).toBe(base);
    },
  );
  it("switches record composition while preserving exact title, actions, values and selection", () => {
    const content = (
      <ol>
        <CatalogResultRow
          title="Electricity · 01.00.000"
          tags="Public"
          action={<button type="button">Copy citation</button>}
          selected
        >
          <dl>
            <dt>Quantity</dt>
            <dd>0.0000000000123 kWh</dd>
          </dl>
        </CatalogResultRow>
      </ol>
    );
    const view = render(<PresentationProvider site="tiangong">{content}</PresentationProvider>);
    expect(view.container.querySelector(".cr-result")).toBeTruthy();
    view.rerender(<PresentationProvider site="atlas">{content}</PresentationProvider>);
    expect(view.container.querySelector(".cr-result")).toBeNull();
    expect(view.container.querySelector('.atlas-record[data-selected="true"]')).toBeTruthy();
    expect(screen.getByRole("heading")).toHaveTextContent("Electricity · 01.00.000");
    expect(screen.getByRole("button", { name: "Copy citation" })).toBeVisible();
    expect(screen.getByText("0.0000000000123 kWh")).toBeVisible();
  });
});
