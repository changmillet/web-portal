import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, spyOn } from "storybook/test";
import {
  SaveDataset,
  SavedDatasetsLink,
  notifySavedDatasetsChanged,
} from "@/features/collections/saved-datasets";
import { CatalogResultsToolbar } from "@/features/catalog/catalog-results-toolbar";
import { SearchResults } from "@/features/catalog/search-results";
import { collectionsStorageKey, emptyCollectionState } from "@/features/collections/storage";
import { collectionsStorageKeyV2, emptyCollectionStateV2 } from "@/features/collections/storage-v2";
import { catalogItems, dictionaries, mobileGlobals, resultLabels, storyLocale } from "../fixtures";

const meta = {
  title: "Catalog/Saved datasets",
  component: SaveDataset,
  args: {
    identity: { kind: catalogItems("en")[0]!.kind, ref: catalogItems("en")[0]!.ref },
    name: catalogItems("en")[0]!.name,
  },
  subcomponents: { SavedDatasetsLink: SavedDatasetsLink, CatalogResultsToolbar, SearchResults },
  tags: ["!autodocs"],
  beforeEach({ parameters }) {
    const prior = [collectionsStorageKey, collectionsStorageKeyV2].map(
      (key) => [key, localStorage.getItem(key)] as const,
    );
    prior.forEach(([key]) => localStorage.removeItem(key));
    if (parameters.legacy)
      localStorage.setItem(
        collectionsStorageKey,
        JSON.stringify({
          ...emptyCollectionState,
          researchName: "Existing study",
          members: [
            { ref: catalogItems("en")[0]!.ref, note: "Keep this note", status: "selected" },
          ],
        }),
      );
    if (parameters.corrupt) localStorage.setItem(collectionsStorageKeyV2, "{broken");
    if (parameters.populated || parameters.limit)
      localStorage.setItem(
        collectionsStorageKeyV2,
        JSON.stringify({
          ...emptyCollectionStateV2,
          members: parameters.limit
            ? Array.from({ length: 200 }, (_, index) => ({
                kind: "flow",
                ref: `33333333-3333-3333-3333-333333333333@01.00.${String(index).padStart(3, "0")}`,
                note: "",
                status: "candidate",
              }))
            : catalogItems("en")
                .slice(0, 2)
                .map((item) => ({ kind: item.kind, ref: item.ref, note: "", status: "candidate" })),
        }),
      );
    notifySavedDatasetsChanged();
    const failed = parameters.writeFailure
      ? spyOn(Storage.prototype, "setItem").mockImplementation(() => {
          throw new Error("quota");
        })
      : null;
    return () => {
      failed?.mockRestore();
      prior.forEach(([key, value]) =>
        value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value),
      );
      notifySavedDatasetsChanged();
    };
  },
  render: (_args, { globals }) => {
    const locale = storyLocale(globals);
    return (
      <section className="mx-auto w-full max-w-5xl p-4">
        <CatalogResultsToolbar
          title={dictionaries[locale].Common.catalog}
          titleId="saved-demo"
          actions={null}
        />
        <SearchResults
          items={catalogItems(locale)}
          labels={resultLabels(locale)}
          locale={locale}
          siteOrigin="https://portal.example"
        />
      </section>
    );
  },
} satisfies Meta<typeof SaveDataset>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SaveWhileBrowsing: Story = {
  globals: { locale: "en" },
  play: async ({ canvas, userEvent }) => {
    await expect(
      await canvas.findByRole("link", { name: "View saved datasets (0)" }),
    ).toBeVisible();
    const item = catalogItems("en")[0]!;
    const button = canvas.getByRole("button", { name: `Save: ${item.name}` });
    button.focus();
    await userEvent.keyboard(" ");
    await expect(await canvas.findByRole("link", { name: `Saved: ${item.name}` })).toHaveFocus();
    await expect(canvas.getByRole("link", { name: "View saved datasets (1)" })).toBeVisible();
  },
};
export const EmptyMobile: Story = { globals: mobileGlobals };
export const SavedAtlas: Story = {
  globals: { site: "atlas", locale: "en" },
  parameters: { populated: true },
};
export const SavedAtlasMobileDark: Story = {
  globals: { ...mobileGlobals, site: "atlas", locale: "de", theme: "dark" },
  parameters: { populated: true },
};
export const French: Story = { globals: { locale: "fr" }, parameters: { populated: true } };
export const LegacyAndOtherTab: Story = {
  globals: { locale: "en" },
  parameters: { legacy: true },
  play: async ({ canvas, userEvent }) => {
    await expect(
      await canvas.findByRole("link", { name: "View saved datasets (1)" }),
    ).toBeVisible();
    const legacy = localStorage.getItem(collectionsStorageKey);
    const item = catalogItems("en")[0]!;
    await userEvent.click(await canvas.findByRole("button", { name: `Save: ${item.name}` }));
    const state = JSON.parse(localStorage.getItem(collectionsStorageKeyV2)!);
    await expect(state.researchName).toBe("Existing study");
    await expect(state.members).toEqual([
      { kind: null, ref: item.ref, note: "Keep this note", status: "selected" },
      { kind: item.kind, ref: item.ref, note: "", status: "candidate" },
    ]);
    await expect(localStorage.getItem(collectionsStorageKey)).toBe(legacy);
    await expect(canvas.getByRole("link", { name: "View saved datasets (2)" })).toBeVisible();
    localStorage.setItem(collectionsStorageKeyV2, JSON.stringify(emptyCollectionStateV2));
    window.dispatchEvent(new StorageEvent("storage", { key: collectionsStorageKeyV2 }));
    await expect(
      await canvas.findByRole("link", { name: "View saved datasets (0)" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: `Save: ${item.name}` })).toBeVisible();
  },
};
export const CorruptStorage: Story = {
  globals: { locale: "en" },
  parameters: { corrupt: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: `Save: ${catalogItems("en")[0]!.name}` }),
    );
    await expect(canvas.getByText(dictionaries.en.SavedDatasets.failed)).toBeVisible();
    await expect(localStorage.getItem(collectionsStorageKeyV2)).toBe("{broken");
  },
};
export const WriteFailure: Story = {
  ...CorruptStorage,
  parameters: { writeFailure: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: `Save: ${catalogItems("en")[0]!.name}` }),
    );
    await expect(canvas.getByText(dictionaries.en.SavedDatasets.failed)).toBeVisible();
    await expect(canvas.getByRole("link", { name: "View saved datasets (0)" })).toBeVisible();
  },
};
export const AtCapacity: Story = {
  globals: { locale: "en" },
  parameters: { limit: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: `Save: ${catalogItems("en")[0]!.name}` }),
    );
    await expect(canvas.getByText(dictionaries.en.SavedDatasets.limit)).toBeVisible();
    await expect(canvas.getByRole("link", { name: "View saved datasets (200)" })).toBeVisible();
  },
};
