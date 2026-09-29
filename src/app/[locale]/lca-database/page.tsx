import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { DatabaseGuide } from "@/features/catalog/database-guide";
import { isPortalLocale } from "@/i18n/routing";
import { localizedMetadata } from "@/lib/seo";
import { getPublicCatalogSummary } from "@/server/data/catalog";
import { PortalDataError } from "@/server/data/supabase-rpc";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/lca-database">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPortalLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "DatabaseGuide" });
  return localizedMetadata({
    locale,
    path: "lca-database",
    title: t("title"),
    description: t("description"),
  });
}

export default async function DatabasePage({ params }: PageProps<"/[locale]/lca-database">) {
  const { locale } = await params;
  if (!isPortalLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const summary = await getPublicCatalogSummary().catch((error: unknown) => {
    if (error instanceof PortalDataError) return null;
    throw error;
  });
  return (
    <DatabaseGuide
      locale={locale}
      labels={messages.DatabaseGuide}
      common={messages.Common}
      summary={summary}
    />
  );
}
