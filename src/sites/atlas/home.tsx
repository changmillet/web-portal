import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import type { BrandHomeProps } from "@/components/brand/brand-home";
import { localePath } from "@/i18n/routing";
import { atlasCopy } from "./copy";
import "./atlas.css";

/** Atlas editorial entrance, consuming the same catalog DTOs as TianGong.
 * @import import { AtlasHome } from "@/sites/atlas/home";
 */
export function AtlasHome({ locale, counts }: BrandHomeProps) {
  const copy = atlasCopy[locale];
  const format = new Intl.NumberFormat(locale);
  const dimensions = [
    {
      id: "process",
      title: copy.process,
      description: copy.processDescription,
      count: counts?.process,
    },
    { id: "flow", title: copy.flow, description: copy.flowDescription, count: counts?.flow },
    { id: "region", title: copy.region, description: copy.regionDescription },
    { id: "source", title: copy.source, description: copy.sourceDescription },
  ];
  return (
    <main id="main-content" className="atlas-home" lang={locale}>
      <section className="atlas-hero">
        <div className="atlas-orbit" aria-hidden="true">
          <div className="atlas-orbit-sphere" />
          <div className="atlas-axis atlas-axis-x" />
          <div className="atlas-axis atlas-axis-y" />
          <span className="atlas-axis-point" />
          <span className="atlas-orbit-letter">A</span>
        </div>
        <div className="site-shell-container atlas-hero-content">
          <p className="atlas-eyebrow">
            <span aria-hidden="true">✳</span>
            {copy.eyebrow}
          </p>
          <h1>
            {copy.title}
            <br />
            <em>{copy.emphasis}</em>
          </h1>
          <div className="atlas-hero-bottom">
            <p>{copy.description}</p>
            <Button asChild size="lg" className="atlas-primary-action">
              <Link href={`${localePath(locale, "search")}?v=1`}>
                {copy.explore}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="atlas-hero-caption">
            <span>ATLAS / LCA</span>
            <Link href="#atlas-index">
              {copy.index}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="site-shell-container atlas-index"
        id="atlas-index"
        aria-labelledby="atlas-index-title"
      >
        <div className="atlas-section-heading">
          <span className="atlas-section-number" aria-hidden="true">
            01 /
          </span>
          <h2 id="atlas-index-title">{copy.index}</h2>
          <p>{copy.indexDescription}</p>
        </div>
        <nav className="atlas-index-grid" aria-label={copy.explore}>
          {dimensions.map((item, i) => (
            <Link
              key={item.id}
              className="atlas-index-link"
              href={`${localePath(locale, "search")}?v=1&explore=${item.id}`}
              prefetch={false}
            >
              <div className="atlas-index-top">
                <span>0{i + 1}</span>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="atlas-index-count">
                {item.count !== undefined ? (
                  format.format(item.count)
                ) : item.id === "process" || item.id === "flow" ? (
                  copy.unavailable
                ) : (
                  <span aria-hidden="true">↗</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </section>
      <section className="atlas-perspective">
        <div className="site-shell-container atlas-perspective-grid">
          <div>
            <p className="atlas-eyebrow">02 / {copy.principle}</p>
            <h2>{copy.principleTitle}</h2>
            <p className="atlas-perspective-description">{copy.principleDescription}</p>
            <Link className="atlas-text-link" href={localePath(locale, "methodology")}>
              {copy.guide}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ol className="atlas-principles">
            {[
              [copy.read, copy.readDescription, "search?v=1"],
              [copy.compare, copy.compareDescription, "compare"],
              [copy.collect, copy.collectDescription, "collections"],
            ].map(([title, description, path], i) => (
              <li key={path}>
                <span aria-hidden="true">0{i + 1}</span>
                <div>
                  <h3>
                    <Link href={localePath(locale, path)}>
                      {title}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
