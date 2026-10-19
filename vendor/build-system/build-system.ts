import type { Logger } from 'pino';

import { MuSchema } from '@box/mudb/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import { stableStringify } from '@box/mudb/util/stringify';

import { BuildSystemAPI, BuildCacheAPI, Tasks, TaskParams } from './type';
import { ContentServer, OssCdnPath, OssStoreType } from '@box/content-server';
import { tasks } from './task-index';

export class BuildSystem implements BuildSystemAPI {
  public tasks: Tasks;
  constructor(
    public cache: BuildCacheAPI,
    public contentServer: ContentServer,
    public ossContentServer: ContentServer,
    public nextUidListUsingGet: (query: { num: number }) => Promise<string[]>,
    public logger: Logger,
    public debug: boolean = false,
  ) {
    this.tasks = tasks;
  }

  public async retrieveJSON(hash: string) {
    const json = Buffer.from(await this.retrieveContent(hash)).toString();
    try {
      if (json.length === 0) {
        return void 0;
      }
      return JSON.parse(json);
    } catch (e) {
      throw new Error(`could not parse json for hash: ${hash}.  ${e.message}`);
    }
  }

  public async retrieveContent(hash: string) {
    if (!hash || typeof hash !== 'string') {
      throw new Error(
        `retrieveContent was called with an invalid hash: ${'' + hash}`,
      );
    }
    // remove extension name and extra point if exists
    const pureHash = hash.match(/^(.*?)(\..*?)?$/)![1];
    const data = await this.contentServer.retrieve(pureHash);
    if (!data) {
      throw new Error(`error retrieving hash ${hash}`);
    }
    return data;
  }

  public async retrieveContentFromS3(
    hash: string,
    options?: {
      ossCdnPath?: OssCdnPath;
    },
  ) {
    if (!hash || typeof hash !== 'string') {
      throw new Error(
        `retrieveContent was called with an invalid hash: ${hash}`,
      );
    }
    const data = await this.ossContentServer.retrieve(hash, options);
    if (!data) {
      throw new Error(`error retrieving hash ${hash} from s3`);
    }
    return data;
  }

  public async retrieveBinarySchema<T>(schema: MuSchema<T>, hash: string) {
    const bytes = await this.contentServer.retrieve(hash);
    if (!bytes) {
      throw new Error('error retrieving hash ' + hash);
    }
    if (bytes.length === 0) {
      return schema.clone(schema.identity);
    }
    const stream = new MuReadStream(bytes);
    return schema.patch(schema.identity, stream);
  }

  public async retrieveJSONSchema<T>(schema: MuSchema<T>, hash: string) {
    const data = await this.retrieveJSON(hash);
    return schema.fromJSON(data);
  }

  public async storeBinarySchema<T>(
    schema: MuSchema<T>,
    value: MuSchema<T>['identity'],
  ) {
    const ws = new MuWriteStream(1);
    schema.diff(schema.identity, value, ws);
    const hash = await this.storeContent(ws.bytes());
    ws.destroy();
    return hash;
  }

  public async storeContent(data: Uint8Array) {
    const hash = await this.contentServer.store(data);
    if (!hash) {
      throw new Error(`error saving data`);
    }
    return hash;
  }

  public async storeContentToS3(
    data: Uint8Array,
    options?: { ossStoreType?: OssStoreType },
  ) {
    const hash = await this.ossContentServer.store(data, options);
    if (!hash) {
      throw new Error(`error saving data to s3`);
    }
    return hash;
  }

  public storeJSON(data: any) {
    return this.storeContent(Buffer.from(stableStringify(data) || '', 'utf8'));
  }

  public async build<T extends keyof Tasks>(
    name: T,
    ...params: TaskParams<Tasks[T]>
  ): Promise<string> {
    const cached = await this.cache.retrieve(name, params);
    if (cached) {
      if (await this.contentServer.retrieve(cached)) {
        return cached;
      }
      this.logger.warn(
        `Build cache result is unavailable in the current content store; rebuilding ${String(name)} (${cached}).`,
      );
      await this.cache.invalidate(name, params, cached);
    }

    const task = this.tasks[name as string];
    if (!task) {
      throw new Error(`no such build task: ${name}`);
    }
    this.logger.info(`${name}(${(params as any[]).join(',')})`);
    const runTask = () =>
      task(
        new BuildSystem(
          this.cache,
          this.contentServer,
          this.ossContentServer,
          this.nextUidListUsingGet,
          this.logger.child({
            caller: name,
          }),
          this.debug,
        ),
        ...(params as any[]),
      );
    try {
      const result = await this.cache.store(name, params, runTask);
      if (await this.contentServer.retrieve(result)) {
        return result;
      }

      // Another runtime can win a shared Redis lock while writing its result
      // into a different derived content store. Do not let that foreign hash
      // strand this runtime in its startup screen: invalidate it, build once
      // against the current store, then best-effort publish the usable result.
      this.logger.warn(
        `Concurrent build cache result is unavailable in the current content store; rebuilding ${String(name)} (${result}).`,
      );
      await this.cache.invalidate(name, params, result);
      const recovered = await runTask();
      await this.cache.store(name, params, async () => recovered);
      return recovered;
    } catch (e) {
      this.logger.error(
        `Error in build task: ${name}(${JSON.stringify(params)})`,
      );
      this.logger.error(e);
      this.logger.error(e.stack);
      throw e;
    }
  }

  public async addTasks(task) {
    Object.assign(this.tasks, task);
  }
}
