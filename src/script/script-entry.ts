/**
 * Maps created by older migrator versions used a generated wrapper named
 * `_migrated_index.js` as their script entry.  The original `index.js` is
 * already part of the project, so run it directly when it is available.
 *
 * New migrations persist their original scriptIndex and do not need this
 * compatibility path.  Keeping it here lets existing imported maps benefit
 * without being exported again.
 */
const LEGACY_MIGRATED_ENTRY = /^_+migrated_index\.js$/;

export function resolveRuntimeScriptEntry(
  scriptIndex: string,
  assets: Record<string, unknown>,
) {
  return LEGACY_MIGRATED_ENTRY.test(scriptIndex) && assets['index.js']
    ? 'index.js'
    : scriptIndex;
}
