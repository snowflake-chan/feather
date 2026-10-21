import { LogSink, LogLevel, LogMessage } from './logger';

export function filterSink(
  filteredSink: LogSink,
  logLevel: LogLevel,
  unfilterPrefixRegex?: string,
) {
  if (unfilterPrefixRegex === undefined || unfilterPrefixRegex === '') {
    return (mesg: LogMessage) => {
      if (logLevel < mesg.level) {
        return;
      }
      filteredSink(mesg);
    };
  }

  const logPrefixRegex = new RegExp(unfilterPrefixRegex);

  return (mesg: LogMessage) => {
    const prefix = mesg.prefix.join('/');
    const matchesPrefix = logPrefixRegex.test(prefix);
    if (!matchesPrefix && logLevel < mesg.level) {
      return;
    }
    filteredSink(mesg);
  };
}
