import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { cleanup, fireEvent, render as renderBase, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationBranchesFixture } from "../../scripts/portal-navigation-fixture";
import type {
  getPublicNavigationBranches,
  getPublicCatalogTotals,
  searchPublicBrowse,
  getPublicBrowseFacets,
} from "@/server/data/navigation";
import { publicNavigationBranchesSchema } from "@/server/contracts/navigation";
import catalogFixture from "../fixtures/portal/catalog-v1.json";
import enMessages from "../../src/i18n/messages/en.json";
import type {
  getPublicFacets,
  searchPublicFlows,
  searchPublicProcesses,
} from "@/server/data/catalog";
import { publicFacetsSchema, publicSearchPageSchema } from "@/server/contracts/portal";

type Translator = (key: string, values?: Record<string, string | number>) => string;

const catalogMocks = vi.hoisted(() => ({
  searchPublicProcesses: vi.fn<typeof searchPublicProcesses>(),
  searchPublicFlows: vi.fn<typeof searchPublicFlows>(),
  getPublicFacets: vi.fn<typeof getPublicFacets>(),
}));

const navigationMocks = vi.hoisted(() => ({
  getPublicNavigationBranches: vi.fn<typeof getPublicNavigationBranches>(),
  getPublicCatalogTotals: vi.fn<typeof getPublicCatalogTotals>(),
  searchPublicBrowse: vi.fn<typeof searchPublicBrowse>(),
  getPublicBrowseFacets: vi.fn<typeof getPublicBrowseFacets>(),
}));
vi.mock("@/server/data/navigation", () => navigationMocks);

const getTranslations = vi.hoisted(() =>
  vi.fn<(options: { locale?: string; namespace: string }) => Promise<Translator>>(),
);

vi.mock("@/server/data/catalog", () => catalogMocks);
vi.mock("next-intl/server", () => ({
  getTranslations,
  setRequestLocale: vi.fn<(locale: string) => void>(),
}));
const routerPush = vi.hoisted(() => vi.fn<(href: string, options?: { scroll: boolean }) => void>());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  notFound: vi.fn<() => never>(),
}));
vi.mock("@/features/catalog/hybrid-search-panel", () => ({
  HybridSearchPanel: () => <div data-testid="hybrid-panel-stub" />,
}));

vi.mock("@/features/catalog/region-explorer", () => ({
  RegionExplorer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/brand/catalog-search-entry", () => ({
  CatalogSearchEntry: () => <h1>Initial catalog entry</h1>,
}));
import SearchPage from "@/app/[locale]/search/page";
import { PortalDataError } from "@/server/data/supabase-rpc";

const searchDictionary = enMessages.Search;

function translator(namespace: string) {
  return (key: string, values?: Record<string, string | number>) => {
    const value = (enMessages as Record<string, Record<string, unknown>>)[namespace]?.[key];
    const template = typeof value === "string" ? value : key;
    if (!values) return template;
    return template.replace(/\{(\w+)\}/gu, (_match, name: string) =>
      String(values[name] ?? `{${name}}`),
    );
  };
}

type SearchPageParams = Record<string, string | string[] | undefined>;

function getSidebar() {
  if (!screen.queryByRole("dialog", { name: "Refine results" }))
    fireEvent.click(screen.getByRole("button", { name: "Refine results" }));
  return screen.getByRole("dialog", { name: "Refine results" });
}

async function renderSearchPage(searchParams: SearchPageParams) {
  const element = await SearchPage({
    params: Promise.resolve({ locale: "en" }),
    searchParams: Promise.resolve(searchParams),
  });
  return render(element);
}

