import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEO_SPEC = "tests/e2e/seo-checker.spec.ts";

export function discoverE2eSpecs(root = process.cwd()) {
  const e2eDir = resolve(root, "tests/e2e");
  return readdirSync(e2eDir)
    .filter((entry) => entry.endsWith(".spec.ts"))
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const relativePath = `tests/e2e/${entry}`;
      return {
        path: relativePath,
        weight: statSync(join(e2eDir, entry)).size,
      };
    });
}

export function partitionE2eSpecs(entries, totalShards) {
  if (!Number.isInteger(totalShards) || totalShards < 1) {
    throw new Error(`--total must be a positive integer; received ${String(totalShards)}`);
  }
  const shards = Array.from({ length: totalShards }, () => ({ files: [], weight: 0 }));
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
  const seoEntry = sorted.find((entry) => entry.path === SEO_SPEC);
  if (seoEntry) {
    shards[0].files.push(seoEntry.path);
    shards[0].weight += seoEntry.weight;
  }
  const remaining = sorted
    .filter((entry) => entry.path !== SEO_SPEC)
    .sort((a, b) => b.weight - a.weight || a.path.localeCompare(b.path));

  for (const entry of remaining) {
    let target = shards[0];
    for (let i = 1; i < shards.length; i += 1) {
      if (shards[i].weight < target.weight) target = shards[i];
    }
    target.files.push(entry.path);
    target.weight += entry.weight;
  }
  return shards.map((shard) => shard.files.sort((a, b) => a.localeCompare(b)));
}

function parseArgs(argv) {
  let shard = 1;
  let total = 1;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--shard") {
      shard = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--total") {
      total = Number(argv[i + 1]);
      i += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (!Number.isInteger(shard) || shard < 1 || shard > total) {
    throw new Error(`--shard must be between 1 and ${String(total)}; received ${String(shard)}`);
  }
  return { shard, total };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { shard, total } = parseArgs(process.argv.slice(2));
  const entries = discoverE2eSpecs();
  const partitions = partitionE2eSpecs(entries, total);
  const selected = partitions[shard - 1];
  if (!selected || selected.length === 0) {
    throw new Error(`E2E shard ${shard}/${total} resolved zero specs.`);
  }
  process.stdout.write(
    `Running Portal E2E shard ${shard}/${total} (${selected.length}/${entries.length} specs)\n`,
  );
  const result = spawnSync(
    process.execPath,
    ["scripts/run-production-e2e.mjs", "--", ...selected],
    {
      stdio: "inherit",
      env: process.env,
    },
  );
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
