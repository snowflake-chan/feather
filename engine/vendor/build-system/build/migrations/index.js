"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationTaskName = migrationTaskName;
exports.cmpVersions = cmpVersions;
exports.preprocessMigrations = preprocessMigrations;
exports.getMigrationPath = getMigrationPath;
exports.buildMigrate = buildMigrate;
const VERSION_REGEX_STR = `^\\d+\\.\\d+\\.\\d+$`;
const VERSION_REGEX = new RegExp(VERSION_REGEX_STR);
function migrationTaskName(name, fromVersion, toVersion) {
    return `${name}:${fromVersion}:${toVersion}`;
}
/**
 * Compares two versions of the form `n.n.n` where n is
 * any integer. Returns -1 if the first argument is strictly
 * lower than the second argument, otherwise 1.
 */
function cmpVersions(a, b) {
    const va = a.split('.').map((v) => parseInt(v));
    const vb = b.split('.').map((v) => parseInt(v));
    for (let i = 0; i < va.length; i++) {
        if (va[i] !== vb[i]) {
            return va[i] < vb[i] ? -1 : 1;
        }
    }
    return 1;
}
class DAGStore {
    constructor() {
        this.forwardMap = {}; // -> toVersion
        this.versions = {};
    }
}
let dags = undefined;
function preprocessMigrations(mas) {
    const migrationTasks = {};
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
            throw new Error(`migration: ${name} from-version = to-version: ${fromVersion}`);
        }
        if (cmpVersions(fromVersion, toVersion) >= 0) {
            // Because this can cause the migrations graph to become cyclic,
            // which breaks a lot of invariants we rely on
            throw new Error(`migration: ${name} violates order invariant`);
        }
        const taskName = migrationTaskName(name, fromVersion, toVersion);
        if (migrationTasks[taskName] !== undefined) {
            throw new Error(`migration: ${name} from ${fromVersion} to ${toVersion} is duplicated`);
        }
        migrationTasks[taskName] = migration;
        let dag = dags[name];
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
function getMigrationPath(spec) {
    const { name, fromVersion, toVersion } = spec;
    if (fromVersion === toVersion) {
        throw new Error('versions must be different');
    }
    if (!dags) {
        throw new Error('getMigrationTasks() not initialized');
    }
    const dag = dags[name];
    if (!dag || !dag.versions[fromVersion] || !dag.versions[toVersion]) {
        throw new Error(`no migration exists for ${name} from ${fromVersion} to ${toVersion}`);
    }
    const res = _getMigrationPathBFS(dag, fromVersion, toVersion);
    if (res === false) {
        throw new Error(`migration failed for ${name} from ${fromVersion} to ${toVersion}`);
    }
    const path = [];
    for (let f = 0; f < res.length - 1; f++) {
        const fromV = res[f];
        const toV = res[f + 1];
        path.push(migrationTaskName(name, fromV, toV));
    }
    return path;
}
function _getMigrationPathBFS(dag, fromVersion, toVersion) {
    const bestPrevious = {
        [fromVersion]: '',
    }; // toNode -> fromNode
    const visitQueue = [fromVersion];
    let currentNodeIndex = 0;
    while (currentNodeIndex < visitQueue.length) {
        const n = visitQueue[currentNodeIndex];
        if (n === toVersion) {
            // Found a shortest path
            const path = [];
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
function buildMigrate(bs, logger, name, fromVersion, toVersion, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const migrationChain = getMigrationPath({
            name,
            fromVersion,
            toVersion,
        });
        logger.info(`migration path: [${migrationChain.join(', ')}]`);
        for (let i = 0; i < migrationChain.length; i++) {
            logger.info(`running migration ${migrationChain[i]}`);
            try {
                const nextHash = yield bs.build(migrationChain[i], hash);
                hash = nextHash;
            }
            catch (e) {
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
    });
}
//# sourceMappingURL=index.js.map