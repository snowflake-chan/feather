import { LogSink, LogLevel } from './logger';

const logFunctions = {
  [LogLevel.ERROR]: console.error.bind(console),
  [LogLevel.WARN]: console.warn.bind(console),
  [LogLevel.DEBUG]: console.info.bind(console),
  [LogLevel.INFO]: console.info.bind(console),
};

const startTime = new Date();

let curPath: string = '';

export const prettySink: LogSink = (mesg) => {
  /**
   *          bgcolor  | font
   * black      40m    | 30m
   * red        41m    | 31m
   * green      42m    | 32m
   * yellow     43m    | 33m
   * blue       44m    | 34m
   * purple     45m    | 35m
   * light blue 46m    | 36m
   * white      47m    | 37m
   *
   */
  const { level, timestamp, prefix, message } = mesg;
  let t = ((<any>timestamp - <any>startTime) / 1000).toFixed(2);
  while (t.length < 8) {
    t = ' ' + t;
  }
  const nextPath = prefix.join('/');
  const p = nextPath === curPath ? '.' : nextPath;
  curPath = nextPath;
  const m = message;
  const txt = typeof m === 'string' ? m : JSON.stringify(m);
  // if node env
  if (typeof window === 'undefined') {
    const l = {
      [LogLevel.ERROR]: '\u001B[31m[ERR]',
      [LogLevel.WARN]: '\u001B[33m[WRN]',
      [LogLevel.DEBUG]: '\u001B[35m[DBG]',
      [LogLevel.INFO]: '\u001B[34m[INF]',
    }[level];
    console.log(
      `${l} \u001B[46;30m ${t} \u001B[43;30m ${p} \u001B[40;32m ${txt}\u001B[0m`,
    );
  } else {
    const l = {
      [LogLevel.ERROR]: '[ERR]',
      [LogLevel.WARN]: '[WRN]',
      [LogLevel.DEBUG]: '[DBG]',
      [LogLevel.INFO]: '[INF]',
    }[level];

    const color = {
      [LogLevel.ERROR]: 'red',
      [LogLevel.WARN]: 'orange',
      [LogLevel.DEBUG]: 'purple',
      [LogLevel.INFO]: 'green',
    }[level];

    const logFunction = logFunctions[level];
    logFunction(
      `%c ${l} %c${t} %c ${p} %c ${txt}`,
      `background: #f7eddf; color:${color}`, // log level
      `background: #f7eddf; color:#a07060`, // timestamp
      'background: #f7eddf; color:#508040', // prefix
      'background: #f7eddf; color:#1a1a1a', // text
    );
  }
};
