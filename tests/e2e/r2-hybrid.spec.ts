import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import en from "../../src/i18n/messages/en.json" with { type: "json" };

const processRef = "11111111-1111-1111-1111-111111111111@01.00.000";
const fixtureOrigin = `http://127.0.0.1:${process.env.PORTAL_FIXTURE_PORT ?? "4328"}`;

test("runs private-by-default Hybrid discovery and keeps evidence comparable", async ({
  context,
  page,
  request,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/search?v=1");
  await page.getByRole("button", { name: "Describe your need" }).click();
  const bffResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/internal/hybrid") && response.request().method() === "POST",
  );
  const query = "low-carbon electricity for an industrial site in China";
  await page.getByLabel("Data need").fill(query);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const bffResponse = await bffResponsePromise;

  expect(bffResponse.ok()).toBe(true);
  await expect(page).toHaveURL(/\/en\/search\?v=1$/u);
  await expect(page.getByRole("status")).toContainText(
    /Updated matches are ready|Results updated for your description/u,
  );
  const updatedResults = page.getByRole("button", { name: "View updated results" });
  if (await updatedResults.isVisible()) await updatedResults.click();
  await expect(
    page.getByRole("button", { name: "How your request was interpreted" }),
  ).toBeVisible();
  await expect(
    page.getByText(en.Hybrid.advisoryDescription, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Matching datasets" })).toBeVisible();
  await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Synthetic electricity supply example", { exact: false }).first(),
  ).toBeVisible();
  expect(page.url()).not.toContain(encodeURIComponent(query));

  const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(serious).toEqual([]);

  const correlationId = bffResponse.headers()["x-portal-correlation-id"];
  expect(correlationId).toMatch(/^[0-9a-f-]{36}$/u);
  const receipt = await request.get(`${fixtureOrigin}/receipts/hybrid/${correlationId}`);
  expect(receipt.ok()).toBe(true);
  const receiptBody = await receipt.text();
  expect(receiptBody).toContain("portal.r2-fixture-hybrid-receipt.v1");
  expect(receiptBody).not.toContain(query);

  await page.getByRole("button", { name: "Preview shared link" }).click();
  await expect(page.getByRole("heading", { name: "What the link will include" })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: query })).toBeVisible();
  await page.getByRole("button", { name: "Confirm and copy query link" }).click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain("#hybrid=");
  expect(shared).not.toContain(query);

  const candidates = page.getByRole("checkbox", { name: /^Select for comparison /u });
  await expect(candidates).toHaveCount(2);
  await candidates.nth(0).check();
  await candidates.nth(1).check();
  await page.getByRole("link", { name: "Compare selected versions", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/compare\?/u);
  await expect(page.getByRole("heading", { name: "Compare Process datasets" })).toBeVisible();
});

test("automatically returns lexical cards for a fixed Hybrid guard rejection", async ({ page }) => {
  await page.goto("/en/search?v=1");
  await page.getByRole("button", { name: "Describe your need" }).click();
  const query = "fixture:guard_unavailable";
  await page.getByLabel("Data need").fill(query);
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByText("Keyword results shown", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Keyword results shown" }),
  ).not.toContainText("guard_unavailable");
  await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/en\/search\?v=1$/u);
  expect(page.url()).not.toContain(query);
});

