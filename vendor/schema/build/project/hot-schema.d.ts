import { MuArray } from '@box/mudb/schema/array';
import { MuASCII } from '@box/mudb/schema/ascii';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDictionary } from '@box/mudb/schema/dictionary';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuInt32 } from '@box/mudb/schema/int32';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import * as ERDA from './project-rda';
export declare const DisplayNameSchema: MuUTF8;
export declare const PrevHashSchema: MuASCII;
export declare const PlayerSchema: MuStruct<{
    cameraType: MuASCII;
    scale: MuFloat64;
    colorLUT: MuUTF8;
    initialPosition: MuStruct<{
        x: MuFloat64;
        y: MuFloat64;
        z: MuFloat64;
    }>;
    initialYaw: MuFloat32;
    movementBounds: MuStruct<{
        lo: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        hi: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
    }>;
    allowFlight: MuBoolean;
    allowMove: MuBoolean;
    allowAction0: MuBoolean;
    allowAction1: MuBoolean;
    allowJump: MuBoolean;
    allowDoubleJump: MuBoolean;
    allowCrouch: MuBoolean;
    noClip: MuBoolean;
    walkSpeed: MuFloat32;
    walkAcceleration: MuFloat32;
    runSpeed: MuFloat32;
    runAcceleration: MuFloat32;
    crouchSpeed: MuFloat32;
    crouchAcceleration: MuFloat32;
    swimSpeed: MuFloat32;
    swimAcceleration: MuFloat32;
    flySpeed: MuFloat32;
    flyAcceleration: MuFloat32;
    jumpSpeedFactor: MuFloat32;
    jumpAccelerationFactor: MuFloat32;
    jumpPower: MuFloat32;
    doubleJumpPower: MuFloat32;
    mass: MuFloat64;
    friction: MuFloat64;
    restitution: MuFloat64;
    color: import("../utils/quantized-schema").QuantizedVec3Schema;
    emissive: import("@box/mudb/schema").MuQuantizedFloat;
    shininess: import("@box/mudb/schema").MuQuantizedFloat;
    metalness: import("@box/mudb/schema").MuQuantizedFloat;
    invisible: MuBoolean;
    showName: MuBoolean;
    showIndicator: MuBoolean;
    damage: MuStruct<{
        enabled: MuBoolean;
        showHealth: MuBoolean;
        showDamage: MuBoolean;
        hp: MuVarint;
        maxHp: MuVarint;
    }>;
    sounds: MuStruct<{
        chat: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        hurt: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        die: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        interact: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
    }>;
    playerSounds: MuStruct<{
        spawn: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        jump: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        doubleJump: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        land: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        crouch: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        step: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        action0: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        action1: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        swim: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        enterWater: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        leaveWater: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        startFly: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        endFly: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        music: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
    }>;
}>;
export declare const EnvironmentSchema: MuStruct<{
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
        skyType: MuSchema<ERDA.EnvironmentSkyType>;
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
        texture: MuUTF8;
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
        texture: MuASCII;
        data: MuASCII;
        chunkShift: MuVarint;
    }>;
}>;
export declare const PhysicsSchema: MuStruct<{
    gravity: MuFloat64;
    velocityDamping: MuFloat64;
    useOBB: MuBoolean;
}>;
export declare const VoxelSchema: MuStruct<{
    shape: MuStruct<{
        x: import("@box/mudb/schema").MuUint16;
        y: import("@box/mudb/schema").MuUint16;
        z: import("@box/mudb/schema").MuUint16;
    }>;
    chunks: MuArray<MuASCII>;
}>;
export declare const GamepadSchema: MuStruct<{
    joystick: MuStruct<{
        background: MuUTF8;
        controller: MuUTF8;
    }>;
    fly: MuStruct<{
        button: MuUTF8;
        flyingController: MuUTF8;
        flyingBackground: MuUTF8;
    }>;
    buttons: MuStruct<{
        jump: MuUTF8;
        crouch: MuUTF8;
        actionA: MuUTF8;
        actionB: MuUTF8;
    }>;
}>;
export declare const SeedSchema: MuStruct<{
    name: MuUTF8;
    tags: MuArray<MuUTF8>;
    editLock: MuBoolean;
    staticShadow: MuBoolean;
    position: import("../utils/quantized-schema").QuantizedVec3Schema;
    collision: MuBoolean;
    gravity: MuBoolean;
    fixed: MuBoolean;
    mass: MuFloat64;
    friction: MuFloat64;
    restitution: MuFloat64;
    bounds: MuSchema<import("gl-matrix").vec3>;
    meshId: MuFloat64;
    mesh: MuUTF8;
    scale: import("../utils/quantized-schema").QuantizedVec3Schema;
    orientation: MuSchema<import("gl-matrix").quat>;
    tint: MuSchema<import("gl-matrix").vec4>;
    metalness: MuFloat64;
    shininess: MuFloat64;
    emissive: MuFloat64;
    defaultMotionId: MuASCII;
    particle: MuStruct<{
        rate: MuFloat64;
        rateSpread: MuFloat64;
        limit: MuVarint;
        lifetime: MuFloat64;
        lifetimeSpread: MuFloat64;
        color0: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color1: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color2: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color3: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color4: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        size0: MuFloat32;
        size1: MuFloat32;
        size2: MuFloat32;
        size3: MuFloat32;
        size4: MuFloat32;
        sizeSpread: MuFloat64;
        velocity: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        velocitySpread: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        acceleration: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        damping: MuFloat64;
        noiseAmpl: MuFloat64;
        noiseFreq: MuFloat64;
    }>;
    damage: MuStruct<{
        enabled: MuBoolean;
        showHealth: MuBoolean;
        showDamage: MuBoolean;
        hp: MuVarint;
        maxHp: MuVarint;
    }>;
    sound: MuStruct<{
        chat: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        hurt: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        die: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        interact: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
    }>;
}>;
export type Seed = typeof SeedSchema.identity;
export declare const SeedSetSchema: MuDictionary<MuStruct<{
    name: MuUTF8;
    tags: MuArray<MuUTF8>;
    editLock: MuBoolean;
    staticShadow: MuBoolean;
    position: import("../utils/quantized-schema").QuantizedVec3Schema;
    collision: MuBoolean;
    gravity: MuBoolean;
    fixed: MuBoolean;
    mass: MuFloat64;
    friction: MuFloat64;
    restitution: MuFloat64;
    bounds: MuSchema<import("gl-matrix").vec3>;
    meshId: MuFloat64;
    mesh: MuUTF8;
    scale: import("../utils/quantized-schema").QuantizedVec3Schema;
    orientation: MuSchema<import("gl-matrix").quat>;
    tint: MuSchema<import("gl-matrix").vec4>;
    metalness: MuFloat64;
    shininess: MuFloat64;
    emissive: MuFloat64;
    defaultMotionId: MuASCII;
    particle: MuStruct<{
        rate: MuFloat64;
        rateSpread: MuFloat64;
        limit: MuVarint;
        lifetime: MuFloat64;
        lifetimeSpread: MuFloat64;
        color0: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color1: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color2: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color3: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        color4: MuStruct<{
            r: MuFloat64;
            g: MuFloat64;
            b: MuFloat64;
        }>;
        size0: MuFloat32;
        size1: MuFloat32;
        size2: MuFloat32;
        size3: MuFloat32;
        size4: MuFloat32;
        sizeSpread: MuFloat64;
        velocity: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        velocitySpread: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        acceleration: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        damping: MuFloat64;
        noiseAmpl: MuFloat64;
        noiseFreq: MuFloat64;
    }>;
    damage: MuStruct<{
        enabled: MuBoolean;
        showHealth: MuBoolean;
        showDamage: MuBoolean;
        hp: MuVarint;
        maxHp: MuVarint;
    }>;
    sound: MuStruct<{
        chat: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        hurt: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        die: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        interact: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
    }>;
}>>;
export type SeedSet = typeof SeedSetSchema.identity;
export declare enum HashType {
    VOXEL_MODEL = "voxelModel",
    IMAGE = "image",
    GLTF_MODEL = "gltfModel"
}
export declare function getMeshPath(meshName: string): string;
export declare const MotionSchema: MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    duration: MuFloat32;
}>;
export declare const MotionListSchema: MuArray<MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    duration: MuFloat32;
}>>;
export declare const CustomBoundsSchema: MuStruct<{
    /**
     * 框的大小
     */
    size: MuSchema<import("gl-matrix").vec3>;
    /**
     * 自定义物理框与外观框锚点的偏移量
     * 目前外观框的锚点就是外观框的质心
     */
    offset: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const MeshAssetSchema: MuStruct<{
    hash: MuASCII;
    /**
     * meshHash为hash值经过migrateVoxel后转出来的最新版本的hash值
     */
    meshHash: MuASCII;
    bounds: MuSchema<import("gl-matrix").vec3>;
    hashType: MuSchema<HashType>;
    /**
     * 动作列表
     */
    motionList: MuArray<MuStruct<{
        id: MuASCII;
        name: MuUTF8;
        duration: MuFloat32;
    }>>;
    /**
     * 是否用自定义物理模型
     */
    useCustomBounds: MuBoolean;
    /**
     * 自定义物理模型
     */
    customBounds: MuStruct<{
        /**
         * 框的大小
         */
        size: MuSchema<import("gl-matrix").vec3>;
        /**
         * 自定义物理框与外观框锚点的偏移量
         * 目前外观框的锚点就是外观框的质心
         */
        offset: MuSchema<import("gl-matrix").vec3>;
    }>;
    /**
     * 外观框中心到锚点的距离
     */
    renderBoxOffset: MuSchema<import("gl-matrix").vec3>;
}>;
export type MeshAssetInfo = typeof MeshAssetSchema.identity;
export declare const MeshAssetSetSchema: MuDictionary<MuStruct<{
    hash: MuASCII;
    /**
     * meshHash为hash值经过migrateVoxel后转出来的最新版本的hash值
     */
    meshHash: MuASCII;
    bounds: MuSchema<import("gl-matrix").vec3>;
    hashType: MuSchema<HashType>;
    /**
     * 动作列表
     */
    motionList: MuArray<MuStruct<{
        id: MuASCII;
        name: MuUTF8;
        duration: MuFloat32;
    }>>;
    /**
     * 是否用自定义物理模型
     */
    useCustomBounds: MuBoolean;
    /**
     * 自定义物理模型
     */
    customBounds: MuStruct<{
        /**
         * 框的大小
         */
        size: MuSchema<import("gl-matrix").vec3>;
        /**
         * 自定义物理框与外观框锚点的偏移量
         * 目前外观框的锚点就是外观框的质心
         */
        offset: MuSchema<import("gl-matrix").vec3>;
    }>;
    /**
     * 外观框中心到锚点的距离
     */
    renderBoxOffset: MuSchema<import("gl-matrix").vec3>;
}>>;
export declare const ScriptAssetSchema: MuStruct<{
    hash: MuASCII;
    isClient: MuBoolean;
}>;
export declare const ScriptAssetSetSchema: MuDictionary<MuStruct<{
    hash: MuASCII;
    isClient: MuBoolean;
}>>;
export declare const ScriptIndexSchema: MuArray<MuUTF8>;
export declare const SoundTableSchema: MuStruct<{
    hashes: MuArray<MuASCII>;
    hashId: MuDictionary<MuVarint>;
}>;
export declare const HotCollisionRules: MuArray<MuStruct<{
    a: MuUTF8;
    b: MuUTF8;
}>>;
export declare const PictureAssetSchema: MuStruct<{
    metadataHash: MuASCII;
    hash: MuASCII;
    width: MuInt32;
    height: MuInt32;
}>;
export type PictureAsset = typeof PictureAssetSchema.identity;
export declare const PictureAssetSetSchema: MuDictionary<MuStruct<{
    metadataHash: MuASCII;
    hash: MuASCII;
    width: MuInt32;
    height: MuInt32;
}>>;
export type PictureAssetSet = typeof PictureAssetSetSchema.identity;
export declare const SkinAssetContent: {
    hash: MuASCII;
    parts: MuStruct<{
        hips: MuASCII;
        torso: MuASCII;
        neck: MuASCII;
        head: MuASCII;
        leftShoulder: MuASCII;
        leftUpperArm: MuASCII;
        leftLowerArm: MuASCII;
        leftHand: MuASCII;
        rightShoulder: MuASCII;
        rightUpperArm: MuASCII;
        rightLowerArm: MuASCII;
        rightHand: MuASCII;
        leftUpperLeg: MuASCII;
        leftLowerLeg: MuASCII;
        leftFoot: MuASCII;
        rightUpperLeg: MuASCII;
        rightLowerLeg: MuASCII;
        rightFoot: MuASCII;
    }>;
};
export declare const SkinAssetSchema: MuStruct<{
    hash: MuASCII;
    parts: MuStruct<{
        hips: MuASCII;
        torso: MuASCII;
        neck: MuASCII;
        head: MuASCII;
        leftShoulder: MuASCII;
        leftUpperArm: MuASCII;
        leftLowerArm: MuASCII;
        leftHand: MuASCII;
        rightShoulder: MuASCII;
        rightUpperArm: MuASCII;
        rightLowerArm: MuASCII;
        rightHand: MuASCII;
        leftUpperLeg: MuASCII;
        leftLowerLeg: MuASCII;
        leftFoot: MuASCII;
        rightUpperLeg: MuASCII;
        rightLowerLeg: MuASCII;
        rightFoot: MuASCII;
    }>;
}>;
export type SkinAsset = typeof SkinAssetSchema.identity;
export declare const SkinAssetSetSchema: MuDictionary<MuStruct<{
    hash: MuASCII;
    parts: MuStruct<{
        hips: MuASCII;
        torso: MuASCII;
        neck: MuASCII;
        head: MuASCII;
        leftShoulder: MuASCII;
        leftUpperArm: MuASCII;
        leftLowerArm: MuASCII;
        leftHand: MuASCII;
        rightShoulder: MuASCII;
        rightUpperArm: MuASCII;
        rightLowerArm: MuASCII;
        rightHand: MuASCII;
        leftUpperLeg: MuASCII;
        leftLowerLeg: MuASCII;
        leftFoot: MuASCII;
        rightUpperLeg: MuASCII;
        rightLowerLeg: MuASCII;
        rightFoot: MuASCII;
    }>;
}>>;
export type SkinAssetSet = typeof SkinAssetSetSchema.identity;
export declare const HotProjectSchema: MuStruct<{
    version: MuASCII;
    name: MuUTF8;
    blockInfoHash: MuASCII;
    blockInfo: MuStruct<{
        ids: import("../utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
        names: MuArray<MuUTF8>;
        emissive: import("../utils/relative-array").RelativeArray<MuVarint>;
        texture: import("../utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
        animLength: import("../utils/relative-array").RelativeArray<MuVarint>;
        friction: import("../utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
        restitution: import("../utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
        velocity: import("../utils/relative-array").RelativeArray<MuFloat32>;
        fluids: MuArray<MuStruct<{
            id: MuVarint;
            info: MuUint32;
            mass: MuFloat64;
        }>>;
        category: MuDictionary<import("../utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>>;
        atlasRadius: MuVarint;
        blockBumpShift: MuVarint;
        blockColorShift: MuVarint;
        colorAtlas: MuArray<MuASCII>;
        materialAtlas: MuArray<MuASCII>;
        bumpAtlas: MuArray<MuASCII>;
    }>;
    environment: MuStruct<{
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
            skyType: MuSchema<ERDA.EnvironmentSkyType>;
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
            texture: MuUTF8;
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
            texture: MuASCII;
            data: MuASCII;
            chunkShift: MuVarint;
        }>;
    }>;
    physics: MuStruct<{
        gravity: MuFloat64;
        velocityDamping: MuFloat64;
        useOBB: MuBoolean;
    }>;
    player: MuStruct<{
        cameraType: MuASCII;
        scale: MuFloat64;
        colorLUT: MuUTF8;
        initialPosition: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        initialYaw: MuFloat32;
        movementBounds: MuStruct<{
            lo: MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>;
            hi: MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>;
        }>;
        allowFlight: MuBoolean;
        allowMove: MuBoolean;
        allowAction0: MuBoolean;
        allowAction1: MuBoolean;
        allowJump: MuBoolean;
        allowDoubleJump: MuBoolean;
        allowCrouch: MuBoolean;
        noClip: MuBoolean;
        walkSpeed: MuFloat32;
        walkAcceleration: MuFloat32;
        runSpeed: MuFloat32;
        runAcceleration: MuFloat32;
        crouchSpeed: MuFloat32;
        crouchAcceleration: MuFloat32;
        swimSpeed: MuFloat32;
        swimAcceleration: MuFloat32;
        flySpeed: MuFloat32;
        flyAcceleration: MuFloat32;
        jumpSpeedFactor: MuFloat32;
        jumpAccelerationFactor: MuFloat32;
        jumpPower: MuFloat32;
        doubleJumpPower: MuFloat32;
        mass: MuFloat64;
        friction: MuFloat64;
        restitution: MuFloat64;
        color: import("../utils/quantized-schema").QuantizedVec3Schema;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        invisible: MuBoolean;
        showName: MuBoolean;
        showIndicator: MuBoolean;
        damage: MuStruct<{
            enabled: MuBoolean;
            showHealth: MuBoolean;
            showDamage: MuBoolean;
            hp: MuVarint;
            maxHp: MuVarint;
        }>;
        sounds: MuStruct<{
            chat: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            hurt: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            die: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            interact: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
        }>;
        playerSounds: MuStruct<{
            spawn: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            jump: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            doubleJump: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            land: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            crouch: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            step: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            action0: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            action1: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            swim: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            enterWater: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            leaveWater: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            startFly: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            endFly: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            music: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
        }>;
    }>;
    voxels: MuStruct<{
        shape: MuStruct<{
            x: import("@box/mudb/schema").MuUint16;
            y: import("@box/mudb/schema").MuUint16;
            z: import("@box/mudb/schema").MuUint16;
        }>;
        chunks: MuArray<MuASCII>;
    }>;
    seeds: MuDictionary<MuStruct<{
        name: MuUTF8;
        tags: MuArray<MuUTF8>;
        editLock: MuBoolean;
        staticShadow: MuBoolean;
        position: import("../utils/quantized-schema").QuantizedVec3Schema;
        collision: MuBoolean;
        gravity: MuBoolean;
        fixed: MuBoolean;
        mass: MuFloat64;
        friction: MuFloat64;
        restitution: MuFloat64;
        bounds: MuSchema<import("gl-matrix").vec3>;
        meshId: MuFloat64;
        mesh: MuUTF8;
        scale: import("../utils/quantized-schema").QuantizedVec3Schema;
        orientation: MuSchema<import("gl-matrix").quat>;
        tint: MuSchema<import("gl-matrix").vec4>;
        metalness: MuFloat64;
        shininess: MuFloat64;
        emissive: MuFloat64;
        defaultMotionId: MuASCII;
        particle: MuStruct<{
            rate: MuFloat64;
            rateSpread: MuFloat64;
            limit: MuVarint;
            lifetime: MuFloat64;
            lifetimeSpread: MuFloat64;
            color0: MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>;
            color1: MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>;
            color2: MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>;
            color3: MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>;
            color4: MuStruct<{
                r: MuFloat64;
                g: MuFloat64;
                b: MuFloat64;
            }>;
            size0: MuFloat32;
            size1: MuFloat32;
            size2: MuFloat32;
            size3: MuFloat32;
            size4: MuFloat32;
            sizeSpread: MuFloat64;
            velocity: MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>;
            velocitySpread: MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>;
            acceleration: MuStruct<{
                x: MuFloat64;
                y: MuFloat64;
                z: MuFloat64;
            }>;
            damping: MuFloat64;
            noiseAmpl: MuFloat64;
            noiseFreq: MuFloat64;
        }>;
        damage: MuStruct<{
            enabled: MuBoolean;
            showHealth: MuBoolean;
            showDamage: MuBoolean;
            hp: MuVarint;
            maxHp: MuVarint;
        }>;
        sound: MuStruct<{
            chat: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            hurt: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            die: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
            interact: MuStruct<{
                sample: MuUTF8;
                radius: MuFloat32;
                pitch: MuFloat32;
                pitchRange: MuFloat32;
                gain: MuFloat32;
                gainRange: MuFloat32;
            }>;
        }>;
    }>>;
    assets: MuDictionary<MuStruct<{
        type: MuSchema<ERDA.AssetType>;
        hash: MuASCII;
        size: MuVarint;
        previewImage: MuASCII;
        ownerId: MuVarint;
        contentId: MuFloat64;
        bounds: MuSchema<import("gl-matrix").vec3>;
        animated: MuBoolean;
    }>>;
    /**
     * 音频资源字典，复制ProjectRDA的audioAssets
     */
    audioAssets: MuDictionary<MuStruct<{
        type: MuSchema<ERDA.AssetType>;
        hash: MuASCII;
        size: MuVarint;
        previewImage: MuASCII;
        id: MuASCII;
        updateAt: MuFloat64;
    }>>;
    sound: MuStruct<{
        ambient: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        breakVoxel: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        placeVoxel: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        playerJoin: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
        playerLeave: MuStruct<{
            sample: MuUTF8;
            radius: MuFloat32;
            pitch: MuFloat32;
            pitchRange: MuFloat32;
            gain: MuFloat32;
            gainRange: MuFloat32;
        }>;
    }>;
    features: MuStruct<{
        enableTriggerAPI: MuBoolean;
    }>;
    zones: MuArray<MuStruct<{
        bounds: MuStruct<{
            lox: MuFloat64;
            loy: MuFloat64;
            loz: MuFloat64;
            hix: MuFloat64;
            hiy: MuFloat64;
            hiz: MuFloat64;
        }>;
        selector: MuUTF8;
        massScale: MuFloat64;
        force: MuStruct<{
            x: MuFloat64;
            y: MuFloat64;
            z: MuFloat64;
        }>;
        overrideFog: MuBoolean;
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
        overrideSky: MuBoolean;
        sky: MuStruct<{
            skyType: MuSchema<ERDA.EnvironmentSkyType>;
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
        overrideSnow: MuBoolean;
        snow: MuStruct<{
            texture: MuUTF8;
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
        overrideRain: MuBoolean;
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
    }>>;
    gamepad: MuStruct<{
        joystick: MuStruct<{
            background: MuUTF8;
            controller: MuUTF8;
        }>;
        fly: MuStruct<{
            button: MuUTF8;
            flyingController: MuUTF8;
            flyingBackground: MuUTF8;
        }>;
        buttons: MuStruct<{
            jump: MuUTF8;
            crouch: MuUTF8;
            actionA: MuUTF8;
            actionB: MuUTF8;
        }>;
    }>;
    collisionRules: MuArray<MuStruct<{
        a: MuUTF8;
        b: MuUTF8;
    }>>;
    soundAssets: MuStruct<{
        hashes: MuArray<MuASCII>;
        hashId: MuDictionary<MuVarint>;
    }>;
    meshAssets: MuDictionary<MuStruct<{
        hash: MuASCII;
        /**
         * meshHash为hash值经过migrateVoxel后转出来的最新版本的hash值
         */
        meshHash: MuASCII;
        bounds: MuSchema<import("gl-matrix").vec3>;
        hashType: MuSchema<HashType>;
        /**
         * 动作列表
         */
        motionList: MuArray<MuStruct<{
            id: MuASCII;
            name: MuUTF8;
            duration: MuFloat32;
        }>>;
        /**
         * 是否用自定义物理模型
         */
        useCustomBounds: MuBoolean;
        /**
         * 自定义物理模型
         */
        customBounds: MuStruct<{
            /**
             * 框的大小
             */
            size: MuSchema<import("gl-matrix").vec3>;
            /**
             * 自定义物理框与外观框锚点的偏移量
             * 目前外观框的锚点就是外观框的质心
             */
            offset: MuSchema<import("gl-matrix").vec3>;
        }>;
        /**
         * 外观框中心到锚点的距离
         */
        renderBoxOffset: MuSchema<import("gl-matrix").vec3>;
    }>>;
    modules: MuDictionary<MuStruct<{
        hash: MuASCII;
        isClient: MuBoolean;
    }>>;
    scriptIndex: MuUTF8;
    uiTree: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<import("./murda-tree").TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
            screen: MuStruct<{
                enable: MuBoolean;
                layout: import("@box/mudb/schema").MuUnion<{
                    none: import("@box/mudb/schema").MuVoid;
                    autoLayout: MuStruct<{
                        cellSize: MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        lineHeightEnabled: MuBoolean;
                        columnWidthEnabled: MuBoolean;
                        startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                        fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                        maxCells: MuVarint;
                        maxCellsEnabled: MuBoolean;
                        cellPadding: MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                        verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                    }>;
                }>;
                zIndex: MuVarint;
            }>;
            element: import("@box/mudb/schema").MuUnion<{
                box: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                image: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    image: MuUTF8;
                    imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    imageDisplayMode: MuSchema<import("./ui-rda/defs").ImageDisplayMode>;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                text: MuStruct<{
                    richText: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("./ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("./ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("./ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                }>;
                scrollBox: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    scrollDirection: MuSchema<import("./ui-rda/defs").UIScrollDirection>;
                    scrollbarHorizontal: MuSchema<import("./ui-rda/defs").UIScrollbarHorizontal>;
                    scrollbarVertical: MuSchema<import("./ui-rda/defs").UIScrollbarVertical>;
                    scrollbarVisibility: MuSchema<import("./ui-rda/defs").UIScrollbarVisibility>;
                    scrollbarThickness: MuVarint;
                    scrollbarColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    scrollCanvasAutoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    scrollCanvasSize: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    scrollPosition: import("../utils/quantized-schema").QuantizedVec2Schema;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                input: MuStruct<{
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("./ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("./ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("./ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("./ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("./ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("./ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("./ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                    placeholder: MuUTF8;
                    placeholderColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    placeholderOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
            }>;
        }>>;
    }>>;
    defaultScreenId: MuUTF8;
    pictureAssets: MuDictionary<MuStruct<{
        metadataHash: MuASCII;
        hash: MuASCII;
        width: MuInt32;
        height: MuInt32;
    }>>;
    skinAssets: MuDictionary<MuStruct<{
        hash: MuASCII;
        parts: MuStruct<{
            hips: MuASCII;
            torso: MuASCII;
            neck: MuASCII;
            head: MuASCII;
            leftShoulder: MuASCII;
            leftUpperArm: MuASCII;
            leftLowerArm: MuASCII;
            leftHand: MuASCII;
            rightShoulder: MuASCII;
            rightUpperArm: MuASCII;
            rightLowerArm: MuASCII;
            rightHand: MuASCII;
            leftUpperLeg: MuASCII;
            leftLowerLeg: MuASCII;
            leftFoot: MuASCII;
            rightUpperLeg: MuASCII;
            rightLowerLeg: MuASCII;
            rightFoot: MuASCII;
        }>;
    }>>;
    defaultSkinName: MuUTF8;
}>;
export type HotProject = typeof HotProjectSchema.identity;
/**
 * 以皮肤name为key的字典
 */
export declare const SkinNameSetsSchema: MuDictionary<MuStruct<{
    hash: MuASCII;
}>>;
export declare const MeshPathSchema: MuStruct<{
    modelId: MuFloat64;
    hash: MuASCII;
    modelPreviewHash: MuASCII;
    animated: MuBoolean;
    updatedAt: MuASCII;
}>;
export type MeshPath = typeof MeshPathSchema.identity;
/**
 * 以模型调用路径path为key的字段
 * 模型调用路径，即用模型名字name固定拼接的字符串
 * `mesh/${名字}.vb`
 */
export declare const MeshPathSetsSchema: MuDictionary<MuStruct<{
    modelId: MuFloat64;
    hash: MuASCII;
    modelPreviewHash: MuASCII;
    animated: MuBoolean;
    updatedAt: MuASCII;
}>>;
export declare const ScriptAssetsSchema: MuStruct<{
    hash: MuASCII;
    name: MuUTF8;
    isClient: MuBoolean;
    isShare: MuBoolean;
    order: MuInt32;
    lockedMapTitle: MuUTF8;
    lockedMapId: MuUint32;
    id: MuUTF8;
}>;
export declare const ScriptAssetSetsSchema: MuDictionary<MuStruct<{
    hash: MuASCII;
    name: MuUTF8;
    isClient: MuBoolean;
    isShare: MuBoolean;
    order: MuInt32;
    lockedMapTitle: MuUTF8;
    lockedMapId: MuUint32;
    id: MuUTF8;
}>>;
export type ExtraScriptAssets = typeof ScriptAssetSetsSchema.identity;
export declare const ExtraProjectInfoSchema: MuStruct<{
    meshAssets: MuDictionary<MuStruct<{
        modelId: MuFloat64;
        hash: MuASCII;
        modelPreviewHash: MuASCII;
        animated: MuBoolean;
        updatedAt: MuASCII;
    }>>;
    skinAssets: MuDictionary<MuStruct<{
        hash: MuASCII;
    }>>;
    defaultSkinName: MuUTF8;
    scriptAssets: MuDictionary<MuStruct<{
        hash: MuASCII;
        name: MuUTF8;
        isClient: MuBoolean;
        isShare: MuBoolean;
        order: MuInt32;
        lockedMapTitle: MuUTF8;
        lockedMapId: MuUint32;
        id: MuUTF8;
    }>>;
}>;
export type ExtraProjectInfo = typeof ExtraProjectInfoSchema.identity;
