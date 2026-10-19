import { RigidBodySet, ContactIndex, RigidBodyFlags } from './physics-schema';
import { indexEq } from '@box/utils/id';
import { MAX_BODIES } from './def';

let FLAG_MASK =
  RigidBodyFlags.LOCKED | RigidBodyFlags.FIXED | RigidBodyFlags.PLAYER;

const PENDING_LOCK: number[] = [];
function lockRec(bodies: RigidBodySet, contacts: ContactIndex) {
  while (PENDING_LOCK.length > 0) {
    const i = PENDING_LOCK.pop() || 0;
    const adj = contacts[i].body;
    for (let j = 0; j < adj.length; ++j) {
      const otherId = adj[j].otherId;
      const otherIndex = indexEq(bodies, otherId);
      if (otherIndex < 0) {
        continue;
      }
      const b = bodies[otherIndex];
      if (b.flags & FLAG_MASK) {
        continue;
      }
      b.flags |= RigidBodyFlags.LOCKED;
      PENDING_LOCK.push(otherIndex);
    }
  }
}

// grow all touching body lock sets recursively
export function expandLockSet(
  bodies: RigidBodySet,
  contact: ContactIndex,
  skipPlayers: boolean,
) {
  for (let i = 0; i < bodies.length; ++i) {
    if (bodies[i].flags & RigidBodyFlags.LOCKED) {
      PENDING_LOCK.push(i);
    }
  }
  if (PENDING_LOCK.length > 0) {
    FLAG_MASK =
      RigidBodyFlags.LOCKED |
      RigidBodyFlags.FIXED |
      (skipPlayers ? RigidBodyFlags.PLAYER : 0);
    lockRec(bodies, contact);
  }
}

// contact islands
export const ISLAND_PARENT = new Int32Array(MAX_BODIES + 1);
export const ISLAND_RANK = new Int32Array(MAX_BODIES + 1);
export const LOCK_ISLAND = MAX_BODIES;

export function islandFind(a: number) {
  let x = a;
  while (true) {
    const p = ISLAND_PARENT[x];
    if (p === x || p < 0) {
      return p;
    }
    const n = ISLAND_PARENT[p];
    ISLAND_PARENT[x] = n;
    x = p;
  }
}

export function islandLink(a: number, b: number) {
  const x = islandFind(a);
  const y = islandFind(b);
  if (x < 0 || y < 0) {
    return;
  }
  const xr = ISLAND_RANK[x];
  const yr = ISLAND_RANK[y];
  if (xr < yr) {
    // xrank is smaller so make y parent
    ISLAND_PARENT[x] = y;
    if (xr === yr) {
      ISLAND_RANK[y] += 1;
    }
  } else {
    ISLAND_PARENT[y] = x;
    if (xr === yr) {
      ISLAND_RANK[x] += 1;
    }
  }
}
