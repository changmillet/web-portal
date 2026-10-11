import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { AtlasInformationPage } from "@/sites/atlas/information-page";
import { AtlasHeader, AtlasFooter } from "@/sites/atlas/shell";
import { atlasInformation, lifeCycleInitiativeUrl } from "@/sites/atlas/information";
import { MethodologyOverview } from "@/features/catalog/methodology-overview";
import { DatabaseGuide } from "@/features/catalog/database-guide";
import { siteMessages } from "@/sites/messages";
import { dictionaries, storyLocale } from "../fixtures";

const meta = {
  title: "Brand/Atlas information",
  component: AtlasInformationPage,
  subcomponents: { MethodologyOverview, DatabaseGuide },
  tags: ["!autodocs"],
  args: { locale: "en", page: "team" },
  globals: { site: "atlas", locale: "en", viewport: { value: "desktop", isRotated: false } },
  parameters: { pageLayout: true },
  beforeEach({ args, globals, parameters }) {
    usePathname.mockReturnValue(
      `/${storyLocale(globals)}/${parameters.informationPage ?? args.page}`,
    );
    return () => usePathname.mockReset();
  },
  loaders: [
    async ({ globals }) => {
      const locale = storyLocale(globals);
      return { header: await AtlasHeader({ locale }), footer: await AtlasFooter({ locale }) };
    },
  ],
  render: (args, { loaded, globals, parameters }) => {
    const locale = storyLocale(globals);
    const messages = siteMessages(dictionaries[locale], locale, "atlas");
    return (
      <>
        {loaded.header}
        {parameters.informationPage === "methodology" ? (
          <MethodologyOverview labels={messages.Methodology} />
        ) : parameters.informationPage === "lca-database" ? (
          <DatabaseGuide
            site="atlas"
            locale={locale}
            labels={messages.DatabaseGuide}
            common={messages.Common}
            summary={null}
          />
        ) : (
          <AtlasInformationPage {...args} locale={locale} />
        )}
        {loaded.footer}
      </>
    );
  },
  play: async ({ canvas, canvasElement, globals }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvasElement.textContent).not.toMatch(/tiangong|天工|\bGLAD\b/i);
    await expect(
      canvasElement.querySelectorAll('a[href*="tiangong"], a[href^="mailto:"], img[src*="team"]'),
    ).toHaveLength(0);
    await expect(
      canvas.getByRole("link", { name: atlasInformation[storyLocale(globals)].aboutLabel }),
    ).toHaveAttribute("href", `/${storyLocale(globals)}/team`);
    await expect(
      canvas.getByRole("link", { name: /UNEP · Life Cycle Initiative/ }),
    ).toHaveAttribute("href", lifeCycleInitiativeUrl);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
  },
} satisfies Meta<typeof AtlasInformationPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const About: Story = {};
export const AboutChinese: Story = { globals: { locale: "zh-CN" } };
export const AboutMobileGerman: Story = {
  globals: { locale: "de", viewport: { value: "mobile", isRotated: false } },
};
export const AboutDarkFrench: Story = { globals: { locale: "fr", theme: "dark" } };
export const Community: Story = { args: { page: "community" } };
export const CommunityMobileChinese: Story = {
  args: { page: "community" },
  globals: { locale: "zh-CN", viewport: { value: "mobile", isRotated: false } },
};
export const CommunityDark: Story = { args: { page: "community" }, globals: { theme: "dark" } };
export const AboutData: Story = { parameters: { informationPage: "methodology" } };
export const AboutDataMobileFrench: Story = {
  parameters: { informationPage: "methodology" },
  globals: { locale: "fr", theme: "dark", viewport: { value: "mobile", isRotated: false } },
};
export const Database: Story = { parameters: { informationPage: "lca-database" } };
export const DatabaseMobileGerman: Story = {
  parameters: { informationPage: "lca-database" },
  globals: { locale: "de", viewport: { value: "mobile", isRotated: false } },
};