describe("Search page sidebar state (Portal #46)", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.getPublicNavigationBranches.mockRejectedValue(
      new PortalDataError("upstream_unavailable"),
    );
    navigationMocks.getPublicCatalogTotals.mockRejectedValue(
      new PortalDataError("upstream_unavailable"),
    );
    getTranslations.mockImplementation(async ({ namespace }: { namespace: string }) =>
      translator(namespace),
    );
  });

  it("empty entry reads only totals and keeps its prompt if they are unavailable", async () => {
    await renderSearchPage({});

    expect(navigationMocks.getPublicNavigationBranches).not.toHaveBeenCalled();
    expect(navigationMocks.getPublicCatalogTotals).toHaveBeenCalledTimes(1);
    expect(catalogMocks.searchPublicProcesses).not.toHaveBeenCalled();
    expect(catalogMocks.searchPublicFlows).not.toHaveBeenCalled();
    expect(catalogMocks.getPublicFacets).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Initial catalog entry" })).toBeInTheDocument();
    expect(screen.queryByText(searchDictionary.unavailableDescription)).not.toBeInTheDocument();
  });

  it("a real backend failure on a submitted query still reports the unavailable state", async () => {
    catalogMocks.searchPublicProcesses.mockRejectedValue(
      new PortalDataError("upstream_unavailable"),
    );
    catalogMocks.getPublicFacets.mockRejectedValue(new PortalDataError("upstream_unavailable"));

    await renderSearchPage({ v: "1", kind: "process", q: "electricity", refine: "1" });

    expect(catalogMocks.searchPublicProcesses).toHaveBeenCalledTimes(1);
    expect(catalogMocks.searchPublicFlows).not.toHaveBeenCalled();
    expect(catalogMocks.getPublicFacets).toHaveBeenCalledTimes(1);

    expect(screen.getByText(searchDictionary.unavailableDescription)).toBeInTheDocument();
  });

  it("does not read facets while the drawer is closed", async () => {
    catalogMocks.searchPublicProcesses.mockResolvedValue(
      publicSearchPageSchema.parse(catalogFixture.search),
    );
    await renderSearchPage({ v: "1", kind: "process", q: "electricity" });
    expect(catalogMocks.searchPublicProcesses).toHaveBeenCalledTimes(1);
    expect(catalogMocks.getPublicFacets).not.toHaveBeenCalled();
    expect(navigationMocks.getPublicCatalogTotals).not.toHaveBeenCalled();
    expect(navigationMocks.getPublicNavigationBranches).toHaveBeenCalledTimes(1);
  });

  it("keeps successful rows and pagination when requested facets fail", async () => {
    catalogMocks.searchPublicProcesses.mockResolvedValue(
      publicSearchPageSchema.parse({ ...catalogFixture.search, nextCursor: "next_page" }),
    );
    catalogMocks.getPublicFacets.mockRejectedValue(new PortalDataError("upstream_unavailable"));
    await renderSearchPage({ v: "1", kind: "process", q: "electricity", refine: "1" });
    const sidebar = getSidebar();
    expect(within(sidebar).getByText(searchDictionary.filtersUnavailable)).toBeInTheDocument();
    expect(screen.queryByText(searchDictionary.unavailableDescription)).not.toBeInTheDocument();
    expect(document.querySelector('a[href*="cursor=next_page"]')).not.toBeNull();
    expect(
      document.querySelector('a[href*="11111111-1111-1111-1111-111111111111"]'),
    ).not.toBeNull();
  });

  it("does not read facets when Region navigation succeeds", async () => {
    navigationMocks.getPublicNavigationBranches.mockResolvedValue(
      publicNavigationBranchesSchema.parse(
        navigationBranchesFixture({
          p_kind: "process",
          p_dimension: "geography",
          p_parent_node_id: null,
        }),
      ),
    );
    await renderSearchPage({ v: "1", explore: "region" });
    expect(catalogMocks.getPublicFacets).not.toHaveBeenCalled();
    expect(catalogMocks.searchPublicProcesses).not.toHaveBeenCalled();
  });

  it("reads facet fallback when Region navigation fails", async () => {
    catalogMocks.getPublicFacets.mockResolvedValue(
      publicFacetsSchema.parse({ ...catalogFixture.facets, kind: "process" }),
    );
    await renderSearchPage({ v: "1", explore: "region" });
    expect(catalogMocks.getPublicFacets).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(searchDictionary.unavailableDescription)).not.toBeInTheDocument();
  });

  it("preserves hierarchy and pagination when requesting refinement", async () => {
    navigationMocks.searchPublicBrowse.mockResolvedValue(
      publicSearchPageSchema.parse(catalogFixture.search),
    );
    await renderSearchPage({
      v: "1",
      kind: "process",
      q: "electricity",
      sort: "name_asc",
      classNode: "class:isic",
      classScope: "subtree",
      cursor: "result_page",
      navCursor: "branch_page",
      pageTrail: "~",
    });
    expect(navigationMocks.getPublicBrowseFacets).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Refine results" }));
    expect(routerPush).toHaveBeenCalledOnce();
    const [href, options] = routerPush.mock.calls[0]!;
    const params = new URL(href, "https://portal.example").searchParams;
    expect(Object.fromEntries(params)).toMatchObject({
      q: "electricity",
      sort: "name_asc",
      classNode: "class:isic",
      classScope: "subtree",
      cursor: "result_page",
      navCursor: "branch_page",
      pageTrail: "~",
      refine: "1",
    });
    expect(options).toEqual({ scroll: false });
  });

  it("keeps requested facets when Search fails", async () => {
    catalogMocks.searchPublicProcesses.mockRejectedValue(
      new PortalDataError("upstream_unavailable"),
    );
    catalogMocks.getPublicFacets.mockResolvedValue(
      publicFacetsSchema.parse({ ...catalogFixture.facets, kind: "process" }),
    );
    await renderSearchPage({ v: "1", kind: "process", q: "electricity", refine: "1" });
    expect(screen.getByText(searchDictionary.unavailableDescription)).toBeInTheDocument();
    expect(within(getSidebar()).getByRole("link", { name: "Process (1)" })).toBeInTheDocument();
  });

  it("reports Region unavailable when both navigation and fallback fail", async () => {
    catalogMocks.getPublicFacets.mockRejectedValue(new PortalDataError("upstream_unavailable"));
    await renderSearchPage({ v: "1", explore: "region" });
    expect(screen.getByText(searchDictionary.unavailableDescription)).toBeInTheDocument();
  });

  it("does not suppress unexpected facet errors", async () => {
    catalogMocks.searchPublicProcesses.mockResolvedValue(
      publicSearchPageSchema.parse(catalogFixture.search),
    );
    catalogMocks.getPublicFacets.mockRejectedValue(new Error("unexpected"));
    await expect(
      renderSearchPage({ v: "1", kind: "process", q: "electricity", refine: "1" }),
    ).rejects.toThrow("unexpected");
  });

  it("a successful query keeps facets and the facet description", async () => {
    catalogMocks.searchPublicProcesses.mockResolvedValue(
      publicSearchPageSchema.parse(catalogFixture.search),
    );
    catalogMocks.getPublicFacets.mockResolvedValue(
      publicFacetsSchema.parse({ ...catalogFixture.facets, kind: "process" }),
    );

    await renderSearchPage({ v: "1", kind: "process", q: "electricity", refine: "1" });

    const sidebar = getSidebar();
    expect(
      within(sidebar).getAllByText(searchDictionary.filtersDescription)[0],
    ).toBeInTheDocument();
    expect(
      within(sidebar).queryByText(searchDictionary.unavailableDescription),
    ).not.toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: "Process (1)" })).toBeInTheDocument();
  });

  it("executes an explicit geography-only query and preserves the filter in keyword submission", async () => {
    catalogMocks.searchPublicProcesses.mockResolvedValue(
      publicSearchPageSchema.parse(fixtureSearch()),
    );
    catalogMocks.getPublicFacets.mockResolvedValue(
      publicFacetsSchema.parse({ ...catalogFixture.facets, kind: "process" }),
    );
    await renderSearchPage({ v: "1", kind: "process", geo: "cn" });
    expect(catalogMocks.searchPublicProcesses).toHaveBeenCalledWith(
      expect.objectContaining({ query: "", filters: { geography: "cn" } }),
      undefined,
      { cache: "short-public" },
    );
    expect(
      screen.getByRole("heading", { name: enMessages.CatalogReference.catalog, level: 1 }),
    ).toBeInTheDocument();
    expect(document.querySelector('input[name="geo"]')).toHaveValue("cn");
  });
});

function fixtureSearch() {
  return catalogFixture.search;
}

function render(node: ReactNode) {
  return renderBase(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {node}
    </NextIntlClientProvider>,
  );
}
