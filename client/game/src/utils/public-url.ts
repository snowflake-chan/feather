/**
 * Resolve a same-origin path through the runtime prefix bootstrap.
 * Returns the value unchanged when no deployment prefix is active.
 */
export function resolvePublicUrl(value: string): string {
  const resolve = (
    window as unknown as { __BOX_RESOLVE_PUBLIC_URL__?: (target: string) => string }
  ).__BOX_RESOLVE_PUBLIC_URL__;
  return resolve ? resolve(value) : value;
}
