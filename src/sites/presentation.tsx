"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteId } from "./config";

const PresentationContext = createContext<SiteId>("tiangong");

/** Deployment-owned identity, also injectable into isolated component stories.
 * @import import { PresentationProvider } from "@/sites/presentation";
 */
export function PresentationProvider({ site, children }: { site: SiteId; children: ReactNode }) {
  return <PresentationContext value={site}>{children}</PresentationContext>;
}

export function usePresentation() {
  return useContext(PresentationContext);
}
