import createDebug from 'debug';
import pino, { Logger } from 'pino';

function parseLogLevel(level: number) {
  return ['error', 'warn', 'info', 'debug'][level];
}

export function setRootLogLevel(level: number) {
  rootLogger.level = parseLogLevel(level);
}

export const LOGGER_HOST_UUID =
  'server:' + Math.floor(Math.random() * 1e8).toString(16);

export const rootLogger: Logger = pino({
  base: {
    pid: process.pid,
    hostname: LOGGER_HOST_UUID,
  },
  // 在获取到配置前，先使用环境变量初始化，默认为 info
  level: parseLogLevel(parseInt(process.env.LOG_LEVEL || '2')),
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            singleLine: true, // for loki to show
            ignore: null, // show hostname
          },
        }
      : undefined,
});

createDebug.enable('box:*');
createDebug.log = (obj: any, msg?: string, ...args: any[]) =>
  rootLogger.debug(obj, msg, ...args);

rootLogger.info('Logger module initialization done.');
