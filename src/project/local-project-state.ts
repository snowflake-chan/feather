import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import type { RetrievedGroupProjectMetaData } from '@box/build-system/group-project/index';

type LocalProjectState = {
  formatVersion?: number;
  permissionHash?: string;
  extraProjectHash?: string;
  extraProjectMode?: string;
  cloudMapId?: number;
  skinPreviews?: Record<string, string>;
  skinProjects?: Record<string, string>;
  modelPreviews?: Record<string, string>;
  modelProjects?: Record<string, string>;
  deletedProjectModelPaths?: string[];
  projectModelPathsByMap?: Record<string, string[]>;
  groupProjectMetaData?: RetrievedGroupProjectMetaData;
  updatedAt?: string;
};

type LocalGroupProjectState = LocalProjectState & {
  formatVersion: number;
  mapGroupId?: string;
  revision?: number;
  createdAt?: string;
};

type GroupStateLockMetadata = {
  formatVersion: 1;
  pid: number;
  hostname: string;
  token: string;
  createdAt: string;
};

type GroupStateLockSnapshot = {
  metadata?: GroupStateLockMetadata;
  ageMs: number;
  device: number;
  inode: number;
  size: number;
  modifiedMs: number;
};

function writeStateAtomically(statePath: string, state: object) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(temporaryPath, statePath);
}

