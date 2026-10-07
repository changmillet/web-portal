import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { detailSubpageDescription } from "@/features/catalog/detail-metadata";
import en from "@/i18n/messages/en.json";
import de from "@/i18n/messages/de.json";
import fr from "@/i18n/messages/fr.json";
import zh from "@/i18n/messages/zh-CN.json";
import { locales, type PortalLocale } from "@/i18n/routing";
import { publicDatasetEnvelopeSchema, type PublicDatasetEnvelope } from "@/server/contracts/portal";
import fixture from "../fixtures/portal/catalog-v1.json";

const resolveDataset = vi.hoisted(() =>
  vi.fn<(kind: "process" | "flow") => Promise<PublicDatasetEnvelope>>(),
);
const dictionaries = { en, de, fr, "zh-CN": zh };

vi.mock("@/features/catalog/resolve-public-dataset", () => ({
  resolvePublicDataset: resolveDataset,
}));
vi.mock("@/server/data/catalog", () => ({
  listPublicProcessExchanges: vi.fn<() => void>(),
  listPublicDatasetVersions: vi.fn<() => void>(),
}));
vi.mock("@/server/lcia/client", () => ({ queryPublishedLcia: vi.fn<() => void>() }));
vi.mock("next-intl/server", () => ({
  getTranslations:
    async ({ locale }: { locale: PortalLocale }) =>
    (key: keyof typeof en.Detail) =>
      dictionaries[locale].Detail[key],
}));

import { generateMetadata as method } from "@/app/[locale]/process/[ref]/method/page";
import { generateMetadata as exchanges } from "@/app/[locale]/process/[ref]/exchanges/page";
import { generateMetadata as lcia } from "@/app/[locale]/process/[ref]/lcia/page";
import { generateMetadata as quality } from "@/app/[locale]/process/[ref]/quality/page";
import { generateMetadata as provenance } from "@/app/[locale]/process/[ref]/provenance/page";
import { generateMetadata as processVersions } from "@/app/[locale]/process/[ref]/versions/page";
import { generateMetadata as flowVersions } from "@/app/[locale]/flow/[ref]/versions/page";

function dataset(kind: "process" | "flow" = "process"): PublicDatasetEnvelope {
  return publicDatasetEnvelopeSchema.parse(
    kind === "process" ? fixture.datasetProcess : fixture.datasetFlow,
  );
}

function description(record: PublicDatasetEnvelope, locale: PortalLocale = "en"): string {
  const t = dictionaries[locale].Detail;
  return detailSubpageDescription({
    dataset: record,
    description: t.methodDescription,
    locale,
    title: t.methodTitle,
    versionLabel: t.currentVersion,
  });
}

afterEach(() => vi.unstubAllEnvs());

describe("authored identity in detail descriptions", () => {
  for (const locale of locales) {
    it(`uses the actual localized name and version in ${locale}`, () => {
      const record = dataset();
      record.metadata.names = locales.map((language) => ({
        language,
        value: `Name for ${language}`,
      }));
      const text = description(record, locale);

      expect(text).toContain(`Name for ${locale}`);
      expect(text).toContain(`${dictionaries[locale].Detail.currentVersion}: 01.00.000`);
      expect(text).toContain(dictionaries[locale].Detail.methodTitle);
      expect(text).toContain(dictionaries[locale].Detail.methodDescription);
      expect(text).not.toContain(record.key.id);
    });
  }

  it("preserves the marked authored-language fallback", () => {
    const record = dataset();
    record.metadata.names = [{ language: "en", value: "Electricity" }];

    expect(description(record, "fr")).toContain("Electricity [en]");
    expect(description(record, "fr")).toContain(fr.Detail.methodDescription);
  });

  it("keeps same-language regional names unmarked and undetermined names unchanged", () => {
    const record = dataset();
    record.metadata.names = [{ language: "en-GB", value: "Electricity" }];
    expect(description(record)).toContain(" · Electricity · ");
    record.metadata.names = [{ language: "und", value: "Authored name" }];
    expect(description(record, "de")).toContain(" · Authored name · ");
    expect(description(record, "de")).not.toContain("[und]");
  });

  it("omits missing or blank names instead of manufacturing identity from a UUID", () => {
    const record = dataset();
    for (const names of [[], [{ language: "en", value: " \n\t " }]]) {
      record.metadata.names = names;
      expect(description(record)).toBe(
        `${en.Detail.methodTitle} · ${en.Detail.currentVersion}: 01.00.000. ${en.Detail.methodDescription}`,
      );
      expect(description(record)).not.toContain(record.key.id);
      expect(description(record)).not.toContain("undefined");
    }
  });

  it("distinguishes names and exact versions without changing authored values", () => {
    const first = dataset();
    const second = dataset();
    second.metadata.names = [{ language: "en", value: "Different process" }];
    expect(description(second)).not.toBe(description(first));
    const nextVersion = dataset();
    nextVersion.key.version = "01.01.000";
    expect(description(nextVersion)).not.toBe(description(first));
    expect(description(nextVersion)).toContain("01.01.000");
  });
});

