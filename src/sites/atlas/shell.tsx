/* oxlint-disable next/no-img-element -- Preserve the supplied 257x87 brand lockup at its intrinsic ratio without remote image processing. */
import { getTranslations } from "next-intl/server";
import { FeedbackLink as Link } from "@/components/shell/feedback-link";
import { HeaderOffset } from "@/components/shell/header-offset";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";
import { NavigationLink } from "@/components/shell/navigation-link";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { localePath, type PortalLocale } from "@/i18n/routing";
import { readBrandConfig, type BrandConfig } from "@/config/brand";
import { AtlasLogo } from "./logo";
export { AtlasLogo } from "./logo";
import { atlasCopy } from "./copy";
import "@/components/shell/site-shell.css";
import "./atlas.css";

/** @import import { AtlasHeader } from "@/sites/atlas/shell"; */
export async function AtlasHeader({
  locale,
  brand = readBrandConfig({ PORTAL_BRAND: "atlas" }),
}: {
  locale: PortalLocale;
  brand?: BrandConfig;
}) {
  const t = await getTranslations({ locale, namespace: "Common" });
  const copy = atlasCopy[locale];
  return (
    <header className="atlas-header" data-portal-header>
      <HeaderOffset />
      <a className="atlas-skip" href="#main-content">
        {t("skipToContent")}
      </a>
      <div className="atlas-masthead site-shell-container">
        <Link href={localePath(locale)} className="atlas-home-link" prefetch={false}>
          <AtlasLogo
            lightLogo={brand.lightLogo}
            darkLogo={brand.darkLogo}
            width={brand.width}
            height={brand.height}
            label={brand.alt[locale]}
          />
          <span className="atlas-descriptor">{copy.descriptor}</span>
        </Link>
        <div className="atlas-tools">
          <ThemeToggle
            labels={{
              dark: t("themeDark"),
              group: t("theme"),
              light: t("themeLight"),
              system: t("themeSystem"),
            }}
          />
          <LocaleSwitcher currentLocale={locale} label={t("language")} />
        </div>
      </div>
      <nav className="atlas-navigation site-shell-container" aria-label={copy.metadataTitle}>
        {(
          [
            ["search?v=1", "catalog"],
            ["lca-database", "databases"],
            ["methodology", "methodology"],
            ["team", "team"],
            ["community", "community"],
            ["collections", "collections"],
          ] as const
        ).map(([path, key], i) => (
          <NavigationLink key={path} href={localePath(locale, path)}>
            <span className="atlas-nav-number" aria-hidden="true">
              0{i + 1}
            </span>
            {t(key)}
          </NavigationLink>
        ))}
      </nav>
    </header>
  );
}

/** @import import { AtlasFooter } from "@/sites/atlas/shell"; */
export async function AtlasFooter({
  locale,
  brand = readBrandConfig({ PORTAL_BRAND: "atlas" }),
}: {
  locale: PortalLocale;
  brand?: BrandConfig;
}) {
  const copy = atlasCopy[locale];
  const t = await getTranslations({ locale, namespace: "Common" });
  return (
    <footer className="atlas-footer">
      <div className="site-shell-container">
        <div className="atlas-footer-top">
          <Link href={localePath(locale)}>
            <AtlasLogo
              lightLogo={brand.lightLogo}
              darkLogo={brand.darkLogo}
              width={brand.width}
              height={brand.height}
              label={brand.alt[locale]}
            />
          </Link>
          <p>{copy.footer}</p>
          <Link href={localePath(locale, "methodology")}>
            {copy.guide}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
        <div className="atlas-footer-bottom">
          <p>{copy.dataCredit}</p>
          <a href="https://lca.tiangong.earth">{t("externalLca")} ↗</a>
        </div>
      </div>
    </footer>
  );
}
