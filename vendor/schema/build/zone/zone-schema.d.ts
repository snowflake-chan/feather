import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const ZoneSchema: MuStruct<{
    id: MuVarint;
    minX: MuQuantizedFloat;
    minY: MuQuantizedFloat;
    minZ: MuQuantizedFloat;
    maxX: MuQuantizedFloat;
    maxY: MuQuantizedFloat;
    maxZ: MuQuantizedFloat;
}>;
export declare const ZoneSelectorGroupSchema: MuStruct<{
    id: MuVarint;
    groupBits: MuSortedArray<MuVarint>;
}>;
export type ZoneSelectorGroup = typeof ZoneSelectorGroupSchema.identity;
export declare const ZoneSelectorGroupSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    groupBits: MuSortedArray<MuVarint>;
}>>;
export declare const PhysicsZoneSchema: MuStruct<{
    id: MuVarint;
    minX: MuQuantizedFloat;
    minY: MuQuantizedFloat;
    minZ: MuQuantizedFloat;
    maxX: MuQuantizedFloat;
    maxY: MuQuantizedFloat;
    maxZ: MuQuantizedFloat;
    selectorGroup: MuVarint;
    massScale: MuQuantizedFloat;
    fx: MuQuantizedFloat;
    fy: MuQuantizedFloat;
    fz: MuQuantizedFloat;
}>;
export type PhysicsZone = typeof PhysicsZoneSchema.identity;
export declare const PhysicsZoneSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    minX: MuQuantizedFloat;
    minY: MuQuantizedFloat;
    minZ: MuQuantizedFloat;
    maxX: MuQuantizedFloat;
    maxY: MuQuantizedFloat;
    maxZ: MuQuantizedFloat;
    selectorGroup: MuVarint;
    massScale: MuQuantizedFloat;
    fx: MuQuantizedFloat;
    fy: MuQuantizedFloat;
    fz: MuQuantizedFloat;
}>>;
export declare const EnvironmentZoneSchema: MuStruct<{
    id: MuVarint;
    minX: MuQuantizedFloat;
    minY: MuQuantizedFloat;
    minZ: MuQuantizedFloat;
    maxX: MuQuantizedFloat;
    maxY: MuQuantizedFloat;
    maxZ: MuQuantizedFloat;
    overrideFog: MuBoolean;
    fog: MuStruct<{
        fogColor: MuStruct<{
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
    overrideSky: MuBoolean;
    sky: MuStruct<{
        skyType: import("@box/mudb/schema").MuSchema<import("../project/project-rda").EnvironmentSkyType>;
        globalLight: import("@box/mudb/schema").MuFloat64;
        sunPhase: import("@box/mudb/schema").MuFloat64;
        sunFrequency: import("@box/mudb/schema").MuFloat64;
        lunarPhase: import("@box/mudb/schema").MuFloat64;
        sunDirection: MuStruct<{
            x: import("@box/mudb/schema").MuFloat64;
            y: import("@box/mudb/schema").MuFloat64;
            z: import("@box/mudb/schema").MuFloat64;
        }>;
        sunColor: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyLeft: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyRight: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyTop: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyBottom: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyFront: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyBack: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        gamma: import("@box/mudb/schema").MuFloat32;
    }>;
    overrideSnow: MuBoolean;
    snow: MuStruct<{
        texture: import("@box/mudb/schema").MuUTF8;
        density: import("@box/mudb/schema").MuFloat64;
        size: MuStruct<{
            w: import("@box/mudb/schema").MuFloat64;
            h: import("@box/mudb/schema").MuFloat64;
        }>;
        fallSpeed: import("@box/mudb/schema").MuFloat64;
        spinSpeed: import("@box/mudb/schema").MuFloat64;
        color: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
            a: import("@box/mudb/schema").MuFloat64;
        }>;
    }>;
    overrideRain: MuBoolean;
    rain: MuStruct<{
        density: import("@box/mudb/schema").MuFloat64;
        direction: MuStruct<{
            x: import("@box/mudb/schema").MuFloat64;
            y: import("@box/mudb/schema").MuFloat64;
            z: import("@box/mudb/schema").MuFloat64;
        }>;
        speed: import("@box/mudb/schema").MuFloat64;
        size: MuStruct<{
            w: import("@box/mudb/schema").MuFloat64;
            h: import("@box/mudb/schema").MuFloat64;
        }>;
        interference: import("@box/mudb/schema").MuFloat64;
        color: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
            a: import("@box/mudb/schema").MuFloat64;
        }>;
    }>;
}>;
export type EnvironmentZone = typeof EnvironmentZoneSchema.identity;
export type EnvironmentZoneSchema = typeof EnvironmentZoneSchema.identity;
export declare const EnvironmentZoneSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    minX: MuQuantizedFloat;
    minY: MuQuantizedFloat;
    minZ: MuQuantizedFloat;
    maxX: MuQuantizedFloat;
    maxY: MuQuantizedFloat;
    maxZ: MuQuantizedFloat;
    overrideFog: MuBoolean;
    fog: MuStruct<{
        fogColor: MuStruct<{
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
    overrideSky: MuBoolean;
    sky: MuStruct<{
        skyType: import("@box/mudb/schema").MuSchema<import("../project/project-rda").EnvironmentSkyType>;
        globalLight: import("@box/mudb/schema").MuFloat64;
        sunPhase: import("@box/mudb/schema").MuFloat64;
        sunFrequency: import("@box/mudb/schema").MuFloat64;
        lunarPhase: import("@box/mudb/schema").MuFloat64;
        sunDirection: MuStruct<{
            x: import("@box/mudb/schema").MuFloat64;
            y: import("@box/mudb/schema").MuFloat64;
            z: import("@box/mudb/schema").MuFloat64;
        }>;
        sunColor: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyLeft: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyRight: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyTop: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyBottom: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyFront: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        skyBack: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
        }>;
        gamma: import("@box/mudb/schema").MuFloat32;
    }>;
    overrideSnow: MuBoolean;
    snow: MuStruct<{
        texture: import("@box/mudb/schema").MuUTF8;
        density: import("@box/mudb/schema").MuFloat64;
        size: MuStruct<{
            w: import("@box/mudb/schema").MuFloat64;
            h: import("@box/mudb/schema").MuFloat64;
        }>;
        fallSpeed: import("@box/mudb/schema").MuFloat64;
        spinSpeed: import("@box/mudb/schema").MuFloat64;
        color: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
            a: import("@box/mudb/schema").MuFloat64;
        }>;
    }>;
    overrideRain: MuBoolean;
    rain: MuStruct<{
        density: import("@box/mudb/schema").MuFloat64;
        direction: MuStruct<{
            x: import("@box/mudb/schema").MuFloat64;
            y: import("@box/mudb/schema").MuFloat64;
            z: import("@box/mudb/schema").MuFloat64;
        }>;
        speed: import("@box/mudb/schema").MuFloat64;
        size: MuStruct<{
            w: import("@box/mudb/schema").MuFloat64;
            h: import("@box/mudb/schema").MuFloat64;
        }>;
        interference: import("@box/mudb/schema").MuFloat64;
        color: MuStruct<{
            r: import("@box/mudb/schema").MuFloat64;
            g: import("@box/mudb/schema").MuFloat64;
            b: import("@box/mudb/schema").MuFloat64;
            a: import("@box/mudb/schema").MuFloat64;
        }>;
    }>;
}>>;