describe("detail route metadata integration", () => {
  beforeEach(() => {
    vi.stubEnv("PORTAL_PUBLIC_INDEXING", "enabled");
    vi.stubEnv("SITE_URL", "https://portal.example");
    resolveDataset.mockImplementation(async (kind: "process" | "flow") => dataset(kind));
  });

  const pages = [
    ["process", "method", method],
    ["process", "exchanges", exchanges],
    ["process", "lcia", lcia],
    ["process", "quality", quality],
    ["process", "provenance", provenance],
    ["process", "versions", processVersions],
    ["flow", "versions", flowVersions],
  ] as const;

  for (const [kind, tab, generate] of pages) {
    it(`describes ${kind}/${tab} while preserving its canonical, alternates and robots`, async () => {
      for (const locale of locales) {
        const record = dataset(kind);
        const ref = `${record.key.id}@${record.key.version}`;
        const page = await generate({
          params: Promise.resolve({ locale, ref }),
          searchParams: Promise.resolve({}),
        });

        expect(page.description).toContain(dictionaries[locale].Detail.currentVersion);
        expect(page.description).toContain(record.key.version);
        expect(page.description).not.toContain(record.key.id);
        expect(page.openGraph?.description).toBe(page.description);
        expect(page.alternates?.canonical).toBe(`/${locale}/${kind}/${ref}/${tab}`);
        expect(page.alternates?.languages).toEqual({
          "zh-CN": `/zh-CN/${kind}/${ref}/${tab}`,
          en: `/en/${kind}/${ref}/${tab}`,
          de: `/de/${kind}/${ref}/${tab}`,
          fr: `/fr/${kind}/${ref}/${tab}`,
          "x-default": `/zh-CN/${kind}/${ref}/${tab}`,
        });
        expect(page.robots).toEqual({ index: true, follow: true });
      }
    });
  }

  it("describes known unavailable capabilities without promising amounts or results", async () => {
    const record = dataset();
    record.capabilities.exchangesVisible = false;
    record.capabilities.lciaVisible = false;
    resolveDataset.mockResolvedValue(record);
    const props = {
      params: Promise.resolve({ locale: "en", ref: `${record.key.id}@${record.key.version}` }),
      searchParams: Promise.resolve({}),
    };
    const inputs = await exchanges(props);
    const impacts = await lcia(props);

    expect(inputs.description).toContain(en.Detail.exchangesEmpty);
    expect(inputs.description).not.toContain(en.Detail.exchangesDescription);
    expect(impacts.description).toContain(en.Detail.lciaUnavailable);
    expect(impacts.description).not.toContain(en.Detail.lciaDescription);
    expect(inputs.robots).toEqual({ index: true, follow: true });
    expect(impacts.robots).toEqual({ index: true, follow: true });
  });

  it("preserves cursor and global indexing exclusions", async () => {
    const record = dataset();
    const params = Promise.resolve({ locale: "en", ref: `${record.key.id}@${record.key.version}` });
    for (const generate of [exchanges, lcia, processVersions]) {
      const page = await generate({ params, searchParams: Promise.resolve({ cursor: "opaque" }) });
      expect(page.robots).toEqual({ index: false, follow: true });
    }
    vi.stubEnv("PORTAL_PUBLIC_INDEXING", "disabled");
    expect((await method({ params, searchParams: Promise.resolve({}) })).robots).toEqual({
      index: false,
      follow: true,
    });
  });
});
