import { createWithdrawalFeedResponse } from "@/server/search-notifications/withdrawal-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: Request): Promise<Response> {
  return createWithdrawalFeedResponse(request);
}

export function HEAD(request: Request): Promise<Response> {
  return createWithdrawalFeedResponse(request);
}
