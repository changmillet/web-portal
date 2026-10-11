import type { PortalDataBrandScope } from "./data-brands";

export type CatalogCoverage = Readonly<{ region: number; source: number; asOf: string }>;

// Production read-only facet snapshot, 2026-10-11. See docs/design-plan.md (#145).
// Keyed by data scope, never by presentation brand. Unknown scopes do not borrow counts.
const snapshots: Readonly<Record<string, CatalogCoverage>> = {
  "portal-display-scope.v1:tiangong_lca": { region: 154, source: 35, asOf: "2026-10-11" },
  "portal-display-scope.v1:bafu,tiangong_lca,uslci,worldsteel": {
    region: 226,
    source: 38,
    asOf: "2026-10-11",
  },
};

export function catalogCoverage(scope: PortalDataBrandScope): CatalogCoverage | null {
  return snapshots[scope.identity] ?? null;
}
