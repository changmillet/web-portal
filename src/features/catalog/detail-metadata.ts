import type { PortalLocale } from "@/i18n/routing";
import type { PublicDatasetEnvelope } from "@/server/contracts/portal";

import { localizedText } from "./map-public-data";

/**
 * Describe a detail subpage using its public identity and purpose. Use the authored name's
 * existing language fallback, not mapDataset's identifier fallback; missing names stay omitted.
 * A version distinguishes same-named records without padding the description with a UUID.
 * The caller supplies purpose or known-unavailable text, never inferred amounts or results.
 */
export function detailSubpageDescription({
  dataset,
  description,
  locale,
  title,
  versionLabel,
}: {
  dataset: PublicDatasetEnvelope;
  description: string;
  locale: PortalLocale;
  title: string;
  versionLabel: string;
}): string {
  const name = localizedText(dataset.metadata.names, locale);
  const identity = [title, name, `${versionLabel}: ${dataset.key.version}`]
    .filter(Boolean)
    .join(" · ");
  return `${identity}. ${description}`;
}
