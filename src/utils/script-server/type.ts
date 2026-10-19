import type { MuSocketServer } from '@box/mudb/socket/socket';
import type { EventBus } from '@box/utils/event';
import type { ParsedError } from '@box/schema/debugger-console/schema';

export interface ScriptServer extends MuSocketServer {
  launch(script: number | string, _module: any): Promise<void>;
  /**
   * HACK: 用于从外部传入 VM接收到的但脚本中未捕获到的错误，暂时只有 ivmp 用到
   */
  onIsolateException?: EventBus<ParsedError>;
}
