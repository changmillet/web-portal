import { spawnSync } from "node:child_process";

if (!process.env.npm_execpath) {
  throw new Error("Start the local Atlas preview with pnpm local:atlas.");
}

// Reuse dev's predev asset generation with the same presentation and data scope.
const result = spawnSync(
  process.execPath,
  [process.env.npm_execpath, "run", "dev", "--hostname", "127.0.0.1", "--port", "3000"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PORTAL_BRAND: "atlas",
      PORTAL_DATA_BRANDS: "tiangong_lca,bafu,uslci,worldsteel",
      SITE_URL: "http://localhost:3000",
    },
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
