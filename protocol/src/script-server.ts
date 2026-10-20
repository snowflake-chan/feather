import type { MuSocketServer } from '@box/mudb/socket/socket';
import type { EventBus } from '@box/utils/event';
import type { ParsedError } from '@box/schema/debugger-console/schema';

/**
 * 脚本执行宿主的传输契约。
 * engine 只依赖这个接口；worker / ivmp / mock 都是它的实现。
 */
export interface ScriptServer extends MuSocketServer {
  launch(script: number | string, _module: any): Promise<void>;
  /** Terminate script workers but keep the socket server alive for relaunch. */
  terminateWorkers?(): void;
  /**
   * HACK: 用于从外部传入 VM 接收到的但脚本中未捕获到的错误。
   */
  onIsolateException?: EventBus<ParsedError>;
}
