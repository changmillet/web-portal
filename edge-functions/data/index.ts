type RequestContext = { request: Request };

/** The retired English data gateway maps to the current English database guide. */
export function onRequest({ request }: RequestContext): Response {
  const url = new URL(request.url);
  const headers = { "cache-control": "no-store" };
  if (url.pathname !== "/data" && url.pathname !== "/data/") {
    return new Response(null, {
      status: 404,
      headers: { ...headers, "x-robots-tag": "noindex" },
    });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { ...headers, allow: "GET, HEAD" },
    });
  }

  // URL.search retains query encoding and ordering, but omits a bare query delimiter.
  const query = url.search || (request.url.endsWith("?") ? "?" : "");
  return new Response(null, {
    status: 301,
    headers: { ...headers, location: `/en/lca-database${query}` },
  });
}
