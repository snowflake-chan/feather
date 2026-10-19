import { GameEntityKeyframe } from '../../api/js/api';
import { RigidBody } from '../../physics/physics-schema';
export declare const ENTITY_ANIM_BINDING: import("../keyframe-binding").AnimationBinding<GameEntityKeyframe, import("@box/mudb/schema").MuStruct<{
    id: import("@box/mudb/schema").MuVarint;
    targetId: import("@box/mudb/schema").MuVarint;
    startTick: import("@box/mudb/schema").MuQuantizedFloat;
    endTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
    cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
    playbackMode: import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>;
    keyframes: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
        tick: import("@box/mudb/schema").MuQuantizedFloat;
        easeIn: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        easeOut: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuUint32]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            color0: import("@box/mudb/schema").MuUint32;
            color1: import("@box/mudb/schema").MuUint32;
            color2: import("@box/mudb/schema").MuUint32;
            color3: import("@box/mudb/schema").MuUint32;
            color4: import("@box/mudb/schema").MuUint32;
        }>, import("@box/mudb/schema").MuStruct<{
            size0: import("@box/mudb/schema").MuQuantizedFloat;
            size1: import("@box/mudb/schema").MuQuantizedFloat;
            size2: import("@box/mudb/schema").MuQuantizedFloat;
            size3: import("@box/mudb/schema").MuQuantizedFloat;
            size4: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuSchema<number>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>]>;
    }>>;
}>, import("@box/mudb/schema").MuStruct<{
    dirty: import("@box/mudb/schema").MuBoolean;
    tracker: import("@box/mudb/schema").MuStruct<{
        targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
        cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
        tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
        outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
        prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
    }>;
    components: import("@box/mudb/schema").MuStruct<{
        mesh: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        physics: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        particles: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        particle_mat: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        interact: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    }>;
}>, {
    mesh: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        meshId: import("@box/mudb/schema").MuVarint;
        invisible: import("@box/mudb/schema").MuBoolean;
        red: import("@box/mudb/schema").MuUint8;
        green: import("@box/mudb/schema").MuUint8;
        blue: import("@box/mudb/schema").MuUint8;
        alpha: import("@box/mudb/schema").MuUint8;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        scaleX: import("@box/mudb/schema").MuQuantizedFloat;
        scaleY: import("@box/mudb/schema").MuQuantizedFloat;
        scaleZ: import("@box/mudb/schema").MuQuantizedFloat;
        offsetX: import("@box/mudb/schema").MuQuantizedFloat;
        offsetY: import("@box/mudb/schema").MuQuantizedFloat;
        offsetZ: import("@box/mudb/schema").MuQuantizedFloat;
        motion: import("@box/mudb/schema").MuStruct<{
            defaultMotionId: import("@box/mudb/schema").MuASCII;
            paused: import("@box/mudb/schema").MuBoolean;
            pausedTick: import("@box/mudb/schema").MuFloat64;
            startTick: import("@box/mudb/schema").MuFloat64;
            playback: import("@box/mudb/schema").MuStruct<{
                motions: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    motionId: import("@box/mudb/schema").MuASCII;
                    cycleCount: import("@box/mudb/schema").MuInt32;
                }>>;
                startTick: import("@box/mudb/schema").MuFloat64;
                cycleCount: import("@box/mudb/schema").MuInt32;
            }>;
        }>;
        staticShadow: import("@box/mudb/schema").MuBoolean;
        name: import("@box/mudb/schema").MuUTF8;
    }>[]) => void;
} & {
    physics: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: RigidBody[]) => void;
} & {
    particles: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        countLimit: import("@box/mudb/schema").MuVarint;
        emitRate: import("@box/mudb/schema").MuQuantizedFloat;
        emitSpread: import("@box/mudb/schema").MuQuantizedFloat;
        lifetime: import("@box/mudb/schema").MuQuantizedFloat;
        lifetimeSpread: import("@box/mudb/schema").MuQuantizedFloat;
        velocity: import("../../utils/quantized-schema").QuantizedVec3Schema;
        velocitySpread: import("../../utils/quantized-schema").QuantizedVec3Schema;
    }>[]) => void;
} & {
    particle_mat: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        acceleration: import("../../utils/quantized-schema").QuantizedVec3Schema;
        noiseAmpl: import("@box/mudb/schema").MuQuantizedFloat;
        noiseFreq: import("@box/mudb/schema").MuQuantizedFloat;
        targetId: import("@box/mudb/schema").MuVarint;
        targetWeight: import("@box/mudb/schema").MuQuantizedFloat;
        color0: import("@box/mudb/schema").MuUint32;
        color1: import("@box/mudb/schema").MuUint32;
        color2: import("@box/mudb/schema").MuUint32;
        color3: import("@box/mudb/schema").MuUint32;
        color4: import("@box/mudb/schema").MuUint32;
        size0: import("@box/mudb/schema").MuQuantizedFloat;
        size1: import("@box/mudb/schema").MuQuantizedFloat;
        size2: import("@box/mudb/schema").MuQuantizedFloat;
        size3: import("@box/mudb/schema").MuQuantizedFloat;
        size4: import("@box/mudb/schema").MuQuantizedFloat;
        sizeSpread: import("@box/mudb/schema").MuQuantizedFloat;
        damping: import("@box/mudb/schema").MuQuantizedFloat;
        id: import("@box/mudb/schema").MuVarint;
    }>[]) => void;
} & {
    interact: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        hint: import("@box/mudb/schema").MuUTF8;
        color: import("../../utils/quantized-schema").QuantizedVec3Schema;
    }>[]) => void;
}, {
    mesh: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        meshId: import("@box/mudb/schema").MuVarint;
        invisible: import("@box/mudb/schema").MuBoolean;
        red: import("@box/mudb/schema").MuUint8;
        green: import("@box/mudb/schema").MuUint8;
        blue: import("@box/mudb/schema").MuUint8;
        alpha: import("@box/mudb/schema").MuUint8;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        scaleX: import("@box/mudb/schema").MuQuantizedFloat;
        scaleY: import("@box/mudb/schema").MuQuantizedFloat;
        scaleZ: import("@box/mudb/schema").MuQuantizedFloat;
        offsetX: import("@box/mudb/schema").MuQuantizedFloat;
        offsetY: import("@box/mudb/schema").MuQuantizedFloat;
        offsetZ: import("@box/mudb/schema").MuQuantizedFloat;
        motion: import("@box/mudb/schema").MuStruct<{
            defaultMotionId: import("@box/mudb/schema").MuASCII;
            paused: import("@box/mudb/schema").MuBoolean;
            pausedTick: import("@box/mudb/schema").MuFloat64;
            startTick: import("@box/mudb/schema").MuFloat64;
            playback: import("@box/mudb/schema").MuStruct<{
                motions: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    motionId: import("@box/mudb/schema").MuASCII;
                    cycleCount: import("@box/mudb/schema").MuInt32;
                }>>;
                startTick: import("@box/mudb/schema").MuFloat64;
                cycleCount: import("@box/mudb/schema").MuInt32;
            }>;
        }>;
        staticShadow: import("@box/mudb/schema").MuBoolean;
        name: import("@box/mudb/schema").MuUTF8;
    }>[]) => void;
} & {
    physics: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: RigidBody[]) => void;
} & {
    particles: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        countLimit: import("@box/mudb/schema").MuVarint;
        emitRate: import("@box/mudb/schema").MuQuantizedFloat;
        emitSpread: import("@box/mudb/schema").MuQuantizedFloat;
        lifetime: import("@box/mudb/schema").MuQuantizedFloat;
        lifetimeSpread: import("@box/mudb/schema").MuQuantizedFloat;
        velocity: import("../../utils/quantized-schema").QuantizedVec3Schema;
        velocitySpread: import("../../utils/quantized-schema").QuantizedVec3Schema;
    }>[]) => void;
} & {
    particle_mat: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        acceleration: import("../../utils/quantized-schema").QuantizedVec3Schema;
        noiseAmpl: import("@box/mudb/schema").MuQuantizedFloat;
        noiseFreq: import("@box/mudb/schema").MuQuantizedFloat;
        targetId: import("@box/mudb/schema").MuVarint;
        targetWeight: import("@box/mudb/schema").MuQuantizedFloat;
        color0: import("@box/mudb/schema").MuUint32;
        color1: import("@box/mudb/schema").MuUint32;
        color2: import("@box/mudb/schema").MuUint32;
        color3: import("@box/mudb/schema").MuUint32;
        color4: import("@box/mudb/schema").MuUint32;
        size0: import("@box/mudb/schema").MuQuantizedFloat;
        size1: import("@box/mudb/schema").MuQuantizedFloat;
        size2: import("@box/mudb/schema").MuQuantizedFloat;
        size3: import("@box/mudb/schema").MuQuantizedFloat;
        size4: import("@box/mudb/schema").MuQuantizedFloat;
        sizeSpread: import("@box/mudb/schema").MuQuantizedFloat;
        damping: import("@box/mudb/schema").MuQuantizedFloat;
        id: import("@box/mudb/schema").MuVarint;
    }>[]) => void;
} & {
    interact: (index: import("@box/mudb/schema/struct").Struct<{
        dirty: import("@box/mudb/schema").MuBoolean;
        tracker: import("@box/mudb/schema").MuStruct<{
            targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
            cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
            tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
            prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            physics: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particles: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            particle_mat: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            interact: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        hint: import("@box/mudb/schema").MuUTF8;
        color: import("../../utils/quantized-schema").QuantizedVec3Schema;
    }>[]) => void;
}, import("@box/mudb/schema").MuStruct<{
    mesh: import("@box/mudb/schema").MuVarint;
} & {
    physics: import("@box/mudb/schema").MuVarint;
} & {
    particles: import("@box/mudb/schema").MuVarint;
} & {
    particle_mat: import("@box/mudb/schema").MuVarint;
} & {
    interact: import("@box/mudb/schema").MuVarint;
}>>;
export declare const EntityAnimationSchema: import("@box/mudb/schema").MuStruct<{
    id: import("@box/mudb/schema").MuVarint;
    targetId: import("@box/mudb/schema").MuVarint;
    startTick: import("@box/mudb/schema").MuQuantizedFloat;
    endTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
    cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
    playbackMode: import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>;
    keyframes: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
        tick: import("@box/mudb/schema").MuQuantizedFloat;
        easeIn: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        easeOut: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuUint32]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            color0: import("@box/mudb/schema").MuUint32;
            color1: import("@box/mudb/schema").MuUint32;
            color2: import("@box/mudb/schema").MuUint32;
            color3: import("@box/mudb/schema").MuUint32;
            color4: import("@box/mudb/schema").MuUint32;
        }>, import("@box/mudb/schema").MuStruct<{
            size0: import("@box/mudb/schema").MuQuantizedFloat;
            size1: import("@box/mudb/schema").MuQuantizedFloat;
            size2: import("@box/mudb/schema").MuQuantizedFloat;
            size3: import("@box/mudb/schema").MuQuantizedFloat;
            size4: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuSchema<number>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>]>;
    }>>;
}>;
export type EntityAnimation = typeof EntityAnimationSchema.identity;
export declare const EntityAnimationSetSchema: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
    id: import("@box/mudb/schema").MuVarint;
    targetId: import("@box/mudb/schema").MuVarint;
    startTick: import("@box/mudb/schema").MuQuantizedFloat;
    endTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
    cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
    cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
    playbackMode: import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>;
    keyframes: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
        tick: import("@box/mudb/schema").MuQuantizedFloat;
        easeIn: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        easeOut: import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>;
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuUint32]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{}>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{} | {
            [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            color0: import("@box/mudb/schema").MuUint32;
            color1: import("@box/mudb/schema").MuUint32;
            color2: import("@box/mudb/schema").MuUint32;
            color3: import("@box/mudb/schema").MuUint32;
            color4: import("@box/mudb/schema").MuUint32;
        }>, import("@box/mudb/schema").MuStruct<{
            size0: import("@box/mudb/schema").MuQuantizedFloat;
            size1: import("@box/mudb/schema").MuQuantizedFloat;
            size2: import("@box/mudb/schema").MuQuantizedFloat;
            size3: import("@box/mudb/schema").MuQuantizedFloat;
            size4: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            x: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            y: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            z: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuSchema<number>]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>]>]>;
    }>>;
}>>;
export declare const EntityAnimationIndexSchema: import("@box/mudb/schema").MuStruct<{
    dirty: import("@box/mudb/schema").MuBoolean;
    tracker: import("@box/mudb/schema").MuStruct<{
        targetId: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        wrapMode: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").AnimationPlaybackMode>>;
        cycleLength: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        loopCount: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        loopPhase: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        tickOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuQuantizedFloat>;
        tickScale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        inEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
        outEasing: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSchema<import("../type").KeyframeEaseMode>>;
        prevFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        nextFrame: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        prevWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
        nextWeight: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat64>;
    }>;
    components: import("@box/mudb/schema").MuStruct<{
        mesh: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        physics: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        particles: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        particle_mat: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        interact: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    }>;
}>;
export type EntityAnimationIndex = typeof EntityAnimationIndexSchema.identity;
//# sourceMappingURL=entity-animation.d.ts.map