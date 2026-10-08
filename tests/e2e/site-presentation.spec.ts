import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { atlasCopy } from "../../src/sites/atlas/copy";
import { locales } from "../../src/i18n/routing";
import en from "../../src/i18n/messages/en.json" with { type: "json" };
import zh from "../../src/i18n/messages/zh-CN.json" with { type: "json" };
import de from "../../src/i18n/messages/de.json" with { type: "json" };
import fr from "../../src/i18n/messages/fr.json" with { type: "json" };
const dictionaries = { en, "zh-CN": zh, de, fr };
import { readSiteId } from "../../src/sites/config";

const site = readSiteId();
const processRef = "11111111-1111-1111-1111-111111111111@01.00.000";

test.describe("site presentation", () => {
  for (const locale of locales) {
    test(`${site} ${locale} identity, routes and responsive themes`, async ({ page }, testInfo) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("data-site", site);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const identity = site === "atlas" ? "Atlas" : "TianGong";
      const metadata = await page.locator('meta[property="og:site_name"]').getAttribute("content");
      expect(metadata).toBeTruthy();
      if (site === "atlas") {
        await expect(page).toHaveTitle(atlasCopy[locale].metadataTitle);
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          atlasCopy[locale].title,
        );
        await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
          "href",
          "/brand/atlas/logo.png",
        );
        const structured = await page.locator('script[type="application/ld+json"]').textContent();
        expect(structured).toContain('"name":"Atlas"');
        expect(structured).not.toContain('"@type":"Organization"');
        await expect(page.locator(".brand-cinematic-hero")).toHaveCount(0);
      }
      const manifest = await (await page.request.get("/manifest.webmanifest")).json();
      expect(manifest.name).toContain(identity);
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const theme of ["light", "dark"] as const) {
          const labels = dictionaries[locale].Common;
          const label = theme === "light" ? labels.themeLight : labels.themeDark;
          if (width < 640) {
            await page.getByRole("combobox", { name: labels.theme, exact: true }).click();
            await page.getByRole("option", { name: label, exact: true }).click();
            await expect(page.getByRole("listbox")).toBeHidden();
          } else {
            await page.getByRole("radio", { name: label, exact: true }).click();
          }
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          // Contrast is assessed after theme-color transitions, not midway between palettes.
          await page.evaluate(async () => {
            await Promise.all(
              document
                .getAnimations()
                .filter(
                  (animation) => animation.effect?.getComputedTiming().iterations !== Infinity,
                )
                .map((animation) => animation.finished.catch(() => undefined)),
            );
          });
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          ).toBe(true);
          const violations = (
            await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
          ).violations;
          expect(violations).toEqual([]);
          if (site === "atlas" && locale === "en" && theme === "light")
            await page.screenshot({
              path: testInfo.outputPath(`atlas-${width}.png`),
              fullPage: true,
            });
        }
      }
    });
  }

  test(`${site} preserves public exact-version detail and catalog actions`, async ({ page }) => {
    await page.goto("/en/search?v=1&kind=process&q=electricity");
    await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
    if (site === "atlas") await expect(page.locator(".atlas-record").first()).toBeVisible();
    await page
      .getByRole("link", { name: "Electricity, medium voltage", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(
      (url) => decodeURIComponent(url.pathname) === `/en/process/${processRef}`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Electricity, medium voltage");
    await expect(page.getByText("1 kWh", { exact: true })).toBeVisible();
    if (site === "atlas") await expect(page.locator(".atlas-detail-header")).toBeVisible();
    await page.getByRole("button", { name: "Citation", exact: true }).click();
    await expect(page.getByRole("dialog").getByText(processRef, { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.goto("/en/compare");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/en/collections");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`${site} keeps discovery and record content available without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      const origin = `http://127.0.0.1:${process.env.PORTAL_E2E_PORT ?? "4317"}`;
      await page.goto(`${origin}/en/search?v=1&kind=process&q=electricity`);
      await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
      await page
        .getByRole("link", { name: "Electricity, medium voltage", exact: true })
        .first()
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Electricity, medium voltage",
      );
    } finally {
      await context.close();
    }
  });
});
