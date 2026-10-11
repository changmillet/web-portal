import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readSiteId } from "../../src/sites/config";
import { collectionsStorageKeyV2 } from "../../src/features/collections/storage-v2";
import en from "../../src/i18n/messages/en.json" with { type: "json" };
import zh from "../../src/i18n/messages/zh-CN.json" with { type: "json" };
import de from "../../src/i18n/messages/de.json" with { type: "json" };
import fr from "../../src/i18n/messages/fr.json" with { type: "json" };

const dictionaries = { en, "zh-CN": zh, de, fr };
const processRef = "11111111-1111-1111-1111-111111111111@01.00.000";

for (const [locale, messages] of Object.entries(dictionaries)) {
  for (const width of [390, 1440]) {
    test(`${readSiteId()} ${locale} ${width}: save, restore and share from secondary tools`, async ({
      page,
      context,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.addInitScript(
        (theme) => {
          localStorage.setItem("tiangong.portal.theme.v1", theme);
        },
        width === 390 ? "dark" : "light",
      );
      const countLabel = (count: number) =>
        messages.SavedDatasets.openCount.replace("{count}", String(count));
      await page.goto(`/${locale}/search?v=1`);
      await expect(page.getByRole("banner").locator('a[href$="/collections"]')).toHaveCount(0);
      await expect(page.getByRole("link", { name: countLabel(0), exact: true })).toBeVisible();
      await page.goto(`/${locale}/search?v=1&kind=process&q=electricity`);
      const before = page.url();
      await page
        .getByRole("button", { name: new RegExp(`^${messages.SavedDatasets.save}:`) })
        .first()
        .click();
      await expect(page.getByRole("link", { name: countLabel(1), exact: true })).toBeVisible();
      expect(page.url()).toBe(before);
      await page.reload();
      await expect(page.getByRole("link", { name: countLabel(1), exact: true })).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(`^${messages.SavedDatasets.saved}:`) }).first(),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
          .violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${readSiteId()}-${locale}-${width}-saved.png`),
        fullPage: true,
      });
      await page.goto(`/${locale}/process/${encodeURIComponent(processRef)}`);
      await expect(
        page.getByRole("link", { name: new RegExp(`^${messages.SavedDatasets.saved}:`) }),
      ).toBeVisible();
      await page
        .getByRole("link", { name: new RegExp(`^${messages.SavedDatasets.saved}:`) })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.Collections.title);
      await page.getByRole("button", { name: messages.Collections.share, exact: true }).click();
      const shared = await page.evaluate(() => navigator.clipboard.readText());
      expect(shared).toContain("#collection=");
      expect(shared).not.toContain("collection-notes");
      await page.getByRole("button", { name: messages.Collections.remove, exact: true }).click();
      await expect
        .poll(() =>
          page.evaluate(
            (key) => JSON.parse(localStorage.getItem(key)!).members.length,
            collectionsStorageKeyV2,
          ),
        )
        .toBe(0);
      await page.goto(`/${locale}/search?v=1&kind=process&explore=process`);
      await expect(page.getByRole("link", { name: countLabel(0), exact: true })).toBeVisible();
    });
  }
}
