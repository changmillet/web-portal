import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import {
  SearchModeControl,
  SearchModeSection,
  SearchModes,
  CatalogSearchHeading,
} from "../../src/features/catalog/search-modes";
import { HybridSearchPanel } from "../../src/features/catalog/hybrid-search-panel";
import { KeywordSearchForm } from "../../src/features/catalog/keyword-search-form";
import { CatalogSearchInput } from "../../src/features/catalog/catalog-search-input";
import { CatalogSearchEntry } from "../../src/components/brand/catalog-search-entry";
import { SavedDatasetsLink } from "../../src/features/collections/saved-datasets";
import { dictionaries, mobileGlobals, resultLabels, storyLocale } from "../fixtures";
import { hybridVersionPage } from "../../tests/fixtures/portal/hybrid-v2";

const meta = {
  component: SearchModes,
  subcomponents: {
    SearchModeControl,
    SearchModeSection,
    SavedDatasetsLink,
    CatalogSearchHeading,
    HybridSearchPanel,
    CatalogSearchInput,
    KeywordSearchForm,
    CatalogSearchEntry,
  },
  title: "Catalog/Search modes",
  tags: ["!autodocs"],
  parameters: {
    pageLayout: true,
    msw: [
      http.post("*/internal/hybrid", () =>
        HttpResponse.json({
          ...hybridVersionPage(),
          schemaVersion: "portal.hybrid-bff.v2",
          mode: "hybrid",
          fallbackReason: null,
        }),
      ),
      http.post("*/internal/hybrid/lexical", () => HttpResponse.json({}, { status: 503 })),
    ],
  },
  loaders: [
    async ({ globals }) => ({
      browse: await CatalogSearchEntry({
        locale: storyLocale(globals),
        browseOnly: true,
        counts: { process: 2, flow: 1 },
        coverage: { region: 154, source: 1, asOf: "2026-10-13" },
      }),
    }),
  ],
  render: (_, { globals, loaded }) => {
    const locale = storyLocale(globals);
    const m = dictionaries[locale];
    return (
      <main className="brand-home catalog-search-page catalog-search-initial" lang={locale}>
        <div className="brand-container catalog-search-content">
          <CatalogSearchHeading
            title={m.CatalogReference.catalog}
            description={m.Search.workspaceDescription}
            actions={<SavedDatasetsLink />}
          />
          <SearchModes
            labels={{
              smartMatch: m.Search.smartMatch,
              smartMatchOnHint: m.Search.smartMatchOnHint,
              smartMatchOffHint: m.Search.smartMatchOffHint,
            }}
            help={{ keyword: m.Search.keywordHelp, description: m.Hybrid.privacy }}
            browse={loaded.browse}
            keyword={
              <SearchModeSection mode="keyword" area="input">
                <search className="brand-search catalog-results-query">
                  <KeywordSearchForm action={`/${locale}/search`}>
                    <input name="v" type="hidden" value="1" />
                    <input name="kind" type="hidden" value="process" />
                    <label className="sr-only" htmlFor="storybook-keyword">
                      {m.Search.label}
                    </label>
                    <CatalogSearchInput
                      id="storybook-keyword"
                      name="q"
                      placeholder={m.Search.placeholder}
                      submitLabel={m.Search.submit}
                      clearLabel={m.Common.clear}
                    />
                  </KeywordSearchForm>
                </search>
              </SearchModeSection>
            }
            description={
              <HybridSearchPanel
                initialKind="process"
                initialFilters={{}}
                labels={m.Hybrid}
                locale={locale}
                resultLabels={resultLabels(locale)}
                siteOrigin="https://portal.example"
              />
            }
          />
        </div>
      </main>
    );
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<Omit<typeof meta, "component">>;
export const Keyword: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const m = dictionaries[storyLocale(globals)];
    await expect(canvas.getByRole("button", { name: m.Search.smartMatch })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.hover(canvas.getByRole("button", { name: m.Search.smartMatch }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("tooltip")).toHaveTextContent(m.Search.smartMatchOnHint);
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("button", { name: m.Search.smartMatch })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await userEvent.unhover(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await userEvent.hover(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(await body.findByRole("tooltip")).toHaveTextContent(m.Search.smartMatchOffHint);
    await userEvent.unhover(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("button", { name: m.Hybrid.process })).toBeVisible();
    await expect(canvas.getByRole("button", { name: m.Search.facets })).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: m.Hybrid.shareQuery }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole("navigation", { name: m.Home.browseTitle })).toBeVisible();
  },
};
export const Description: Story = {
  play: async (context) => {
    await Keyword.play?.(context);
    const { canvas, canvasElement, userEvent, globals } = context;
    const m = dictionaries[storyLocale(globals)];
    const metric = () =>
      [".catalog-query-control", ".catalog-workspace-controls", ".catalog-workspace-browse"].map(
        (selector) => {
          const node = [...canvasElement.querySelectorAll(selector)].find(
            (node) => node.getBoundingClientRect().height > 0,
          )!;
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        },
      );
    const before = metric();
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel })).toBeVisible();
    await expect(metric()).toEqual(before);
    await expect(canvas.getByRole("button", { name: m.Search.smartMatch })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
export const DraftsAndFilters: Story = {
  play: async (context) => {
    await Keyword.play?.(context);
    const { canvas, userEvent, globals } = context;
    const m = dictionaries[storyLocale(globals)];
    await userEvent.type(canvas.getByRole("searchbox", { name: m.Search.label }), "steel");
    await userEvent.click(canvas.getByRole("button", { name: m.Hybrid.flow }));
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("button", { name: m.Hybrid.flow })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel })).toHaveValue("steel");
    await userEvent.clear(canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel }));
    await userEvent.type(
      canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel }),
      "Electricity in China",
    );
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("searchbox", { name: m.Search.label })).toHaveValue(
      "Electricity in China",
    );
    await expect(canvas.getByRole("button", { name: m.Hybrid.flow })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
export const Results: Story = {
  globals: { locale: "en" },
  play: async (context) => {
    await Description.play?.(context);
    const { canvas, userEvent, globals } = context;
    const m = dictionaries[storyLocale(globals)];
    await userEvent.type(
      canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel }),
      "Electricity in China",
    );
    await userEvent.click(canvas.getByRole("button", { name: m.Search.submit }));
    await expect(await canvas.findByRole("heading", { name: m.Hybrid.resultsTitle })).toBeVisible();
    await expect(canvas.getByRole("button", { name: m.Hybrid.shareQuery })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
    await expect(canvas.getByRole("heading", { name: m.Hybrid.resultsTitle })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: m.Search.smartMatch }));
  },
};
export const PendingChanges: Story = {
  globals: { locale: "en" },
  play: async (context) => {
    await Results.play?.(context);
    const m = dictionaries[storyLocale(context.globals)];
    await context.userEvent.type(
      context.canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel }),
      " in 2022",
    );
    await expect(context.canvas.getByText(m.Search.pendingTitle)).toBeVisible();
  },
};
export const MobileFrench: Story = { ...Description, globals: { ...mobileGlobals, locale: "fr" } };
export const GermanDark: Story = {
  ...Description,
  globals: { ...mobileGlobals, locale: "de", theme: "dark" },
};
export const AtlasDescription: Story = { ...Description, globals: { site: "atlas", locale: "en" } };
