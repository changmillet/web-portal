// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { captureMapInputs, runStaticChecks } from "../../scripts/run-static-checks.mjs";

const roots: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "portal-check-inputs-"));
  roots.push(root);
  const files = [
    "package.json",
    "pnpm-lock.yaml",
    ".node-version",
    "vitest.unit.config.ts",
    "scripts/run-static-checks.mjs",
    "tests/unit/region-map-assets.test.ts",
    "src/i18n/locations.generated.json",
    "src/features/catalog/region-map-manifest.generated.json",
    "scripts/maps/sources/source.json.gz",
    "scripts/maps/lib/config.mjs",
    "public/maps/layer.json",
    "contracts/database-engine/portal/schema.json",
    "node_modules/mapshaper/package.json",
    "node_modules/mapshaper/bin/mapshaper",
    "node_modules/mapshaper/mapshaper.js",
  ];
  for (const file of files) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(
      join(root, file),
      file.endsWith("package.json") ? '{"version":"0.7.61"}' : "original",
    );
  }
  return root;
}
afterEach(() => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("aggregate static checks", () => {
  it("retains every original gate and leaves the real region rebuild in the unfiltered unit suite", () => {
    const root = fixture();
    const calls: string[] = [];
    runStaticChecks({
      root,
      run: (stage: string) => {
        calls.push(stage);
      },
    });
    expect(calls).toEqual([
      "check:toolchain",
      "check:brand",
      "check:database-contracts",
      "check:licenses",
      "check:maplibre",
      "check:navigation-locations",
      "format:check",
      "lint",
      "typecheck",
      "test",
      "build",
      "check:bundle-budget",
      "check:bundle",
      "check:fonts",
    ]);
    expect(calls).toContain("test");
    expect(calls).toContain("check:maplibre");
    expect(calls).not.toContain("check:maps");
    const unit = readFileSync(new URL("./region-map-assets.test.ts", import.meta.url), "utf8");
    expect(unit).toContain('[GENERATOR, "--check"]');
    expect(unit).toContain("timeout: 180_000");
  });

  it.each([
    "scripts/maps/sources/source.json.gz",
    "scripts/maps/lib/config.mjs",
    "public/maps/layer.json",
    "src/i18n/locations.generated.json",
    "contracts/database-engine/portal/schema.json",
    "node_modules/mapshaper/mapshaper.js",
    "tests/unit/region-map-assets.test.ts",
  ])("rejects %s drift between the two original observation points", (file) => {
    const root = fixture();
    expect(() =>
      runStaticChecks({
        root,
        run: (stage: string) => {
          if (stage === "typecheck") writeFileSync(join(root, file), "changed");
        },
      }),
    ).toThrow(/map inputs or outputs changed/u);
  });

  it("rejects added files and symlink sources", () => {
    const root = fixture();
    expect(() =>
      runStaticChecks({
        root,
        run: (stage: string) => {
          if (stage === "test") writeFileSync(join(root, "public/maps/extra.json"), "extra");
        },
      }),
    ).toThrow(/map inputs or outputs changed/u);
    const file = join(root, "scripts/maps/sources/source.json.gz");
    rmSync(file);
    symlinkSync(join(root, "public/maps/layer.json"), file);
    expect(() => captureMapInputs(root)).toThrow(/regular/u);
  });

  it("propagates the original unit failure and never proceeds to build", () => {
    const root = fixture();
    const calls: string[] = [];
    expect(() =>
      runStaticChecks({
        root,
        run: (stage: string) => {
          calls.push(stage);
          if (stage === "test") throw new Error("original test failed");
        },
      }),
    ).toThrow("original test failed");
    expect(calls).not.toContain("build");
  });

  it("preserves a command-name override and detects changed selected tool bytes", () => {
    const root = fixture();
    const bin = join(root, "bin");
    mkdirSync(bin);
    const command = join(bin, "controlled-mapshaper");
    writeFileSync(command, "original tool");
    vi.stubEnv("MAPSHAPER_BIN", "controlled-mapshaper");
    vi.stubEnv("PATH", bin + delimiter + process.env.PATH);
    expect(() => runStaticChecks({ root, run: () => {} })).not.toThrow();
    expect(() =>
      runStaticChecks({
        root,
        run: (stage: string) => {
          if (stage === "test") writeFileSync(command, "changed tool");
        },
      }),
    ).toThrow(/map inputs or outputs changed/u);
  });
});
