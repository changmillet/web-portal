import { expect, test } from "@playwright/test";

const verificationKey = "4cb8ce6fb4707a240bee58ce0c818af8";

test("serves the exact public IndexNow verification file without a locale redirect", async ({
  request,
}) => {
  const response = await request.get(`/${verificationKey}.txt`, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  expect(await response.text()).toBe(verificationKey);
});

test("keeps the unactivated withdrawal feed closed and uncached in production routing", async ({
  request,
}) => {
  for (const method of ["GET", "HEAD"]) {
    const response = await request.fetch("/baidu-withdrawals.txt", { method, maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(await response.text()).toBe(method === "HEAD" ? "" : "Not found.\n");
  }
  expect((await request.post("/baidu-withdrawals.txt")).status()).toBe(405);
  expect((await request.get("/baidu-withdrawals.txt?origin=arbitrary")).status()).toBe(400);
});
