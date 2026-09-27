import "server-only";

export type PortalDataErrorCode = "invalid_request" | "upstream_unavailable" | "invalid_response";
export type PortalUpstreamErrorCode = "22023" | "P0001" | "57014" | "PGRST" | "unknown";
export type PortalUpstreamFailure = {
  readonly upstreamStatus?: number;
  readonly upstreamCode: PortalUpstreamErrorCode;
};

/**
 * The single public failure shape of the Portal data boundary. Messages stay
 * generic: callers and framework logs may surface them, so they must never
 * carry a query, an identifier list, or an upstream body.
 */
export class PortalDataError extends Error {
  readonly code: PortalDataErrorCode;
  readonly upstream?: Readonly<PortalUpstreamFailure>;

  constructor(code: PortalDataErrorCode, upstream?: PortalUpstreamFailure) {
    super(
      code === "invalid_request"
        ? "The Portal request is invalid."
        : "The public data service is temporarily unavailable.",
    );
    this.name = "PortalDataError";
    this.code = code;
    if (upstream !== undefined) this.upstream = Object.freeze({ ...upstream });
  }
}
