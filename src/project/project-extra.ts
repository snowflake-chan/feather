import type { Logger } from 'pino';
import axios from 'axios';

import {
  ExtraProjectInfo,
  ExtraProjectInfoSchema,
  getMeshPath,
} from '@box/schema/project/hot-schema';
import { CreativeMode } from '@box/apis';
import { isContentHash } from './content-hash';
import { voxaInternalHeaders } from './voxa-internal-auth';

export type Mode = 'edit' | 'play';

const LOCAL_MESH_PATH = /__local_\d+\.vb$/;
const LOCAL_SKIN_NAME = /__local_\d+$/;

/**
 * `boxes` receives one authoritative extra-project snapshot from its backend.
 * The local product has two authoritative inputs instead: the snapshot packed
 * with an imported cloud project and the models/skins stored in local VOXA.
 * Merge them into the same schema that boxes consumes, with the live local
 * library winning when an entry has the same key.
 */
export function mergeExtraProjectInfo(
  packaged: ExtraProjectInfo,
  localLibrary: ExtraProjectInfo,
  deletedModelPaths: ReadonlySet<string> = new Set(),
): ExtraProjectInfo {
  const liveLocalModelIds = new Set(
    Object.values(localLibrary.meshAssets)
      .filter((asset) => isContentHash(asset.hash))
      .map((asset) => asset.modelId),
  );
  const packagedMeshAssets = Object.fromEntries(
    Object.entries(packaged.meshAssets).filter(([path, asset]) => {
      if (deletedModelPaths.has(path)) return false;
      // Imported legacy data and interrupted project-model saves can contain
      // an empty hash. Never expose it to the runtime: retrieveContent('')
      // aborts the whole model preload instead of failing only that asset.
      if (!isContentHash(asset.hash)) return false;
      // A VOXA rename changes the resource path while preserving modelId.
      // Embedded snapshots may therefore contain the old local path forever.
      // Keep ordinary cloud/project assets (their ids can legitimately collide),
      // but discard stale __local_<id> aliases when VOXA has the live entry.
      return !(
        LOCAL_MESH_PATH.test(path) &&
        liveLocalModelIds.has(asset.modelId) &&
        !localLibrary.meshAssets[path]
      );
    }),
  );
  return {
    meshAssets: {
      ...packagedMeshAssets,
      ...Object.fromEntries(
        Object.entries(localLibrary.meshAssets).filter(
          ([path, asset]) =>
            !deletedModelPaths.has(path) && isContentHash(asset.hash),
        ),
      ),
    },
    skinAssets: {
      ...packaged.skinAssets,
      ...localLibrary.skinAssets,
    },
    defaultSkinName:
      localLibrary.defaultSkinName ||
      (LOCAL_SKIN_NAME.test(packaged.defaultSkinName)
        ? ''
        : packaged.defaultSkinName),
    // Shared scripts are owned exclusively by the authoritative map-group
    // snapshot. VOXA is only a source for local models and skins; treating its
    // result as another script source makes deletions impossible to express.
    scriptAssets: { ...packaged.scriptAssets },
  };
}

function getLocalMeshPath(modelName: string, modelId: number) {
  return getMeshPath(`${modelName}__local_${modelId}`);
}

export async function getLocalExtraProject(
  voxaURL: string,
  mapId: number,
  logger: Logger,
  projectKey = '',
) {
  const extra = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  try {
    const baseURL = voxaURL.replace(/\/$/, '');
    const [modelResponse, skinResponse, defaultSkinResponse] =
      await Promise.all([
        axios.get(`${baseURL}/api/local/models`, {
          params: {
            creativeMode: CreativeMode.Model,
          },
          headers: voxaInternalHeaders(),
          timeout: 10_000,
        }),
        axios.get(`${baseURL}/api/local/models`, {
          params: {
            creativeMode: CreativeMode.Skin,
          },
          headers: voxaInternalHeaders(),
          timeout: 10_000,
        }),
        axios
          .get(`${baseURL}/api/local/default-skin`, {
            params: projectKey ? { projectKey, mapId } : { mapId },
            headers: voxaInternalHeaders(),
            timeout: 10_000,
          })
          .catch(() => ({ data: null })),
      ]);
    const rows = Array.isArray(modelResponse.data?.rows)
      ? modelResponse.data.rows
      : [];
    for (const row of rows) {
      const modelId = Number(row.modelId || 0);
      const hash = String(row.modelFileHash || '').trim();
      const path = getLocalMeshPath(String(row.modelName || ''), modelId);
      if (!modelId || !isContentHash(hash) || extra.meshAssets[path]) continue;
      extra.meshAssets[path] = {
        modelId,
        hash,
        modelPreviewHash: String(row.modelPreviewHash || ''),
        animated: Boolean(row.animated),
        updatedAt: String(row.updatedAt || ''),
      };
    }
    const skinRows = Array.isArray(skinResponse.data?.rows)
      ? skinResponse.data.rows
      : [];
    for (const row of skinRows) {
      const modelId = Number(row.modelId || 0);
      if (!modelId || !row.modelFileHash) continue;
      const name = `${String(row.modelName || '皮肤')}__local_${modelId}`;
      extra.skinAssets[name] = { hash: String(row.modelFileHash) };
      if (Number(defaultSkinResponse.data?.modelId || 0) === modelId) {
        extra.defaultSkinName = name;
      }
    }
    logger.info(
      `fetch local VOXA assets: ${Object.keys(extra.meshAssets).length} models, ${Object.keys(extra.skinAssets).length} skins`,
    );
  } catch (error) {
    logger.error(`get local VOXA mesh assets error: ${String(error)}`);
  }
  return extra;
}

export async function getExtraProject(
  mapId: number,
  _mode: Mode,
  logger: Logger,
) {
  const voxaURL =
    process.env.VOXA_INTERNAL_URL ||
    process.env.VOXA_URL ||
    'http://127.0.0.1:3001';
  return getLocalExtraProject(
    voxaURL,
    mapId,
    logger,
    process.env.CONTAINER_NAME || '',
  );
}
