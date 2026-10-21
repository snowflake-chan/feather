export interface FeatherBuildResult {
  output: string;
  manifest: {
    map: { id: string; name?: string; version?: string };
    storage?: { volume?: string };
    content: { hash?: string };
  };
}
export function buildProjectArchive(
  archive: string,
  output?: string,
  options?: { version?: string },
): FeatherBuildResult;
