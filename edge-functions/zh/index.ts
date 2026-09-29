type RequestContext = { request: Request };

/** The two retired Chinese home URLs share one canonical public destination. */
export function onRequest({ request }: RequestContext): Response {
  const url = new URL(request.url);
  const headers = { "cache-control": "no-store" };
  if (url.pathname !== "/zh" && url.pathname !== "/zh/") {
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

  return new Response(null, {
    status: 301,
    headers: { ...headers, location: `/zh-CN${url.search}` },
  });
}
