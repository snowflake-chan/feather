import path from 'node:path';
import fs from 'node:fs';

import { requireDaemon } from './socket';

export interface LoadOptions {
  archive: string;
  socket?: string;
  replace?: boolean;
  purgeData?: boolean;
}

export async function loadCommand(options: LoadOptions) {
  const archive = path.resolve(options.archive);
  if (path.extname(archive).toLowerCase() === '.boxproject') {
    const error = new Error('.boxproject is editable source; use feather unpack') as Error & { code?: string };
    error.code = 'ARCHIVE_UNSUPPORTED';
    throw error;
  }
  if (!fs.existsSync(archive)) throw new Error(`archive not found: ${archive}`);
  const client = await requireDaemon(options.socket);
  const result = await client.importArchive(archive, {
    replace: !!options.replace,
    purgeData: !!options.purgeData,
  });
  return result;
}
