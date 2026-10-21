import { IframeController, EmitType } from './iframe';
import { EventOnType, EmitEventType, EventsType } from './event-types';
import { ChildrenEventType } from './defs';
import { Events } from './events';

/**
 * 心跳检测超时的时间
 */
const HEARTBEAT_TIMEOUT = 1000;

/**
 * 心跳检测触发的时间间隔
 */
const DEFAULT_HEARTBEAT_INTERVAL = 60 * 1000;

type HeartbeatOptions = {
  /**
   * 心跳检测的时间间隔
   * @default 60 * 1000
   */
  interval?: number;
};

/**
 * 用于生成iframe.allow字符串的数组
 * Permissions Policy和Permissions API都可以通过allow设置
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#allowlists
 * - https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#relationship_with_the_permissions_api
 */
const PERMISSIONS: string[] = [
  // 以下是Permissions Policy
  'autoplay',
  'fullscreen',

  // 以下是Permissions API
  'microphone',
  'clipboard-read',
  'clipboard-write',
];

export class Parent<K extends EventsType, E extends EventsType> {
  private dom: Element;
  public iframeElement: HTMLIFrameElement | undefined;
  public iframe: IframeController<K, E>;
  /**
   * 心跳检测的定时器
   */
  private heartbeatTimer = -1;

  private events: Events<K>;

  constructor(public url: string, public type: string) {
    this.events = new Events<K>();

    this.iframe = new IframeController<K, E>(this.events);
  }

  // 初始化iframe通讯，并增加全部事件监听
  public async init(spec: {
    dom: Element;
    eventsOn?: EmitEventType<K>;
    /**
     * 是否启用心跳检测
     * @default false
     */
    checkHeartbeat?: boolean | HeartbeatOptions;
  }) {
    if (this.iframeElement) {
      return false;
    }
    const { dom, eventsOn, checkHeartbeat = false } = spec;
    this.dom = dom;
    // 创建iframe并append到dom里面
    const iframeEl = (this.iframeElement = document.createElement('iframe'));
    iframeEl.src = this.url;
    iframeEl.allow = PERMISSIONS.join(';');
    iframeEl.id = 'GameIframe';
    dom.appendChild(iframeEl);

    const connection = this.iframe.connect({
      current: 'parent',
      eventsOn,
      iframe: iframeEl,
    });

    connection.then((isConnected) => {
      // 成功连接后，执行心跳检测
      if (isConnected && checkHeartbeat) {
        this.startCheckingHeartbeat(
          typeof checkHeartbeat === 'object' ? checkHeartbeat : undefined,
        );
      }
    });

    return connection;
  }

  public emitEvent: EmitType<E> = (key, value) => {
    return this.iframe.emitEvent(key, value);
  };

  public destroy() {
    if (this.dom) {
      const node = document.getElementById('GameIframe');
      node && this.dom.removeChild(node);
    }

    this.stopCheckingHeartbeat();

    this.events.removeAllListeners();

    this.iframeElement = undefined;
    this.iframe.destroy();
  }

  /*
   * 增加某个自定义事件的监听
   */
  public eventOn: EventOnType<K> = (key, handler) => {
    this.events.addListener(key, handler);
  };

  /*
   * 取消某个自定义事件的监听
   */
  public eventOff: EventOnType<K> = (key, handler) => {
    this.events.removeListener(key, handler);
  };

  /**
   * 开始定时进行心跳检测
   */
  private startCheckingHeartbeat(heartbeatOptions: HeartbeatOptions = {}) {
    this.stopCheckingHeartbeat();

    const { interval = DEFAULT_HEARTBEAT_INTERVAL } = heartbeatOptions;

    this.heartbeatTimer = window.setTimeout(async () => {
      const res = await this.confirmHeartbeat();

      if (!res) {
        this.events.emit('children', {
          type: ChildrenEventType.ConnectionLost,
        });
      }

      this.startCheckingHeartbeat(heartbeatOptions);
    }, interval);
  }

  private stopCheckingHeartbeat() {
    clearTimeout(this.heartbeatTimer);
  }

  /**
   * 确认心跳检测
   */
  private async confirmHeartbeat(): Promise<boolean> {
    if (!this.iframe.target || !this.iframe.isReady) {
      return false;
    }

    const timeout = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), HEARTBEAT_TIMEOUT),
    );

    const confirm = this.iframe.target.receiveHeartbeat().catch(() => {
      return false;
    });

    return Promise.race([confirm, timeout]);
  }
}
