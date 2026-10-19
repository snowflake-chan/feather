import type { Logger } from 'pino';

import { BackendSocket } from '../backendSocket';
import {
  BroadcastData,
  BroadcastDataType,
  BroadcastMsg,
  Channel,
  OPCode,
  P2PData,
  P2PDataMsg,
  P2PDataType,
  ReceivedMsg,
} from '@box/schema/chat/chat-schema';
import { getConfigSync } from '../config/server';
import { clearTimeout } from 'timers';
import { ProjectAction } from '@box/schema/replica/replica-schema';
import {
  GroupProjectStateSchema,
  GroupProjectStore,
  GroupProjectStoreSchema,
} from '@box/schema/group-project/rda';
import { RetrievedGroupProjectMetaData } from '@box/build-system/group-project';
import { GroupAssetsRDA, ProjectRDA } from '@box/schema/project/project-rda';
import type { MuRDATypes } from '@box/mudb/rda';
import { UITreeRDA } from '@box/schema/project/ui-rda/defs';
import { BuildSystemAPI } from '@box/build-system/type';
import { TEMP_OSS_CDN_PATH } from '@box/content-server';
import { MuReadStream } from '@box/mudb/stream';

const GROUP_PROJECT_TIMEOUT = 30 * 1000;

export type GetGroupProjectRes = {
  /**
   * 获取共享数据或哈希值时，可能收到的其他容器的action
   */
  pendingActions: ProjectAction[][];
  /**
   * 从其他容器请求到的共享数据
   */
  store?: GroupProjectStore;
  /**
   * 从后端请求到的哈希值
   */
  metaData?: RetrievedGroupProjectMetaData;
};

/**
 * 通过websocket获取GroupProject初始化数据
 */
export async function getGroupProjectBySocket(spec: {
  backendSocket: BackendSocket;
  logger: Logger;
  bs: BuildSystemAPI;
  /**
   * Hack，把已经收到的消息，立刻传给handler
   * - 目前只在replica-server处理重连时会传入
   */
  message?: string;
}): Promise<GetGroupProjectRes> {
  const { logger, backendSocket, message, bs } = spec;

  const serverConfig = getConfigSync();
  const pendingActions: ProjectAction[][] = [];

  return new Promise((resolve, reject) => {
    // timeout
    const timer = setTimeout(() => {
      reject(new Error('STATE_SHARE: get initial shared state timeout'));
      clearTimeout(timer);
    }, GROUP_PROJECT_TIMEOUT);

    const handler = async (data: string) => {
      const message: ReceivedMsg = JSON.parse(data);
      if (message.opcode !== OPCode.Dispatch) {
        return;
      }
      // == 获取当前在线容器 ==
      if (message.event === 'ONLINE_CONNECTION') {
        const { connections } = message.data;
        logger.info(
          `STATE_SHARE: received event ${
            message.event
          }, data is: ${JSON.stringify(message.data)}`,
        );
        // 过滤掉自己和没有ready的
        const availableConnection = connections.find(
          (_) => _.serverId !== serverConfig.serverId && _.engineReady,
        );

        if (availableConnection) {
          logger.info(
            `STATE_SHARE: init state use socket, target server id is ${JSON.stringify(
              availableConnection,
            )}`,
          );
          // 通过socket请求容器state
          backendSocket.send<P2PDataMsg>(
            generateP2PMsg(
              {
                type: P2PDataType.GROUP_PROJECT_REQUEST,
              },
              availableConnection.serverId,
            ),
          );
        } else {
          resolve({ pendingActions });
          backendSocket.removeHandler(handler);
        }
        return;
      }

      // == 获取到在线容器状态 ==
      if (
        message.event === 'POINT_TO_POINT' &&
        message.data.data.type === P2PDataType.GROUP_PROJECT_RESPONSE
      ) {
        logger.info(
          `STATE_SHARE: received event ${message.event}, hash is ${message.data.data.payload}`,
        );

        const hash = message.data.data.payload;
        const bytes = await bs.retrieveContentFromS3(hash, {
          ossCdnPath: TEMP_OSS_CDN_PATH,
        });
        const stream = new MuReadStream(bytes);
        const store = GroupProjectStoreSchema.patch(
          GroupProjectStoreSchema.identity,
          stream,
        );

        resolve({
          pendingActions,
          store,
        });
        backendSocket.removeHandler(handler);
        return;
      }

      // == init 前收到Actions,存储在pendingActions ==
      if (
        message.event === 'BROADCAST' &&
        message.data.type === BroadcastDataType.ACTION
      ) {
        logger.info(
          `STATE_SHARE: received actions before init, actions type is ${message.data.type}`,
        );
        pendingActions.push(message.data.payload);
      }
    };

    backendSocket.onMessage(handler);

    message && handler(message);
  });
}

