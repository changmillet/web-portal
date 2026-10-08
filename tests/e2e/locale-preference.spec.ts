import { expect, test } from "@playwright/test";

for (const input of ["mouse", "touch", "Enter", "Space"] as const) {
  test(`records the already selected language after explicit ${input} selection`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      locale: "fr-CA",
      hasTouch: input === "touch",
      isMobile: input === "touch",
      viewport: input === "touch" ? { width: 390, height: 844 } : { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    try {
      await page.goto("/?entry=same-language#catalog");
      await expect(page).toHaveURL(/\/fr\?entry=same-language#catalog$/);
      expect(await context.cookies()).toEqual([]);
      await page.evaluate(() => {
        document.documentElement.dataset.languageDocument = "same-document";
      });
      const navigations: string[] = [];
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) navigations.push(frame.url());
      });
      const trigger = page.getByRole("combobox", { name: "Langue", exact: true });
      if (input === "touch") await trigger.tap();
      else if (input === "mouse") await trigger.click();
      else {
        await trigger.focus();
        await trigger.press("Enter");
      }
      const selected = page.getByRole("option", { name: "Français", exact: true });
      await expect(selected).toHaveAttribute("data-state", "checked");
      if (input === "touch") await selected.tap();
      else if (input === "mouse") await selected.click();
      else {
        await expect(selected).toBeFocused();
        await selected.press(input === "Space" ? " " : "Enter");
      }
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("html")).toHaveAttribute("data-language-document", "same-document");
      expect(navigations).toEqual([]);
      expect(await context.cookies()).toEqual([
        expect.objectContaining({ name: "portal_locale", value: "fr" }),
      ]);

      const reopened = await browser.newContext({
        baseURL,
        locale: "de-AT",
        storageState: await context.storageState(),
      });
      try {
        const next = await reopened.newPage();
        await next.goto("/");
        await expect(next).toHaveURL(/\/fr$/);
      } finally {
        await reopened.close();
      }
    } finally {
      await context.close();
    }
  });
}

test("opening, dismissing and typing ahead do not save the current language", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, locale: "fr-CA" });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr$/);
    const trigger = page.getByRole("combobox", {
      name: "Langue",
      exact: true,
      includeHidden: true,
    });
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("listbox", { includeHidden: true })).toHaveCount(0);
    expect(await context.cookies()).toEqual([]);

    await trigger.click();
    // The modal options intentionally make the background inert to accessibility.
    await page.mouse.click(1, 1);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("listbox", { includeHidden: true })).toHaveCount(0);
    expect(await context.cookies()).toEqual([]);

    await trigger.focus();
    await trigger.press("Enter");
    const current = page.getByRole("option", { name: "Français", exact: true });
    await expect(current).toBeFocused();
    await page.keyboard.type("f");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("listbox", { includeHidden: true })).toHaveCount(0);
    expect(await context.cookies()).toEqual([]);
  } finally {
    await context.close();
  }
});

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
  await page.evaluate(() => {
    document.documentElement.dataset.languageDocument = "same-document";
  });
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/methodology\?keep=a&keep=b#reading$/);
  await expect(page.locator("html")).toHaveAttribute("data-language-document", "same-document");
  expect(await context.cookies()).toEqual([]);
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: "中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/methodology\?keep=a&keep=b#reading$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  expect(await context.cookies()).toEqual([]);
});
