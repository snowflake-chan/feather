/**
 * A resource reference must always be a content-addressed hash. Keeping this
 * check at project-library boundaries prevents a partial VOXA save from
 * turning one bad entry into a runtime-wide `retrieveContent` failure.
 */
export function isContentHash(value: unknown): value is string {
  const hash = typeof value === 'string' ? value : '';
  return (
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) ||
    /^[A-Za-z0-9_-]{43}$/.test(hash)
  );
}
