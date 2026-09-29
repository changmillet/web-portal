import { describe, expect, it } from "vitest";
import { onRequest } from "../../edge-functions/zh/index";

describe("Chinese home aliases", () => {
  it.each(["/zh", "/zh/"])("preserves the complete query on %s for GET and HEAD", (path) => {
    for (const method of ["GET", "HEAD"]) {
      for (const query of [
        "",
        "?seo_check=1&value=a%2Fb&value=2",
        "?space=one%20two&plus=one+two&encoded=%2f&blank=&flag",
        "?next=https%3A%2F%2Fother.test%2F&line=%0D%0ASet-Cookie%3Ainvalid",
      ]) {
        const response = onRequest({
          request: new Request(`https://www.tiangong.earth${path}${query}`, { method }),
        });
        expect(response.status).toBe(301);
        expect(response.headers.get("location")).toBe(`/zh-CN${query}`);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(response.headers.has("set-cookie")).toBe(false);
        expect(response.body).toBeNull();
      }
    }
  });

  it.each(["/zh/post/retired", "/zh/data", "/zh/index", "/zh//", "/ZH", "/en", "/"])(
    "does not redirect a path outside the exact alias allowlist: %s",
    (path) => {
      const response = onRequest({ request: new Request(`https://www.tiangong.earth${path}`) });
      expect(response.status).toBe(404);
      expect(response.headers.has("location")).toBe(false);
      expect(response.headers.get("x-robots-tag")).toBe("noindex");
    },
  );

  it.each(["POST", "PUT", "DELETE", "OPTIONS"])("does not redirect %s request bodies", (method) => {
    const response = onRequest({
      request: new Request("https://www.tiangong.earth/zh", { method }),
    });
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
    expect(response.headers.has("location")).toBe(false);
  });
});
