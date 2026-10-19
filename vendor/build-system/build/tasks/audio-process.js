"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genOptimizedAudio = genOptimizedAudio;
exports.genAudioFromUploader = genAudioFromUploader;
const events_1 = require("events");
let audioWorker;
if (typeof window === 'undefined') {
    const child_process = require('child_process');
    class AudioWorker extends events_1.EventEmitter {
        constructor() {
            super();
            this.queue = [];
            this.workerLength = 0;
            this.workerLimit = require('os').cpus().length;
            this.checkQueueLock = false;
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
                        task.resolve(Uint8Array.from(Object.getOwnPropertyNames(resData).map((key) => resData[key])));
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
        add(data, sampleRatio, channel) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
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
            });
        }
    }
    audioWorker = new AudioWorker();
}
var SampleRatio;
(function (SampleRatio) {
    SampleRatio[SampleRatio["LOW"] = 8000] = "LOW";
})(SampleRatio || (SampleRatio = {}));
const DEFAULT_SAMPLE_RATIO = SampleRatio.LOW;
const DEFAULT_CHANNEL = 1;
// const CHECKLENGTH = 16;
// const supportList = ['m4a', 'mp3', 'ogg', 'opus', 'wav'];
function audioProcess(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, sampleRatio = DEFAULT_SAMPLE_RATIO, channel = DEFAULT_CHANNEL) {
        if (typeof window === 'undefined') {
            return yield audioWorker.add(data, sampleRatio, channel);
        }
        else {
            return data;
        }
    });
}
function genOptimizedAudio(bs, hash, sampleRatio, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (hash === '') {
            return hash;
        }
        const pureHash = hash.match(/^(.*?)(\..*?)?$/)[1];
        const audioData = yield bs.retrieveContent(pureHash);
        return yield bs.storeContent(yield audioProcess(audioData, sampleRatio, channel));
    });
}
function genAudioFromUploader(bs, rawData, sampleRatio, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(rawData instanceof Buffer) && rawData && rawData.data) {
            rawData = Buffer.from(rawData.data);
        }
        return yield bs.storeContent(yield audioProcess(Uint8Array.from(rawData), sampleRatio, channel));
    });
}
//# sourceMappingURL=audio-process.js.map