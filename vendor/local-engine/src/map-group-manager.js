'use strict';

const fs = require('fs');
const path = require('path');

const sharedStateKeys = [
    'extraProjectHash',
    'extraProjectMode',
    'skinPreviews',
    'skinProjects',
    'modelPreviews',
    'modelProjects',
    'projectModelPathsByMap',
    'groupProjectMetaData',
];

function readJSON(filePath, fallback = undefined) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        if (fallback !== undefined && error.code === 'ENOENT') {
            return fallback;
        }
        throw error;
    }
}

function writeJSON(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
    fs.renameSync(temporaryPath, filePath);
}

function pickSharedState(state) {
    return Object.fromEntries(
        sharedStateKeys.filter((key) => state[key] !== undefined).map((key) => [key, state[key]]),
    );
}

/**
 * Owns the local adapter for Boxes' map-group state. Project and group schema
 * contents stay untouched; only their authoritative root pointers live here.
 */
function createMapGroupManager(projectsRoot) {
    const projectRoot = (id) => path.join(projectsRoot, id);
    const metadataPath = (id) => path.join(projectRoot(id), 'project.json');
    const sourceRoot = (id) => path.join(projectRoot(id), 'source');

    function identity(id) {
        const metadata = readJSON(metadataPath(id));
        if (
            typeof metadata.mapGroupId !== 'string' ||
            !['main', 'submap'].includes(metadata.mapRole) ||
            typeof metadata.mainProjectId !== 'string'
        ) {
            throw new Error(`Map group metadata is invalid: ${id}`);
        }
        return {
            mapGroupId: metadata.mapGroupId,
            mapRole: metadata.mapRole,
            mainProjectId: metadata.mainProjectId,
        };
    }

    function paths(id) {
        const group = identity(id);
        return {
            ...group,
            statePath: path.join(projectRoot(group.mainProjectId), 'group-state.json'),
            blobRoot: path.join(sourceRoot(group.mainProjectId), 'blobs'),
        };
    }

    function ensure(id) {
        const group = paths(id);
        const current = readJSON(group.statePath, null);
        if (current) {
            return current;
        }

        const mainState = readJSON(
            path.join(sourceRoot(group.mainProjectId), 'project-state.json'),
            {},
        );
        const now = new Date().toISOString();
        const initial = {
            formatVersion: 1,
            mapGroupId: group.mapGroupId,
            revision: 1,
            ...pickSharedState(mainState),
            createdAt: now,
            updatedAt: now,
        };
        writeJSON(group.statePath, initial);
        return initial;
    }

    function materialize(id) {
        const group = paths(id);
        const shared = ensure(id);
        const statePath = path.join(sourceRoot(id), 'project-state.json');
        const projectState = readJSON(statePath, null);
        const sharedState = pickSharedState(shared);
        // A blank Boxes map is initialized by the edit runtime on first launch.
        // Group resources do not make the member map itself initialized: every
        // member needs its own permission root. Shared state is available to the
        // runtime through BOX_GROUP_PROJECT_STATE_PATH, so never create a partial
        // member state merely because the group already has resources. Also repair
        // partial files produced by older versions of the local adapter.
        if (!projectState?.permissionHash) {
            if (fs.existsSync(statePath)) {
                fs.rmSync(statePath);
            }
        } else {
            writeJSON(statePath, {
                ...(projectState || {}),
                ...sharedState,
                mapGroupId: group.mapGroupId,
                mainProjectId: group.mainProjectId,
            });
        }
        const memberBlobRoot = path.join(sourceRoot(id), 'blobs');
        fs.mkdirSync(memberBlobRoot, { recursive: true });
        if (fs.existsSync(group.blobRoot)) {
            for (const entry of fs.readdirSync(group.blobRoot, { withFileTypes: true })) {
                if (!entry.isFile()) {
                    continue;
                }
                const source = path.join(group.blobRoot, entry.name);
                const destination = path.join(memberBlobRoot, entry.name);
                if (fs.existsSync(destination)) {
                    continue;
                }
                try {
                    // Content-addressed blobs are immutable. Hard links let member maps
                    // consume the group pool without creating another authoritative copy.
                    fs.linkSync(source, destination);
                } catch (error) {
                    if (!['EXDEV', 'EPERM', 'EACCES'].includes(error.code)) {
                        throw error;
                    }
                    fs.copyFileSync(source, destination);
                    fs.chmodSync(destination, 0o644);
                }
            }
        }
        return { ...group, revision: shared.revision || 1 };
    }

    return { ensure, identity, materialize, paths };
}

module.exports = {
    createMapGroupManager,
    pickSharedState,
    sharedStateKeys,
};
