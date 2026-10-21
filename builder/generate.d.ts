export function generateProject(
  workspace: string,
  dataRoot: string,
): Promise<{
  projectHash: string;
  permissionHash: string;
  extraProjectHash: string;
}>;
