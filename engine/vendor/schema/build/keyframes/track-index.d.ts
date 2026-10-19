import { MuArray, MuFloat64, MuQuantizedFloat, MuSchema, MuStruct, MuVarint } from '@box/mudb/schema';
import { AnimationPlaybackMode, GenericAnimation, KeyframeEaseMode } from './type';
export declare const KeyframeTrackIndexSchema: MuStruct<{
    targetId: MuArray<MuVarint>;
    wrapMode: MuArray<MuSchema<AnimationPlaybackMode>>;
    cycleLength: MuArray<MuFloat64>;
    loopCount: MuArray<MuFloat64>;
    loopPhase: MuArray<MuFloat64>;
    tickOffset: MuArray<MuQuantizedFloat>;
    tickScale: MuArray<MuFloat64>;
    dataOffset: MuArray<MuVarint>;
    data: MuArray<MuFloat64>;
    inEasing: MuArray<MuSchema<KeyframeEaseMode>>;
    outEasing: MuArray<MuSchema<KeyframeEaseMode>>;
    prevFrame: MuArray<MuVarint>;
    nextFrame: MuArray<MuVarint>;
    prevWeight: MuArray<MuFloat64>;
    nextWeight: MuArray<MuFloat64>;
}>;
export type KeyframeTrackIndex = typeof KeyframeTrackIndexSchema.identity;
export declare function rebuildKeyframeTrackIndex(animations: GenericAnimation[], tracker: KeyframeTrackIndex): void;
export declare function updateKeyframeTrackIndex(tracker: KeyframeTrackIndex, tick: number, deltaTick: number): void;
//# sourceMappingURL=track-index.d.ts.map