import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalLocale } from "@/i18n/routing";
import { atlasInformation, lifeCycleInitiativeUrl } from "./information";
import "./atlas.css";

/** Institutional Atlas pages deliberately have no person or partner roster.
 * @import import { AtlasInformationPage } from "@/sites/atlas/information-page";
 */
export function AtlasInformationPage({
  locale,
  page,
}: {
  locale: PortalLocale;
  page: "team" | "community";
}) {
  const information = atlasInformation[locale];
  const copy = information[page];
  return (
    <main id="main-content" className="atlas-information site-shell-container" lang={locale}>
      <header className="atlas-information-heading">
        <p className="atlas-eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="atlas-information-intro">{copy.description}</p>
      </header>
      <section className="atlas-information-body" aria-labelledby="atlas-information-title">
        <h2 id="atlas-information-title">{copy.sectionTitle}</h2>
        <ol className="atlas-principles">
          {copy.sections.map((section, index) => (
            <li key={section.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div className="atlas-information-action">
        <Button asChild variant="outline">
          <a href={lifeCycleInitiativeUrl}>
            {information.officialAction}
            <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
      </div>
    </main>
  );
}
