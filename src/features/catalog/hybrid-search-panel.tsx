"use client";

import { DataBrandFilter } from "./data-brand-filter";
import { dataBrandNames, type PortalDataBrandScope } from "@/config/data-brands";
import { ResponsiveFacets } from "./responsive-facets";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { CatalogPagination } from "@/features/catalog/catalog-pagination";

import {
  LinkIcon,
  LoaderCircleIcon,
  ScanSearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { SearchModeSection, useSearchWorkspace } from "./search-modes";
import { CatalogSearchInput } from "./catalog-search-input";
import { useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { CatalogKindSwitch } from "./catalog-kind-switch";
import { CatalogResultsToolbar } from "./catalog-results-toolbar";
import { mapProgressiveSearchPage } from "@/features/catalog/map-public-data";
import { useProgressiveSearch } from "@/features/catalog/use-progressive-search";
import { SearchResults, type SearchResultLabels } from "@/features/catalog/search-results";
import {
  decodeHybridQueryFragment,
  encodeHybridQueryFragment,
} from "@/features/catalog/hybrid-share";
import {
  portalHybridSearchRequestSchema,
  type PortalHybridFilters,
  type PortalHybridVersionSearchRequest,
} from "@/lib/hybrid-request";
import { localePath, type PortalLocale } from "@/i18n/routing";
import { CompareSelectionForm } from "@/features/compare/selection";
import { formatGeographyCode } from "@/i18n/geography";
import { localizeProcessSubtype } from "@/i18n/domain-vocabulary";

export type HybridSearchLabels = {
  advisoryDescription: string;
  advisoryTitle: string;
  compareSelected: string;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  error: string;
  fallbackDescription: string;
  fallbackTitle: string;
  flow: string;
  kind: string;
  privacy: string;
  process: string;
  queryLabel: string;
  queryPlaceholder: string;
  flowPlaceholder: string;
  resultsTitle: string;
  running: string;
  semanticQuery: string;
  shareCancel: string;
  shareConfirm: string;
  shareDisclosure: string;
  sharePreview: string;
  shareQuery: string;
  shared: string;
  submit: string;
  terms: string;
  title: string;
  initialDescription: string;
  optimizing: string;
  optimizingDescription: string;
  updateTitle: string;
  updateDescription: string;
  showUpdated: string;
  optimized: string;
  noMatchesTitle: string;
  noMatchesDescription: string;
  loadMore: string;
  loadingMore: string;
  pageError: string;
  cursorExpired: string;
  restart: string;
  activeFilters: string;
  clearFilters: string;
  technicalPreview: string;
  filterGeography: string;
  filterSource: string;
  filterClassification: string;
  filterAccess: string;
  filterYearFrom: string;
  filterYearTo: string;
  filterSubtype: string;
};

type RequestState = {
  filters: PortalHybridFilters;
  kind: "process" | "flow";
  query: string;
  limit: number;
};

function shareRequest(state: RequestState): PortalHybridVersionSearchRequest {
  const request = portalHybridSearchRequestSchema.parse({
    schemaVersion: "portal.hybrid-search-request.v2",
    kind: state.kind,
    query: state.query,
    filters:
      state.kind === "flow" ? { ...state.filters, processSubtype: undefined } : state.filters,
    limit: state.limit,
    cursor: null,
  });
  if (request.schemaVersion !== "portal.hybrid-search-request.v2")
    throw new Error("Expected versioned request");
  return request;
}

/** @import import { HybridSearchPanel } from "@/features/catalog/hybrid-search-panel"; */
export function HybridSearchPanel({
  initialFilters,
  allowedBrandCodes = [],
  initialKind,
  labels,
  locale,
  resultLabels,
  siteOrigin,
}: {
  initialFilters: PortalHybridFilters;
  allowedBrandCodes?: PortalDataBrandScope["allowedBrandCodes"];
  initialKind: "process" | "flow";
  labels: HybridSearchLabels;
  locale: PortalLocale;
  resultLabels: SearchResultLabels;
  siteOrigin: string;
}) {
  const workspace = useSearchWorkspace();
  const catalog = useTranslations("Search");
  const common = useTranslations("Common");
  const [requestState, setRequestState] = useState<RequestState>({
    filters: initialFilters,
    kind: initialKind,
    query: "",
    limit: 20,
  });
  const [message, setMessage] = useState("");
  const [sharePreview, setSharePreview] = useState<PortalHybridVersionSearchRequest | null>(null);
  const {
    state: search,
    start: startSearch,
    applyUpdate,
    loadMore,
    running,
    unavailable,
  } = useProgressiveSearch(locale);
  const start = (request: PortalHybridVersionSearchRequest) => {
    workspace?.showDescriptionResults();
    startSearch(request);
  };
  const pendingChanges =
    !!search.request &&
    (requestState.query.trim() !== search.request.query ||
      JSON.stringify(
        Object.entries(requestState.filters)
          .filter(([, value]) => value !== undefined)
          .sort(([left], [right]) => left.localeCompare(right)),
      ) !==
        JSON.stringify(
          Object.entries(search.request.filters)
            .filter(([, value]) => value !== undefined)
            .sort(([left], [right]) => left.localeCompare(right)),
        ));
  const response = search.response;
  const resultHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!window.location.hash.startsWith("#hybrid=")) return;
    try {
      const request = decodeHybridQueryFragment(window.location.hash);
      // oxlint-disable-next-line react-hooks/set-state-in-effect -- A fragment is browser-only input and never auto-submits.
      setRequestState({
        filters: request.filters,
        kind: request.kind,
        query: request.query,
        limit: request.limit,
      });
    } catch {
      // oxlint-disable-next-line react-hooks/set-state-in-effect -- Invalid shared input is reported locally.
      setMessage(labels.error);
    }
  }, [labels.error]);

  const parsedRequest = useMemo(() => {
    const parsed = portalHybridSearchRequestSchema.safeParse({
      schemaVersion: "portal.hybrid-search-request.v2",
      kind: requestState.kind,
      query: requestState.query,
      filters:
        requestState.kind === "flow"
          ? { ...requestState.filters, processSubtype: undefined }
          : requestState.filters,
      limit: requestState.limit,
      cursor: null,
    });
    return parsed.success && parsed.data.schemaVersion === "portal.hybrid-search-request.v2"
      ? parsed.data
      : null;
  }, [requestState]);

  const results = useMemo(() => {
    if (!response) return [];
    return mapProgressiveSearchPage(response, locale);
  }, [locale, response]);
  const keptLexicalResults = search.hybrid === "empty" && results.length > 0;
  const filterLabels: Record<keyof PortalHybridFilters, string> = {
    brand: catalog("dataBrand"),
    accessLevel: labels.filterAccess,
    classification: labels.filterClassification,
    geography: labels.filterGeography,
    processSubtype: labels.filterSubtype,
    referenceYearFrom: labels.filterYearFrom,
    referenceYearTo: labels.filterYearTo,
    source: labels.filterSource,
  };
  const describeFilters = (filters: PortalHybridFilters, kind: "process" | "flow") =>
    Object.entries(filters)
      .filter(
        ([key, value]) => value !== undefined && !(key === "processSubtype" && kind === "flow"),
      )
      .map(([key, value]) => ({
        label: filterLabels[key as keyof PortalHybridFilters],
        value:
          key === "brand"
            ? dataBrandNames[value as keyof typeof dataBrandNames]
            : key === "geography"
              ? formatGeographyCode(String(value), locale)
              : key === "accessLevel"
                ? value === "open"
                  ? resultLabels.public
                  : resultLabels.metadataOnly
                : key === "processSubtype"
                  ? localizeProcessSubtype(String(value), locale)
                  : String(value),
      }));
  const filterEntries = describeFilters(requestState.filters, requestState.kind);

  return (
    <div className="catalog-description-workspace">
      <SearchModeSection mode="description" area="input">
        <search className="brand-search catalog-results-query">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!parsedRequest) {
                setMessage(labels.error);
                return;
              }
              setMessage("");
              setSharePreview(null);
              start(parsedRequest);
            }}
          >
            <label className="sr-only" htmlFor="hybrid-query">
              {labels.queryLabel}
            </label>
            <CatalogSearchInput
              id="hybrid-query"
              maxLength={512}
              autoComplete="off"
              onChange={(event) =>
                setRequestState((current) => ({ ...current, query: event.target.value }))
              }
              onClear={() => setRequestState((current) => ({ ...current, query: "" }))}
              clearLabel={common("clear")}
              placeholder={
                requestState.kind === "flow" ? labels.flowPlaceholder : labels.queryPlaceholder
              }
              value={requestState.query}
              submitLabel={catalog("submit")}
              submitDisabled={!parsedRequest}
              busy={running}
            />
          </form>
        </search>
        <p className="catalog-input-help">{labels.privacy}</p>
        {pendingChanges ? (
          <output className="catalog-pending-changes" aria-live="polite">
            <div>
              <strong>{catalog("pendingTitle")}</strong>
              <p>{catalog("pendingDescription")}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (search.request) setRequestState({ ...search.request });
              }}
            >
              {catalog("discardChanges")}
            </Button>
          </output>
        ) : null}
        {filterEntries.length ? (
          <section className="catalog-applied-filters" aria-label={labels.activeFilters}>
            {filterEntries.map((entry) => (
              <Badge variant="secondary" key={entry.label}>
                {entry.label}: {entry.value}
              </Badge>
            ))}
          </section>
        ) : null}
      </SearchModeSection>
      <SearchModeSection mode="description" area="results">
        {search.request ? (
          <p className="catalog-applied-query">
            {catalog("showingResultsFor", { query: search.request.query })}
          </p>
        ) : null}
        <CatalogResultsToolbar
          showSaved={!workspace}
          headingRef={resultHeading}
          titleId="description-results-heading"
          title={response ? labels.resultsTitle : ""}
          scope={
            <CatalogKindSwitch
              value={requestState.kind}
              label={labels.kind}
              labels={{ process: labels.process, flow: labels.flow }}
              onChange={(kind) => {
                setRequestState((current) => ({
                  ...current,
                  kind,
                  filters:
                    kind === "flow"
                      ? Object.fromEntries(
                          Object.entries(current.filters).filter(
                            ([key]) => key !== "processSubtype",
                          ),
                        )
                      : current.filters,
                }));
                if (search.request && kind !== search.request.kind) {
                  start(shareRequest({ ...search.request, kind }));
                }
              }}
            />
          }
          actions={
            <>
              <Button
                disabled={!search.request && !parsedRequest}
                onClick={() => setSharePreview(search.request ?? parsedRequest)}
                type="button"
                variant="ghost"
                aria-label={labels.shareQuery}
                title={labels.shareQuery}
              >
                <LinkIcon aria-hidden="true" />
                {labels.shareQuery}
              </Button>
              <ResponsiveFacets
                drawer
                labels={{
                  title: catalog("facets"),
                  description: catalog("filtersDescription"),
                  close: common("close"),
                }}
              >
                <div className="flex flex-col gap-4">
                  <DataBrandFilter
                    allowedBrandCodes={allowedBrandCodes}
                    value={requestState.filters.brand}
                    label={common("dataBrand")}
                    allLabel={common("allDataBrands")}
                    onChange={(brand) =>
                      setRequestState((current) => {
                        const filters = { ...current.filters };
                        if (brand) filters.brand = brand;
                        else delete filters.brand;
                        return { ...current, filters };
                      })
                    }
                  />
                  {(
                    [
                      ["geography", labels.filterGeography],
                      ["classification", labels.filterClassification],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key}>
                      <FieldLabel htmlFor={`description-filter-${key}`}>{label}</FieldLabel>
                      <Input
                        id={`description-filter-${key}`}
                        value={String(requestState.filters[key] ?? "")}
                        onChange={(event) =>
                          setRequestState((current) => {
                            const filters = { ...current.filters };
                            if (event.target.value.trim()) filters[key] = event.target.value.trim();
                            else delete filters[key];
                            return { ...current, filters };
                          })
                        }
                      />
                    </Field>
                  ))}
                  <Button
                    disabled={!parsedRequest}
                    onClick={() => {
                      if (parsedRequest) start(parsedRequest);
                    }}
                  >
                    {labels.submit}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setRequestState((current) => ({ ...current, filters: {} }))}
                  >
                    {labels.clearFilters}
                  </Button>
                </div>
              </ResponsiveFacets>
            </>
          }
        />

        {sharePreview ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>
                <h3>{labels.sharePreview}</h3>
              </CardTitle>
              <CardDescription>{labels.shareDisclosure}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="flex flex-col gap-3">
                <div>
                  <dt className="text-muted-foreground text-sm">{labels.kind}</dt>
                  <dd>{sharePreview.kind === "process" ? labels.process : labels.flow}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">{labels.queryLabel}</dt>
                  <dd className="break-words whitespace-pre-wrap">{sharePreview.query}</dd>
                </div>
                {describeFilters(sharePreview.filters, sharePreview.kind).map((entry) => (
                  <div key={entry.label}>
                    <dt className="text-muted-foreground text-sm">{entry.label}</dt>
                    <dd className="break-words">{entry.value}</dd>
                  </div>
                ))}
              </dl>
              <details>
                <summary className="text-link min-h-11 cursor-pointer py-3 text-sm">
                  {labels.technicalPreview}
                </summary>
                <pre className="bg-muted max-h-64 overflow-auto rounded-lg p-3 text-xs break-words whitespace-pre-wrap">
                  {JSON.stringify(sharePreview, null, 2)}
                </pre>
              </details>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const fragment = encodeHybridQueryFragment(sharePreview);
                      const url = `${window.location.origin}${window.location.pathname}${fragment}`;
                      await navigator.clipboard.writeText(url);
                      setMessage(labels.shared);
                      setSharePreview(null);
                    } catch {
                      setMessage(labels.error);
                    }
                  }}
                  type="button"
                >
                  <LinkIcon data-icon="inline-start" />
                  {labels.shareConfirm}
                </Button>
                <Button onClick={() => setSharePreview(null)} type="button" variant="ghost">
                  <XIcon data-icon="inline-start" />
                  {labels.shareCancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {search.request && (running || search.pendingUpdate || response) ? (
          <output
            aria-atomic="true"
            aria-live="polite"
            className="bg-muted/30 grid min-h-28 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          >
            {running ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="text-primary size-5 shrink-0 motion-safe:animate-spin"
              />
            ) : keptLexicalResults ? (
              <ScanSearchIcon
                aria-hidden="true"
                className="text-muted-foreground size-5 shrink-0"
              />
            ) : search.pendingUpdate || response?.mode === "hybrid" ? (
              <SparklesIcon aria-hidden="true" className="text-primary size-5 shrink-0" />
            ) : (
              <ShieldAlertIcon
                aria-hidden="true"
                className="text-muted-foreground size-5 shrink-0"
              />
            )}
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-medium">
                {search.pendingUpdate
                  ? labels.updateTitle
                  : running
                    ? results.length > 0
                      ? labels.optimizing
                      : labels.running
                    : keptLexicalResults
                      ? labels.noMatchesTitle
                      : response?.mode === "hybrid"
                        ? labels.optimized
                        : labels.fallbackTitle}
              </span>
              <span className="text-muted-foreground text-sm">
                {search.pendingUpdate
                  ? labels.updateDescription
                  : running
                    ? results.length > 0
                      ? labels.optimizingDescription
                      : labels.initialDescription
                    : keptLexicalResults
                      ? labels.noMatchesDescription
                      : response?.mode === "hybrid"
                        ? labels.advisoryDescription
                        : labels.fallbackDescription}
              </span>
            </span>
            {search.pendingUpdate ? (
              <Button
                className="col-start-2 h-auto min-h-11 justify-self-start whitespace-normal sm:col-start-auto"
                onClick={() => {
                  applyUpdate();
                  resultHeading.current?.focus({ preventScroll: true });
                }}
                type="button"
              >
                {labels.showUpdated}
              </Button>
            ) : null}
          </output>
        ) : null}

        {unavailable ? (
          <Alert>
            <ShieldAlertIcon aria-hidden="true" />
            <AlertTitle>{labels.error}</AlertTitle>
          </Alert>
        ) : null}

        {response?.mode === "hybrid" ? (
          <Accordion collapsible type="single">
            <AccordionItem value="interpretation">
              <AccordionTrigger type="button">{labels.advisoryTitle}</AccordionTrigger>
              <AccordionContent>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-xs font-medium uppercase">
                      {labels.semanticQuery}
                    </dt>
                    <dd>{response.interpretation.semanticQuery}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs font-medium uppercase">
                      {labels.terms}
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {response.interpretation.terms.map((term) => (
                        <Badge key={`${term.language}:${term.value}`} variant="outline">
                          {term.language} · {term.value}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        {response ? (
          results.length === 0 ? (
            running ? null : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
                  <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )
          ) : (
            <section aria-label={labels.resultsTitle} className="flex flex-col gap-4">
              <CompareSelectionForm action={localePath(locale, "compare")}>
                <input name="v" type="hidden" value="1" />
                <SearchResults
                  query={search.request?.query}
                  items={results}
                  labels={resultLabels}
                  locale={locale}
                  selectable
                  siteOrigin={siteOrigin}
                />
                <noscript>
                  {" "}
                  {results.some((item) => item.kind === "process") ? (
                    <Button
                      className="h-auto min-h-11 max-w-full self-start whitespace-normal"
                      type="submit"
                    >
                      {labels.compareSelected}
                    </Button>
                  ) : null}
                </noscript>
              </CompareSelectionForm>
              {search.pageError ? (
                <Alert>
                  <AlertDescription>
                    {search.pageError === "cursor_expired"
                      ? labels.cursorExpired
                      : labels.pageError}
                  </AlertDescription>
                  {search.pageError === "cursor_expired" && search.request ? (
                    <Button
                      className="mt-3"
                      onClick={() => start(search.request!)}
                      type="button"
                      variant="outline"
                    >
                      {labels.restart}
                    </Button>
                  ) : null}
                </Alert>
              ) : null}
              {response.nextCursor && search.pageError !== "cursor_expired" ? (
                <CatalogPagination label={labels.loadMore}>
                  <Button
                    className="self-start"
                    disabled={search.pageLoading}
                    onClick={() => {
                      void loadMore();
                    }}
                    type="button"
                    variant="outline"
                  >
                    {search.pageLoading ? (
                      <LoaderCircleIcon
                        aria-hidden="true"
                        className="size-4 motion-safe:animate-spin"
                      />
                    ) : null}
                    {search.pageLoading ? labels.loadingMore : labels.loadMore}
                  </Button>
                </CatalogPagination>
              ) : null}
            </section>
          )
        ) : null}

        <p aria-live="polite" className="text-muted-foreground min-h-5 text-sm">
          {message}
        </p>
      </SearchModeSection>
    </div>
  );
}
