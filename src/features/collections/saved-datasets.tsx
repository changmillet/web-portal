"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookmarkIcon, BookmarkCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import { localePath, type PortalLocale } from "@/i18n/routing";
import { collectionsStorageKey } from "./storage";
import {
  buildMemberFragment,
  collectionMemberKey,
  collectionsStorageKeyV2,
  emptyCollectionStateV2,
  mergeCollectionMembers,
  parseCollectionJsonV2,
  type DatasetIdentity,
} from "./storage-v2";

export const savedDatasetsChanged = "portal:saved-datasets-changed";
export function notifySavedDatasetsChanged() {
  window.dispatchEvent(new Event(savedDatasetsChanged));
}
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === collectionsStorageKeyV2 ||
      event.key === collectionsStorageKey
    )
      callback();
  };
  window.addEventListener(savedDatasetsChanged, callback);
  window.addEventListener("storage", storage);
  window.addEventListener("pageshow", callback);
  return () => {
    window.removeEventListener(savedDatasetsChanged, callback);
    window.removeEventListener("storage", storage);
    window.removeEventListener("pageshow", callback);
  };
}
function snapshot(): string | null {
  try {
    return (
      localStorage.getItem(collectionsStorageKeyV2) ?? localStorage.getItem(collectionsStorageKey)
    );
  } catch {
    return "unavailable";
  }
}
function useSavedDatasets() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => undefined);
  return useMemo(() => {
    if (raw === undefined) return { ready: false, state: null };
    try {
      return {
        ready: true,
        state: raw === null ? emptyCollectionStateV2 : parseCollectionJsonV2(raw),
      };
    } catch {
      return { ready: true, state: null };
    }
  }, [raw]);
}

/** @import import { SavedDatasetsLink } from "@/features/collections/saved-datasets"; */
export function SavedDatasetsLink() {
  const t = useTranslations("SavedDatasets");
  const locale = useLocale() as PortalLocale;
  const { state } = useSavedDatasets();
  return (
    <Button asChild variant={state?.members.length ? "outline" : "ghost"}>
      <Link
        href={localePath(locale, "collections")}
        aria-label={state ? t("openCount", { count: state.members.length }) : t("open")}
      >
        <BookmarkIcon aria-hidden="true" />
        <span>
          {t("short")}
          {state ? ` (${state.members.length})` : ""}
        </span>
      </Link>
    </Button>
  );
}

/** @import import { SaveDataset } from "@/features/collections/saved-datasets"; */
export function SaveDataset({
  identity,
  name,
  iconOnly = false,
}: {
  identity: DatasetIdentity;
  name: string;
  iconOnly?: boolean;
}) {
  const t = useTranslations("SavedDatasets");
  const locale = useLocale() as PortalLocale;
  const { state, ready } = useSavedDatasets();
  const [announced, setAnnounced] = useState(false);
  const [error, setError] = useState<"failed" | "limit" | null>(null);
  const saved =
    state?.members.some(
      (member) => collectionMemberKey(member) === collectionMemberKey(identity),
    ) ?? false;
  const label = saved ? t("saved") : t("save");
  const Icon = saved ? BookmarkCheckIcon : BookmarkIcon;
  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      <Button asChild variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon" : "default"}>
        <Link
          href={`${localePath(locale, "collections")}${saved ? "" : buildMemberFragment(identity)}`}
          aria-label={`${label}: ${name}`}
          title={saved ? t("open") : label}
          role={ready && !saved ? "button" : undefined}
          onKeyDown={(event) => {
            if (ready && !saved && event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          onClick={(event) => {
            if (
              !ready ||
              saved ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            )
              return;
            event.preventDefault();
            try {
              const raw = snapshot();
              const current = raw === null ? emptyCollectionStateV2 : parseCollectionJsonV2(raw);
              const next = mergeCollectionMembers(current, [identity]);
              localStorage.setItem(collectionsStorageKeyV2, JSON.stringify(next));
              setError(null);
              setAnnounced(true);
              notifySavedDatasetsChanged();
            } catch (cause) {
              setError(
                cause instanceof Error && cause.message === "collection_member_limit"
                  ? "limit"
                  : "failed",
              );
            }
          }}
        >
          <Icon aria-hidden="true" />
          {!iconOnly && label}
        </Link>
      </Button>
      {(error || (announced && saved)) && (
        <output className={error ? "text-destructive max-w-64 text-sm" : "sr-only"}>
          {error ? t(error) : t("savedAnnouncement", { name })}
        </output>
      )}
    </span>
  );
}
