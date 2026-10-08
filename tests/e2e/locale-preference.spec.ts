import { expect, test } from "@playwright/test";

test("negotiates neutral entries by weighted browser languages without caching or saving them", async ({
  request,
}) => {
  for (const [language, locale] of [
    ["fr-CA,en;q=0.8", "fr"],
    ["ja-JP,de-AT;q=0.8,en;q=0.5", "de"],
    ["zh-TW,en;q=0.8", "zh-CN"],
    ["es-MX,ja;q=0.8", "en"],
    ["fr;q=0,de;q=0.8", "de"],
    ["", "en"],
  ]) {
    const response = await request.get("/?tag=a&tag=b&empty=", {
      headers: { "Accept-Language": language! },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(`/${locale}?tag=a&tag=b&empty=`);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers().vary?.toLowerCase()).toContain("accept-language");
    expect(response.headers().vary?.toLowerCase()).toContain("cookie");
    expect(response.headers()["set-cookie"]).toBeUndefined();
  }
  const head = await request.head("/", {
    headers: { "Accept-Language": "de-AT" },
    maxRedirects: 0,
  });
  expect(head.status()).toBe(307);
  expect(head.headers().location).toBe("/de");
});

test("remembers manual selection across browser reopening but honors explicit language URLs", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, locale: "fr-CA" });
  const page = await context.newPage();
  try {
    await page.goto("/?entry=1#catalog");
    await expect(page).toHaveURL(/\/fr\?entry=1#catalog$/);
    expect(await context.cookies()).toEqual([]);
    await page.getByRole("combobox", { name: "Langue", exact: true }).click();
    await page.getByRole("option", { name: "Deutsch", exact: true }).click();
    await expect(page).toHaveURL(/\/de\?entry=1#catalog$/);
    const cookies = await context.cookies();
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({
      name: "portal_locale",
      value: "de",
      path: "/",
      sameSite: "Lax",
    });
    expect(cookies[0]!.expires).toBeGreaterThan(Date.now() / 1000 + 3600 * 24 * 300);

    const reopened = await browser.newContext({
      baseURL,
      locale: "zh-CN",
      storageState: await context.storageState(),
    });
    try {
      const next = await reopened.newPage();
      await next.goto("/");
      await expect(next).toHaveURL(/\/de$/);
      await next.goto("/en/methodology?keep=1#reading");
      await expect(next).toHaveURL(/\/en\/methodology\?keep=1#reading$/);
      await expect(next.locator("html")).toHaveAttribute("lang", "en");
      expect((await reopened.cookies())[0]!.value).toBe("de");
      await next.goto("/");
      await expect(next).toHaveURL(/\/de$/);
    } finally {
      await reopened.close();
    }
  } finally {
    await context.close();
  }
});

test("manual language still works when cookie writes are denied", async ({ page, context }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set() {
        throw new Error("Blocked");
      },
    });
  });
  await page.goto("/en/methodology?keep=a&keep=b#reading");
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: "中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/methodology\?keep=a&keep=b#reading$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  expect(await context.cookies()).toEqual([]);
});
