export declare function captureMapInputs(root?: string): {
  root: string;
  node: { version: string; executable: string };
  tool: { command: string; args: string[]; origin: string };
  files: Record<string, string>;
};

export declare function runStaticChecks(options?: {
  root?: string;
  run?: (stage: string) => void;
}): void;