test("keeps early selections stable until a late update is accepted and exposes exact versions on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let releaseUpdate: () => void = () => {};
  const updateReady = new Promise<void>((resolve) => {
    releaseUpdate = resolve;
  });
  await page.route("**/internal/hybrid", async (route) => {
    const response = await route.fetch();
    await updateReady;
    await route.fulfill({ response });
  });
  await page.goto("/en/search?v=1");
  await page.getByRole("button", { name: "Describe your need" }).click();
  await page.getByLabel("Data need").fill("electricity for an industrial site");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const firstSelection = page.getByRole("checkbox", { name: /^Select for comparison /u }).first();
  await firstSelection.check();
  const selectedRef = await firstSelection.inputValue();
  releaseUpdate();
  await expect(page.getByRole("button", { name: "View updated results" })).toBeVisible();
  await expect(firstSelection).toBeChecked();
  expect(await firstSelection.inputValue()).toBe(selectedRef);
  await page.getByRole("button", { name: "View updated results" }).click();
  const versions = page
    .getByRole("button", { name: /Other versions matched in this search/u })
    .first();
  await versions.focus();
  await page.keyboard.press("Enter");
  const versionLink = page.getByRole("link", { name: "Version 00.99.999" });
  await expect(versionLink).toBeVisible();
  await expect(versionLink).toHaveAttribute(
    "href",
    /11111111-1111-1111-1111-111111111111%4000\.99\.999$/u,
  );
  const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(violations).toEqual([]);
  await page
    .getByRole("heading", { name: "Matching datasets" })
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: "test-results/hybrid-progressive-mobile-viewport.png" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/hybrid-progressive-mobile.png", fullPage: true });
});

