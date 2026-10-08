"use client";
import type { ReactNode } from "react";
import { usePresentation } from "./presentation";
import styles from "@/features/catalog/detail.module.css";

/** Presentation slots contain shared exact-version metadata and functional controls.
 * @import import { DetailFrame } from "@/sites/detail-frame";
 */
export function DetailFrame({
  heading,
  actions,
  navigation,
}: {
  heading: ReactNode;
  actions: ReactNode;
  navigation: ReactNode;
}) {
  const site = usePresentation();
  if (site === "atlas")
    return (
      <header className="atlas-detail-header">
        <div className="atlas-detail-heading">{heading}</div>
        <aside className="atlas-detail-actions">{actions}</aside>
        <div className="atlas-detail-navigation">{navigation}</div>
      </header>
    );
  return (
    <header className={styles.header}>
      {heading}
      {actions}
      {navigation}
    </header>
  );
}
