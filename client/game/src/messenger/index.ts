import {
  createTool,
  Children,
  EventsType,
  EmitEventType,
  CallAsyncType,
} from '@box/sdk';
import type { PlayerSkinHash } from '@box/schema/player/player-schema';
import type { GroundEmote } from '@box/schema/animation/ik-schema';
import { IframeEventBus } from '@box/iframe-event-bus';

import { clientConfig } from 'src/config/client';
import { resolvePublicUrl } from 'src/utils/public-url';
import type { Settings } from 'src/engine/settings/settings-schema';
import { UIConfigState } from 'src/redux/slices/UIConfig';
import { UiState } from 'src/redux/edit/ui';
import { exitPointerLock } from 'src/engine/utils/pointer-lock';

type UIState = UIConfigState & UiState;

interface EmitEvents extends EventsType {
  publish: {
    contentId: number;
  };
  openStore: {
    mapId: number;
    productIds?: string[];
  };
  closeStore: undefined;
  openStoreSettings: {
    mapId: number;
  };
  openUserProfile: {
    userId: number;
  };
  uiStatusChange: {
    [k in keyof Partial<UIState>]: UIState[k];
  };
  screenshot: {
    blob: Blob;
  };
  fromScript: {
    type: string;
    value: object;
  };
  fromEngine: {
    type: string;
    value: object;
  };
  playerContextmenu: {
    id: number;
    clientX: number;
    clientY: number;
    hitId: number;
    hitUserId: string;
    hitName: string;
    hitRect: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  };
  editRunningStatusChange: boolean;
  share: {
    title: string;
    text: string;
    modalProps: {
      mask: {
        closable: boolean;
      };
      content: {
        placement: {
          mobile: string;
          tablet: string;
        };
      };
    };
  };
  responseGetSettings: Partial<Settings>;
  tapReconnect: undefined;
  requestUserMedia: {
    audio?: boolean;
    video?: boolean;
  };
  loading: { status: 'start'; backgroundImage: string } | { status: 'end' };
  hashChange: {
    hash: string;
    isNewTab: boolean;
  };
}

interface SubscribeEvents extends EventsType {
  postMessage: {
    eventType: string;
    eventParams: any;
  };

  setUIConfig: {
    [k in keyof Partial<UIState>]: UIState[k];
  };

  togglePlayerRender: {
    hide: boolean;
  };

  screenshot: undefined;

  startPlay: undefined;

  setSkin: PlayerSkinHash;

  playEmote: {
    emote: GroundEmote;
  };
  exitPointerLock: undefined;

  startProject: undefined;
  stopProject: undefined;
  setSettings: Partial<Settings>;
  getSettings: Array<keyof Partial<Settings>> | undefined;
}

interface IframeEventBusType {
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
}

/**
 * 处理与iframe，webview的统一通信
 */
class MessageController {
  public isReady: boolean = false;
  public messageTool: Children<SubscribeEvents, EmitEvents>;
  // 用于iframe下通知外部快捷键
  public iframeEventBus = new IframeEventBus<IframeEventBusType>(window.top);

  constructor() {
    this.messageTool = createTool();
  }

  public async connect() {
    if (!this.isReady) {
      await this.messageTool.connect((events, data) => {
        if (clientConfig.APP_ENV !== 'production') {
          console.log('allEventsOn:', events, data);
        }
      });
      this.isReady = true;
      // 通知SDK加载完毕
      this.emitEvent('loaded');

      this.messageTool.eventOn('exitPointerLock', exitPointerLock);
    }
  }

  public callAsync: CallAsyncType<EmitEvents> = async (key, value) => {
    if (this.isReady) {
      return this.messageTool.callAsync(key, value);
    } else {
      console.error(`message tool is not ready(${key})`);
      return null;
    }
  };

  public emitEvent: EmitEventType<EmitEvents> = (key, value) => {
    if (this.isReady) {
      this.messageTool.emitEvent(key, value);
    } else {
      console.error(`message tool is not ready(${key})`);
    }
  };

  public jumpTo = (options: {
    url: string;
    isNewTab?: boolean;
    isLoginBack?: boolean;
  }) => {
    const { url, isNewTab, isLoginBack } = options;
    if (
      this.messageTool.isInIframe() ||
      this.messageTool.isInWebviewOrRusty()
    ) {
      this.emitEvent('jumpTo', {
        url,
        isNewTab: !!isNewTab,
        isLoginBack: !!isLoginBack,
      });
      return;
    }
    let link = resolvePublicUrl(url);
    if (isLoginBack) {
      link += `?referrer=${encodeURIComponent(window.location.href)}`;
    }

    if (isNewTab) {
      window.open(link);
    } else {
      window.location.assign(link);
    }
  };

  // 通知keys event事件给parent
  public exposeKeysEventToParent = (
    event: keyof IframeEventBusType,
    e: KeyboardEvent,
  ) => {
    this.iframeEventBus.expose(event, e);
  };
}

export const messenger = new MessageController();