test("shares collection notes only after preview and second confirmation", async ({
  browser,
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/collections");
  await page.locator(".collection-add-shell > summary").click();
  await page.getByLabel("Add by version ID").fill(processRef);
  await page.getByRole("button", { name: "Save dataset" }).click();
  await page.locator(".collection-details > summary").click();
  await page.getByLabel("Collection name").fill("Private research name");
  await page.getByLabel("Purpose or research question").fill("Private purpose");
  await page.getByLabel("Notes or selection rationale").fill("Private local note");
  await page.evaluate(() => navigator.clipboard.writeText("sentinel"));

  await page.getByRole("button", { name: "Share datasets and notes" }).click();
  await expect(page.getByRole("heading", { name: "Review before sharing" })).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Review before sharing" })
      .getByText("Notes or selection rationale: Private local note", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("sentinel");

  await page.getByRole("button", { name: "Confirm and copy link" }).click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain("#collection-notes=");
  expect(shared).not.toContain("Private local note");

  const receiverContext = await browser.newContext();
  try {
    const receiver = await receiverContext.newPage();
    await receiver.goto(shared);
    await expect(receiver.getByRole("heading", { name: "Review collection import" })).toBeVisible();
    await expect(receiver.getByLabel("Collection name")).toHaveValue("");
    await receiver.getByRole("button", { name: "Add shared collection" }).click();
    await expect(receiver.getByLabel("Collection name")).toHaveValue("Private research name");
    await expect(receiver.getByLabel("Purpose or research question")).toHaveValue(
      "Private purpose",
    );
    await expect(receiver.getByLabel("Notes or selection rationale")).toHaveValue(
      "Private local note",
    );
  } finally {
    await receiverContext.close();
  }
});

for (const mode of ["keyword", "description"] as const) {
  test(`submits shared type and filters through ${mode} search`, async ({ page }) => {
    await page.goto("/en/search?v=1");
    await page.getByRole("button", { name: en.Hybrid.flow, exact: true }).click();
    await page.getByRole("button", { name: en.Search.facets }).click();
    const drawer = page.getByRole("dialog");
    await drawer.getByLabel(en.Hybrid.filterGeography, { exact: true }).fill("CN");
    await drawer.getByLabel(en.Hybrid.filterYearFrom).fill("2020");
    await drawer.getByLabel(en.Hybrid.filterYearTo).fill("2022");
    await drawer.getByRole("button", { name: en.Search.applyFilters }).click();
    await expect(drawer).toBeHidden();
    await page.getByRole("button", { name: en.Search.descriptionMode }).click();
    await page.getByRole("searchbox", { name: en.Hybrid.queryLabel }).fill("Electricity in China");
    if (mode === "description") {
      const submitted = page.waitForRequest(
        (request) => request.url().endsWith("/internal/hybrid") && request.method() === "POST",
      );
      await page.getByRole("searchbox", { name: en.Hybrid.queryLabel }).press("Enter");
      expect((await submitted).postDataJSON()).toMatchObject({
        kind: "flow",
        query: "Electricity in China",
        filters: { geography: "cn", referenceYearFrom: 2020, referenceYearTo: 2022 },
      });
      expect(page.url()).not.toContain("Electricity");
    } else {
      await page.getByRole("button", { name: en.Search.keywordMode }).click();
      await page.getByRole("searchbox", { name: en.Search.label }).fill("steel");
      await page.getByRole("searchbox", { name: en.Search.label }).press("Enter");
      await expect(page).toHaveURL(/q=steel/);
      const parameters = new URL(page.url()).searchParams;
      expect(Object.fromEntries(parameters)).toMatchObject({
        kind: "flow",
        q: "steel",
        geo: "CN",
        yearFrom: "2020",
        yearTo: "2022",
      });
      expect(page.url()).not.toContain("Electricity");
    }
  });
}

for (const width of [1440, 390]) {
  test(`keeps one search workspace and identical input geometry at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/en/search?v=1");
    const keyword = page.getByRole("searchbox", { name: en.Search.label });
    const description = page.getByRole("searchbox", { name: en.Hybrid.queryLabel });
    const metrics = () =>
      page.locator(".catalog-query-control:visible").evaluate((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const input = element.querySelector("input")!;
        const button = element.querySelector('button[type="submit"]')!;
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          padding: style.padding,
          radius: style.borderRadius,
          background: style.backgroundColor,
          fontSize: getComputedStyle(input).fontSize,
          buttonHeight: button.getBoundingClientRect().height,
        };
      });
    await expect(keyword).toBeVisible();
    const workspaceLayout = () =>
      page.locator(".catalog-search-modes").evaluate((element) =>
        [".catalog-workspace-controls", ".catalog-workspace-browse"].map((selector) => {
          const node = [...element.querySelectorAll(selector)].find(
            (node) => node.getBoundingClientRect().height > 0,
          )!;
          const { x, y, width, height } = node.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
    const original = await metrics();
    const originalLayout = await workspaceLayout();
    await expect(page.getByRole("button", { name: en.Hybrid.process, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: en.Search.facets })).toBeVisible();
    await expect(page.getByRole("button", { name: en.Hybrid.shareQuery })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`keyword-${width}.png`), fullPage: true });
    await keyword.fill("steel");
    await page.getByRole("button", { name: en.Search.descriptionMode }).click();
    await expect(description).toBeVisible();
    await expect(page.getByRole("button", { name: en.Search.descriptionMode })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.locator("body").evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
    expect(await metrics()).toEqual(original);
    expect(await workspaceLayout()).toEqual(originalLayout);
    await expect(page.getByRole("navigation", { name: en.Home.browseTitle })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`description-${width}.png`),
      fullPage: true,
    });
    await description.fill("electricity in China");
    await page.getByRole("button", { name: en.Search.keywordMode }).click();
    await expect(keyword).toHaveValue("steel");
    await page.getByRole("button", { name: en.Search.descriptionMode }).click();
    await expect(description).toHaveValue("electricity in China");
    await description.press("Enter");
    await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
    await description.fill("industrial electricity in China, 2022");
    await expect(page.getByText(en.Search.pendingTitle, { exact: true })).toBeVisible();
    await expect(page.getByText("Showing results for: electricity in China")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`pending-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: en.Search.keywordMode }).click();
    await expect(page.getByText("Electricity, medium voltage", { exact: true })).toBeVisible();
    await expect(keyword).toHaveValue("steel");
    await page.getByRole("button", { name: en.Search.descriptionMode }).click();
    await page.getByRole("button", { name: en.Search.discardChanges }).click();
    await expect(description).toHaveValue("electricity in China");
    expect(page.url()).not.toContain("electricity");
  });
}
