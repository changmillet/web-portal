"use client";

import "./search-workspace.css";
import {
  Fragment,
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SearchMode = "keyword" | "description";
const ModeContext = createContext<{
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
}: {
  mode: SearchMode;
  area: "input" | "results";
  children: ReactNode;
}) {
  const context = useSearchWorkspace();
  const visible =
    !context || (area === "input" ? context.mode : (context.resultsMode ?? context.mode)) === mode;
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
}: {
  descriptionBlocked?: { message: string; href: string; label: string };
  keyword: ReactNode;
  description: ReactNode;
  browse?: ReactNode;
  initialResultsMode?: SearchMode | null;
  labels: { mode: string; keyword: string; description: string };
}) {
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
        {!resultsMode && browse ? <div className="catalog-workspace-browse">{browse}</div> : null}
      </div>
    </ModeContext.Provider>
  );
}
