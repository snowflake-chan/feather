import { MuScheduler } from '@box/mudb/scheduler/scheduler';
import { MuServer } from '@box/mudb/server';
import { Logger as LegacyLogger } from '@box/utils/logger';
import { Logger } from 'pino';

import { ProjectBakeCache } from '@box/build-system/project/bake';
import { BuildSystemAPI } from '@box/build-system/type';
import { ContentServer } from '@box/content-server';
import { BackendRPC } from '@box/schema/backend/rpc-interface';
import { FileDictRDA } from '@box/schema/code-editor/code-editor-common-state';
import { CodeEditorProtocol } from '@box/schema/code-editor/code-editor-protocol';
import type { GroupProjectStore } from '@box/schema/group-project/rda';
import { Permissions } from '@box/schema/permissions/permission-rda';
import { ExtraProjectInfo, HotProject } from '@box/schema/project/hot-schema';
import { ProjectInfo } from '@box/schema/project/project-rda';
import type { ProjectAction } from '@box/schema/replica/replica-schema';
import { GameServer } from '../';
import type { BackendSocket } from '../../backendSocket';
import { getConfig } from '../../config/server';
import { GameAdminServer } from '../admin/admin-server';
import { GameSession } from '../session/server';
import { ServerSettings } from '../settings/server-settings-schema';
import { CommonSQL } from '../storage/types';
import { ScriptServer } from '../utils/script-server/type';
import { ServerVoxelPreloadData } from '../voxel/voxel-server-schema';
import { AiServer } from './ai/ai-server';
import { CodeEditorServerController } from './code-editor/code-editor-server-controller';
import { MuCodeEditorReplicaServer } from './code-editor/replica/server';
import { DebuggerServer } from './debugger/debugger-server';
import { CreatorPreviewRuntime } from './creator-preview-runtime';
import { EditServerStateSchema } from './edit-server-schema';
import { PublishServer } from './publish/publish-server';
import { EditReplicaServer } from './replica/replica-server';
import { EditRPCServer } from './rpc/rpc-server';

export async function startEditServer(spec: {
  server: MuServer;
  scheduler: MuScheduler;
  buildSystem: BuildSystemAPI;
  contentServer: ContentServer;
  ossContentServer: ContentServer;
  scriptServer: ScriptServer;
  brpc: BackendRPC;
  bake: ProjectBakeCache;
  logger: Logger;
  legacyLogger: LegacyLogger;
  session: GameSession;
  projectHash: string;
  project: ProjectInfo;
  hotProject: HotProject;
  extraProject: ExtraProjectInfo;
  settings: ServerSettings;
  permissionHash: string;
  permissions: Permissions;
  sql: CommonSQL;
  voxels: ServerVoxelPreloadData;
  contentId: number;
  backendSocket: BackendSocket;
  pendingActions: ProjectAction[][];
  groupStore?: GroupProjectStore;
}) {
  const serverConfig = await getConfig();
  let gameId = spec.contentId;
  spec.logger.info('start edit server');
  const server = new EditServer({
    server: spec.server,
    scheduler: spec.scheduler,
    buildSystem: spec.buildSystem,
    contentServer: spec.contentServer,
    ossContentServer: spec.ossContentServer,
    scriptServer: spec.scriptServer,
    bake: spec.bake,
    logger: spec.logger.child({ caller: 'EditServer' }),
    legacyLogger: spec.legacyLogger,
    initVoxels: spec.voxels,
    session: spec.session,
    projectHash: spec.projectHash,
    project: spec.project,
    extraProjectInfo: spec.extraProject,
    hotProject: spec.hotProject,
    settings: spec.settings,
    permissionHash: spec.permissionHash,
    permissions: spec.permissions,
    gameId,
    sql: spec.sql,
    brpc: spec.brpc,
    featureFlags: serverConfig.FEATURE_FLAGS || [],
    backendSocket: spec.backendSocket,
    pendingActions: spec.pendingActions,
    groupStore: spec.groupStore,
    openRouterApiKey: serverConfig.OPENROUTER_API_KEY,
    aiModelMapping: serverConfig.AI_MODEL_MAPPING,
  });

  await server.start(spec);
  spec.logger.info('Server started.');
  await server.state.game.synchronizeProject(spec.hotProject, {
    skipVoxels: false,
    play: false,
  });
  server.creatorPreviewRuntime.markReady();
  return server;
}

