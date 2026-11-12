import "server-only";

import { readPortalDataEnvironment } from "@/server/data/environment";

export const withdrawalFeedMaximumBytes = 5 * 1024 * 1024;
export const withdrawalFeedMaximumUrls = 50_000;
export const withdrawalFeedTimeoutMilliseconds = 15_000;
export const withdrawalFeedFunctionPath =
  "/functions/v1/dispatch_portal_index_notifications/baidu-withdrawals.txt";

const canonicalOrigin = "https://www.tiangong.earth";
const canonicalDatasetUrl =
  /^https:\/\/www\.tiangong\.earth\/(?:zh-CN|en|de|fr)\/(?:process|flow)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@\d{2}\.\d{2}\.\d{3}$/u;
const feedSecretPattern = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/u;

type FeedDependencies = {
  environment?: Record<string, string | undefined>;
  fetchImplementation?: typeof fetch;
  timeoutMilliseconds?: number;
};

function textResponse(body: string, status: number, head: boolean): Response {
  return new Response(head ? null : body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

/** A full, validated manifest is returned or the request fails closed. */
async function readFeed(response: Response, signal: AbortSignal): Promise<string> {
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) || Number(declaredLength) >= withdrawalFeedMaximumBytes)
  ) {
    void response.body?.cancel().catch(() => undefined);
    throw new Error("invalid feed size");
  }
  if (!response.body) throw new Error("missing feed body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const chunks: string[] = [];
  let bytes = 0;
  const cancel = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      bytes += value.byteLength;
      if (bytes >= withdrawalFeedMaximumBytes) throw new Error("feed size exceeded");
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
  } catch (error) {
    cancel();
    throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }

  const text = chunks.join("");
  if (text === "") return "";
  const urls = text.split("\n");
  if (urls.at(-1) === "") urls.pop();
  if (urls.length > withdrawalFeedMaximumUrls) throw new Error("feed count exceeded");
  const unique = new Set<string>();
  for (const url of urls) {
    if (!canonicalDatasetUrl.test(url) || unique.has(url)) throw new Error("invalid feed URL");
    unique.add(url);
  }
  return `${urls.join("\n")}\n`;
}

/**
 * The dispatcher owns prior-public history, live visibility rechecks and 404 proofs. This
 * server-only read capability cannot claim jobs or send notifications. No browser input is
 * forwarded to it, and no cached manifest can reintroduce a reactivated URL.
 */
export async function createWithdrawalFeedResponse(
  request: Request,
  dependencies: FeedDependencies = {},
): Promise<Response> {
  const head = request.method === "HEAD";
  if (request.method !== "GET" && !head) {
    const response = textResponse("Method not allowed.\n", 405, head);
    response.headers.set("allow", "GET, HEAD");
    return response;
  }
  if (request.url.includes("?")) return textResponse("Invalid request.\n", 400, head);

  const environment = dependencies.environment ?? process.env;
  if (
    environment.PORTAL_INDEX_FEED_ENABLED !== "true" ||
    environment.PORTAL_PUBLIC_INDEXING !== "enabled" ||
    ![canonicalOrigin, `${canonicalOrigin}/`].includes(environment.SITE_URL ?? "")
  ) {
    return textResponse("Not found.\n", 404, head);
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const abort = new AbortController();
  const cancelRequest = () => abort.abort();
  request.signal.addEventListener("abort", cancelRequest, { once: true });
  try {
    if (request.signal.aborted) throw new Error("request canceled");
    const secret = environment.PORTAL_INDEX_FEED_SECRET;
    if (!secret || !feedSecretPattern.test(secret)) throw new Error("invalid feed configuration");
    const dataEnvironment = readPortalDataEnvironment(environment);
    if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/u.test(dataEnvironment.supabaseUrl)) {
      throw new Error("invalid feed origin");
    }

    // A bounded override permits deterministic timeout verification, never a longer runtime.
    const deadline = dependencies.timeoutMilliseconds ?? withdrawalFeedTimeoutMilliseconds;
    if (
      !Number.isInteger(deadline) ||
      deadline < 1 ||
      deadline > withdrawalFeedTimeoutMilliseconds
    ) {
      throw new Error("invalid feed deadline");
    }
    timeout = setTimeout(() => abort.abort(), deadline);
    const upstream = await (dependencies.fetchImplementation ?? fetch)(
      `${dataEnvironment.supabaseUrl}${withdrawalFeedFunctionPath}`,
      {
        method: "GET",
        headers: {
          accept: "text/plain",
          apikey: dataEnvironment.publishableKey,
          "x-portal-index-feed-secret": secret,
        },
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: abort.signal,
      },
    );
    if (
      upstream.status !== 200 ||
      upstream.redirected ||
      !/^text\/plain(?:\s*;\s*charset=utf-8)?$/iu.test(
        upstream.headers.get("content-type") ?? "",
      ) ||
      upstream.headers.get("x-portal-index-feed-version") !== "1" ||
      upstream.headers.get("x-portal-index-origin") !== canonicalOrigin ||
      upstream.headers.get("x-portal-index-brands") !==
        dataEnvironment.dataBrandScope.allowedBrandCodes.join(",")
    ) {
      void upstream.body?.cancel().catch(() => undefined);
      throw new Error("invalid feed response");
    }

    return textResponse(await readFeed(upstream, abort.signal), 200, head);
  } catch {
    // Provider bodies, URL lists and configuration values must never enter logs or errors.
    abort.abort();
    return textResponse("Withdrawal manifest temporarily unavailable.\n", 503, head);
  } finally {
    request.signal.removeEventListener("abort", cancelRequest);
    if (timeout !== undefined) clearTimeout(timeout);
  }
}
