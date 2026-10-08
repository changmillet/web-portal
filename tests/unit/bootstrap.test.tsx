import { describe, expect, it } from "vitest";

import { GET } from "@/app/(default)/route";

describe("Portal bootstrap entry", () => {
  it("negotiates the neutral root without dropping query order or creating a preference", () => {
    const response = GET(
      new Request("https://example.org/?tag=a&tag=b&empty=", {
        headers: { "accept-language": "ja-JP,fr-CA;q=0.9,en;q=0.8" },
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/fr?tag=a&tag=b&empty=");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.has("set-cookie")).toBe(false);
  });
});
