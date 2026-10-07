import { expect, test } from "@playwright/test";
import { locales } from "../../src/i18n/routing";

for (const locale of locales) {
  test(`functional pages keep noindex and native discovery controls in ${locale}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto(`/${locale}`);
      const homeFunctionalLinks = page.locator(
        `a[href^="/${locale}/search"], a[href^="/${locale}/compare"], a[href^="/${locale}/collections"]`,
      );
      expect(await homeFunctionalLinks.count()).toBeGreaterThan(0);
      for (const link of await homeFunctionalLinks.all()) {
        await expect(link).toHaveAttribute("rel", /(?:^|\s)nofollow(?:\s|$)/);
      }
      for (const path of ["search?kind=process", "compare?v=1", "collections"]) {
        const response = await page.goto(`/${locale}/${path}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      }
      await page.goto(`/${locale}/search?kind=process`);
      const functionalLinks = page.locator(
        `a[href^="/${locale}/search"], a[href^="/${locale}/compare"], a[href^="/${locale}/collections"]`,
      );
      expect(await functionalLinks.count()).toBeGreaterThan(0);
      for (const link of await functionalLinks.all()) {
        await expect(link).toHaveAttribute("rel", /(?:^|\s)nofollow(?:\s|$)/);
      }
      const detail = page.locator(`a[href^="/${locale}/process/"]`).first();
      await expect(detail).not.toHaveAttribute("rel", /nofollow/);
      await detail.click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/process/`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.goto(`/${locale}/lca-database`);
      const browse = page.locator(`a[href="/${locale}/browse/process"]`).first();
      await expect(browse).not.toHaveAttribute("rel", /nofollow/);
      await browse.click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/browse/process$`));
    } finally {
      await context.close();
    }
  });
}
