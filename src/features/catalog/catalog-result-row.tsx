"use client";

import type { ReactNode } from "react";
import { usePresentation } from "@/sites/presentation";
import { AtlasCatalogRecord } from "@/sites/atlas/catalog-record";

export type CatalogResultRowProps = {
  title: ReactNode;
  tags?: ReactNode;
  selection?: ReactNode;
  action?: ReactNode;
  selected?: boolean;
  children: ReactNode;
};
import "./catalog-result-row.css";

/** Shared result row used by the design reference and live catalog.
 * @import import { CatalogResultRow } from "@/features/catalog/catalog-result-row";
 */
export function CatalogResultRow({
  title,
  tags,
  selection,
  action,
  selected,
  children,
}: CatalogResultRowProps) {
  const site = usePresentation();
  if (site === "atlas")
    return (
      <AtlasCatalogRecord
        title={title}
        tags={tags}
        selection={selection}
        action={action}
        selected={selected}
      >
        {children}
      </AtlasCatalogRecord>
    );
  return (
    <li className="cr-result" data-selected={selected || undefined}>
      {selection && <div className="cr-record-select">{selection}</div>}
      <article>
        <div className="cr-record-top">
          <div className="cr-record-identity">
            <h3>{title}</h3>
            <span className="cr-record-tags">{tags}</span>
          </div>
          {action}
        </div>
        {children}
      </article>
    </li>
  );
}

/** Shared list boundary for live results and design-reference fixtures. */
/** @import import { CatalogResultList } from "@/features/catalog/catalog-result-row"; */
export function CatalogResultList({ children }: { children: ReactNode }) {
  return <ol className="catalog-result-list">{children}</ol>;
}

/** Authored summary shared by every catalog adapter. */
/** @import import { CatalogResultSummary } from "@/features/catalog/catalog-result-row"; */
export function CatalogResultSummary({ text, query = "" }: { text?: string; query?: string }) {
  if (!text) return null;
  const index = query.trim()
    ? text.toLocaleLowerCase().indexOf(query.trim().toLocaleLowerCase())
    : -1;
  return (
    <p className="cr-match catalog-result-summary">
      {index < 0 ? (
        text
      ) : (
        <>
          {text.slice(0, index)}
          <mark>{text.slice(index, index + query.trim().length)}</mark>
          {text.slice(index + query.trim().length)}
        </>
      )}
    </p>
  );
}
