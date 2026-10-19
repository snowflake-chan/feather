import { MuStruct } from '@box/mudb/schema/struct';
export declare const KeyframeReplicaSchema: MuStruct<{
    entity: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        targetId: import("@box/mudb/schema").MuVarint;
        startTick: import("@box/mudb/schema").MuQuantizedFloat;
        endTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
        cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
        playbackMode: import("@box/mudb/schema").MuSchema<import("./type").AnimationPlaybackMode>;
        keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            tick: import("@box/mudb/schema").MuQuantizedFloat;
            easeIn: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            easeOut: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            components: import("./mu-array-union").MuArrayUnion<[import("./mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{}>, MuStruct<{}>, import("@box/mudb/schema").MuUint32]>, import("./mu-array-union").MuArrayUnion<[MuStruct<{}>, MuStruct<{} | {
                [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
            }>, MuStruct<{} | {
                [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
            }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("./mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{
                x: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                y: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                z: import("@box/mudb/schema").MuQuantizedFloat;
            }>, MuStruct<{
                x: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                y: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                z: import("@box/mudb/schema").MuQuantizedFloat;
            }>]>, import("./mu-array-union").MuArrayUnion<[MuStruct<{
                color0: import("@box/mudb/schema").MuUint32;
                color1: import("@box/mudb/schema").MuUint32;
                color2: import("@box/mudb/schema").MuUint32;
                color3: import("@box/mudb/schema").MuUint32;
                color4: import("@box/mudb/schema").MuUint32;
            }>, MuStruct<{
                size0: import("@box/mudb/schema").MuQuantizedFloat;
                size1: import("@box/mudb/schema").MuQuantizedFloat;
                size2: import("@box/mudb/schema").MuQuantizedFloat;
                size3: import("@box/mudb/schema").MuQuantizedFloat;
                size4: import("@box/mudb/schema").MuQuantizedFloat;
            }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{
                x: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                y: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                z: import("@box/mudb/schema").MuQuantizedFloat;
            }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuSchema<number>]>, import("./mu-array-union").MuArrayUnion<[MuStruct<{
                r: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                g: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                b: import("@box/mudb/schema").MuQuantizedFloat;
            }>]>]>;
        }>>;
    }>>;
    player: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        targetId: import("@box/mudb/schema").MuVarint;
        startTick: import("@box/mudb/schema").MuQuantizedFloat;
        endTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
        cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
        playbackMode: import("@box/mudb/schema").MuSchema<import("./type").AnimationPlaybackMode>;
        keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            tick: import("@box/mudb/schema").MuQuantizedFloat;
            easeIn: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            easeOut: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            components: import("./mu-array-union").MuArrayUnion<[import("./mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{
                r: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                g: import("@box/mudb/schema").MuQuantizedFloat;
            } & {
                b: import("@box/mudb/schema").MuQuantizedFloat;
            }>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("./mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
        }>>;
    }>>;
    world: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        targetId: import("@box/mudb/schema").MuVarint;
        startTick: import("@box/mudb/schema").MuQuantizedFloat;
        endTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
        cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
        cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
        playbackMode: import("@box/mudb/schema").MuSchema<import("./type").AnimationPlaybackMode>;
        keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            tick: import("@box/mudb/schema").MuQuantizedFloat;
            easeIn: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            easeOut: import("@box/mudb/schema").MuSchema<import("./type").KeyframeEaseMode>;
            components: import("./mu-array-union").MuArrayUnion<[import("./mu-array-union").MuArrayUnion<[]>, import("./mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>]>]>;
        }>>;
    }>>;
}>;
