import { BuildSystem } from '../type';
import { Hash } from '@box/content-server';
export declare function genOptimizedAudio(bs: BuildSystem, hash: Hash, sampleRatio?: number, channel?: number): Promise<string>;
export declare function genAudioFromUploader(bs: BuildSystem, rawData: any, sampleRatio?: number, channel?: number): Promise<string>;
//# sourceMappingURL=audio-process.d.ts.map