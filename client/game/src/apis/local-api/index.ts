import { ApiClient } from '@box/apis';
import { clientConfig, getConfig } from 'src/config/client';
import { localResourceIds, uploadLocalResource } from './resource-upload';

export interface PagedData<T> {
  count: number;
  rows: T[];
}

function runtimeApi() {
  return new ApiClient({
    baseUrl: getConfig().BACKEND_SERVER_URL.replace(/\/$/, ''),
    defaultErrorMessage: '本地地图运行时请求失败',
  });
}

function voxaApi() {
  if (!clientConfig.VOXA_URL) throw new Error('本地 VOXA 地址未配置，请先启动 VOXA');
  return new ApiClient({
    baseUrl: clientConfig.VOXA_URL.replace(/\/$/, ''),
    credentials: 'include',
    defaultErrorMessage: '本地 VOXA 请求失败',
  });
}

function absoluteVoxaURL(value?: string) {
  if (!value || /^https?:\/\//.test(value) || value.startsWith('/api/creator-models/')) {
    return value;
  }
  return `${clientConfig.VOXA_URL.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}

const unsupportedCollaboration = async (..._args: any[]) => {
  throw new Error('本地引擎不提供旧平台协作接口');
};

/**
 * Compatibility-shaped adapters used by inherited Creator screens.
 * Every implementation targets Local Engine routes; no cloud client is used.
 */
export const apis = {
  createra: {
    async nextGameUidListUsingGet({ num }: { num?: number }) {
      return localResourceIds(num);
    },
    async checkNameScriptUsingGet(_input?: unknown) { return true; },
    async createScriptUsingPost(
      _input: Record<string, unknown>,
    ): Promise<{ id: string; name: string; share: boolean; type: number }> {
      throw new Error('本地地图使用工程内脚本，不支持旧平台脚本创建接口');
    },
    async deleteScriptUsingDelete(_input: Record<string, unknown>): Promise<boolean> {
      throw new Error('本地地图使用工程内脚本，不支持旧平台脚本删除接口');
    },
    async renameScriptUsingPost(_input: Record<string, unknown>): Promise<boolean> {
      throw new Error('本地地图使用工程内脚本，不支持旧平台脚本重命名接口');
    },
    async shareScriptUsingPost({ id, hash }: { id: string; hash: string; mapId?: unknown }) {
      await runtimeApi().postApiProjectScripts({ body: { action: 'share', fileId: id, hash } });
      return true;
    },
    async unshareScriptUsingPost({ id }: { id: string; mapId?: unknown }) {
      const result = await runtimeApi().postApiProjectScripts({
        body: { action: 'unshare', fileId: id },
      }) as { hash?: string };
      return String(result.hash || '');
    },
    updateLocalSharedScript(action: 'rename' | 'delete', fileId: string, name?: string) {
      return runtimeApi().postApiProjectScripts({
        body: { action, fileId, ...(name ? { name } : {}) },
      });
    },
  },
  upload: {
    async fileUploadPost({ file }: { file?: Blob; type?: string }) {
      if (!file) throw new Error('请选择要上传的文件');
      return uploadLocalResource(runtimeApi(), file);
    },
  },
  model: {
    getModelDetailUsingGet(modelId: number | string, _params?: Record<string, unknown>) {
      return voxaApi().getApiLocalModelsId({ params: { path: { id: String(modelId) } } });
    },
    copyProjectSharedModelUsingPost({ originModelId }: { originModelId: number | string }) {
      return runtimeApi().postApiProjectModels({
        body: { action: 'importLocal', modelId: originModelId },
      });
    },
    async deleteModelUsingDelete(modelIds: Array<number | string>) {
      const results = await Promise.all(
        modelIds.map((modelId) => voxaApi().deleteApiLocalModelsId({
          params: { path: { id: String(modelId) } },
        })),
      );
      return results.every(Boolean);
    },
    deleteProjectSharedModelUsingDelete({ modelId }: { modelId: number | string }) {
      return voxaApi().deleteApiLocalModelsId({ params: { path: { id: String(modelId) } } });
    },
    renameProjectSharedModelUsingPut({ modelId, modelName }: {
      modelId: number | string; modelName: string;
    }) {
      return voxaApi().putApiLocalModelsId({
        params: { path: { id: String(modelId) } },
        body: { modelName },
      });
    },
    setDefaultSkinUsingPut({ mapId, skinId }: { mapId: number; skinId: number }) {
      const projectKey = String(clientConfig.name || mapId);
      return voxaApi().putApiLocalDefaultSkin({
        params: { query: { projectKey, mapId: String(mapId) } },
        body: { projectKey, mapId, skinId },
      });
    },
    async getDefaultSkinUsingGet({ mapId }: { mapId: number }) {
      const projectKey = String(clientConfig.name || mapId);
      const skin = await voxaApi().getApiLocalDefaultSkin({
        params: { query: { projectKey, mapId: String(mapId) } },
      }) as Record<string, any> | undefined;
      return skin ? { ...skin, modelPreviewUrl: absoluteVoxaURL(skin.modelPreviewUrl) } : undefined;
    },
    async getSkinMapIdList() { return []; },
    async batchAddSkinUsingPost() { return true; },
  },
  models: {
    async getModelsUsingGetV2(query: Record<string, unknown>) {
      const parameters = Object.fromEntries(
        Object.entries(query || {})
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)]),
      );
      const result = await new ApiClient({
        defaultErrorMessage: '本地模型服务请求失败',
      }).getApiCreatorModels({
        params: { query: parameters },
        credentials: 'same-origin',
        cache: 'no-store',
      }) as { rows: Array<Record<string, any>> } & Record<string, any>;
      return {
        ...result,
        rows: result.rows.map((model) => ({
          ...model, modelPreviewUrl: absoluteVoxaURL(model.modelPreviewUrl),
        })),
      };
    },
    deleteSharedSkinUsingDelete({ skinId }: { skinId: number | string }) {
      return voxaApi().deleteApiLocalModelsId({ params: { path: { id: String(skinId) } } });
    },
    renameSharedSkinUsingPut({ skinId, skinName }: {
      skinId: number | string; skinName: string;
    }) {
      return voxaApi().putApiLocalModelsId({
        params: { path: { id: String(skinId) } },
        body: { modelName: skinName },
      });
    },
  },
  collaboration: {
    async roleListUsingGet(_input?: unknown) { return []; },
    async applyListUsingGet(_input?: unknown) { return []; },
    updateMapPrivacyUsingPut: unsupportedCollaboration,
    async memberPermissionUsingGet(_input?: unknown) {
      return { admin: true, owner: true, collaboration: undefined };
    },
    applyUsingPost: unsupportedCollaboration,
    terminateUsingPost: unsupportedCollaboration,
    deleteRoleUsingDelete: unsupportedCollaboration,
    updateRoleUsingPut: unsupportedCollaboration,
    addRoleUsingPost: unsupportedCollaboration,
    updateMemberUsingPut: unsupportedCollaboration,
    unbanUsingPost: unsupportedCollaboration,
    banUsingPost: unsupportedCollaboration,
    memberSortUsingPost: unsupportedCollaboration,
    rejectApplyUsingPost: unsupportedCollaboration,
    ticketRefreshUsingGet: unsupportedCollaboration,
    getTicketUsingGet: unsupportedCollaboration,
  },
  creatorStore: {
    async checkStoreAccessUsingGet(_input?: unknown) { return false; },
  },
};