/**
 * socket订阅（向后端上报当前容器上线？）
 * 只需订阅一次，断线重连不需要重复订阅
 */
export function subscribeGroupProjectSocket(
  socket: BackendSocket,
  targetId: number,
  serverId: string,
) {
  socket.subscribe(
    JSON.stringify({
      opcode: OPCode.Subscribe,
      channel: Channel.ENGINE_CUSTOM,
      data: {
        targetId,
        serverId,
      },
    }),
  );
}

export function generateBroadcastMsg(data: BroadcastData): BroadcastMsg {
  return {
    opcode: OPCode.Dispatch,
    channel: Channel.ENGINE_CUSTOM,
    event: 'BROADCAST',
    data,
  };
}

export function generateP2PMsg(data: P2PData, targetId: string): P2PDataMsg {
  return {
    opcode: OPCode.Dispatch,
    channel: Channel.ENGINE_CUSTOM,
    event: 'POINT_TO_POINT',
    data: {
      targetId,
      data,
    },
  };
}

export function generateEngineReadyMsg() {
  return {
    opcode: OPCode.Dispatch,
    channel: Channel.ENGINE_CUSTOM,
    event: 'ENGINE_READY',
  };
}

/**
 * 通过后端接口获取metaData，会把version以外的字段合并存储到hashes字典中
 */

/**
 * 过滤出GroupProject相关的action
 */
export function filterGroupProjectActions(
  actions: ProjectAction[],
): ProjectAction[] {
  // 共享数据的action需要转发给其他server
  return actions.filter(
    (action) => action.type in GroupProjectStateSchema.identity,
  );
}

/**
 * 通过GroupProject的store序列化数据，更新Project store
 */
export function updateProjectStoreByGroupProject(
  out: MuRDATypes<typeof ProjectRDA>['store'],
  groupProjectStore: GroupProjectStore,
) {
  out.stores.uiTree.free(UITreeRDA);
  out.stores.uiTree = UITreeRDA.parse(groupProjectStore.uiTree);

  out.stores.audioAssets.free(GroupAssetsRDA);
  out.stores.audioAssets = GroupAssetsRDA.parse(groupProjectStore.audioAssets);

  out.stores.pictureAssets.free(GroupAssetsRDA);
  out.stores.pictureAssets = GroupAssetsRDA.parse(
    groupProjectStore.pictureAssets,
  );
}

/**
 * 临时变量，存储GroupProject store序列化的结果
 */
const TEMP_GROUP_PROJECT_STORE = GroupProjectStoreSchema.alloc();

/**
 * 通过Project store生成GroupProject store序列化结果
 */
export function serializeGroupProjectStoreByProject(
  projectStore: MuRDATypes<typeof ProjectRDA>['store'],
): GroupProjectStore {
  const { uiTree, audioAssets, pictureAssets } = projectStore.stores;

  uiTree.serialize(UITreeRDA, TEMP_GROUP_PROJECT_STORE.uiTree);
  audioAssets.serialize(GroupAssetsRDA, TEMP_GROUP_PROJECT_STORE.audioAssets);
  pictureAssets.serialize(
    GroupAssetsRDA,
    TEMP_GROUP_PROJECT_STORE.pictureAssets,
  );

  return TEMP_GROUP_PROJECT_STORE;
}

/**
 * 获取play模式存储在后端的数据，构造成groupProject数据格式返回
 * 用于play模式的数据兼容
 * @param param
 * @returns
 */
