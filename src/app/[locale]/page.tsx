import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BrandHome } from "@/components/brand/brand-home";
import { isPortalLocale } from "@/i18n/routing";
import { localizedMetadata, portalWebsiteJsonLd } from "@/lib/seo";
import type { PublicCatalogSummary } from "@/server/contracts/portal";
import { getPublicCatalogSummary } from "@/server/data/catalog";
import { getPublicNavigation } from "@/server/data/navigation";
import { PortalDataError } from "@/server/data/supabase-rpc";

export const revalidate = 300;

async function readCatalogSummary(): Promise<PublicCatalogSummary | null> {
  try {
    return await getPublicCatalogSummary();
  } catch (error) {
    if (error instanceof PortalDataError) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPortalLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "BrandHome" });
  const title = t("metadataTitle");

  return {
    ...localizedMetadata({ locale, title, description: t("description") }),
    title: { absolute: title },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isPortalLocale(locale)) notFound();
  setRequestLocale(locale);
  const [summary, navigation] = await Promise.all([
    readCatalogSummary(),
    getPublicNavigation(
      {
        kind: "all",
        query: "",
        filters: {},
        dimension: "classification",
        limit: 1,
      },
      undefined,
      // This route is statically rendered: the coordinated read path issues a
      // `no-store` origin request, which would opt the page out of ISR.
      { boundary: "legacy" },
    ).catch((error: unknown) => {
      if (error instanceof PortalDataError) return null;
      throw error;
    }),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portalWebsiteJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <BrandHome locale={locale} summary={summary} counts={navigation?.totals ?? null} />
    </>
  );
}
