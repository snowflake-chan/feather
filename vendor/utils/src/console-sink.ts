import { LogMessage, LogLevel } from './logger';

const logFunctions = {
  [LogLevel.ERROR]: console.error.bind(console),
  [LogLevel.WARN]: console.warn.bind(console),
  [LogLevel.DEBUG]: console.info.bind(console),
  [LogLevel.INFO]: console.info.bind(console),
};

function padToLength(mesg: string, length: number) {
  let result = mesg;
  while (result.length < length) {
    result += ' ';
  }
  return result;
}

export function consolePrefix(mesg: LogMessage) {
  return `(${mesg.timestamp.toISOString()} ${padToLength(
    mesg.uuid,
    16,
  )} ${padToLength(mesg.prefix.join('/'), 16)}): `;
}

export function consoleSink(mesg: LogMessage) {
  const str = consolePrefix(mesg) + mesg.message;
  const logger = logFunctions[mesg.level];
  if (logger) {
    logger.call(null, str);
  }
}
