import { Logger, LogLevel } from '@box/utils/logger';

export function createConsoleLogger(
  startTime: number,
  level: LogLevel = LogLevel.INFO,
) {
  // set up build stuff
  const startDate = +new Date(startTime);
  const logger = new Logger(
    (message) => {
      const time = ((+message.timestamp - startDate) / 1000).toFixed(4);

      if (message.level > level) {
        return;
      }

      switch (message.level) {
        case LogLevel.ERROR:
          console.error(
            `${time} [${message.prefix.join(';')}] ${message.message}`,
          );
          break;
        case LogLevel.WARN:
          console.warn(
            `${time} [${message.prefix.join(';')}] ${message.message}`,
          );
          break;
        default:
          const prefix = message.prefix.slice();
          if (prefix.length > 3) {
            prefix.splice(2, prefix.length - 3, '...');
          }
          console.log(`${time} [${prefix.join(';')}] ${message.message}`);
          break;
      }
    },
    [],
    '',
  );

  return logger;
}
