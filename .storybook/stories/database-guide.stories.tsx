import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { DatabaseGuide } from "@/features/catalog/database-guide";
import { localePath } from "@/i18n/routing";
import { publicResources } from "@/lib/public-resources";
import { publicCatalogSummarySchema } from "@/server/contracts/portal";
import fixture from "../../tests/fixtures/portal/catalog-v1.json";
import { dictionaries, mobileGlobals, storyLocale } from "../fixtures";

const summary = publicCatalogSummarySchema.parse(fixture.catalogSummary);
const meta = {
  title: "Catalog/LCA database",
  component: DatabaseGuide,
  tags: ["!autodocs"],
  parameters: { pageLayout: true },
  args: {
    locale: "zh-CN",
    labels: dictionaries["zh-CN"].DatabaseGuide,
    common: dictionaries["zh-CN"].Common,
    summary,
  },
  render: (args, { globals }) => {
    const locale = storyLocale(globals);
    return (
      <DatabaseGuide
        {...args}
        locale={locale}
        labels={dictionaries[locale].DatabaseGuide}
        common={dictionaries[locale].Common}
      />
    );
  },
  play: async ({ canvas, canvasElement, globals }) => {
    const locale = storyLocale(globals);
    const labels = dictionaries[locale].DatabaseGuide;
    await expect(canvas.getByRole("heading", { level: 1, name: labels.title })).toBeVisible();
    await expect(canvas.getByRole("link", { name: labels.processAction })).toHaveAttribute(
      "href",
      localePath(locale, "browse/process"),
    );
    await expect(canvas.getByRole("link", { name: labels.guideAction })).toHaveAttribute(
      "href",
      publicResources(locale).dataGuide,
    );
    await expect(canvas.getByRole("link", { name: labels.distributionAction })).toHaveAttribute(
      "href",
      "https://lcdn.tiangong.earth/",
    );
    await expect(canvasElement.querySelectorAll("main")).toHaveLength(1);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
  },
} satisfies Meta<typeof DatabaseGuide>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Chinese: Story = {};
export const English: Story = { globals: { locale: "en" } };
export const GermanMobile: Story = { globals: { ...mobileGlobals, locale: "de" } };
export const FrenchDark: Story = { globals: { ...mobileGlobals, locale: "fr", theme: "dark" } };
export const UnavailableCounts: Story = {
  args: { summary: null },
  play: async (context) => {
    await meta.play(context);
    await expect(
      context.canvas.getByText(
        dictionaries[storyLocale(context.globals)].DatabaseGuide.countsUnavailable,
      ),
    ).toBeVisible();
  },
};
