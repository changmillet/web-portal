import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  constants,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { basename, delimiter, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { resolveMapshaper } from "./maps/lib/mapshaper.mjs";

const staticCheckStages = Object.freeze([
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

export function captureMapInputs(root = process.cwd()) {
  const files = new Map();
  function add(file, label = relative(root, file)) {
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Map inputs require regular paths: ${label}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(file).sort()) {
        if (name !== ".toolchain" && name !== "node_modules")
          add(join(file, name), `${label}/${name}`);
      }
    } else if (stat.isFile()) {
      files.set(label, createHash("sha256").update(readFileSync(file)).digest("hex"));
    } else throw new Error(`Map inputs require regular files: ${label}`);
  }
  for (const name of [
    "scripts/maps",
    "public/maps",
    "contracts/database-engine/portal",
    "src/i18n/locations.generated.json",
    "src/features/catalog/region-map-manifest.generated.json",
    "scripts/run-static-checks.mjs",
    "tests/unit/region-map-assets.test.ts",
    "vitest.unit.config.ts",
    "package.json",
    "pnpm-lock.yaml",
    ".node-version",
  ])
    add(join(root, name));
  const tool = resolveMapshaper(root);
  if (tool.args.length) {
    // pnpm's package link is expected; hash its actual package files, not all node_modules.
    add(realpathSync(join(root, "node_modules/mapshaper")), "mapshaper-package");
  } else {
    // The standalone override is an explicit existing generator interface.
    const windows = process.platform === "win32";
    // Node's direct executable search uses COM/EXE on Windows, not PATHEXT.
    const extensions = windows
      ? [...(basename(tool.command).includes(".") ? [""] : []), ".com", ".exe"]
      : [""];
    const hasPath = windows ? /[/\\:]/u.test(tool.command) : tool.command.includes("/");
    const directories = windows
      ? [process.cwd(), ...(process.env.PATH ?? "").split(delimiter)]
      : (process.env.PATH ?? "").split(delimiter);
    const candidates = hasPath
      ? extensions.map((extension) => resolve(tool.command + extension))
      : directories.flatMap((directory) =>
          extensions.map((extension) => join(directory, tool.command + extension)),
        );
    const executable = candidates.find((candidate) => {
      try {
        if (!statSync(candidate).isFile()) return false;
        if (!windows) accessSync(candidate, constants.X_OK);
        return true;
      } catch {
        return false;
      }
    });
    if (!executable) throw new Error(`Cannot resolve selected mapshaper command: ${tool.command}`);
    add(realpathSync(executable), "mapshaper-selected-command");
    if (tool.origin === "scripts/maps/.toolchain")
      add(
        realpathSync(join(root, "scripts/maps/.toolchain/node_modules/mapshaper")),
        "mapshaper-package",
      );
  }
  return {
    root: realpathSync(root),
    node: { version: process.version, executable: process.execPath },
    tool,
    files: Object.fromEntries([...files.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}

function runStage(stage) {
  // Closed source-authored stages retain the original package-script shell
  // contract, including pnpm.cmd on Windows. No CLI input enters the shell.
  const result = childProcess.spawnSync(`pnpm run ${stage}`, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${stage} failed with ${result.signal ?? result.status}.`);
}

export function runStaticChecks({ root = process.cwd(), run = runStage } = {}) {
  let initial;
  function verify() {
    if (JSON.stringify(captureMapInputs(root)) !== initial)
      throw new Error("Region map inputs or outputs changed during the static checks.");
  }
  for (const stage of staticCheckStages) {
    if (stage === "check:maplibre") initial = JSON.stringify(captureMapInputs(root));
    run(stage);
    // The unchanged, unfiltered unit suite performs the full region rebuild.
    // This in-memory input guard cannot assert success or skip that actual test.
    if (stage === "test") verify();
  }
  verify();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    runStaticChecks();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
