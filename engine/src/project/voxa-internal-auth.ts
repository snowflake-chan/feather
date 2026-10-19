/**
 * Authenticates calls from an isolated game runtime to the co-deployed VOXA
 * service. Browser requests must use a player session instead; this secret is
 * only present in trusted runtime containers.
 */
export function voxaInternalHeaders(): Record<string, string> {
  const secret = String(process.env.PERMISSION_TOKEN_SECRET || '').trim();
  return secret ? { Authorization: `Bearer ${secret}` } : {};
}
