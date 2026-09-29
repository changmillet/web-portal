import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/routing";
import { publicResources } from "@/lib/public-resources";

describe("public resource language boundaries", () => {
  it("uses the default Chinese homes but the real zh document routes", () => {
    expect(publicResources("zh-CN")).toMatchObject({
      docs: "https://docs.tiangong.earth/",
      tidas: "https://tidas.tiangong.earth/",
      pcr: "https://pcr.tiangong.earth/",
      dataGuide: "https://docs.tiangong.earth/zh/docs/user-guide/data-use/",
    });
  });
  it("keeps actual German and French documents while linking to PCR's published English edition", () => {
    for (const locale of ["de", "fr"] as const) {
      const links = publicResources(locale);
      expect(links.docs).toBe(`https://docs.tiangong.earth/${locale}/`);
      expect(links.dataGuide).toContain(`/${locale}/docs/`);
      expect(links.pcr).toBe("https://pcr.tiangong.earth/en/");
    }
  });
  it("preserves the independent public distribution node for every locale", () => {
    for (const locale of locales)
      expect(publicResources(locale).lcdn).toBe("https://lcdn.tiangong.earth/");
  });
});
