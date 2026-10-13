"use client";

import { useSearchWorkspace } from "./search-modes";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { PendingFeedback } from "@/components/shell/navigation-feedback";

/** Native GET remains the no-JavaScript fallback; client navigation preserves selected versions.
 * @import import { KeywordSearchForm } from "@/features/catalog/keyword-search-form";
 */
export function KeywordSearchForm({ action, children }: { action: string; children: ReactNode }) {
  const workspace = useSearchWorkspace();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={action}
      className="portal-keyword-form flex flex-col gap-2"
      aria-busy={pending}
      data-pending={pending || undefined}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        const parameters = new URLSearchParams();
        for (const [key, value] of new FormData(event.currentTarget))
          if (typeof value === "string") parameters.append(key, value);
        if (workspace) {
          const draft = workspace.descriptionDraft;
          parameters.set("kind", draft.kind);
          const names = {
            brand: "brand",
            accessLevel: "access",
            geography: "geo",
            classification: "classification",
            referenceYearFrom: "yearFrom",
            referenceYearTo: "yearTo",
            processSubtype: "subtype",
            source: "source",
          } as const;
          for (const [key, name] of Object.entries(names)) {
            const value = draft.filters[key as keyof typeof names];
            if (value !== undefined && !(draft.kind === "flow" && key === "processSubtype"))
              parameters.set(name, String(value));
            else parameters.delete(name);
          }
        }
        workspace?.restoreKeywordResults();
        const href = `${action}?${parameters.toString()}`;
        startTransition(() => router.push(href));
      }}
    >
      {children}
      <PendingFeedback pending={pending} />
    </form>
  );
}
