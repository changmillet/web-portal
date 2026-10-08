import type { CatalogResultRowProps } from "@/features/catalog/catalog-result-row";

/** Independent record composition; shared callers still own grouping, actions and values.
 * @import import { AtlasCatalogRecord } from "@/sites/atlas/catalog-record";
 */
export function AtlasCatalogRecord({
  title,
  tags,
  selection,
  action,
  selected,
  children,
}: CatalogResultRowProps) {
  return (
    <li className="atlas-record" data-selected={selected || undefined}>
      <div className="atlas-record-toolbar">
        {selection && <div className="atlas-record-selection">{selection}</div>}
        {action}
      </div>
      <article>
        <div className="atlas-record-heading">
          <h3>{title}</h3>
        </div>
        <div className="atlas-record-tags">{tags}</div>
        {children}
      </article>
    </li>
  );
}