export class EditServer {
  public state = EditServerStateSchema.clone(EditServerStateSchema.identity);

  public codeEditorController: CodeEditorServerController;
  public replica: EditReplicaServer;
  public debugger: DebuggerServer;
  public creatorPreviewRuntime: CreatorPreviewRuntime;
  public ai: AiServer;
  public rpc: EditRPCServer;
  public publish: PublishServer;

  constructor(spec: {
    server: MuServer;
    scheduler: MuScheduler;
    buildSystem: BuildSystemAPI;
    contentServer: ContentServer;
    ossContentServer: ContentServer;
    scriptServer: ScriptServer;
    bake: ProjectBakeCache;
    logger: Logger;
    legacyLogger: LegacyLogger;
    initVoxels: ServerVoxelPreloadData;
    session: GameSession;
    projectHash: string;
    project: ProjectInfo;
    extraProjectInfo: ExtraProjectInfo;
    hotProject: HotProject;
    settings: ServerSettings;
    permissions: Permissions;
    permissionHash: string;
    gameId: number;
    sql: CommonSQL;
    brpc: BackendRPC;
    featureFlags: string[];
    backendSocket: BackendSocket;
    pendingActions: ProjectAction[][];
    groupStore?: GroupProjectStore;
    openRouterApiKey: string;
    aiModelMapping: Record<string, string[]>;
  }) {
    const game = (this.state.game = new GameServer(spec));

    this.codeEditorController = new CodeEditorServerController(
      this,
      spec.server.protocol(CodeEditorProtocol),
      spec.contentServer,
      new MuCodeEditorReplicaServer({
        editServer: this,
        server: spec.server,
        rda: FileDictRDA,
        name: 'code-editor-files',
      }),
    );

    this.state.buildSystem = spec.buildSystem;
    this.state.contentServer = spec.contentServer;
    this.state.bakeCache = spec.bake;
    this.state.logger = spec.legacyLogger;
    this.state.brpc = spec.brpc;

    this.replica = new EditReplicaServer({
      server: spec.server,
      state: this.state,
      projectHash: spec.projectHash,
      projectState: spec.project,
      extraProjectInfo: spec.extraProjectInfo,
      permissions: spec.permissions,
      permissionHash: spec.permissionHash,
      codeEditorController: this.codeEditorController,
      featureFlags: spec.featureFlags,
      pendingActions: spec.pendingActions,
      groupStore: spec.groupStore,
      logger: spec.logger,
    });
    game.handleUserJoin = this.replica.handleUserJoin;

    this.debugger = new DebuggerServer({
      server: spec.server,
      state: this.state,
    });
    this.creatorPreviewRuntime = new CreatorPreviewRuntime({
      state: this.state,
      replica: this.replica,
      debugger: this.debugger,
    });

    // 初始化 AI 服务
    this.ai = new AiServer({
      server: spec.server,
      state: this.state,
      replica: this.replica,
      logger: spec.logger,
      gameId: spec.gameId,
      codeEditorController: this.codeEditorController,
      openRouterApiKey: spec.openRouterApiKey,
      featureFlags: spec.featureFlags,
      aiModelMapping: spec.aiModelMapping,
    });

    this.rpc = new EditRPCServer({
      server: spec.server,
      state: this.state,
    });

    this.publish = new PublishServer({
      server: spec.server,
      state: this.state,
      replica: this.replica,
      gameId: spec.gameId,
    });

    const adminServer = new GameAdminServer({
      server: spec.server,
      game,
      containerName: spec.settings.containerName,
      contentId: spec.settings.contentId,
      brpc: spec.brpc,
      editState: this.state,
    });

    game.onTick.sub(() => {
      this.replica.tick();
    });
  }

  public async start(spec) {
    await this.state.game.start();
    this.state.logger.log('server started');
    await this.codeEditorController.initScripts();
    this.codeEditorController.initSocketMsg();
    this.state.logger.log('scripts started');
  }
}