function copyProjectBlobsToGroup() {
  const groupBlobRoot = process.env.BOX_GROUP_CONTENT_PATH;
  const statePath = process.env.BOX_PROJECT_STATE_PATH;
  if (!groupBlobRoot || !statePath) return;
  const projectBlobRoot = path.join(path.dirname(statePath), 'blobs');
  if (!fs.existsSync(projectBlobRoot)) return;
  fs.mkdirSync(groupBlobRoot, { recursive: true });
  for (const entry of fs.readdirSync(projectBlobRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const destination = path.join(groupBlobRoot, entry.name);
    if (fs.existsSync(destination)) continue;
    const temporaryPath = `${destination}.${process.pid}.${randomUUID()}.tmp`;
    try {
      fs.copyFileSync(path.join(projectBlobRoot, entry.name), temporaryPath);
      fs.chmodSync(temporaryPath, 0o644);
      if (fs.existsSync(destination)) continue;
      try {
        fs.renameSync(temporaryPath, destination);
      } catch (error) {
        // Multiple map runtimes can publish the same immutable hash. The
        // winner has already installed the complete file atomically.
        if (!fs.existsSync(destination)) throw error;
      }
    } finally {
      fs.rmSync(temporaryPath, { force: true });
    }
  }
}

function positiveMilliseconds(name: string, fallback: number, minimum: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= minimum
    ? Math.floor(value)
    : fallback;
}

function lockTimings() {
  const timeoutMs = positiveMilliseconds(
    'BOX_GROUP_STATE_LOCK_TIMEOUT_MS',
    30_000,
    50,
  );
  const staleMs = positiveMilliseconds(
    'BOX_GROUP_STATE_LOCK_STALE_MS',
    300_000,
    1_000,
  );
  return { timeoutMs, staleMs: Math.max(staleMs, timeoutMs * 2) };
}

function readGroupStateLock(lockPath: string): GroupStateLockSnapshot | undefined {
  try {
    const stats = fs.statSync(lockPath);
    let metadata: GroupStateLockMetadata | undefined;
    try {
      const candidate = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      if (
        candidate?.formatVersion === 1 &&
        Number.isInteger(candidate.pid) &&
        candidate.pid > 0 &&
        typeof candidate.hostname === 'string' &&
        typeof candidate.token === 'string' &&
        typeof candidate.createdAt === 'string'
      ) {
        metadata = candidate;
      }
    } catch {
      // Locks written by older builds were empty. Their mtime still permits
      // conservative expiry without treating a live legacy owner as dead.
    }
    return {
      metadata,
      ageMs: Math.max(0, Date.now() - stats.mtimeMs),
      device: stats.dev,
      inode: stats.ino,
      size: stats.size,
      modifiedMs: stats.mtimeMs,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

function isLocalLockOwnerAlive(metadata: GroupStateLockMetadata) {
  if (metadata.hostname !== os.hostname()) return undefined;
  try {
    process.kill(metadata.pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'ESRCH' ? false : true;
  }
}

function sameLockSnapshot(
  left: GroupStateLockSnapshot,
  right: GroupStateLockSnapshot,
) {
  if (left.metadata?.token || right.metadata?.token) {
    return left.metadata?.token === right.metadata?.token;
  }
  return left.device === right.device &&
    left.inode === right.inode &&
    left.size === right.size &&
    left.modifiedMs === right.modifiedMs;
}

function recoverAbandonedGroupStateLock(lockPath: string, staleMs: number) {
  const observed = readGroupStateLock(lockPath);
  if (!observed) return true;
  const ownerAlive = observed.metadata
    ? isLocalLockOwnerAlive(observed.metadata)
    : undefined;
  if (ownerAlive === true) return false;
  if (ownerAlive !== false && observed.ageMs < staleMs) return false;

  // Verify the path still names the lock we inspected. This avoids removing
  // a replacement lock acquired after the original owner released it.
  const current = readGroupStateLock(lockPath);
  if (!current || !sameLockSnapshot(observed, current)) return true;
  const abandonedPath = `${lockPath}.${process.pid}.${randomUUID()}.abandoned`;
  try {
    fs.renameSync(lockPath, abandonedPath);
    const moved = readGroupStateLock(abandonedPath);
    if (!moved || sameLockSnapshot(observed, moved)) return true;
    // An extremely narrow replacement race moved a different lock. Restore
    // it when possible rather than allowing two state writers to proceed.
    if (!fs.existsSync(lockPath)) fs.renameSync(abandonedPath, lockPath);
    return false;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
    throw error;
  } finally {
    fs.rmSync(abandonedPath, { force: true });
  }
}

function lockOwnerDescription(lockPath: string) {
  const snapshot = readGroupStateLock(lockPath);
  if (!snapshot) return 'owner=unknown';
  const age = Math.round(snapshot.ageMs);
  const metadata = snapshot.metadata;
  return metadata
    ? `owner pid=${metadata.pid} host=${metadata.hostname} age=${age}ms token=${metadata.token}`
    : `owner=legacy age=${age}ms`;
}

function releaseOwnedGroupStateLock(
  lockPath: string,
  descriptor: number,
  token: string,
) {
  fs.closeSync(descriptor);
  const snapshot = readGroupStateLock(lockPath);
  if (snapshot?.metadata?.token === token) fs.rmSync(lockPath, { force: true });
}

function withGroupStateLock<T>(statePath: string, operation: () => T): T {
  const lockPath = `${statePath}.lock`;
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const { timeoutMs, staleMs } = lockTimings();
  const deadline = Date.now() + timeoutMs;
  let descriptor: number | undefined;
  const token = randomUUID();
  while (descriptor === undefined) {
    try {
      descriptor = fs.openSync(lockPath, 'wx');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (recoverAbandonedGroupStateLock(lockPath, staleMs)) continue;
      if (Date.now() >= deadline) {
        throw new Error(
          `timed out waiting for map group state lock (${lockOwnerDescription(lockPath)})`,
        );
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
      continue;
    }
    try {
      const metadata: GroupStateLockMetadata = {
        formatVersion: 1,
        pid: process.pid,
        hostname: os.hostname(),
        token,
        createdAt: new Date().toISOString(),
      };
      fs.writeFileSync(descriptor, `${JSON.stringify(metadata)}\n`);
      fs.fsyncSync(descriptor);
    } catch (error) {
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.rmSync(lockPath, { force: true });
      throw error;
    }
  }
  try {
    return operation();
  } finally {
    releaseOwnedGroupStateLock(lockPath, descriptor, token);
  }
}

/**
 * Serializes long-running shared-resource edits across map runtimes. Unlike
 * the short state-file lock, this may cover content retrieval and hashing, so
 * two maps cannot both read the same old snapshot and publish competing edits.
 */
export async function withLocalGroupSharedResourceLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const statePath = process.env.BOX_GROUP_PROJECT_STATE_PATH;
  if (!statePath) return operation();
  const lockPath = `${statePath}.shared-resource.lock`;
  const token = randomUUID();
  const { timeoutMs, staleMs } = lockTimings();
  const deadline = Date.now() + timeoutMs;
  let descriptor: fs.promises.FileHandle | undefined;
  while (!descriptor) {
    try {
      descriptor = await fs.promises.open(lockPath, 'wx');
      await descriptor.writeFile(`${token}\n`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const snapshot = readGroupStateLock(lockPath);
      if (snapshot && snapshot.ageMs >= staleMs) {
        fs.rmSync(lockPath, { force: true });
        continue;
      }
      if (Date.now() >= deadline) {
        throw new Error('timed out waiting for shared resource edit lock');
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  try {
    return await operation();
  } finally {
    await descriptor.close();
    try {
      if (fs.readFileSync(lockPath, 'utf8').trim() === token) {
        fs.rmSync(lockPath, { force: true });
      }
    } catch {
      // A stale-lock recovery must never be undone by a prior owner.
    }
  }
}

function updateLocalGroupProjectState(
  update: (state: LocalGroupProjectState) => void | boolean,
) {
  const statePath = process.env.BOX_GROUP_PROJECT_STATE_PATH;
  if (!statePath) return;
  // Content hashes are immutable and copied through an atomic rename. Keep
  // this potentially expensive I/O outside the small state merge lock so a
  // large model library cannot prevent another map runtime from starting.
  copyProjectBlobsToGroup();
  withGroupStateLock(statePath, () => {
    const previous = readLocalProjectState(statePath) as LocalGroupProjectState;
    const now = new Date().toISOString();
    const next: LocalGroupProjectState = {
      ...previous,
      formatVersion: 1,
      revision: (previous.revision || 0) + 1,
      createdAt: previous.createdAt || now,
      updatedAt: now,
    };
    if (update(next) === false) return;
    writeStateAtomically(statePath, next);
  });
}

function readLocalProjectState(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
): LocalProjectState {
  if (!statePath) return {};
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

function readLocalProjectStateWithGroup(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
): LocalProjectState {
  const groupStatePath = process.env.BOX_GROUP_PROJECT_STATE_PATH;
  const groupState = groupStatePath && groupStatePath !== statePath
    ? readLocalProjectState(groupStatePath)
    : {};
  return {
    ...readLocalProjectState(statePath),
    // Shared resource roots are authoritative at the map-group level. Member
    // files can contain an older materialized snapshot and must not mask a
    // newer group revision written by another map runtime.
    ...groupState,
  };
}

export function getLocalProjectStateHash(statePath = process.env.BOX_PROJECT_STATE_PATH) {
  const state = readLocalProjectState(statePath);
  return typeof state.permissionHash === 'string' ? state.permissionHash : '';
}

export function getLocalExtraProjectStateHash(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const state = readLocalProjectStateWithGroup(statePath);
  return typeof state.extraProjectHash === 'string'
    ? state.extraProjectHash
    : '';
}

export function getLocalExtraProjectMode(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const state = readLocalProjectStateWithGroup(statePath);
  return typeof state.extraProjectMode === 'string'
    ? state.extraProjectMode
    : '';
}

export function getLocalGroupProjectMetaData(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const state = readLocalProjectStateWithGroup(statePath);
  const value = state.groupProjectMetaData;
  if (!value || typeof value.version !== 'string' || !value.hashes) {
    return undefined;
  }
  return value;
}

export function getLocalProjectSkinPreviews(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const value = readLocalProjectStateWithGroup(statePath).skinPreviews;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([name, hash]) =>
        Boolean(name) && typeof hash === 'string' && Boolean(hash),
    ),
  );
}

export function getLocalProjectSkinProjects(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const value = readLocalProjectStateWithGroup(statePath).skinProjects;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([name, hash]) =>
        Boolean(name) && typeof hash === 'string' && Boolean(hash),
    ),
  );
}

function getLocalProjectModelMetadata(
  key: 'modelPreviews' | 'modelProjects',
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const value = readLocalProjectStateWithGroup(statePath)[key];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([name, hash]) => Boolean(name) && typeof hash === 'string' && Boolean(hash),
    ),
  );
}

export function getLocalProjectModelPreviews(statePath = process.env.BOX_PROJECT_STATE_PATH) {
  return getLocalProjectModelMetadata('modelPreviews', statePath);
}

export function getLocalProjectModelProjects(statePath = process.env.BOX_PROJECT_STATE_PATH) {
  return getLocalProjectModelMetadata('modelProjects', statePath);
}

export function getLocalProjectModelPaths(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const memberships = readLocalProjectStateWithGroup(statePath)
    .projectModelPathsByMap;
  if (!memberships || typeof memberships !== 'object' || Array.isArray(memberships)) {
    return [];
  }
  return Array.from(
    new Set(
      Object.values(memberships).flatMap((paths) =>
        Array.isArray(paths)
          ? paths.filter((value): value is string =>
              typeof value === 'string' && value.startsWith('mesh/'),
            )
          : [],
      ),
    ),
  ).sort();
}

export function getDeletedLocalProjectModelPaths(
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  const paths = readLocalProjectStateWithGroup(statePath)
    .deletedProjectModelPaths;
  if (!Array.isArray(paths)) return [];
  return Array.from(
    new Set(
      paths.filter(
        (value): value is string =>
          typeof value === 'string' && value.startsWith('mesh/'),
      ),
    ),
  ).sort();
}

export function setDeletedLocalProjectModelPath(
  meshPath: string,
  deleted: boolean,
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  if (!statePath || !meshPath.startsWith('mesh/')) return;
  const state = readLocalProjectState(statePath);
  const paths = new Set(
    Array.isArray(state.deletedProjectModelPaths)
      ? state.deletedProjectModelPaths.filter(
          (value): value is string => typeof value === 'string',
        )
      : [],
  );
  if (deleted) paths.add(meshPath);
  else paths.delete(meshPath);
  state.deletedProjectModelPaths = Array.from(paths).sort();
  state.updatedAt = new Date().toISOString();
  writeStateAtomically(statePath, state);
  updateLocalGroupProjectState((group) => {
    const groupPaths = new Set(
      Array.isArray(group.deletedProjectModelPaths)
        ? group.deletedProjectModelPaths
        : [],
    );
    if (deleted) groupPaths.add(meshPath);
    else groupPaths.delete(meshPath);
    group.deletedProjectModelPaths = Array.from(groupPaths).sort();
  });
}

export function syncLocalProjectModelPaths(
  paths: Iterable<string>,
  mapId = process.env.CONTAINER_NAME || '',
) {
  if (!mapId || !process.env.BOX_GROUP_PROJECT_STATE_PATH) return;
  const normalized = Array.from(
    new Set(
      Array.from(paths).filter(
        (value) => typeof value === 'string' && value.startsWith('mesh/'),
      ),
    ),
  ).sort();
  updateLocalGroupProjectState((group) => {
    const previous = Array.isArray(group.projectModelPathsByMap?.[mapId])
      ? group.projectModelPathsByMap![mapId]
          .filter((value): value is string => typeof value === 'string')
          .sort()
      : [];
    if (
      previous.length === normalized.length &&
      previous.every((value, index) => value === normalized[index])
    ) {
      return false;
    }
    group.projectModelPathsByMap = {
      ...(group.projectModelPathsByMap || {}),
      [mapId]: normalized,
    };
    return true;
  });
}

export function updateLocalProjectModelMetadata(
  update: (metadata: {
    modelPreviews: Record<string, string>;
    modelProjects: Record<string, string>;
  }) => void,
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  if (!statePath) return;
  const state = readLocalProjectState(statePath);
  const metadata = {
    modelPreviews: getLocalProjectModelPreviews(statePath),
    modelProjects: getLocalProjectModelProjects(statePath),
  };
  update(metadata);
  state.modelPreviews = metadata.modelPreviews;
  state.modelProjects = metadata.modelProjects;
  state.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(temporaryPath, statePath);
}

export function updateLocalProjectSkinMetadata(
  update: (metadata: {
    skinPreviews: Record<string, string>;
    skinProjects: Record<string, string>;
  }) => void,
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  if (!statePath) return;
  const state = readLocalProjectState(statePath);
  const metadata = {
    skinPreviews: getLocalProjectSkinPreviews(statePath),
    skinProjects: getLocalProjectSkinProjects(statePath),
  };
  update(metadata);
  state.skinPreviews = metadata.skinPreviews;
  state.skinProjects = metadata.skinProjects;
  state.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(temporaryPath, statePath);
}

/** Persists the editable project root separately from content-addressed blobs. */
export function persistLocalProjectState(
  permissionHash: string,
  extraProjectHash?: string,
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  if (!statePath || !permissionHash) return;
  const previous = readLocalProjectState(statePath);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(
      {
        formatVersion: 1,
        permissionHash,
        extraProjectHash:
          extraProjectHash === undefined
            ? previous.extraProjectHash || ''
            : extraProjectHash,
        extraProjectMode: previous.extraProjectMode || '',
        ...(previous.cloudMapId ? { cloudMapId: previous.cloudMapId } : {}),
        ...(previous.skinPreviews
          ? { skinPreviews: previous.skinPreviews }
          : {}),
        ...(previous.skinProjects
          ? { skinProjects: previous.skinProjects }
          : {}),
        ...(previous.modelPreviews
          ? { modelPreviews: previous.modelPreviews }
          : {}),
        ...(previous.modelProjects
          ? { modelProjects: previous.modelProjects }
          : {}),
        ...(previous.deletedProjectModelPaths
          ? { deletedProjectModelPaths: previous.deletedProjectModelPaths }
          : {}),
        ...(previous.groupProjectMetaData
          ? { groupProjectMetaData: previous.groupProjectMetaData }
          : {}),
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  fs.renameSync(temporaryPath, statePath);
  if (extraProjectHash !== undefined) {
    const current = readLocalProjectState(statePath);
    updateLocalGroupProjectState((group) => {
      group.extraProjectHash = current.extraProjectHash;
      group.extraProjectMode = current.extraProjectMode;
      group.skinPreviews = current.skinPreviews;
      group.skinProjects = current.skinProjects;
      group.modelPreviews = current.modelPreviews;
      group.modelProjects = current.modelProjects;
    });
  }
}

export function persistLocalGroupProjectMetaData(
  groupProjectMetaData: RetrievedGroupProjectMetaData,
  statePath = process.env.BOX_PROJECT_STATE_PATH,
) {
  if (!statePath || !groupProjectMetaData) return;
  const state = readLocalProjectState(statePath);
  state.groupProjectMetaData = groupProjectMetaData;
  state.updatedAt = new Date().toISOString();
  writeStateAtomically(statePath, state);
  updateLocalGroupProjectState((group) => {
    group.groupProjectMetaData = groupProjectMetaData;
  });
}
