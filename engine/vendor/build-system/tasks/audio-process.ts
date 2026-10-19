import { BuildSystem } from '../type';
import { Hash } from '@box/content-server';
import { EventEmitter } from 'events';

let audioWorker;
if (typeof window === 'undefined') {
  const child_process = require('child_process');
  class AudioWorker extends EventEmitter {
    private queue: {
      data: { data: Uint8Array; sampleRatio: number; channel: number };
      resolve: any;
      reject: any;
    }[] = [];
    private workerLength = 0;
    private workerLimit = require('os').cpus().length;
    private checkQueueLock = false;
    constructor() {
      super();
      this.on('checkQueue', () => {
        if (this.checkQueueLock) {
          return;
        }
        this.checkQueueLock = true;
        if (this.workerLength < this.workerLimit) {
          this.workerLength++;
          const task = this.queue.shift();
          if (!task) {
            this.workerLength--;
            this.checkQueueLock = false;
            return;
          }
          const worker = child_process.fork(`${__dirname}/audio-worker.js`, {
            // silent: true,
          });
          worker.on('message', (resData) => {
            task.resolve(
              Uint8Array.from(
                Object.getOwnPropertyNames(resData).map((key) => resData[key]),
              ),
            );
            worker.kill();
            this.workerLength--;
            this.checkQueueLock = false;
            this.emit('checkQueue');
          });
          worker.on('exit', (code) => {
            if (code) {
              task.reject('Process Fail');
              worker.kill();
              this.workerLength--;
              this.checkQueueLock = false;
              this.emit('checkQueue');
            }
          });
          worker.on('error', (e) => {
            task.reject(e);
            worker.kill();
            this.workerLength--;
            this.checkQueueLock = false;
            this.emit('checkQueue');
          });
          worker.send([
            Buffer.from(task.data.data),
            task.data.sampleRatio,
            task.data.channel,
          ]);
        }
      });
    }
    public async add(
      data: Uint8Array,
      sampleRatio: number,
      channel: number,
    ): Promise<Uint8Array> {
      return await new Promise((resolve, reject) => {
        this.queue.push({
          data: {
            data,
            sampleRatio,
            channel,
          },
          resolve,
          reject,
        });
        this.emit('checkQueue');
      });
    }
  }
  audioWorker = new AudioWorker();
}

enum SampleRatio {
  LOW = 8000,
}
const DEFAULT_SAMPLE_RATIO = SampleRatio.LOW;
const DEFAULT_CHANNEL = 1;
// const CHECKLENGTH = 16;
// const supportList = ['m4a', 'mp3', 'ogg', 'opus', 'wav'];

async function audioProcess(
  data: Uint8Array,
  sampleRatio = DEFAULT_SAMPLE_RATIO,
  channel = DEFAULT_CHANNEL,
): Promise<Uint8Array> {
  if (typeof window === 'undefined') {
    return await audioWorker.add(data, sampleRatio, channel);
  } else {
    return data;
  }
}

export async function genOptimizedAudio(
  bs: BuildSystem,
  hash: Hash,
  sampleRatio?: number,
  channel?: number,
) {
  if (hash === '') {
    return hash;
  }
  const pureHash = hash.match(/^(.*?)(\..*?)?$/)![1];
  const audioData = await bs.retrieveContent(pureHash);
  return await bs.storeContent(
    await audioProcess(audioData, sampleRatio, channel),
  );
}

export async function genAudioFromUploader(
  bs: BuildSystem,
  rawData: any,
  sampleRatio?: number,
  channel?: number,
) {
  if (!(rawData instanceof Buffer) && rawData && rawData.data) {
    rawData = Buffer.from(rawData.data);
  }
  return await bs.storeContent(
    await audioProcess(Uint8Array.from(rawData), sampleRatio, channel),
  );
}
