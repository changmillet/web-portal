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
  smartMatchDisabled: boolean;
  mode: SearchMode;
  resultsMode: SearchMode | null;
  change: (value: SearchMode) => void;
  showDescriptionResults: () => void;
  restoreKeywordResults: () => void;
  labels: { smartMatch: string };
} | null>(null);

export function useSearchWorkspace() {
  return useContext(ModeContext);
}

/** @import import { SearchModeControl } from "@/features/catalog/search-modes"; */
export function SearchModeControl() {
  const context = useSearchWorkspace();
  if (!context) return null;
  return (
    <label className="catalog-smart-match">
      <input
        type="checkbox"
        checked={context.mode === "description"}
        disabled={context.smartMatchDisabled}
        onChange={(event) => {
          const workspace = event.currentTarget.closest(".catalog-search-modes");
          context.change(event.target.checked ? "description" : "keyword");
          // Both forms stay mounted; move keyboard focus to the now-visible checkbox.
          requestAnimationFrame(() => {
            const checkbox = [
              ...(workspace?.querySelectorAll<HTMLInputElement>(".catalog-smart-match input") ??
                []),
            ].find((node) => node.getClientRects().length > 0);
            checkbox?.focus();
          });
        }}
      />
      <span>{context.labels.smartMatch}</span>
    </label>
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

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** @import import { SearchModes } from "@/features/catalog/search-modes"; */
export function SearchModes({
  keyword,
  description,
  labels,
  descriptionBlocked,
  browse,
  initialResultsMode = null,
  initialInputMode = "description",
  initialDraft,
  help,
}: {
  descriptionBlocked?: { message: string; href: string; label: string };
  keyword: ReactNode;
  description: ReactNode;
  browse?: ReactNode;
  initialResultsMode?: SearchMode | null;
  initialInputMode?: SearchMode;
  initialDraft?: Pick<SearchDraft, "kind" | "filters"> & { query?: string };
  help?: { keyword: string; description: string };
  labels: { smartMatch: string };
}) {
  const [descriptionDraft, setDescriptionDraft] = useState<SearchDraft>({
    kind: initialDraft?.kind ?? "process",
    filters: initialDraft?.filters ?? {},
    query: initialDraft?.query ?? "",
    limit: 20,
  });
  const [choice, setChoice] = useState<SearchMode | null>(null);
  const [resultsMode, setResultsMode] = useState(initialResultsMode);
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const mode = choice ?? (hydrated && !descriptionBlocked ? initialInputMode : "keyword");
  const keywordWorkspace = <Fragment key="keyword">{keyword}</Fragment>;
  const descriptionWorkspace = (
    <Fragment key="description">{!descriptionBlocked && description}</Fragment>
  );
  return (
    <ModeContext.Provider
      value={{
        mode,
        descriptionDraft,
        setDescriptionDraft,
        hasSharedHelp: !!help,
        smartMatchDisabled: !hydrated || !!descriptionBlocked,
        resultsMode,
        labels,
        change: setChoice,
        showDescriptionResults: () => setResultsMode("description"),
        restoreKeywordResults: () => setResultsMode(initialResultsMode),
      }}
    >
      <div className="catalog-search-modes flex flex-col gap-6">
        {mode === "keyword"
          ? [keywordWorkspace, descriptionWorkspace]
          : [descriptionWorkspace, keywordWorkspace]}
        {descriptionBlocked && (
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
        )}
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
