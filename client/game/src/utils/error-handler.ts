import { Logger } from '@box/utils/logger';

export function installErrorHandler(logger: Logger) {
  if (typeof window === 'undefined') {
    return;
  }
  window.onerror = function (message, source, lineno, colno, error) {
    logger.error(
      `Error: ${message} @ ${source}:${lineno}:${colno}.  ${
        error ? error.stack : ''
      }`,
    );
  };
}
