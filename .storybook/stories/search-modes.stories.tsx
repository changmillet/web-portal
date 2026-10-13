import { CatalogKindSwitch } from "../../src/features/catalog/catalog-kind-switch";
import { CatalogPagination } from "../../src/features/catalog/catalog-pagination";
import { CatalogResultsToolbar } from "../../src/features/catalog/catalog-results-toolbar";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { http, HttpResponse } from "msw";
import {
  SearchModeControl,
  SearchModeSection,
  SearchModes,
} from "../../src/features/catalog/search-modes";
import { HybridSearchPanel } from "../../src/features/catalog/hybrid-search-panel";
import { KeywordSearchForm } from "../../src/features/catalog/keyword-search-form";
import { Field, FieldLabel } from "../../src/components/ui/field";
import { CatalogSearchInput } from "../../src/features/catalog/catalog-search-input";
import { Button } from "../../src/components/ui/button";
import { dictionaries, mobileGlobals, resultLabels, storyLocale } from "../fixtures";

const meta = {
  component: SearchModes,
  subcomponents: {
    SearchModeControl,
    CatalogKindSwitch,
    CatalogPagination,
    CatalogResultsToolbar,
    Button,
    Field,
    FieldLabel,
    HybridSearchPanel,
    CatalogSearchInput,
    KeywordSearchForm,
  },
  title: "Catalog/Search modes",
  tags: ["!autodocs"],
  parameters: {
    msw: [
      http.post("*/internal/hybrid", () => HttpResponse.json({}, { status: 503 })),
      http.post("*/internal/hybrid/lexical", () => HttpResponse.json({}, { status: 503 })),
    ],
  },
  render: (_, { globals }) => {
    const locale = storyLocale(globals);
    const m = dictionaries[locale];
    return (
      <SearchModes
        labels={{
          mode: m.Search.searchMode,
          keyword: m.Search.keywordMode,
          description: m.Search.descriptionMode,
        }}
        keyword={
          <SearchModeSection mode="keyword" area="input">
            <KeywordSearchForm action={`/${locale}/search`}>
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
            <p className="catalog-input-help">{m.Search.keywordHelp}</p>
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
    );
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<Omit<typeof meta, "component">>;
export const Keyword: Story = {};
export const Description: Story = {
  play: async ({ canvas, userEvent, globals }) => {
    const m = dictionaries[storyLocale(globals)];
    const keyword = canvas.getByRole("searchbox", { name: m.Search.label });
    await userEvent.type(keyword, "steel");
    const keywordHeight = keyword
      .closest('[data-slot="input-group"]')!
      .getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: m.Search.descriptionMode }));
    const description = canvas.getByRole("searchbox", { name: m.Hybrid.queryLabel });
    await expect(description).toBeVisible();
    await expect(
      description.closest('[data-slot="input-group"]')!.getBoundingClientRect().height,
    ).toBe(keywordHeight);
    await userEvent.type(description, "Electricity in China");
    await userEvent.click(canvas.getByRole("button", { name: m.Search.keywordMode }));
    await expect(keyword).toHaveValue("steel");
    await userEvent.click(canvas.getByRole("button", { name: m.Search.descriptionMode }));
    await expect(description).toHaveValue("Electricity in China");
  },
};
export const MobileFrench: Story = { ...Description, globals: { ...mobileGlobals, locale: "fr" } };
