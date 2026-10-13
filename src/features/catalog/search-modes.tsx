"use client";

import "./search-workspace.css";
import {
  Fragment,
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { PortalHybridFilters } from "@/lib/hybrid-request";

export type SearchDraft = {
  kind: "process" | "flow";
  filters: PortalHybridFilters;
  query: string;
  limit: number;
};

type SearchMode = "keyword" | "description";
const ModeContext = createContext<{
  descriptionDraft: SearchDraft;
  setDescriptionDraft: Dispatch<SetStateAction<SearchDraft>>;
  hasSharedHelp: boolean;
  mode: SearchMode;
  resultsMode: SearchMode | null;
  change: (value: SearchMode) => void;
  showDescriptionResults: () => void;
  restoreKeywordResults: () => void;
  labels: { mode: string; keyword: string; description: string };
} | null>(null);

export function useSearchWorkspace() {
  return useContext(ModeContext);
}

/** @import import { SearchModeControl } from "@/features/catalog/search-modes"; */
export function SearchModeControl() {
  const context = useSearchWorkspace();
  if (!context) return null;
  return (
    <fieldset className="catalog-search-mode-switch flex" aria-label={context.labels.mode}>
      {(["keyword", "description"] as const).map((mode) => (
        <Button
          key={mode}
          type="button"
          variant="ghost"
          aria-pressed={context.mode === mode}
          data-state={context.mode === mode ? "on" : "off"}
          onClick={() => context.change(mode)}
        >
          {context.labels[mode]}
        </Button>
      ))}
    </fieldset>
  );
}

/** Input mode and submitted results are deliberately independent. Hidden sections stay mounted. */
export function SearchModeSection({
  mode,
  area,
  children,
  when = true,
}: {
  when?: boolean;
  mode: SearchMode;
  area: "input" | "feedback" | "controls" | "results";
  children: ReactNode;
}) {
  const context = useSearchWorkspace();
  const visible =
    when &&
    (!context ||
      (area === "input" || area === "feedback"
        ? context.mode
        : area === "controls"
          ? (context.resultsMode ?? "description")
          : (context.resultsMode ?? context.mode)) === mode);
  return (
    <div hidden={!visible} className={`catalog-workspace-${area}`}>
      {children}
    </div>
  );
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function isSharedDescription() {
  return window.location.hash.startsWith("#hybrid=") || window.location.hash === "#description";
}

/** @import import { SearchModes } from "@/features/catalog/search-modes"; */
export function SearchModes({
  keyword,
  description,
  labels,
  descriptionBlocked,
  browse,
  initialResultsMode = null,
  initialDraft,
  help,
}: {
  descriptionBlocked?: { message: string; href: string; label: string };
  keyword: ReactNode;
  description: ReactNode;
  browse?: ReactNode;
  initialResultsMode?: SearchMode | null;
  initialDraft?: Pick<SearchDraft, "kind" | "filters">;
  help?: { keyword: string; description: string };
  labels: { mode: string; keyword: string; description: string };
}) {
  const [descriptionDraft, setDescriptionDraft] = useState<SearchDraft>({
    kind: initialDraft?.kind ?? "process",
    filters: initialDraft?.filters ?? {},
    query: "",
    limit: 20,
  });
  const [choice, setChoice] = useState<SearchMode | null>(null);
  const [resultsMode, setResultsMode] = useState(initialResultsMode);
  const sharedDescription = useSyncExternalStore(subscribe, isSharedDescription, () => false);
  const mode = choice ?? (sharedDescription ? "description" : "keyword");
  const keywordWorkspace = <Fragment key="keyword">{keyword}</Fragment>;
  const descriptionWorkspace = (
    <Fragment key="description">
      {descriptionBlocked ? (
        <SearchModeSection mode="description" area="input">
          <Alert>
            <AlertDescription>
              <p>{descriptionBlocked.message}</p>
              <Button asChild variant="outline">
                <Link href={descriptionBlocked.href} prefetch={false}>
                  {descriptionBlocked.label}
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </SearchModeSection>
      ) : (
        description
      )}
    </Fragment>
  );
  return (
    <ModeContext.Provider
      value={{
        mode,
        descriptionDraft,
        setDescriptionDraft,
        hasSharedHelp: !!help,
        resultsMode,
        labels,
        change: setChoice,
        showDescriptionResults: () => setResultsMode("description"),
        restoreKeywordResults: () => setResultsMode(initialResultsMode),
      }}
    >
      <div className="catalog-search-modes flex flex-col gap-6">
        <SearchModeControl />
        {mode === "keyword"
          ? [keywordWorkspace, descriptionWorkspace]
          : [descriptionWorkspace, keywordWorkspace]}
        {help && (
          <p className="catalog-input-help catalog-workspace-help">
            {(["keyword", "description"] as const).map((key) => (
              <span
                key={key}
                aria-hidden={mode !== key}
                style={{ visibility: mode === key ? "visible" : "hidden", gridArea: "1 / 1" }}
              >
                {help[key]}
              </span>
            ))}
          </p>
        )}
        {!resultsMode && browse ? <div className="catalog-workspace-browse">{browse}</div> : null}
      </div>
    </ModeContext.Provider>
  );
}

/** Shared page heading for the production route and its complete Storybook workspace. */
export function CatalogSearchHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <header className="catalog-results-intro">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {actions}
      </div>
      <p className="text-muted-foreground mt-2">{description}</p>
    </header>
  );
}
