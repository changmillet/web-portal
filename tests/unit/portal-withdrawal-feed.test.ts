import { describe, expect, it, vi } from "vitest";

import {
  createWithdrawalFeedResponse,
  withdrawalFeedFunctionPath,
  withdrawalFeedMaximumBytes,
} from "@/server/search-notifications/withdrawal-feed";

const origin = "https://www.tiangong.earth";
const backend = "https://abcdefghijklmnopqrst.supabase.co";
const secret = Buffer.alloc(32, 19).toString("base64url");
const processUrl = `${origin}/zh-CN/process/11111111-1111-1111-1111-111111111111@01.00.000`;
const flowUrl = `${origin}/en/flow/22222222-2222-2222-2222-222222222222@00.00.001`;
const environment = {
  SITE_URL: origin,
  SUPABASE_URL: backend,
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_feed_test_value",
  PORTAL_DATA_BRANDS: "tiangong_lca",
  PORTAL_PUBLIC_INDEXING: "enabled",
  PORTAL_INDEX_FEED_ENABLED: "true",
  PORTAL_INDEX_FEED_SECRET: secret,
};

function request(init: RequestInit = {}, query = "") {
  return new Request(`${origin}/baidu-withdrawals.txt${query}`, init);
}

function upstream(
  body: BodyInit | null = `${processUrl}\n${flowUrl}\n`,
  headers: Record<string, string | undefined> = {},
) {
  const responseHeaders = new Headers({
    "content-type": "text/plain; charset=utf-8",
    "x-portal-index-feed-version": "1",
    "x-portal-index-origin": origin,
    "x-portal-index-brands": "tiangong_lca",
  });
  for (const [name, value] of Object.entries(headers)) {
    if (value !== undefined) responseHeaders.set(name, value);
  }
  return new Response(body, {
    headers: responseHeaders,
  });
}

function respond(response: Response = upstream()) {
  return vi.fn<typeof fetch>(async () => response);
}

