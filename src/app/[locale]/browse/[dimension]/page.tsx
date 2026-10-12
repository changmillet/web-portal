import SearchPage from "../../search/page";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { isPortalLocale, localePath } from "@/i18n/routing";
import { localizedMetadata } from "@/lib/seo";

const dimensions = ["process", "flow", "region"] as const;
type Dimension = (typeof dimensions)[number];

function isDimension(value: string): value is Dimension {
  return dimensions.some((dimension) => dimension === value);
}

export function generateStaticParams() {
  return dimensions.map((dimension) => ({ dimension }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ dimension: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { dimension, locale } = await params;
  if (!isPortalLocale(locale) || !isDimension(dimension)) return {};
  const t = await getTranslations({ locale, namespace: "Browse" });
  return localizedMetadata({
    description: t(
      dimension === "process" || dimension === "flow" ? "catalogDescription" : "description",
    ),
    index: Object.keys(await searchParams).length === 0,
    locale,
    path: `browse/${dimension}`,
    title: t(`${dimension}Title`),
  });
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ dimension: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dimension, locale } = await params;
  if (!isPortalLocale(locale)) notFound();
  if (dimension === "source") redirect(`${localePath(locale, "search")}?v=1`);
  if (!isDimension(dimension)) notFound();
  setRequestLocale(locale);
  return (
    <SearchPage
      params={Promise.resolve({ locale })}
      browseKind={dimension === "flow" ? "flow" : "process"}
      searchParams={Promise.resolve({
        ...(await searchParams),
        v: "1",
        ...(dimension === "region" ? { explore: "region" } : { kind: dimension }),
      })}
    />
  );
}
