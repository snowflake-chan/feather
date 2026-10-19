import { Logger } from './logger';
import { MuLogger } from '@box/mudb/logger';

export function createMuLogger(
  baseLogger: Logger,
  prefix = '@box/mudb/src',
): MuLogger {
  const logger = baseLogger.create(prefix);
  return {
    log: (x: string) => {},
    error: (x: string) => logger.error(x),
    exception: (x) => logger.error(x),
  };
}
