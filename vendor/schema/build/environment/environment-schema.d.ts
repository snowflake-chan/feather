import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuStruct } from '@box/mudb/schema/struct';
export declare const EnvironmentParamSchema: MuStruct<{
    fog: MuStruct<{
        fogColor: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        fogStartDistance: MuFloat64;
        fogHeightOffset: MuFloat64;
        fogHeightFalloff: MuFloat64;
        fogDensity: MuFloat64;
        maxFog: MuFloat64;
    }>;
    sky: MuStruct<{
        skyType: import("@box/mudb/schema").MuSchema<import("../project/project-rda").EnvironmentSkyType>;
        globalLight: MuFloat64;
        sunPhase: MuFloat64;
        sunFrequency: MuFloat64;
        lunarPhase: MuFloat64;
        sunDirection: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        sunColor: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyLeft: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyRight: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyTop: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyBottom: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyFront: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        skyBack: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        gamma: MuFloat32;
    }>;
    snow: MuStruct<{
        texture: import("@box/mudb/schema").MuUTF8;
        density: MuFloat64;
        size: MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>;
        fallSpeed: MuFloat64;
        spinSpeed: MuFloat64;
        color: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>;
    }>;
    rain: MuStruct<{
        density: MuFloat64;
        direction: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        speed: MuFloat64;
        size: MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>;
        interference: MuFloat64;
        color: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>;
    }>;
    drawDistance: MuFloat32;
    bakedShadow: MuStruct<{
        texture: import("@box/mudb/schema").MuASCII;
        data: import("@box/mudb/schema").MuASCII;
        chunkShift: import("@box/mudb/schema").MuVarint;
    }>;
}>;
export type EnvironmentParams = typeof EnvironmentParamSchema.identity;
export declare const EnvironmentStateSchema: MuStruct<{
    timeOfDay: MuFloat64;
    sunUp: MuBoolean;
    globalLight: MuFloat64;
    gamma: MuFloat32;
    drawDistance: MuFloat32;
    freezeDrawDistance: MuBoolean;
    sunDirection: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    sunColor: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyLeft: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyRight: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyTop: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyBottom: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyFront: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    skyBack: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    fogParams: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec4>;
    fogParams2: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec4>;
    fogParams3: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec4>;
}>;
export type EnvironmentState = typeof EnvironmentStateSchema.identity;
