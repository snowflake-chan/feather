import type { Logger } from 'pino';

import { BuildSystem, BuildSystemAPI, TaskObject } from '../type';

export type Migration = (
  buildSystem: BuildSystem,
  hash: string,
) => Promise<string>;
const VERSION_REGEX_STR = `^\\d+\\.\\d+\\.\\d+$`;
const VERSION_REGEX = new RegExp(VERSION_REGEX_STR);

export interface MigrationRaw {
  migration: Migration;
  name: string;
  fromVersion: string;
  toVersion: string;
}

export function migrationTaskName(
  name: string,
  fromVersion: string,
  toVersion: string,
) {
  return `${name}:${fromVersion}:${toVersion}`;
}

/**
 * Compares two versions of the form `n.n.n` where n is
 * any integer. Returns -1 if the first argument is strictly
 * lower than the second argument, otherwise 1.
 */
export function cmpVersions(a: string, b: string): number {
  const va = a.split('.').map((v) => parseInt(v));
  const vb = b.split('.').map((v) => parseInt(v));
  for (let i = 0; i < va.length; i++) {
    if (va[i] !== vb[i]) {
      return va[i] < vb[i] ? -1 : 1;
    }
  }
  return 1;
}

type VersionMap = { [fromVersion: string]: string[] }; // -> toVersion[]

class DAGStore {
  public forwardMap: VersionMap = {}; // -> toVersion
  public versions: { [version: string]: true } = {};
}

let dags: { [name: string]: DAGStore } | undefined = undefined;

export function preprocessMigrations(mas: MigrationRaw[]) {
  const migrationTasks: TaskObject = {};
  dags = {};

  for (let i = 0; i < mas.length; i++) {
    const { name, fromVersion, toVersion, migration } = mas[i];
    if (!VERSION_REGEX.test(fromVersion)) {
      throw new Error(`migration: ${name} bad from-version: ${fromVersion}`);
    }
    if (!VERSION_REGEX.test(toVersion)) {
      throw new Error(`migration: ${name} bad to-version: ${toVersion}`);
    }

    // These version requirements ensure that we have a DAG, if they are removed or chnaged,
    // the migration path calculation algorithm needs to be changed.
    if (fromVersion === toVersion) {
      throw new Error(
        `migration: ${name} from-version = to-version: ${fromVersion}`,
      );
    }
    if (cmpVersions(fromVersion, toVersion) >= 0) {
      // Because this can cause the migrations graph to become cyclic,
      // which breaks a lot of invariants we rely on
      throw new Error(`migration: ${name} violates order invariant`);
    }
    const taskName = migrationTaskName(name, fromVersion, toVersion);
    if (migrationTasks[taskName] !== undefined) {
      throw new Error(
        `migration: ${name} from ${fromVersion} to ${toVersion} is duplicated`,
      );
    }

    migrationTasks[taskName] = migration;

    let dag: DAGStore | undefined = dags[name];
    if (dag === undefined) {
      dag = new DAGStore();
      dags[name] = dag;
    }

    dag.versions[fromVersion] = true;
    dag.versions[toVersion] = true;

    if (dag.forwardMap[fromVersion] === undefined) {
      dag.forwardMap[fromVersion] = [];
    }
    dag.forwardMap[fromVersion].push(toVersion);

    if (dag.forwardMap[toVersion] === undefined) {
      dag.forwardMap[toVersion] = [];
    }
  }

  return {
    migrationTasks,
    dags,
  };
}

export function getMigrationPath(spec: {
  name: string;
  fromVersion: string;
  toVersion: string;
}): string[] {
  const { name, fromVersion, toVersion } = spec;
  if (fromVersion === toVersion) {
    throw new Error('versions must be different');
  }
  if (!dags) {
    throw new Error('getMigrationTasks() not initialized');
  }
  const dag = dags[name];
  if (!dag || !dag.versions[fromVersion] || !dag.versions[toVersion]) {
    throw new Error(
      `no migration exists for ${name} from ${fromVersion} to ${toVersion}`,
    );
  }

  const res = _getMigrationPathBFS(dag, fromVersion, toVersion);
  if (res === false) {
    throw new Error(
      `migration failed for ${name} from ${fromVersion} to ${toVersion}`,
    );
  }

  const path: string[] = [];
  for (let f = 0; f < res.length - 1; f++) {
    const fromV = res[f];
    const toV = res[f + 1];
    path.push(migrationTaskName(name, fromV, toV));
  }
  return path;
}

function _getMigrationPathBFS(
  dag: DAGStore,
  fromVersion: string,
  toVersion: string,
): string[] | false {
  const bestPrevious: { [toNode: string]: string } = {
    [fromVersion]: '',
  }; // toNode -> fromNode
  const visitQueue: string[] = [fromVersion];

  let currentNodeIndex = 0;
  while (currentNodeIndex < visitQueue.length) {
    const n = visitQueue[currentNodeIndex];
    if (n === toVersion) {
      // Found a shortest path
      const path: string[] = [];
      let walkBack = n;
      while (true) {
        path.unshift(walkBack);
        const bp = bestPrevious[walkBack];
        if (bp === undefined) {
          throw new Error('failed to find path');
        }
        if (bp === '') {
          return path;
        }
        walkBack = bp;
      }
    }
    if (cmpVersions(n, toVersion) !== -1) {
      // No need to search past the version we're looking to get to
      currentNodeIndex++;
      continue;
    }
    const nexts = dag.forwardMap[n];
    for (let i = 0; i < nexts.length; i++) {
      const nn = nexts[i];
      if (bestPrevious[nn] === undefined) {
        visitQueue.push(nn);
        bestPrevious[nn] = n;
      }
    }
    currentNodeIndex++;
  }

  return false;
}

export async function buildMigrate(
  bs: BuildSystemAPI,
  logger: Logger,
  name: string,
  fromVersion: string,
  toVersion: string,
  hash: string,
) {
  const migrationChain = getMigrationPath({
    name,
    fromVersion,
    toVersion,
  });
  logger.info(`migration path: [${migrationChain.join(', ')}]`);
  for (let i = 0; i < migrationChain.length; i++) {
    logger.info(`running migration ${migrationChain[i]}`);
    try {
      const nextHash = await bs.build(migrationChain[i] as any, hash);
      hash = nextHash;
    } catch (e) {
      const chainStr = migrationChain.join(' ');
      logger.error(`
                Could not migrate "${name}" from "${fromVersion}" to "${toVersion}"
                Broke when trying to migrate "${hash}" with "${migrationChain[i]}" in chain
                ${chainStr}`);
      logger.error(e);
      throw e;
    }
  }
  return hash;
}
