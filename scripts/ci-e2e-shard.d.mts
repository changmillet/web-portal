export interface E2eSpecEntry {
  path: string;
  weight: number;
}

export function discoverE2eSpecs(root?: string): E2eSpecEntry[];
export function partitionE2eSpecs(entries: E2eSpecEntry[], totalShards: number): string[][];
