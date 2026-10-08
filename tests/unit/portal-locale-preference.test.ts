import { describe, expect, it } from "vitest";

import {
  matchBrowserLocale,
  readLocalePreference,
  rememberLocale,
  resolveEntryLocale,
} from "@/i18n/preference";

describe("explicit language preference and browser negotiation", () => {
  it.each([
    ["fr-CA", "fr"],
    ["de-AT", "de"],
    ["en-GB", "en"],
    ["zh-TW", "zh-CN"],
    ["FR-ca", "fr"],
    ["ja-JP", undefined],
    ["en-invalid-!", undefined],
    ["", undefined],
  ])("matches browser tag %s to %s", (input, expected) => {
    expect(matchBrowserLocale(input!)).toBe(expected);
  });

  it("prioritizes explicit saved preferences and ignores malformed or unrelated cookies", () => {
    expect(resolveEntryLocale("theme=dark; portal_locale=fr", "de-DE,en;q=0.8")).toBe("fr");
    expect(resolveEntryLocale("portal_locale=unsupported", "de-DE,en;q=0.8")).toBe("de");
    expect(readLocalePreference("not_portal_locale=fr; portal_locale=%66r")).toBeUndefined();
  });

  it("respects weights, stable preference order and unsupported higher preferences", () => {
    expect(resolveEntryLocale("", "ja-JP,fr-CA;q=0.9,de;q=0.8")).toBe("fr");
    expect(resolveEntryLocale("", "de;q=0.4,fr;q=0.8")).toBe("fr");
    expect(resolveEntryLocale("", "de;q=0.8,fr;q=0.8")).toBe("de");
    expect(resolveEntryLocale("", "zh-CN;q=0,fr;q=0.7")).toBe("fr");
    expect(resolveEntryLocale("", "zh-CN;q=bogus,de;q=0.8")).toBe("de");
  });

  it.each(["", "ja-JP,es;q=0.9", "*", "fr;q=0,de;q=0", "invalid-!"])(
    "falls back to English for %s",
    (header) => {
      expect(resolveEntryLocale("", header)).toBe("en");
    },
  );

  it("writes only the bounded manual locale and tolerates denied cookie storage", () => {
    const target = { cookie: "" };
    rememberLocale("fr", target, true);
    expect(target.cookie).toBe("portal_locale=fr; Path=/; Max-Age=31536000; SameSite=Lax; Secure");
    const blocked = Object.defineProperty({}, "cookie", {
      set() {
        throw new Error("Cookie storage denied");
      },
    }) as Pick<Document, "cookie">;
    expect(() => rememberLocale("en", blocked, false)).not.toThrow();
  });
});
