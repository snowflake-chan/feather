import { MuRDAStruct, MuRDARegister, MuRDAConstant, MuRDATypes, MuRDAMap, MuRDAList } from '@box/mudb/rda';
import { MuArray } from '@box/mudb/schema/array';
import { MuASCII } from '@box/mudb/schema/ascii';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDate } from '@box/mudb/schema/date';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint16 } from '@box/mudb/schema/uint16';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { vec3, quat } from 'gl-matrix';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { MuRDATree } from './murda-tree';
export * from '../group-project/rda';
export declare function sizeLimitedStringRDA(defaultValue: string, len: number): MuRDARegister<MuUTF8>;
export declare const AssetEntryRDA: MuRDAStruct<{
    type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
    hash: MuRDARegister<MuASCII>;
    size: MuRDARegister<MuVarint>;
    previewImage: MuRDARegister<MuASCII>;
    ownerId: MuRDAConstant<MuVarint>;
    /**
     * 上传音频时，会将 contentId 设置为上传时间戳
     * 因此 contentId 也可以作为 createTime 使用
     */
    contentId: MuRDAConstant<MuFloat64>;
    bounds: MuRDARegister<MuSchema<vec3>>;
    animated: MuRDAConstant<MuBoolean>;
}>;
export declare const AssetsRDA: MuRDAMap<MuUTF8, MuRDAStruct<{
    type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
    hash: MuRDARegister<MuASCII>;
    size: MuRDARegister<MuVarint>;
    previewImage: MuRDARegister<MuASCII>;
    ownerId: MuRDAConstant<MuVarint>;
    /**
     * 上传音频时，会将 contentId 设置为上传时间戳
     * 因此 contentId 也可以作为 createTime 使用
     */
    contentId: MuRDAConstant<MuFloat64>;
    bounds: MuRDARegister<MuSchema<vec3>>;
    animated: MuRDAConstant<MuBoolean>;
}>>;
export declare const DeleteAssetsRDA: MuRDAList<MuRDAStruct<{
    key: MuRDARegister<MuUTF8>;
    value: MuRDAStruct<{
        type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        ownerId: MuRDAConstant<MuVarint>;
        /**
         * 上传音频时，会将 contentId 设置为上传时间戳
         * 因此 contentId 也可以作为 createTime 使用
         */
        contentId: MuRDAConstant<MuFloat64>;
        bounds: MuRDARegister<MuSchema<vec3>>;
        animated: MuRDAConstant<MuBoolean>;
    }>;
}>>;
export type AssetEntry = typeof AssetEntryRDA.stateSchema.identity;
export type AssetEntries = typeof AssetsRDA.stateSchema.identity;
export declare const VoxelShape: MuStruct<{
    x: MuUint16;
    y: MuUint16;
    z: MuUint16;
}>;
export type VoxelShape = typeof VoxelShape.identity;
export declare const VoxelRDA: MuRDARegister<MuStruct<{
    shape: MuStruct<{
        x: MuUint16;
        y: MuUint16;
        z: MuUint16;
    }>;
    chunks: MuArray<MuASCII>;
}>>;
export type VoxelInfo = MuRDATypes<typeof VoxelRDA>['state'];
export declare const XYSchema: MuRDAStruct<{
    x: MuRDARegister<MuFloat64>;
    y: MuRDARegister<MuFloat64>;
}>;
export declare const RGBSchema: MuStruct<{
    r: MuFloat64;
    g: MuFloat64;
    b: MuFloat64;
}>;
export declare const RGBASchema: MuStruct<{
    r: MuFloat64;
    g: MuFloat64;
    b: MuFloat64;
    a: MuFloat64;
}>;
export declare const XYZSchema: MuStruct<{
    x: MuFloat64;
    y: MuFloat64;
    z: MuFloat64;
}>;
export declare const DimsSchema: MuStruct<{
    w: MuFloat64;
    h: MuFloat64;
}>;
export type XYZType = typeof XYZSchema.identity;
export declare const AudioSampleRDA: MuRDAStruct<{
    sample: MuRDARegister<MuUTF8>;
    radius: MuRDARegister<MuFloat32>;
    pitch: MuRDARegister<MuFloat32>;
    pitchRange: MuRDARegister<MuFloat32>;
    gain: MuRDARegister<MuFloat32>;
    gainRange: MuRDARegister<MuFloat32>;
}>;
export declare enum AudioSampleEnum {
    Sample = "track",
    Radius = "radius",
    Pitch = "pitch",
    PitchRange = "pitchRange",
    Gain = "gain",
    GainRange = "gainRange"
}
export type AudioSample = (typeof AudioSampleRDA.stateSchema)['identity'];
export declare enum EnvironmentSkyType {
    NATURAL = 0,
    COLORS = 1
}
export declare const SkyRDA: MuRDAStruct<{
    skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
    /**
     * 0-0.6, determines shaded color, camera exposure and voxel light map.
     * Voxel light map will turn off inner AO when set globalLight 0
     */
    globalLight: MuRDARegister<MuFloat64>;
    sunPhase: MuRDARegister<MuFloat64>;
    sunFrequency: MuRDARegister<MuFloat64>;
    /**
     * @deprecated
     * temporarily useless, may be useful in the future.
     */
    lunarPhase: MuRDARegister<MuFloat64>;
    sunDirection: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    sunColor: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyLeft: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyRight: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyTop: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyBottom: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyFront: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    skyBack: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    gamma: MuRDARegister<MuFloat32>;
}>;
export declare const FogRDA: MuRDAStruct<{
    fogColor: MuRDAStruct<{
        r: MuRDARegister<MuFloat64>;
        g: MuRDARegister<MuFloat64>;
        b: MuRDARegister<MuFloat64>;
    }>;
    fogStartDistance: MuRDARegister<MuFloat64>;
    fogHeightOffset: MuRDARegister<MuFloat64>;
    fogHeightFalloff: MuRDARegister<MuFloat64>;
    fogDensity: MuRDARegister<MuFloat64>;
    maxFog: MuRDARegister<MuFloat64>;
}>;
export declare const SnowRDA: MuRDAStruct<{
    texture: MuRDARegister<MuUTF8>;
    density: MuRDARegister<MuFloat64>;
    size: MuRDARegister<MuStruct<{
        w: MuFloat64;
        h: MuFloat64;
    }>>;
    fallSpeed: MuRDARegister<MuFloat64>;
    spinSpeed: MuRDARegister<MuFloat64>;
    color: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
        a: MuFloat64;
    }>>;
}>;
export declare const RainRDA: MuRDAStruct<{
    density: MuRDARegister<MuFloat64>;
    direction: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    speed: MuRDARegister<MuFloat64>;
    size: MuRDARegister<MuStruct<{
        w: MuFloat64;
        h: MuFloat64;
    }>>;
    interference: MuRDARegister<MuFloat64>;
    color: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
        a: MuFloat64;
    }>>;
}>;
export declare const BakedShadowRDA: MuRDARegister<MuStruct<{
    texture: MuASCII;
    data: MuASCII;
    chunkShift: MuVarint;
}>>;
export type BakedShadow = typeof BakedShadowRDA.stateSchema.identity;
export declare const EnvironmentRDA: MuRDAStruct<{
    fog: MuRDAStruct<{
        fogColor: MuRDAStruct<{
            r: MuRDARegister<MuFloat64>;
            g: MuRDARegister<MuFloat64>;
            b: MuRDARegister<MuFloat64>;
        }>;
        fogStartDistance: MuRDARegister<MuFloat64>;
        fogHeightOffset: MuRDARegister<MuFloat64>;
        fogHeightFalloff: MuRDARegister<MuFloat64>;
        fogDensity: MuRDARegister<MuFloat64>;
        maxFog: MuRDARegister<MuFloat64>;
    }>;
    sky: MuRDAStruct<{
        skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
        /**
         * 0-0.6, determines shaded color, camera exposure and voxel light map.
         * Voxel light map will turn off inner AO when set globalLight 0
         */
        globalLight: MuRDARegister<MuFloat64>;
        sunPhase: MuRDARegister<MuFloat64>;
        sunFrequency: MuRDARegister<MuFloat64>;
        /**
         * @deprecated
         * temporarily useless, may be useful in the future.
         */
        lunarPhase: MuRDARegister<MuFloat64>;
        sunDirection: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        sunColor: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyLeft: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyRight: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyTop: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBottom: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyFront: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBack: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        gamma: MuRDARegister<MuFloat32>;
    }>;
    snow: MuRDAStruct<{
        texture: MuRDARegister<MuUTF8>;
        density: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        fallSpeed: MuRDARegister<MuFloat64>;
        spinSpeed: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
    rain: MuRDAStruct<{
        density: MuRDARegister<MuFloat64>;
        direction: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        speed: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        interference: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
    drawDistance: MuRDARegister<MuFloat32>;
    bakedShadow: MuRDARegister<MuStruct<{
        texture: MuASCII;
        data: MuASCII;
        chunkShift: MuVarint;
    }>>;
}>;
export declare const DamageConfigRDA: MuRDAStruct<{
    enabled: MuRDARegister<MuBoolean>;
    showHealth: MuRDARegister<MuBoolean>;
    showDamage: MuRDARegister<MuBoolean>;
    hp: MuRDARegister<MuVarint>;
    maxHp: MuRDARegister<MuVarint>;
}>;
export declare const ParticleConfigRDA: MuRDAStruct<{
    rate: MuRDARegister<MuFloat64>;
    rateSpread: MuRDARegister<MuFloat64>;
    limit: MuRDARegister<MuVarint>;
    lifetime: MuRDARegister<MuFloat64>;
    lifetimeSpread: MuRDARegister<MuFloat64>;
    color0: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    color1: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    color2: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    color3: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    color4: MuRDARegister<MuStruct<{
        r: MuFloat64;
        g: MuFloat64;
        b: MuFloat64;
    }>>;
    size0: MuRDARegister<MuFloat32>;
    size1: MuRDARegister<MuFloat32>;
    size2: MuRDARegister<MuFloat32>;
    size3: MuRDARegister<MuFloat32>;
    size4: MuRDARegister<MuFloat32>;
    sizeSpread: MuRDARegister<MuFloat64>;
    velocity: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    velocitySpread: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    acceleration: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    damping: MuRDARegister<MuFloat64>;
    noiseAmpl: MuRDARegister<MuFloat64>;
    noiseFreq: MuRDARegister<MuFloat64>;
}>;
export type ParticleConfig = (typeof ParticleConfigRDA.stateSchema)['identity'];
export declare const AmbientSoundRDA: MuRDAStruct<{
    ambient: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    breakVoxel: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    placeVoxel: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    playerJoin: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    playerLeave: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
}>;
export type AmbientSound = (typeof AmbientSoundRDA.stateSchema)['identity'];
export declare enum AmbientSoundEnum {
    ambient = "ambient",
    breakVoxel = "breakVoxel",
    placeVoxel = "placeVoxel",
    playerJoin = "playerJoin",
    playerLeave = "playerLeave"
}
export declare const EntitySoundRDA: MuRDAStruct<{
    chat: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    hurt: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    die: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    interact: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
}>;
export declare enum EntitySoundEnum {
    chat = "chat",
    hurt = "hurt",
    die = "die",
    interact = "interact"
}
export type EntitySound = (typeof EntitySoundRDA.stateSchema)['identity'];
export declare const PlayerSoundRDA: MuRDAStruct<{
    spawn: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    jump: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    doubleJump: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    land: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    crouch: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    step: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    action0: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    action1: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    swim: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    enterWater: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    leaveWater: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    startFly: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    endFly: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
    music: MuRDAStruct<{
        sample: MuRDARegister<MuUTF8>;
        radius: MuRDARegister<MuFloat32>;
        pitch: MuRDARegister<MuFloat32>;
        pitchRange: MuRDARegister<MuFloat32>;
        gain: MuRDARegister<MuFloat32>;
        gainRange: MuRDARegister<MuFloat32>;
    }>;
}>;
export declare enum PlayerSoundEnum {
    spawn = "spawn",
    jump = "jump",
    doubleJump = "doubleJump",
    land = "land",
    crouch = "crouch",
    step = "step",
    action0 = "action0",
    action1 = "action1",
    swim = "swim",
    enterWater = "enterWater",
    leaveWater = "leaveWater",
    startFly = "startFly",
    endFly = "endFly",
    music = "music"
}
export type PlayerSound = (typeof PlayerSoundRDA.stateSchema)['identity'];
export declare const InitialPositionRDA: MuStruct<{
    x: MuFloat64;
    y: MuFloat64;
    z: MuFloat64;
}>;
export declare const MovementBoundsRDA: MuRDAStruct<{
    lo: MuRDAStruct<{
        x: MuRDARegister<MuFloat64>;
        y: MuRDARegister<MuFloat64>;
        z: MuRDARegister<MuFloat64>;
    }>;
    hi: MuRDAStruct<{
        x: MuRDARegister<MuFloat64>;
        y: MuRDARegister<MuFloat64>;
        z: MuRDARegister<MuFloat64>;
    }>;
}>;
export type MovementBounds = typeof MovementBoundsRDA.stateSchema.identity;
export declare const PlayerRDA: MuRDAStruct<{
    cameraType: MuRDARegister<MuASCII>;
    scale: MuRDARegister<MuFloat64>;
    colorLUT: MuRDARegister<MuUTF8>;
    initialPosition: MuRDARegister<MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>>;
    initialYaw: MuRDARegister<MuFloat32>;
    movementBounds: MuRDAStruct<{
        lo: MuRDAStruct<{
            x: MuRDARegister<MuFloat64>;
            y: MuRDARegister<MuFloat64>;
            z: MuRDARegister<MuFloat64>;
        }>;
        hi: MuRDAStruct<{
            x: MuRDARegister<MuFloat64>;
            y: MuRDARegister<MuFloat64>;
            z: MuRDARegister<MuFloat64>;
        }>;
    }>;
    allowFlight: MuRDARegister<MuBoolean>;
    allowMove: MuRDARegister<MuBoolean>;
    allowAction0: MuRDARegister<MuBoolean>;
    allowAction1: MuRDARegister<MuBoolean>;
    allowJump: MuRDARegister<MuBoolean>;
    allowDoubleJump: MuRDARegister<MuBoolean>;
    allowCrouch: MuRDARegister<MuBoolean>;
    noClip: MuRDARegister<MuBoolean>;
    walkSpeed: MuRDARegister<MuFloat32>;
    walkAcceleration: MuRDARegister<MuFloat32>;
    runSpeed: MuRDARegister<MuFloat32>;
    runAcceleration: MuRDARegister<MuFloat32>;
    crouchSpeed: MuRDARegister<MuFloat32>;
    crouchAcceleration: MuRDARegister<MuFloat32>;
    swimSpeed: MuRDARegister<MuFloat32>;
    swimAcceleration: MuRDARegister<MuFloat32>;
    flySpeed: MuRDARegister<MuFloat32>;
    flyAcceleration: MuRDARegister<MuFloat32>;
    jumpSpeedFactor: MuRDARegister<MuFloat32>;
    jumpAccelerationFactor: MuRDARegister<MuFloat32>;
    jumpPower: MuRDARegister<MuFloat32>;
    doubleJumpPower: MuRDARegister<MuFloat32>;
    mass: MuRDARegister<MuFloat64>;
    friction: MuRDARegister<MuFloat64>;
    restitution: MuRDARegister<MuFloat64>;
    color: MuRDARegister<QuantizedVec3Schema>;
    emissive: MuRDARegister<MuQuantizedFloat>;
    shininess: MuRDARegister<MuQuantizedFloat>;
    metalness: MuRDARegister<MuQuantizedFloat>;
    invisible: MuRDARegister<MuBoolean>;
    showName: MuRDARegister<MuBoolean>;
    showIndicator: MuRDARegister<MuBoolean>;
    damage: MuRDAStruct<{
        enabled: MuRDARegister<MuBoolean>;
        showHealth: MuRDARegister<MuBoolean>;
        showDamage: MuRDARegister<MuBoolean>;
        hp: MuRDARegister<MuVarint>;
        maxHp: MuRDARegister<MuVarint>;
    }>;
    sounds: MuRDAStruct<{
        chat: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        hurt: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        die: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        interact: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
    }>;
    playerSounds: MuRDAStruct<{
        spawn: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        jump: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        doubleJump: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        land: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        crouch: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        step: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        action0: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        action1: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        swim: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        enterWater: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        leaveWater: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        startFly: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        endFly: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        music: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
    }>;
}>;
export declare const EntitySeedRDA: MuRDAStruct<{
    name: MuRDARegister<MuUTF8>;
    tags: MuRDAList<MuRDARegister<MuUTF8>>;
    editLock: MuRDARegister<MuBoolean>;
    staticShadow: MuRDARegister<MuBoolean>;
    position: MuRDARegister<QuantizedVec3Schema>;
    collision: MuRDARegister<MuBoolean>;
    gravity: MuRDARegister<MuBoolean>;
    fixed: MuRDARegister<MuBoolean>;
    mass: MuRDARegister<MuFloat64>;
    friction: MuRDARegister<MuFloat64>;
    restitution: MuRDARegister<MuFloat64>;
    bounds: MuRDARegister<MuSchema<vec3>>;
    meshId: MuRDAConstant<MuFloat64>;
    mesh: MuRDARegister<MuUTF8>;
    scale: MuRDARegister<QuantizedVec3Schema>;
    orientation: MuRDARegister<MuSchema<quat>>;
    tint: MuRDARegister<MuSchema<import("gl-matrix").vec4>>;
    metalness: MuRDARegister<MuFloat64>;
    shininess: MuRDARegister<MuFloat64>;
    emissive: MuRDARegister<MuFloat64>;
    defaultMotionId: MuRDARegister<MuASCII>;
    particle: MuRDAStruct<{
        rate: MuRDARegister<MuFloat64>;
        rateSpread: MuRDARegister<MuFloat64>;
        limit: MuRDARegister<MuVarint>;
        lifetime: MuRDARegister<MuFloat64>;
        lifetimeSpread: MuRDARegister<MuFloat64>;
        color0: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color1: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color2: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color3: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color4: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        size0: MuRDARegister<MuFloat32>;
        size1: MuRDARegister<MuFloat32>;
        size2: MuRDARegister<MuFloat32>;
        size3: MuRDARegister<MuFloat32>;
        size4: MuRDARegister<MuFloat32>;
        sizeSpread: MuRDARegister<MuFloat64>;
        velocity: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        velocitySpread: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        acceleration: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        damping: MuRDARegister<MuFloat64>;
        noiseAmpl: MuRDARegister<MuFloat64>;
        noiseFreq: MuRDARegister<MuFloat64>;
    }>;
    damage: MuRDAStruct<{
        enabled: MuRDARegister<MuBoolean>;
        showHealth: MuRDARegister<MuBoolean>;
        showDamage: MuRDARegister<MuBoolean>;
        hp: MuRDARegister<MuVarint>;
        maxHp: MuRDARegister<MuVarint>;
    }>;
    sound: MuRDAStruct<{
        chat: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        hurt: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        die: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        interact: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
    }>;
}>;
export type EntitySeed = (typeof EntitySeedRDA.stateSchema)['identity'];
export declare const EntitiesTreeRDA: MuRDATree<MuRDAStruct<{
    name: MuRDARegister<MuUTF8>;
    tags: MuRDAList<MuRDARegister<MuUTF8>>;
    editLock: MuRDARegister<MuBoolean>;
    staticShadow: MuRDARegister<MuBoolean>;
    position: MuRDARegister<QuantizedVec3Schema>;
    collision: MuRDARegister<MuBoolean>;
    gravity: MuRDARegister<MuBoolean>;
    fixed: MuRDARegister<MuBoolean>;
    mass: MuRDARegister<MuFloat64>;
    friction: MuRDARegister<MuFloat64>;
    restitution: MuRDARegister<MuFloat64>;
    bounds: MuRDARegister<MuSchema<vec3>>;
    meshId: MuRDAConstant<MuFloat64>;
    mesh: MuRDARegister<MuUTF8>;
    scale: MuRDARegister<QuantizedVec3Schema>;
    orientation: MuRDARegister<MuSchema<quat>>;
    tint: MuRDARegister<MuSchema<import("gl-matrix").vec4>>;
    metalness: MuRDARegister<MuFloat64>;
    shininess: MuRDARegister<MuFloat64>;
    emissive: MuRDARegister<MuFloat64>;
    defaultMotionId: MuRDARegister<MuASCII>;
    particle: MuRDAStruct<{
        rate: MuRDARegister<MuFloat64>;
        rateSpread: MuRDARegister<MuFloat64>;
        limit: MuRDARegister<MuVarint>;
        lifetime: MuRDARegister<MuFloat64>;
        lifetimeSpread: MuRDARegister<MuFloat64>;
        color0: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color1: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color2: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color3: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        color4: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        size0: MuRDARegister<MuFloat32>;
        size1: MuRDARegister<MuFloat32>;
        size2: MuRDARegister<MuFloat32>;
        size3: MuRDARegister<MuFloat32>;
        size4: MuRDARegister<MuFloat32>;
        sizeSpread: MuRDARegister<MuFloat64>;
        velocity: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        velocitySpread: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        acceleration: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        damping: MuRDARegister<MuFloat64>;
        noiseAmpl: MuRDARegister<MuFloat64>;
        noiseFreq: MuRDARegister<MuFloat64>;
    }>;
    damage: MuRDAStruct<{
        enabled: MuRDARegister<MuBoolean>;
        showHealth: MuRDARegister<MuBoolean>;
        showDamage: MuRDARegister<MuBoolean>;
        hp: MuRDARegister<MuVarint>;
        maxHp: MuRDARegister<MuVarint>;
    }>;
    sound: MuRDAStruct<{
        chat: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        hurt: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        die: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        interact: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
    }>;
}>>;
export type TreeNode = (typeof EntitiesTreeRDA.nodeSchema)['identity'];
export type TreeNodes = (typeof EntitiesTreeRDA.stateSchema)['identity'];
export declare const CollisionRuleRDA: MuRDAStruct<{
    selectorA: MuRDARegister<MuUTF8>;
    selectorB: MuRDARegister<MuUTF8>;
}>;
export declare const CollisionFilterRDA: MuRDAList<MuRDAStruct<{
    selectorA: MuRDARegister<MuUTF8>;
    selectorB: MuRDARegister<MuUTF8>;
}>>;
export declare const PhysicsRDA: MuRDAStruct<{
    gravity: MuRDARegister<MuFloat64>;
    velocityDamping: MuRDARegister<MuFloat64>;
    useOBB: MuRDARegister<MuBoolean>;
}>;
export declare const ZoneRDA: MuRDAStruct<{
    bounds: MuRDAStruct<{
        lox: MuRDARegister<MuFloat64>;
        loy: MuRDARegister<MuFloat64>;
        loz: MuRDARegister<MuFloat64>;
        hix: MuRDARegister<MuFloat64>;
        hiy: MuRDARegister<MuFloat64>;
        hiz: MuRDARegister<MuFloat64>;
    }>;
    selector: MuRDARegister<MuUTF8>;
    massScale: MuRDARegister<MuFloat64>;
    force: MuRDAStruct<{
        x: MuRDARegister<MuFloat64>;
        y: MuRDARegister<MuFloat64>;
        z: MuRDARegister<MuFloat64>;
    }>;
    overrideFog: MuRDARegister<MuBoolean>;
    fog: MuRDAStruct<{
        fogColor: MuRDAStruct<{
            r: MuRDARegister<MuFloat64>;
            g: MuRDARegister<MuFloat64>;
            b: MuRDARegister<MuFloat64>;
        }>;
        fogStartDistance: MuRDARegister<MuFloat64>;
        fogHeightOffset: MuRDARegister<MuFloat64>;
        fogHeightFalloff: MuRDARegister<MuFloat64>;
        fogDensity: MuRDARegister<MuFloat64>;
        maxFog: MuRDARegister<MuFloat64>;
    }>;
    overrideSky: MuRDARegister<MuBoolean>;
    sky: MuRDAStruct<{
        skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
        /**
         * 0-0.6, determines shaded color, camera exposure and voxel light map.
         * Voxel light map will turn off inner AO when set globalLight 0
         */
        globalLight: MuRDARegister<MuFloat64>;
        sunPhase: MuRDARegister<MuFloat64>;
        sunFrequency: MuRDARegister<MuFloat64>;
        /**
         * @deprecated
         * temporarily useless, may be useful in the future.
         */
        lunarPhase: MuRDARegister<MuFloat64>;
        sunDirection: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        sunColor: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyLeft: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyRight: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyTop: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBottom: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyFront: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBack: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        gamma: MuRDARegister<MuFloat32>;
    }>;
    overrideSnow: MuRDARegister<MuBoolean>;
    snow: MuRDAStruct<{
        texture: MuRDARegister<MuUTF8>;
        density: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        fallSpeed: MuRDARegister<MuFloat64>;
        spinSpeed: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
    overrideRain: MuRDARegister<MuBoolean>;
    rain: MuRDAStruct<{
        density: MuRDARegister<MuFloat64>;
        direction: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        speed: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        interference: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
}>;
export declare const ZoneSetRDA: MuRDAList<MuRDAStruct<{
    bounds: MuRDAStruct<{
        lox: MuRDARegister<MuFloat64>;
        loy: MuRDARegister<MuFloat64>;
        loz: MuRDARegister<MuFloat64>;
        hix: MuRDARegister<MuFloat64>;
        hiy: MuRDARegister<MuFloat64>;
        hiz: MuRDARegister<MuFloat64>;
    }>;
    selector: MuRDARegister<MuUTF8>;
    massScale: MuRDARegister<MuFloat64>;
    force: MuRDAStruct<{
        x: MuRDARegister<MuFloat64>;
        y: MuRDARegister<MuFloat64>;
        z: MuRDARegister<MuFloat64>;
    }>;
    overrideFog: MuRDARegister<MuBoolean>;
    fog: MuRDAStruct<{
        fogColor: MuRDAStruct<{
            r: MuRDARegister<MuFloat64>;
            g: MuRDARegister<MuFloat64>;
            b: MuRDARegister<MuFloat64>;
        }>;
        fogStartDistance: MuRDARegister<MuFloat64>;
        fogHeightOffset: MuRDARegister<MuFloat64>;
        fogHeightFalloff: MuRDARegister<MuFloat64>;
        fogDensity: MuRDARegister<MuFloat64>;
        maxFog: MuRDARegister<MuFloat64>;
    }>;
    overrideSky: MuRDARegister<MuBoolean>;
    sky: MuRDAStruct<{
        skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
        /**
         * 0-0.6, determines shaded color, camera exposure and voxel light map.
         * Voxel light map will turn off inner AO when set globalLight 0
         */
        globalLight: MuRDARegister<MuFloat64>;
        sunPhase: MuRDARegister<MuFloat64>;
        sunFrequency: MuRDARegister<MuFloat64>;
        /**
         * @deprecated
         * temporarily useless, may be useful in the future.
         */
        lunarPhase: MuRDARegister<MuFloat64>;
        sunDirection: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        sunColor: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyLeft: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyRight: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyTop: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBottom: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyFront: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        skyBack: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>>;
        gamma: MuRDARegister<MuFloat32>;
    }>;
    overrideSnow: MuRDARegister<MuBoolean>;
    snow: MuRDAStruct<{
        texture: MuRDARegister<MuUTF8>;
        density: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        fallSpeed: MuRDARegister<MuFloat64>;
        spinSpeed: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
    overrideRain: MuRDARegister<MuBoolean>;
    rain: MuRDAStruct<{
        density: MuRDARegister<MuFloat64>;
        direction: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        speed: MuRDARegister<MuFloat64>;
        size: MuRDARegister<MuStruct<{
            w: MuFloat64;
            h: MuFloat64;
        }>>;
        interference: MuRDARegister<MuFloat64>;
        color: MuRDARegister<MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
            a: MuFloat64;
        }>>;
    }>;
}>>;
export type ZoneSet = typeof ZoneSetRDA.stateSchema.identity;
export declare const JoystickTextureRDA: MuRDAStruct<{
    background: MuRDARegister<MuUTF8>;
    controller: MuRDARegister<MuUTF8>;
}>;
export declare const GamepadFlyTextureRDA: MuRDAStruct<{
    button: MuRDARegister<MuUTF8>;
    flyingController: MuRDARegister<MuUTF8>;
    flyingBackground: MuRDARegister<MuUTF8>;
}>;
export declare const GamepadButtonsTextureRDA: MuRDAStruct<{
    jump: MuRDARegister<MuUTF8>;
    crouch: MuRDARegister<MuUTF8>;
    actionA: MuRDARegister<MuUTF8>;
    actionB: MuRDARegister<MuUTF8>;
}>;
export declare const GamepadRDA: MuRDAStruct<{
    joystick: MuRDAStruct<{
        background: MuRDARegister<MuUTF8>;
        controller: MuRDARegister<MuUTF8>;
    }>;
    fly: MuRDAStruct<{
        button: MuRDARegister<MuUTF8>;
        flyingController: MuRDARegister<MuUTF8>;
        flyingBackground: MuRDARegister<MuUTF8>;
    }>;
    buttons: MuRDAStruct<{
        jump: MuRDARegister<MuUTF8>;
        crouch: MuRDARegister<MuUTF8>;
        actionA: MuRDARegister<MuUTF8>;
        actionB: MuRDARegister<MuUTF8>;
    }>;
}>;
export type GamepadType = typeof GamepadRDA.stateSchema.identity;
export declare const ProjectMetaRDA: MuRDAStruct<{
    displayName: MuRDARegister<MuUTF8>;
    description: MuRDARegister<MuUTF8>;
    previewImage: MuRDARegister<MuASCII>;
    bannerImages: MuRDAList<MuRDARegister<MuASCII>>;
    notice: MuRDARegister<MuUTF8>;
    isNeverChangeDisplayName: MuRDARegister<MuBoolean>;
}>;
export declare const ProjectFeatureRDA: MuRDAStruct<{
    enableTriggerAPI: MuRDAConstant<MuBoolean>;
}>;
export declare const ProjectRDA: MuRDAStruct<{
    uiTree: MuRDATree<import("./murda-union").MuRDAUnion<{
        screen: MuRDAStruct<{
            enable: MuRDARegister<MuBoolean>;
            layout: import("./murda-union").MuRDAUnion<{
                none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                autoLayout: MuRDAStruct<{
                    cellSize: MuRDAStruct<{
                        offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    }>;
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                    fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                    maxCells: MuRDARegister<MuVarint>;
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    cellPadding: MuRDAStruct<{
                        offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    }>;
                    horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                    verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            zIndex: MuRDARegister<MuVarint>;
        }>;
        element: import("./murda-union").MuRDAUnion<{
            box: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("./murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                rotation: MuRDARegister<MuQuantizedFloat>;
            }>;
            image: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                clipsDescendants: MuRDARegister<MuBoolean>;
                layout: import("./murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                image: MuRDARegister<MuUTF8>;
                imageOpacity: MuRDARegister<MuQuantizedFloat>;
                imageDisplayMode: MuRDARegister<MuSchema<import("./ui-rda/defs").ImageDisplayMode>>;
                rotation: MuRDARegister<MuQuantizedFloat>;
            }>;
            text: MuRDAStruct<{
                richText: MuRDARegister<MuBoolean>;
                rotation: MuRDARegister<MuQuantizedFloat>;
                textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
                textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
                textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
                textFontFamily: MuRDARegister<MuSchema<import("./ui-rda/defs").UITextFontFamily>>;
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("./murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                textContent: MuRDARegister<MuUTF8>;
                textFontSize: MuRDARegister<import("@box/mudb/schema").MuUint8>;
                textColor: MuRDARegister<QuantizedVec3Schema>;
                textOpacity: MuRDARegister<MuQuantizedFloat>;
                textXAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").TextXAlignType>>;
                textYAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").TextYAlignType>>;
                textLineHeight: MuRDARegister<MuQuantizedFloat>;
                autoWordWrap: MuRDARegister<MuBoolean>;
            }>;
            scrollBox: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                clipsDescendants: MuRDARegister<MuBoolean>;
                layout: import("./murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                scrollDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").UIScrollDirection>>;
                scrollbarHorizontal: MuRDARegister<MuSchema<import("./ui-rda/defs").UIScrollbarHorizontal>>;
                scrollbarVertical: MuRDARegister<MuSchema<import("./ui-rda/defs").UIScrollbarVertical>>;
                scrollbarVisibility: MuRDARegister<MuSchema<import("./ui-rda/defs").UIScrollbarVisibility>>;
                scrollbarThickness: MuRDARegister<MuVarint>;
                scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
                scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
                scrollCanvasAutoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                scrollCanvasSize: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                scrollPosition: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                rotation: MuRDARegister<MuQuantizedFloat>;
            }>;
            input: MuRDAStruct<{
                textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
                textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
                textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
                textFontFamily: MuRDARegister<MuSchema<import("./ui-rda/defs").UITextFontFamily>>;
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("./murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                textContent: MuRDARegister<MuUTF8>;
                textFontSize: MuRDARegister<import("@box/mudb/schema").MuUint8>;
                textColor: MuRDARegister<QuantizedVec3Schema>;
                textOpacity: MuRDARegister<MuQuantizedFloat>;
                textXAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").TextXAlignType>>;
                textYAlignment: MuRDARegister<MuSchema<import("./ui-rda/defs").TextYAlignType>>;
                textLineHeight: MuRDARegister<MuQuantizedFloat>;
                autoWordWrap: MuRDARegister<MuBoolean>;
                placeholder: MuRDARegister<MuUTF8>;
                placeholderColor: MuRDARegister<QuantizedVec3Schema>;
                placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
                rotation: MuRDARegister<MuQuantizedFloat>;
            }>;
        }, "text" | "input" | "image" | "box" | "scrollBox">;
    }, "element" | "screen">>;
    audioAssets: MuRDAMap<MuUTF8, MuRDAStruct<{
        type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        id: MuRDARegister<MuASCII>;
        updateAt: MuRDARegister<MuFloat64>;
    }>>;
    pictureAssets: MuRDAMap<MuUTF8, MuRDAStruct<{
        type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        id: MuRDARegister<MuASCII>;
        updateAt: MuRDARegister<MuFloat64>;
    }>>;
    type: MuRDAConstant<MuUTF8>;
    version: MuRDAConstant<MuUTF8>;
    prevHash: MuRDARegister<MuASCII>;
    timestamp: MuRDARegister<MuDate>;
    storageMode: MuRDARegister<MuUTF8>;
    features: MuRDAStruct<{
        enableTriggerAPI: MuRDAConstant<MuBoolean>;
    }>;
    info: MuRDAStruct<{
        displayName: MuRDARegister<MuUTF8>;
        description: MuRDARegister<MuUTF8>;
        previewImage: MuRDARegister<MuASCII>;
        bannerImages: MuRDAList<MuRDARegister<MuASCII>>;
        notice: MuRDARegister<MuUTF8>;
        isNeverChangeDisplayName: MuRDARegister<MuBoolean>;
    }>;
    voxels: MuRDARegister<MuStruct<{
        shape: MuStruct<{
            x: MuUint16;
            y: MuUint16;
            z: MuUint16;
        }>;
        chunks: MuArray<MuASCII>;
    }>>;
    environment: MuRDAStruct<{
        fog: MuRDAStruct<{
            fogColor: MuRDAStruct<{
                r: MuRDARegister<MuFloat64>;
                g: MuRDARegister<MuFloat64>;
                b: MuRDARegister<MuFloat64>;
            }>;
            fogStartDistance: MuRDARegister<MuFloat64>;
            fogHeightOffset: MuRDARegister<MuFloat64>;
            fogHeightFalloff: MuRDARegister<MuFloat64>;
            fogDensity: MuRDARegister<MuFloat64>;
            maxFog: MuRDARegister<MuFloat64>;
        }>;
        sky: MuRDAStruct<{
            skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
            /**
             * 0-0.6, determines shaded color, camera exposure and voxel light map.
             * Voxel light map will turn off inner AO when set globalLight 0
             */
            globalLight: MuRDARegister<MuFloat64>;
            sunPhase: MuRDARegister<MuFloat64>;
            sunFrequency: MuRDARegister<MuFloat64>;
            /**
             * @deprecated
             * temporarily useless, may be useful in the future.
             */
            lunarPhase: MuRDARegister<MuFloat64>;
            sunDirection: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            sunColor: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyLeft: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyRight: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyTop: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyBottom: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyFront: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyBack: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            gamma: MuRDARegister<MuFloat32>;
        }>;
        snow: MuRDAStruct<{
            texture: MuRDARegister<MuUTF8>;
            density: MuRDARegister<MuFloat64>;
            size: MuRDARegister<MuStruct<{
                w: MuFloat64;
                h: MuFloat64;
            }>>;
            fallSpeed: MuRDARegister<MuFloat64>;
            spinSpeed: MuRDARegister<MuFloat64>;
            color: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
                a: MuFloat64;
            }>>;
        }>;
        rain: MuRDAStruct<{
            density: MuRDARegister<MuFloat64>;
            direction: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            speed: MuRDARegister<MuFloat64>;
            size: MuRDARegister<MuStruct<{
                w: MuFloat64;
                h: MuFloat64;
            }>>;
            interference: MuRDARegister<MuFloat64>;
            color: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
                a: MuFloat64;
            }>>;
        }>;
        drawDistance: MuRDARegister<MuFloat32>;
        bakedShadow: MuRDARegister<MuStruct<{
            texture: MuASCII;
            data: MuASCII;
            chunkShift: MuVarint;
        }>>;
    }>;
    ambientSound: MuRDAStruct<{
        ambient: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        breakVoxel: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        placeVoxel: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        playerJoin: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
        playerLeave: MuRDAStruct<{
            sample: MuRDARegister<MuUTF8>;
            radius: MuRDARegister<MuFloat32>;
            pitch: MuRDARegister<MuFloat32>;
            pitchRange: MuRDARegister<MuFloat32>;
            gain: MuRDARegister<MuFloat32>;
            gainRange: MuRDARegister<MuFloat32>;
        }>;
    }>;
    physics: MuRDAStruct<{
        gravity: MuRDARegister<MuFloat64>;
        velocityDamping: MuRDARegister<MuFloat64>;
        useOBB: MuRDARegister<MuBoolean>;
    }>;
    collisionFilter: MuRDAList<MuRDAStruct<{
        selectorA: MuRDARegister<MuUTF8>;
        selectorB: MuRDARegister<MuUTF8>;
    }>>;
    player: MuRDAStruct<{
        cameraType: MuRDARegister<MuASCII>;
        scale: MuRDARegister<MuFloat64>;
        colorLUT: MuRDARegister<MuUTF8>;
        initialPosition: MuRDARegister<MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>>;
        initialYaw: MuRDARegister<MuFloat32>;
        movementBounds: MuRDAStruct<{
            lo: MuRDAStruct<{
                x: MuRDARegister<MuFloat64>;
                y: MuRDARegister<MuFloat64>;
                z: MuRDARegister<MuFloat64>;
            }>;
            hi: MuRDAStruct<{
                x: MuRDARegister<MuFloat64>;
                y: MuRDARegister<MuFloat64>;
                z: MuRDARegister<MuFloat64>;
            }>;
        }>;
        allowFlight: MuRDARegister<MuBoolean>;
        allowMove: MuRDARegister<MuBoolean>;
        allowAction0: MuRDARegister<MuBoolean>;
        allowAction1: MuRDARegister<MuBoolean>;
        allowJump: MuRDARegister<MuBoolean>;
        allowDoubleJump: MuRDARegister<MuBoolean>;
        allowCrouch: MuRDARegister<MuBoolean>;
        noClip: MuRDARegister<MuBoolean>;
        walkSpeed: MuRDARegister<MuFloat32>;
        walkAcceleration: MuRDARegister<MuFloat32>;
        runSpeed: MuRDARegister<MuFloat32>;
        runAcceleration: MuRDARegister<MuFloat32>;
        crouchSpeed: MuRDARegister<MuFloat32>;
        crouchAcceleration: MuRDARegister<MuFloat32>;
        swimSpeed: MuRDARegister<MuFloat32>;
        swimAcceleration: MuRDARegister<MuFloat32>;
        flySpeed: MuRDARegister<MuFloat32>;
        flyAcceleration: MuRDARegister<MuFloat32>;
        jumpSpeedFactor: MuRDARegister<MuFloat32>;
        jumpAccelerationFactor: MuRDARegister<MuFloat32>;
        jumpPower: MuRDARegister<MuFloat32>;
        doubleJumpPower: MuRDARegister<MuFloat32>;
        mass: MuRDARegister<MuFloat64>;
        friction: MuRDARegister<MuFloat64>;
        restitution: MuRDARegister<MuFloat64>;
        color: MuRDARegister<QuantizedVec3Schema>;
        emissive: MuRDARegister<MuQuantizedFloat>;
        shininess: MuRDARegister<MuQuantizedFloat>;
        metalness: MuRDARegister<MuQuantizedFloat>;
        invisible: MuRDARegister<MuBoolean>;
        showName: MuRDARegister<MuBoolean>;
        showIndicator: MuRDARegister<MuBoolean>;
        damage: MuRDAStruct<{
            enabled: MuRDARegister<MuBoolean>;
            showHealth: MuRDARegister<MuBoolean>;
            showDamage: MuRDARegister<MuBoolean>;
            hp: MuRDARegister<MuVarint>;
            maxHp: MuRDARegister<MuVarint>;
        }>;
        sounds: MuRDAStruct<{
            chat: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            hurt: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            die: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            interact: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
        }>;
        playerSounds: MuRDAStruct<{
            spawn: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            jump: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            doubleJump: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            land: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            crouch: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            step: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            action0: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            action1: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            swim: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            enterWater: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            leaveWater: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            startFly: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            endFly: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            music: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
        }>;
    }>;
    entitiesTree: MuRDATree<MuRDAStruct<{
        name: MuRDARegister<MuUTF8>;
        tags: MuRDAList<MuRDARegister<MuUTF8>>;
        editLock: MuRDARegister<MuBoolean>;
        staticShadow: MuRDARegister<MuBoolean>;
        position: MuRDARegister<QuantizedVec3Schema>;
        collision: MuRDARegister<MuBoolean>;
        gravity: MuRDARegister<MuBoolean>;
        fixed: MuRDARegister<MuBoolean>;
        mass: MuRDARegister<MuFloat64>;
        friction: MuRDARegister<MuFloat64>;
        restitution: MuRDARegister<MuFloat64>;
        bounds: MuRDARegister<MuSchema<vec3>>;
        meshId: MuRDAConstant<MuFloat64>;
        mesh: MuRDARegister<MuUTF8>;
        scale: MuRDARegister<QuantizedVec3Schema>;
        orientation: MuRDARegister<MuSchema<quat>>;
        tint: MuRDARegister<MuSchema<import("gl-matrix").vec4>>;
        metalness: MuRDARegister<MuFloat64>;
        shininess: MuRDARegister<MuFloat64>;
        emissive: MuRDARegister<MuFloat64>;
        defaultMotionId: MuRDARegister<MuASCII>;
        particle: MuRDAStruct<{
            rate: MuRDARegister<MuFloat64>;
            rateSpread: MuRDARegister<MuFloat64>;
            limit: MuRDARegister<MuVarint>;
            lifetime: MuRDARegister<MuFloat64>;
            lifetimeSpread: MuRDARegister<MuFloat64>;
            color0: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            color1: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            color2: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            color3: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            color4: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            size0: MuRDARegister<MuFloat32>;
            size1: MuRDARegister<MuFloat32>;
            size2: MuRDARegister<MuFloat32>;
            size3: MuRDARegister<MuFloat32>;
            size4: MuRDARegister<MuFloat32>;
            sizeSpread: MuRDARegister<MuFloat64>;
            velocity: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            velocitySpread: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            acceleration: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            damping: MuRDARegister<MuFloat64>;
            noiseAmpl: MuRDARegister<MuFloat64>;
            noiseFreq: MuRDARegister<MuFloat64>;
        }>;
        damage: MuRDAStruct<{
            enabled: MuRDARegister<MuBoolean>;
            showHealth: MuRDARegister<MuBoolean>;
            showDamage: MuRDARegister<MuBoolean>;
            hp: MuRDARegister<MuVarint>;
            maxHp: MuRDARegister<MuVarint>;
        }>;
        sound: MuRDAStruct<{
            chat: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            hurt: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            die: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
            interact: MuRDAStruct<{
                sample: MuRDARegister<MuUTF8>;
                radius: MuRDARegister<MuFloat32>;
                pitch: MuRDARegister<MuFloat32>;
                pitchRange: MuRDARegister<MuFloat32>;
                gain: MuRDARegister<MuFloat32>;
                gainRange: MuRDARegister<MuFloat32>;
            }>;
        }>;
    }>>;
    scriptIndex: MuRDARegister<MuUTF8>;
    zones: MuRDAList<MuRDAStruct<{
        bounds: MuRDAStruct<{
            lox: MuRDARegister<MuFloat64>;
            loy: MuRDARegister<MuFloat64>;
            loz: MuRDARegister<MuFloat64>;
            hix: MuRDARegister<MuFloat64>;
            hiy: MuRDARegister<MuFloat64>;
            hiz: MuRDARegister<MuFloat64>;
        }>;
        selector: MuRDARegister<MuUTF8>;
        massScale: MuRDARegister<MuFloat64>;
        force: MuRDAStruct<{
            x: MuRDARegister<MuFloat64>;
            y: MuRDARegister<MuFloat64>;
            z: MuRDARegister<MuFloat64>;
        }>;
        overrideFog: MuRDARegister<MuBoolean>;
        fog: MuRDAStruct<{
            fogColor: MuRDAStruct<{
                r: MuRDARegister<MuFloat64>;
                g: MuRDARegister<MuFloat64>;
                b: MuRDARegister<MuFloat64>;
            }>;
            fogStartDistance: MuRDARegister<MuFloat64>;
            fogHeightOffset: MuRDARegister<MuFloat64>;
            fogHeightFalloff: MuRDARegister<MuFloat64>;
            fogDensity: MuRDARegister<MuFloat64>;
            maxFog: MuRDARegister<MuFloat64>;
        }>;
        overrideSky: MuRDARegister<MuBoolean>;
        sky: MuRDAStruct<{
            skyType: MuRDARegister<MuSchema<EnvironmentSkyType>>;
            /**
             * 0-0.6, determines shaded color, camera exposure and voxel light map.
             * Voxel light map will turn off inner AO when set globalLight 0
             */
            globalLight: MuRDARegister<MuFloat64>;
            sunPhase: MuRDARegister<MuFloat64>;
            sunFrequency: MuRDARegister<MuFloat64>;
            /**
             * @deprecated
             * temporarily useless, may be useful in the future.
             */
            lunarPhase: MuRDARegister<MuFloat64>;
            sunDirection: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            sunColor: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyLeft: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyRight: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyTop: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyBottom: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyFront: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            skyBack: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>>;
            gamma: MuRDARegister<MuFloat32>;
        }>;
        overrideSnow: MuRDARegister<MuBoolean>;
        snow: MuRDAStruct<{
            texture: MuRDARegister<MuUTF8>;
            density: MuRDARegister<MuFloat64>;
            size: MuRDARegister<MuStruct<{
                w: MuFloat64;
                h: MuFloat64;
            }>>;
            fallSpeed: MuRDARegister<MuFloat64>;
            spinSpeed: MuRDARegister<MuFloat64>;
            color: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
                a: MuFloat64;
            }>>;
        }>;
        overrideRain: MuRDARegister<MuBoolean>;
        rain: MuRDAStruct<{
            density: MuRDARegister<MuFloat64>;
            direction: MuRDARegister<MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>>;
            speed: MuRDARegister<MuFloat64>;
            size: MuRDARegister<MuStruct<{
                w: MuFloat64;
                h: MuFloat64;
            }>>;
            interference: MuRDARegister<MuFloat64>;
            color: MuRDARegister<MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
                a: MuFloat64;
            }>>;
        }>;
    }>>;
    gamepad: MuRDAStruct<{
        joystick: MuRDAStruct<{
            background: MuRDARegister<MuUTF8>;
            controller: MuRDARegister<MuUTF8>;
        }>;
        fly: MuRDAStruct<{
            button: MuRDARegister<MuUTF8>;
            flyingController: MuRDARegister<MuUTF8>;
            flyingBackground: MuRDARegister<MuUTF8>;
        }>;
        buttons: MuRDAStruct<{
            jump: MuRDARegister<MuUTF8>;
            crouch: MuRDARegister<MuUTF8>;
            actionA: MuRDARegister<MuUTF8>;
            actionB: MuRDARegister<MuUTF8>;
        }>;
    }>;
    assets: MuRDAMap<MuUTF8, MuRDAStruct<{
        type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        ownerId: MuRDAConstant<MuVarint>;
        /**
         * 上传音频时，会将 contentId 设置为上传时间戳
         * 因此 contentId 也可以作为 createTime 使用
         */
        contentId: MuRDAConstant<MuFloat64>;
        bounds: MuRDARegister<MuSchema<vec3>>;
        animated: MuRDAConstant<MuBoolean>;
    }>>;
    deleteAssets: MuRDAList<MuRDAStruct<{
        key: MuRDARegister<MuUTF8>;
        value: MuRDAStruct<{
            type: MuRDAConstant<MuSchema<import("../group-project/rda").AssetType>>;
            hash: MuRDARegister<MuASCII>;
            size: MuRDARegister<MuVarint>;
            previewImage: MuRDARegister<MuASCII>;
            ownerId: MuRDAConstant<MuVarint>;
            /**
             * 上传音频时，会将 contentId 设置为上传时间戳
             * 因此 contentId 也可以作为 createTime 使用
             */
            contentId: MuRDAConstant<MuFloat64>;
            bounds: MuRDARegister<MuSchema<vec3>>;
            animated: MuRDAConstant<MuBoolean>;
        }>;
    }>>;
    committerId: MuRDARegister<MuVarint>;
    defaultScreenId: MuRDARegister<MuUTF8>;
}>;
export type ProjectInfo = MuRDATypes<typeof ProjectRDA>['state'];
