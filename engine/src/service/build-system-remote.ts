import type { Logger } from 'pino';

import { FetchAPI } from '@box/utils/http-fetch/type';
import { BuildSystemAPI, Hash } from '@box/build-system/type';
import { Tasks, TaskParams } from '@box/build-system/type';
import { Semaphore } from '@box/utils/semaphore';
import { ContentServer, OssCdnPath, OssStoreType } from '@box/content-server';
import { stableStringify } from '@box/mudb/util/stringify';
import { BuildSystem } from '@box/build-system/build-system';
import { MockBuildCache } from '@box/build-system/build-cache-mock';

export class BuildSystemRemote implements BuildSystemAPI {
  public mutex: { [token: string]: Semaphore } = {};
  public caches: { [token: string]: string } = {};
  public cache: any = {};
  public debug: boolean = true;

  private localBuild: BuildSystem;

  constructor(
    private _fetch: FetchAPI,
    public contentServer: ContentServer,
    public ossContentServer: ContentServer,
    public nextUidListUsingGet: (query: { num: number }) => Promise<string[]>,
    public logger: Logger,
  ) {
    this.localBuild = new BuildSystem(
      new MockBuildCache(),
      contentServer,
      ossContentServer,
      nextUidListUsingGet,
      logger,
      false,
    );
  }

  public async retrieveJSON(hash: string) {
    const json = Buffer.from(await this.retrieveContent(hash)).toString();
    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error(`could not parse json for hash: ${hash}.  ${e.message}`);
    }
  }

  public async retrieveContent(hash: string) {
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
    options?: { ossCdnPath?: OssCdnPath },
  ) {
    const data = await this.ossContentServer.retrieve(hash, options);
    if (!data) {
      throw new Error(`error retrieving hash ${hash} from s3`);
    }
    return data;
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
    options?: {
      ossStoreType?: OssStoreType;
    },
  ) {
    const hash = await this.ossContentServer.store(data, options);
    if (!hash) {
      throw new Error(`error saving data to s3`);
    }
    return hash;
  }

  public async storeJSON(data: any) {
    const str = stableStringify(data);
    if (!str) {
      throw new Error('invalid json');
    }
    return this.storeContent(Buffer.from(str, 'utf8'));
  }

  public async build<T extends keyof Tasks>(
    taskName: T,
    ...params
  ): Promise<Hash> {
    const token = JSON.stringify({
      task: taskName,
      params,
    });
    if (token in this.caches) {
      return this.caches[token];
    }
    const sem = this.mutex[token];
    if (sem) {
      await sem.p();
      return this.caches[token];
    }
    const s = (this.mutex[token] = new Semaphore(0));
    try {
      try {
        const result = await this._fetch.post(`/build/${taskName}`, params);
        this.caches[token] = result;
        return result;
      } catch (e) {
        // fallback: try building locally
        this.logger.error(
          `error running remote build: ${taskName}(${JSON.stringify(params)})`,
        );
        this.logger.error(e);
        this.logger.error(e.stack);
        const result = await this.localBuild.build(
          taskName,
          ...(params as any),
        );
        this.caches[token] = result;
        return result;
      }
    } finally {
      delete this.mutex[token];
      s.v(Infinity);
    }
  }
}
