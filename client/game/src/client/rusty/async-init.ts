import type { ClientConfig } from 'src/config/client';
import type { PlayClient } from '../play/play-client';
import type { EditClient } from '../edit/edit-client';

export async function initClient(clientConfig: ClientConfig) {
  // Client Config 拿到后才能进行一系列初始化

  const [messenger, PlayClient, EditInit] = await Promise.all([
    import('../../messenger').then(({ messenger }) => messenger),
    clientConfig.mode === 'play' &&
      import('../play/play-client').then(({ PlayClient }) => PlayClient),
    clientConfig.mode === 'edit' &&
      import('../edit/edit-client').then(({ EditClient, resolveEditor }) => ({
        EditClient,
        resolveEditor,
      })),
  ]);

  await messenger.connect();
  messenger.emitEvent('status', 'ready');

  let client: PlayClient | EditClient;

  if (clientConfig.mode === 'edit' && EditInit) {
    client = new EditInit.EditClient();
    EditInit.resolveEditor(client);
  } else if (PlayClient) {
    client = new PlayClient();
  } else {
    throw new Error('Missing valid client');
  }

  // 页面监听 GameClient 实例发生变更
  client.onGameChange.sub((gameClient) => {
    if (!gameClient) {
      return;
    }

    gameClient.rendererReady(() => {
      /*
       * TODO resolutionScale影响gpu canvas的分辨率、以及一些射线检测的计算（比如pixelToRay()）
       * 正常来讲只有设置了“清晰度”为“高”时，resolutionScale才会等于devicePixelRatio
       * 因此手动同步下状态。
       *
       * - 不调用client.setGameSettings是避免写入错误的resolutionScale到localStorage导致切到其他模式（edit/play）对比时分辨率大增
       */
      let resolutionScale = devicePixelRatio;
      const canvas = client.game.state.gpu.rewgpu?.canvas;
      if (canvas) {
        resolutionScale = canvas.width / window.innerWidth;
      }

      client.game.state.settings.resolutionScale = resolutionScale;
      client.game.onResolutionScaleUpdate();
    });

    // 在 Ready 前展示 Loading 页面
    messenger.emitEvent('loading', {
      status: 'start',
      backgroundImage: clientConfig.mapInfo.backgroundImage,
    });
  });

  client.onGameReady.sub(() => {
    messenger.emitEvent('loading', { status: 'end' });
  });

  // EditClient不会触发回调
  client.preconnect((err) => {
    console.log('preconnect error', err);
  });

  client.start({
    ready: () => {
      messenger.emitEvent('status', 'started');
    },
    // EditClient不会触发frame回调
    frame: () => {},
    close: (error) => {
      console.log('closed', error);
    },
  });

  if (process.env.NODE_ENV === 'development') {
    window['client'] = client;
  }
}
