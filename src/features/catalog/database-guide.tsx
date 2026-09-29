import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";

import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import { PortalPage } from "@/components/shell/portal-page";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { localePath, type PortalLocale } from "@/i18n/routing";
import { publicResources } from "@/lib/public-resources";
import type { PublicCatalogSummary } from "@/server/contracts/portal";

type Dictionary = typeof import("@/i18n/messages/en.json");

/**
 * A substantive data-selection entry point using only the public catalog's own facts.
 * @import import { DatabaseGuide } from "@/features/catalog/database-guide";
 */
export function DatabaseGuide({
  locale,
  labels,
  common,
  summary,
}: {
  locale: PortalLocale;
  labels: Dictionary["DatabaseGuide"];
  common: Dictionary["Common"];
  summary: PublicCatalogSummary | null;
}) {
  const resources = publicResources(locale);
  const number = new Intl.NumberFormat(locale);
  return (
    <PortalPage title={labels.title} description={labels.description}>
      <div className="flex flex-col gap-10" data-database-guide>
        <section
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.45fr)]"
          aria-labelledby="catalog-title"
        >
          <div className="flex max-w-prose flex-col gap-5">
            <h2 id="catalog-title" className="font-heading text-2xl font-semibold">
              {labels.catalogTitle}
            </h2>
            <p className="leading-7">{labels.catalogBody}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={localePath(locale, "browse/process")}>
                  {labels.processAction}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localePath(locale, "browse/flow")}>{labels.flowAction}</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5">
              <Link
                className="text-foreground underline underline-offset-4"
                href={localePath(locale, "browse/region")}
              >
                {labels.regionAction}
              </Link>
              <Link
                className="text-foreground underline underline-offset-4"
                href={localePath(locale, "browse/source")}
              >
                {labels.sourceAction}
              </Link>
            </div>
          </div>
          <aside
            className="bg-muted flex flex-col gap-5 rounded-lg p-6"
            aria-labelledby="catalog-counts-title"
          >
            <h3 id="catalog-counts-title" className="font-heading text-lg font-semibold">
              {labels.countsTitle}
            </h3>
            {summary ? (
              <>
                <dl className="flex flex-col gap-5">
                  {(["process", "flow"] as const).map((kind) => (
                    <div key={kind}>
                      <dt className="text-muted-foreground">{labels[`${kind}Count`]}</dt>
                      <dd className="font-heading text-3xl font-semibold tabular-nums">
                        {number.format(summary.counts[kind])}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-muted-foreground text-sm leading-6">{labels.countsNote}</p>
              </>
            ) : (
              <p className="leading-7">{labels.countsUnavailable}</p>
            )}
          </aside>
        </section>
        <Separator />
        <section className="flex flex-col gap-6" aria-labelledby="records-title">
          <h2 id="records-title" className="font-heading text-2xl font-semibold">
            {labels.recordsTitle}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {(["process", "flow"] as const).map((kind) => (
              <div key={kind} className="flex max-w-prose flex-col gap-3">
                <h3 className="font-heading text-lg font-semibold">{labels[`${kind}Title`]}</h3>
                <p className="leading-7">{labels[`${kind}Body`]}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-6" aria-labelledby="selection-title">
          <h2 id="selection-title" className="font-heading text-2xl font-semibold">
            {labels.selectionTitle}
          </h2>
          <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {(["scope", "coverage", "evidence", "version"] as const).map((key) => (
              <div key={key} className="flex max-w-prose flex-col gap-2">
                <dt className="font-heading text-lg font-semibold">{labels[`${key}Title`]}</dt>
                <dd className="leading-7">{labels[`${key}Body`]}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-5">
            <a className="text-foreground underline underline-offset-4" href={resources.dataGuide}>
              {labels.guideAction}
            </a>
            <Link
              className="text-foreground underline underline-offset-4"
              href={localePath(locale, "methodology")}
            >
              {labels.methodologyAction}
            </Link>
          </div>
        </section>
        <Separator />
        <section className="grid gap-8 md:grid-cols-2" aria-labelledby="access-title">
          <div className="flex max-w-prose flex-col gap-3">
            <h2 id="access-title" className="font-heading text-2xl font-semibold">
              {labels.accessTitle}
            </h2>
            <p className="leading-7">{labels.accessBody}</p>
          </div>
          <div className="flex max-w-prose flex-col items-start gap-3">
            <h2 className="font-heading text-2xl font-semibold">{labels.distributionTitle}</h2>
            <p className="leading-7">{labels.distributionBody}</p>
            <Button asChild variant="outline">
              <a href={resources.lcdn}>
                {labels.distributionAction}
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </section>
        <nav className="flex flex-col gap-5" aria-labelledby="resources-title">
          <h2 id="resources-title" className="font-heading text-2xl font-semibold">
            {labels.resourcesTitle}
          </h2>
          <div className="grid gap-7 md:grid-cols-3">
            {(["docs", "tidas", "pcr"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <a
                  className="text-foreground font-semibold underline underline-offset-4"
                  href={resources[key]}
                >
                  {common[`${key}Resource`]}
                </a>
                <p className="text-muted-foreground leading-7">{labels[`${key}Body`]}</p>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </PortalPage>
  );
}
