"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { functionalLinkRel } from "@/lib/catalog-crawl-policy";
import { PendingFeedback } from "./navigation-feedback";

function LinkFeedback() {
  const { pending } = useLinkStatus();
  return <PendingFeedback pending={pending} />;
}

/** Native Next links with local pending feedback; no prefetch, overlay or synthetic progress.
 * @import import { FeedbackLink } from "@/components/shell/feedback-link";
 */
export function FeedbackLink({ children, className, rel, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      rel={functionalLinkRel(props.href, rel)}
      prefetch={false}
      className={[className, "portal-feedback-link"].filter(Boolean).join(" ")}
    >
      {children}
      <LinkFeedback />
    </Link>
  );
}
