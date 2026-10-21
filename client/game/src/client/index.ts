import { toWebSocketURL } from '../../shared/websocket-url';
import { clientConfig } from 'src/config/client';

import { ContentResolver } from '@box/content-server/content-fetch';
import { MuClient } from '@box/mudb/client';
import { MuSystemScheduler } from '@box/mudb/scheduler/system';
import { MuWebSocket } from '@box/mudb/socket/web/client';
import type { ClientConsole } from '@box/script-api';
import { consoleSink } from '@box/utils/console-sink';
import { LoadingController } from '@box/utils/loading/loading-controller';
import { BufferSink, Logger, LogLevel, LogMessage } from '@box/utils/logger';
import { createMuLogger } from '@box/utils/mutracer';

import type { Logger as PinoLogger } from 'pino';

import { GameClient } from 'src/engine/game-client';
import { connectGameServer } from 'src/utils/connect-game-server';
import { getFingerprint } from 'src/utils/fingerprint';
import { GameClientSocket } from 'src/utils/game-client-socket';
import { connectNetLog } from 'src/utils/logger';
import { NetLogClient } from 'src/utils/net-log/client';
import { getQueryParam } from 'src/utils/url-helpers';
import type { GameSession } from '/pages/api/createSession';
import { resolveGameServerTarget } from 'src/utils/remote-game-server';

export const createGameClient = (
  spec: {
    bufferSink: BufferSink;
    logger: Logger;
    pinoLogger: PinoLogger;
    console: ClientConsole;
    autoCreateElement: boolean;
    connectGame: (hash: string, serverId?: string) => void;
  },
  setSessionConfig?: (spec: GameSession) => void,
  getGamepadHash?: (group: string, part: string) => string,
) => {
  const {
    bufferSink,
    logger,
    pinoLogger,
    console,
    autoCreateElement,
    connectGame,
  } = spec;
  const loadingController = new LoadingController();
  const gameServerTarget = resolveGameServerTarget(clientConfig);
  const content = new ContentResolver({
    cdnPath: gameServerTarget.assetBaseURL,
    ossCdnURL: gameServerTarget.assetBaseURL,
    avatarCdnURL: clientConfig.launcherServiceWorkerMode
      ? clientConfig.launcherAvatarCdnURL
      : undefined,
    cacheIPFS: clientConfig.cacheIPFS,
    loadingController: loadingController,
  });

  let configuredAudioHashes: string[] | undefined;

  // 连接game-server，生成socket client实例
  const socket = new GameClientSocket(
    (async () => {
      /**
       * 没有直接统一用clientConfig.ARENA_URL，因为本地起next服务的时候，可能会需要读取本地的配置。
       * 比如isLocalGameServer为true时。
       */
      let visitorId: string = 'defaultVisitorId';

      const serverId = getQueryParam('serverId');

      if (
        !process.env.RUSTY &&
        (gameServerTarget.isRemote || !clientConfig.isLocalGameServer)
      ) {
        try {
          visitorId = (await getFingerprint()).visitorId;
        } catch (err) {
          console.error('Failed to get visitorId by Fingerprint');
        }
      }

      const { config: sessionConfig, prefetchAbortController } =
        await connectGameServer(
          loadingController,
          gameServerTarget,
          visitorId,
          serverId,
        );

      configuredAudioHashes = sessionConfig.configuredAudioHashes;

      setSessionConfig && setSessionConfig(sessionConfig);

      prefetchAbortController.abort();
      content.setPrefetchCaches(sessionConfig.prefetchCaches);

      return new MuWebSocket({
        sessionId: sessionConfig.sessionId,
        sessionProof: sessionConfig.sessionProof,
        url: toWebSocketURL(sessionConfig.socketServerUrl, window.location.href),
        maxSockets: sessionConfig.maxSockets,
        logger: createMuLogger(logger, 'mudb/src-socket'),
      });
    })(),
  );

  const client = new MuClient(
    socket,
    createMuLogger(logger),
    // This must match game-server's local/production rule. A production local
    // client still validates the MuDB handshake; otherwise its first protocol
    // packet is mistaken for the server's validation JSON and the connection
    // is closed immediately.
    process.env.NODE_ENV !== 'development' && !clientConfig.isLocalGameServer,
  );
  const netLog = new NetLogClient({
    client,
    sink: consoleSink,
  });
  bufferSink.replace((msg: LogMessage) => {
    if (msg.level <= LogLevel.WARN) {
      consoleSink(msg);
    }
    netLog.log(msg);
  });

  connectNetLog((ev) => {
    netLog.logPino(ev);
  });

  // 初始化引擎
  const game = new GameClient({
    client,
    content,
    logger,
    pinoLogger,
    scheduler: MuSystemScheduler,
    clientConfig,
    loadingController,
    console,
    autoCreateElement,
    getGamepadHash,
    connectGame,
  });

  socket.defer.then(() => {
    game.sound.loadFirstSampleHashes(configuredAudioHashes || []);
  });

  return {
    client,
    game,
  };
};
