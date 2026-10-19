export type LocalSharedScriptActionName = 'share' | 'save' | 'unshare';

/**
 * A shared-script save only changes its content hash. It remains shared until
 * the caller explicitly unshares it.
 */
export function isSharedAfterLocalScriptAction(
  action: LocalSharedScriptActionName,
): boolean {
  return action !== 'unshare';
}

/** A stale editor must never recreate a script another map has unshared. */
export function canPersistLocalSharedScript(
  action: LocalSharedScriptActionName,
  existsInAuthoritativeSnapshot: boolean,
): boolean {
  return action !== 'save' || existsInAuthoritativeSnapshot;
}

export type LocalSharedScriptSnapshot = {
  id: string;
  name: string;
  hash: string;
  isClient: boolean;
  isShare: boolean;
  order: number;
  lockedMapId: number;
  lockedMapTitle: string;
};

export type LocalSharedScriptMutation =
  | { action: 'save'; hash: string; name: string; isClient: boolean; order: number }
  | { action: 'rename'; name: string }
  | { action: 'delete' }
  | { action: 'lock'; ownerId: number; ownerTitle: string }
  | { action: 'unlock'; ownerId: number };

/**
 * Applies a mutation to the map group's authoritative shared-script entry.
 * Returning `undefined` represents a shared-script deletion. Lock ownership
 * uses a per-runtime numeric ID because local maps all have contentId=0.
 */
export function applyLocalSharedScriptMutation(
  script: LocalSharedScriptSnapshot | undefined,
  mutation: LocalSharedScriptMutation,
  callerOwnerId = 0,
): LocalSharedScriptSnapshot | undefined {
  if (!script?.isShare) {
    throw new Error('script is no longer shared');
  }
  if (
    script.lockedMapId &&
    callerOwnerId !== script.lockedMapId
  ) {
    throw new Error(`script is locked by ${script.lockedMapTitle || 'another map'}`);
  }
  switch (mutation.action) {
    case 'save':
      return { ...script, ...mutation };
    case 'rename':
      return { ...script, name: mutation.name };
    case 'delete':
      return undefined;
    case 'lock':
      return {
        ...script,
        lockedMapId: mutation.ownerId,
        lockedMapTitle: mutation.ownerTitle,
      };
    case 'unlock':
      return { ...script, lockedMapId: 0, lockedMapTitle: '' };
  }
}

/** A stable, non-zero uint32 owner ID for a local map runtime/container. */
export function localSharedScriptLockOwnerId(runtimeName: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < runtimeName.length; index += 1) {
    hash ^= runtimeName.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) || 1;
}
