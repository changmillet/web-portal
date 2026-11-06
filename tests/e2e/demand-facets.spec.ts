import { expect, test } from "@playwright/test";
import en from "../../src/i18n/messages/en.json" with { type: "json" };

for (const width of [390, 1440]) {
  test(`loads requested filters and preserves the search at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/search?v=1&kind=process&q=electricity&sort=name_asc");
    const trigger = page.getByRole("button", { name: en.Search.facets, exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/refine=1/);
    expect(new URL(page.url()).searchParams.get("q")).toBe("electricity");
    expect(new URL(page.url()).searchParams.get("sort")).toBe("name_asc");
    const dialog = page.getByRole("dialog", { name: en.Search.facets });
    await expect(dialog.getByRole("link", { name: "Process (1)" })).toBeVisible();
    await dialog.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map((animation) => animation.finished),
      );
    });
    await page.screenshot({ path: testInfo.outputPath(`filters-${width}.png`), fullPage: true });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Process (1)" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/refine=1/);
  });
}

test("facet failure keeps successful results visible", async ({ page }) => {
  await page.goto(
    `/en/search?v=1&kind=process&q=fixture:facets-fail-${crypto.randomUUID()}&refine=1`,
  );
  await expect(page.getByRole("dialog").getByText(en.Search.filtersUnavailable)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText(en.Search.unavailableDescription)).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Electricity, medium voltage", exact: true }).first(),
  ).toBeVisible();
});

test("native refinement works without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/search?v=1&kind=process&q=electricity");
    const fallback = page.locator(".portal-facets-content");
    await fallback.getByRole("link", { name: en.Search.facets, exact: true }).click();
    await expect(page).toHaveURL(/refine=1/);
    await expect(fallback.getByRole("link", { name: "Process (1)" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath("native-refinement.png"), fullPage: true });
    await fallback.getByRole("link", { name: "Process (1)" }).click();
    await expect(page).not.toHaveURL(/refine=1/);
  } finally {
    await context.close();
  }
});