describe("public withdrawal manifest boundary", () => {
  it("uses only the current backend, public gateway key and separate feed capability", async () => {
    const fetchImplementation = respond(
      upstream(undefined, { "set-cookie": "private=value", "x-internal-secret": secret }),
    );
    const result = await createWithdrawalFeedResponse(
      request({
        headers: { cookie: "browser=value", authorization: "Bearer visitor", host: "evil" },
      }),
      { environment, fetchImplementation },
    );
    expect(result.status).toBe(200);
    expect(await result.text()).toBe(`${processUrl}\n${flowUrl}\n`);
    expect(fetchImplementation).toHaveBeenCalledWith(
      `${backend}${withdrawalFeedFunctionPath}`,
      expect.objectContaining({
        method: "GET",
        headers: {
          accept: "text/plain",
          apikey: environment.SUPABASE_PUBLISHABLE_KEY,
          "x-portal-index-feed-secret": secret,
        },
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(result.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(result.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(result.headers.get("set-cookie")).toBeNull();
    expect(result.headers.get("x-internal-secret")).toBeNull();
    expect(result.headers.get("x-portal-index-brands")).toBeNull();
  });

  it.each([
    { PORTAL_INDEX_FEED_ENABLED: undefined },
    { PORTAL_INDEX_FEED_ENABLED: "false" },
    { PORTAL_PUBLIC_INDEXING: "disabled" },
    { SITE_URL: "https://atlas.example" },
    { SITE_URL: "https://www.tiangong.earth/other" },
  ])("keeps an unactivated or different deployment closed before any I/O: %j", async (override) => {
    const fetchImplementation = respond();
    const result = await createWithdrawalFeedResponse(request(), {
      environment: { ...environment, ...override },
      fetchImplementation,
    });
    expect(result.status).toBe(404);
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it.each([
    { PORTAL_INDEX_FEED_SECRET: undefined },
    { PORTAL_INDEX_FEED_SECRET: "invalid" },
    { PORTAL_INDEX_FEED_SECRET: `${"A".repeat(42)}B` },
    { SUPABASE_URL: "https://attacker.example" },
    { SUPABASE_URL: "http://abcdefghijklmnopqrst.supabase.co" },
    { SUPABASE_URL: "https://user:password@abcdefghijklmnopqrst.supabase.co" },
    { SUPABASE_URL: `${backend}/rpc` },
    { SUPABASE_PUBLISHABLE_KEY: "service_role_private_value" },
  ])("rejects invalid server configuration without exposing it: %j", async (override) => {
    const fetchImplementation = respond();
    const result = await createWithdrawalFeedResponse(request(), {
      environment: { ...environment, ...override },
      fetchImplementation,
    });
    expect(result.status).toBe(503);
    expect(await result.text()).toBe("Withdrawal manifest temporarily unavailable.\n");
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("rejects arbitrary query inputs and unsupported methods before forwarding", async () => {
    const fetchImplementation = respond();
    for (const [input, status] of [
      [request({}, "?origin=https://attacker.example"), 400],
      [request({}, "?"), 400],
      [request({ method: "POST", body: "{}" }), 405],
    ] as const) {
      const result = await createWithdrawalFeedResponse(input, {
        environment,
        fetchImplementation,
      });
      expect(result.status).toBe(status);
    }
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it.each([
    { "content-type": "application/json" },
    { "content-type": "text/plain; charset=iso-8859-1" },
    { "x-portal-index-feed-version": "2" },
    { "x-portal-index-origin": "https://elsewhere.example" },
    { "x-portal-index-brands": "bafu" },
  ])("refuses a different upstream contract or scope: %j", async (headers) => {
    const result = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: respond(upstream(undefined, headers)),
    });
    expect(result.status).toBe(503);
  });

  it.each([
    processUrl.replace("https:", "http:"),
    processUrl.replace("www.tiangong.earth", "attacker.example"),
    processUrl.replace("/zh-CN/", "/es/"),
    processUrl.replace("/process/", "/private/"),
    processUrl.replace("@01.00.000", "%4001.00.000"),
    processUrl.replace("@01.00.000", "@latest"),
    `${processUrl}/exchanges`,
    `${processUrl}?token=private`,
    `${processUrl}#note`,
    `${processUrl}\n\n${flowUrl}`,
    `${processUrl}\n${processUrl}`,
  ])(
    "fails the complete feed rather than emitting a malformed or partial list: %s",
    async (body) => {
      const result = await createWithdrawalFeedResponse(request(), {
        environment,
        fetchImplementation: respond(upstream(body)),
      });
      expect(result.status).toBe(503);
      expect(await result.text()).not.toContain("11111111");
    },
  );

  it("accepts an empty complete manifest and returns matching HEAD metadata without a body", async () => {
    const empty = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: respond(upstream("")),
    });
    expect(empty.status).toBe(200);
    expect(await empty.text()).toBe("");
    const head = await createWithdrawalFeedResponse(request({ method: "HEAD" }), {
      environment,
      fetchImplementation: respond(),
    });
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
    expect(head.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("checks body bytes even without Content-Length and cancels an oversized stream", async () => {
    let canceled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(withdrawalFeedMaximumBytes));
      },
      cancel() {
        canceled = true;
      },
    });
    const result = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: respond(upstream(body)),
    });
    expect(result.status).toBe(503);
    expect(canceled).toBe(true);
  });

  it.each([String(withdrawalFeedMaximumBytes), "invalid"])(
    "rejects an oversized or malformed declared length: %s",
    async (length) => {
      const result = await createWithdrawalFeedResponse(request(), {
        environment,
        fetchImplementation: respond(upstream(undefined, { "content-length": length })),
      });
      expect(result.status).toBe(503);
    },
  );

  it("rejects malformed UTF-8 instead of repairing a provider URL", async () => {
    const result = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: respond(upstream(new Uint8Array([0xff, 0xfe]))),
    });
    expect(result.status).toBe(503);
  });

  it.each([{ "content-type": "application/json" }, { "content-length": "invalid" }])(
    "does not await an uncooperative cancellation on a rejected upstream: %j",
    async (headers) => {
      const body = new ReadableStream<Uint8Array>({
        cancel: () => new Promise<void>(() => undefined),
      });
      const result = await createWithdrawalFeedResponse(request(), {
        environment,
        fetchImplementation: respond(upstream(body, headers)),
        timeoutMilliseconds: 5,
      });
      expect(result.status).toBe(503);
    },
  );

  it("enforces its deadline while reading a stalled response body", async () => {
    let canceled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`${processUrl}\n`));
      },
      cancel() {
        canceled = true;
      },
    });
    const result = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: respond(upstream(body)),
      timeoutMilliseconds: 5,
    });
    expect(result.status).toBe(503);
    expect(canceled).toBe(true);
  });

  it("does not expose upstream errors, credentials, or redirect bodies", async () => {
    for (const status of [301, 401, 500]) {
      const result = await createWithdrawalFeedResponse(request(), {
        environment,
        fetchImplementation: respond(new Response(secret, { status })),
      });
      expect(result.status).toBe(503);
      expect(await result.text()).not.toContain(secret);
    }
    const result = await createWithdrawalFeedResponse(request(), {
      environment,
      fetchImplementation: vi.fn<typeof fetch>(async () => {
        throw new Error(`upstream failure ${secret}`);
      }),
    });
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain(secret);
  });
});
