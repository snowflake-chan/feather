import { GameWorldKeyframe } from '../../api/js/api';
import { MuFloat32 } from '@box/mudb/schema';
import { EnvironmentSkyType } from '../../project/project-rda';
export declare const WORLD_ANIM_BINDING: import("../keyframe-binding").AnimationBinding<GameWorldKeyframe, import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>]>]>;
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
        environment: import("@box/mudb/schema").MuStruct<{
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
    }>;
}>, {
    environment: (index: import("@box/mudb/schema/struct").Struct<{
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
            environment: import("@box/mudb/schema").MuStruct<{
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
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        fog: import("@box/mudb/schema").MuStruct<{
            fogColor: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            fogStartDistance: import("@box/mudb/schema").MuFloat64;
            fogHeightOffset: import("@box/mudb/schema").MuFloat64;
            fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
            fogDensity: import("@box/mudb/schema").MuFloat64;
            maxFog: import("@box/mudb/schema").MuFloat64;
        }>;
        sky: import("@box/mudb/schema").MuStruct<{
            skyType: import("@box/mudb/schema").MuSchema<EnvironmentSkyType>;
            globalLight: import("@box/mudb/schema").MuFloat64;
            sunPhase: import("@box/mudb/schema").MuFloat64;
            sunFrequency: import("@box/mudb/schema").MuFloat64;
            lunarPhase: import("@box/mudb/schema").MuFloat64;
            sunDirection: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            sunColor: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyLeft: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyRight: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyTop: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyBottom: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyFront: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyBack: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            gamma: MuFloat32;
        }>;
        snow: import("@box/mudb/schema").MuStruct<{
            texture: import("@box/mudb/schema").MuUTF8;
            density: import("@box/mudb/schema").MuFloat64;
            size: import("@box/mudb/schema").MuStruct<{
                w: import("@box/mudb/schema").MuFloat64;
                h: import("@box/mudb/schema").MuFloat64;
            }>;
            fallSpeed: import("@box/mudb/schema").MuFloat64;
            spinSpeed: import("@box/mudb/schema").MuFloat64;
            color: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
                a: import("@box/mudb/schema").MuFloat64;
            }>;
        }>;
        rain: import("@box/mudb/schema").MuStruct<{
            density: import("@box/mudb/schema").MuFloat64;
            direction: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            speed: import("@box/mudb/schema").MuFloat64;
            size: import("@box/mudb/schema").MuStruct<{
                w: import("@box/mudb/schema").MuFloat64;
                h: import("@box/mudb/schema").MuFloat64;
            }>;
            interference: import("@box/mudb/schema").MuFloat64;
            color: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
                a: import("@box/mudb/schema").MuFloat64;
            }>;
        }>;
        drawDistance: MuFloat32;
        bakedShadow: import("@box/mudb/schema").MuStruct<{
            texture: import("@box/mudb/schema").MuASCII;
            data: import("@box/mudb/schema").MuASCII;
            chunkShift: import("@box/mudb/schema").MuVarint;
        }>;
    }>) => void;
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
            environment: import("@box/mudb/schema").MuStruct<{
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
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        gravity: import("@box/mudb/schema").MuFloat64;
        velocityDamping: import("@box/mudb/schema").MuFloat64;
        useOBB: import("@box/mudb/schema").MuBoolean;
    }>) => void;
}, {
    environment: (index: import("@box/mudb/schema/struct").Struct<{
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
            environment: import("@box/mudb/schema").MuStruct<{
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
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        fog: import("@box/mudb/schema").MuStruct<{
            fogColor: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            fogStartDistance: import("@box/mudb/schema").MuFloat64;
            fogHeightOffset: import("@box/mudb/schema").MuFloat64;
            fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
            fogDensity: import("@box/mudb/schema").MuFloat64;
            maxFog: import("@box/mudb/schema").MuFloat64;
        }>;
        sky: import("@box/mudb/schema").MuStruct<{
            skyType: import("@box/mudb/schema").MuSchema<EnvironmentSkyType>;
            globalLight: import("@box/mudb/schema").MuFloat64;
            sunPhase: import("@box/mudb/schema").MuFloat64;
            sunFrequency: import("@box/mudb/schema").MuFloat64;
            lunarPhase: import("@box/mudb/schema").MuFloat64;
            sunDirection: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            sunColor: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyLeft: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyRight: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyTop: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyBottom: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyFront: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            skyBack: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
            }>;
            gamma: MuFloat32;
        }>;
        snow: import("@box/mudb/schema").MuStruct<{
            texture: import("@box/mudb/schema").MuUTF8;
            density: import("@box/mudb/schema").MuFloat64;
            size: import("@box/mudb/schema").MuStruct<{
                w: import("@box/mudb/schema").MuFloat64;
                h: import("@box/mudb/schema").MuFloat64;
            }>;
            fallSpeed: import("@box/mudb/schema").MuFloat64;
            spinSpeed: import("@box/mudb/schema").MuFloat64;
            color: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
                a: import("@box/mudb/schema").MuFloat64;
            }>;
        }>;
        rain: import("@box/mudb/schema").MuStruct<{
            density: import("@box/mudb/schema").MuFloat64;
            direction: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            speed: import("@box/mudb/schema").MuFloat64;
            size: import("@box/mudb/schema").MuStruct<{
                w: import("@box/mudb/schema").MuFloat64;
                h: import("@box/mudb/schema").MuFloat64;
            }>;
            interference: import("@box/mudb/schema").MuFloat64;
            color: import("@box/mudb/schema").MuStruct<{
                r: import("@box/mudb/schema").MuFloat64;
                g: import("@box/mudb/schema").MuFloat64;
                b: import("@box/mudb/schema").MuFloat64;
                a: import("@box/mudb/schema").MuFloat64;
            }>;
        }>;
        drawDistance: MuFloat32;
        bakedShadow: import("@box/mudb/schema").MuStruct<{
            texture: import("@box/mudb/schema").MuASCII;
            data: import("@box/mudb/schema").MuASCII;
            chunkShift: import("@box/mudb/schema").MuVarint;
        }>;
    }>) => void;
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
            environment: import("@box/mudb/schema").MuStruct<{
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
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        gravity: import("@box/mudb/schema").MuFloat64;
        velocityDamping: import("@box/mudb/schema").MuFloat64;
        useOBB: import("@box/mudb/schema").MuBoolean;
    }>) => void;
}, import("@box/mudb/schema").MuStruct<{
    environment: import("@box/mudb/schema").MuVarint;
} & {
    physics: import("@box/mudb/schema").MuVarint;
}>>;
export declare const WorldAnimationSchema: import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>]>]>;
    }>>;
}>;
export type WorldAnimation = typeof WorldAnimationSchema.identity;
export declare const WorldAnimationSetSchema: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>]>]>;
    }>>;
}>>;
export declare const WorldAnimationIndexSchema: import("@box/mudb/schema").MuStruct<{
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
        environment: import("@box/mudb/schema").MuStruct<{
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
    }>;
}>;
export type WorldAnimationIndex = typeof WorldAnimationIndexSchema.identity;
//# sourceMappingURL=world-animation.d.ts.map