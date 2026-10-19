import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { ContentServer } from '@box/content-server';
import { Logger } from '@box/utils/logger';
import { Semaphore } from '@box/utils/semaphore';

export type UploadDirType = {
  [name: string]: string | UploadDirType;
};

/**
 * helper function, uploads a directory completely into IPFS
 *
 * return the structure of the directory
 */
export function uploadDirectory(
  root: string,
  content: ContentServer,
): Promise<UploadDirType> {
  async function uploadRecursive(dir: string) {
    const ls = await fs.promises.readdir(dir, { withFileTypes: true });
    const result: { [key: string]: any } = {};
    const meta: { name: string; dir: boolean; size: number }[] = [];
    await Promise.all(
      ls.map(async (file) => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          result[file.name] = await uploadRecursive(fullPath);
          meta.push({
            name: file.name,
            dir: true,
            size: 0,
          });
        } else if (file.isFile()) {
          const bytes = await fs.promises.readFile(fullPath);
          result[file.name] = await content.store(bytes);
          meta.push({
            name: file.name,
            dir: false,
            size: bytes.length,
          });
        }
      }),
    );
    meta.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name === b.name) {
        return 0;
      }
      return 1;
    });
    result['.'] = meta;
    return result;
  }
  return uploadRecursive(root);
}

// watch version of upload
export function watchUploadDirectory(
  root: string,
  content: ContentServer,
  logger: Logger,
  onChange: (dir: UploadDirType) => Promise<void>,
) {
  const mutex = new Semaphore(1);

  let dirty = false;
  async function checkUpload() {
    await mutex.p();
    while (dirty) {
      let nextDir: UploadDirType | null = null;
      while (dirty) {
        dirty = false;
        try {
          nextDir = await uploadDirectory(root, content);
        } catch (e) {
          logger.error(e);
        }
      }
      if (nextDir) {
        try {
          await onChange(nextDir);
        } catch (e) {
          logger.error(e);
        }
      }
    }
    mutex.v();
  }

  chokidar
    .watch(root, {
      persistent: true,
    })
    .on('all', () => {
      if (dirty) {
        return;
      }
      dirty = true;
      checkUpload()
        .then(() => {})
        .catch((e) => logger.error(e));
    });
}

export function watchFile(
  logger: Logger,
  file: string,
  onChange: (buffer: Buffer) => Promise<void>,
) {
  const mutex = new Semaphore(1);
  let dirty = true;
  async function handleChange() {
    let data: Buffer | null = null;
    await mutex.p();
    while (dirty) {
      while (dirty) {
        dirty = false;
        try {
          data = await fs.promises.readFile(file);
        } catch (e) {
          logger.error(e);
        }
      }
      if (data) {
        try {
          await onChange(data);
        } catch (e) {
          logger.error(e);
        }
      }
    }
    mutex.v();
  }

  chokidar.watch(file, { persistent: true }).on('all', () => {
    dirty = true;
    handleChange().catch((e) => logger.error(e));
  });
}

export function watchNewFiles(
  logger: Logger,
  directory: string,
  onChange: (filePath: string) => Promise<void>,
) {
  chokidar
    .watch(directory, {
      ignoreInitial: true,
      persistent: true,
    })
    .on('add', (path) => {
      onChange(path).catch((e) => logger.error(e));
    })
    .on('error', (error) =>
      logger.error(error instanceof Error ? error : new Error(String(error))),
    );
}
