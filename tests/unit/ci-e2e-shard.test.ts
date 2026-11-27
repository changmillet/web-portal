// @vitest-environment node
import { describe, expect, it } from "vitest";

import { discoverE2eSpecs, partitionE2eSpecs } from "../../scripts/ci-e2e-shard.mjs";

describe("Portal E2E CI sharding", () => {
  it("partitions every tests/e2e spec without gaps or overlap and pins seo-checker to shard 1", () => {
    const entries = discoverE2eSpecs();
    expect(entries.length).toBeGreaterThanOrEqual(2);

    const partitions = partitionE2eSpecs(entries, 2);
    expect(partitions).toHaveLength(2);
    expect(partitions[0]).toContain("tests/e2e/seo-checker.spec.ts");
    expect(partitions[1]).not.toContain("tests/e2e/seo-checker.spec.ts");

    const combined = partitions.flat().sort((a, b) => a.localeCompare(b));
    const expected = entries.map((entry) => entry.path).sort((a, b) => a.localeCompare(b));
    expect(new Set(combined).size).toBe(expected.length);
    expect(combined).toEqual(expected);
  });
});
