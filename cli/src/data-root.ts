import os from 'node:os';
import path from 'node:path';

export function resolveDataRoot(rootArg?: string): string {
  return path.resolve(
    rootArg || process.env.FEATHER_DATA_ROOT || process.env.FEATHER_DATA_DIR || path.join(os.homedir(), '.feather'),
  );
}
