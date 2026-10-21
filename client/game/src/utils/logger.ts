import type { NetLogEvent } from '@box/schema/net-log/schema';
import createDebug from 'debug';
import pino, { levels } from 'pino';
import { clientConfig } from 'src/config/client';

const LogState: {
  send: (logEvent: NetLogEvent) => void;
  pendingMessages: NetLogEvent[];
} = {
  send: (ev: NetLogEvent) => {
    LogState.pendingMessages.push(ev);
  },
  pendingMessages: [],
};

/**
 * 供主线程使用的最底层日志
 * Worker 里别用，拿不到 clientConfig
 */
export const rootLogger = pino({
  level: levels.labels[10 * (5 - clientConfig.LOG_LEVEL)] || 'info',
  browser: {
    serialize: true,
    write: (o: any) => {
      // Development or greater than INFO
      if (process.env.NODE_ENV === 'development' || o.level > 30) {
        console.log(o);
      }

      LogState.send(o);
    },
  },
});

createDebug.enable('box:*');
createDebug.log = (obj: any, msg?: string, ...args: any[]) =>
  rootLogger.debug(obj, msg, ...args);

/**
 * Connect the root logger to container
 * @param send
 */
export function connectNetLog(send: (ev: NetLogEvent) => void) {
  LogState.send = send;
  while (LogState.pendingMessages.length > 0) {
    send(LogState.pendingMessages.shift()!);
  }
}
