import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDictionary } from '@box/mudb/schema/dictionary';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuRelativeVarint } from '@box/mudb/schema/rvarint';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint16 } from '@box/mudb/schema/uint16';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuVoid } from '@box/mudb/schema/void';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { PlayerLoginState } from '../player/player-schema';
export declare const MAX_CLIENT_INPUT_ENTITIES = 32;
export declare const MAX_INPUT_EVENTS = 256;
export declare const PUBLIC_BUFFER_DIVISOR = 4;
export declare const NetStateSchema: MuStruct<{
    players: MuSortedArray<MuStruct<{
        id: MuVarint;
        physGround: MuBoolean;
        physFluid: MuQuantizedFloat;
        platformX: MuQuantizedFloat;
        platformY: MuQuantizedFloat;
        platformZ: MuQuantizedFloat;
        occupancy: MuUint8;
        flags: MuSchema<import("../player/player-schema").PlayerFlags>;
        walkSpeed: MuQuantizedFloat;
        walkAcceleration: MuQuantizedFloat;
        runSpeed: MuQuantizedFloat;
        runAcceleration: MuQuantizedFloat;
        crouchSpeed: MuQuantizedFloat;
        crouchAcceleration: MuQuantizedFloat;
        swimSpeed: MuQuantizedFloat;
        swimAcceleration: MuQuantizedFloat;
        flySpeed: MuQuantizedFloat;
        flyAcceleration: MuQuantizedFloat;
        jumpSpeedFactor: MuQuantizedFloat;
        jumpAccelerationFactor: MuQuantizedFloat;
        jumpPower: MuQuantizedFloat;
        doubleJumpPower: MuQuantizedFloat;
        freezedForwardAngle: MuUint16;
        inputDirectionState: MuUint8;
        stepHeight: MuQuantizedFloat;
    }>>;
    playerInputs: MuSortedArray<MuStruct<{
        id: MuUint32;
        state: MuUint16;
        angle: MuUint8;
        cameraAngle: MuUint8;
        pitch: MuUint8;
    }>>;
    physics: MuStruct<{
        gravity: import("@box/mudb/schema").MuFloat64;
        velocityDamping: import("@box/mudb/schema").MuFloat64;
        useOBB: MuBoolean;
    }>;
    bodies: MuSortedArray<MuSchema<import("../physics/physics-schema").RigidBody> & {
        pool: import("../physics/physics-schema").RigidBody[];
        stats: () => any;
    }>;
    collisionFilter: MuArray<MuSortedArray<MuVarint>>;
    zones: MuSortedArray<MuStruct<{
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
    zoneSelectors: MuSortedArray<MuStruct<{
        id: MuVarint;
        groupBits: MuSortedArray<MuVarint>;
    }>>;
}>;
export type NetState = typeof NetStateSchema.identity;
export declare const NetPositionCorrectionSchema: MuStruct<{
    id: MuVarint;
    px: MuQuantizedFloat;
    py: MuQuantizedFloat;
    pz: MuQuantizedFloat;
    vx: MuQuantizedFloat;
    vy: MuQuantizedFloat;
    vz: MuQuantizedFloat;
}>;
export type NetPositionData = typeof NetPositionCorrectionSchema.identity;
export declare const NetPositionCorrectionSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    px: MuQuantizedFloat;
    py: MuQuantizedFloat;
    pz: MuQuantizedFloat;
    vx: MuQuantizedFloat;
    vy: MuQuantizedFloat;
    vz: MuQuantizedFloat;
}>>;
export type NetPositionCorrectionSet = typeof NetPositionCorrectionSetSchema.identity;
export declare enum NetInputEventBits {
    ACTION0 = 1,
    ACTION1 = 2,
    JUMP = 4,
    WALK = 8,
    CROUCH = 16,
    RUN = 32,
    DOUBLE_JUMP = 64,
    FLY = 128
}
export declare const NetInputEventSchema: MuStruct<{
    tick: MuQuantizedFloat;
    position: QuantizedVec3Schema;
    rayTime: MuQuantizedFloat;
    rayHitEntity: MuVarint;
    rayHitVoxelX: MuVarint;
    rayHitVoxelY: MuVarint;
    rayHitVoxelZ: MuVarint;
    rayHitNormal: MuSchema<import("gl-matrix").vec3>;
    rayOrigin: QuantizedVec3Schema;
    rayDirection: QuantizedVec3Schema;
    buttonState: MuSchema<NetInputEventBits>;
    prevButtonState: MuSchema<NetInputEventBits>;
}>;
export type NetInputEvent = typeof NetInputEventSchema.identity;
export declare const NetClientInputSchema: MuStruct<{
    inputState: MuUint16;
    inputAngle: MuUint8;
    inputPitch: MuUint8;
    inputCameraAngle: MuUint8;
    bodies: MuSortedArray<MuStruct<{
        id: MuVarint;
        px: MuQuantizedFloat;
        py: MuQuantizedFloat;
        pz: MuQuantizedFloat;
        vx: MuQuantizedFloat;
        vy: MuQuantizedFloat;
        vz: MuQuantizedFloat;
    }>>;
}>;
export type NetClientInput = typeof NetClientInputSchema.identity;
export declare const TimestampedClientInputSchema: MuStruct<{
    tick: MuRelativeVarint;
    input: MuStruct<{
        inputState: MuUint16;
        inputAngle: MuUint8;
        inputPitch: MuUint8;
        inputCameraAngle: MuUint8;
        bodies: MuSortedArray<MuStruct<{
            id: MuVarint;
            px: MuQuantizedFloat;
            py: MuQuantizedFloat;
            pz: MuQuantizedFloat;
            vx: MuQuantizedFloat;
            vy: MuQuantizedFloat;
            vz: MuQuantizedFloat;
        }>>;
    }>;
    pauseCounter: MuRelativeVarint;
    events: MuArray<MuStruct<{
        tick: MuQuantizedFloat;
        position: QuantizedVec3Schema;
        rayTime: MuQuantizedFloat;
        rayHitEntity: MuVarint;
        rayHitVoxelX: MuVarint;
        rayHitVoxelY: MuVarint;
        rayHitVoxelZ: MuVarint;
        rayHitNormal: MuSchema<import("gl-matrix").vec3>;
        rayOrigin: QuantizedVec3Schema;
        rayDirection: QuantizedVec3Schema;
        buttonState: MuSchema<NetInputEventBits>;
        prevButtonState: MuSchema<NetInputEventBits>;
    }>>;
}>;
export type TimestampedClientInput = typeof TimestampedClientInputSchema.identity;
export declare const TaggedNetClientInputSchema: MuStruct<{
    id: MuVarint;
    input: MuStruct<{
        inputState: MuUint16;
        inputAngle: MuUint8;
        inputPitch: MuUint8;
        inputCameraAngle: MuUint8;
        bodies: MuSortedArray<MuStruct<{
            id: MuVarint;
            px: MuQuantizedFloat;
            py: MuQuantizedFloat;
            pz: MuQuantizedFloat;
            vx: MuQuantizedFloat;
            vy: MuQuantizedFloat;
            vz: MuQuantizedFloat;
        }>>;
    }>;
}>;
export type TaggedNetClientInput = typeof TaggedNetClientInputSchema.identity;
export declare const NetInputSchema: MuStruct<{
    clients: MuSortedArray<MuStruct<{
        id: MuVarint;
        input: MuStruct<{
            inputState: MuUint16;
            inputAngle: MuUint8;
            inputPitch: MuUint8;
            inputCameraAngle: MuUint8;
            bodies: MuSortedArray<MuStruct<{
                id: MuVarint;
                px: MuQuantizedFloat;
                py: MuQuantizedFloat;
                pz: MuQuantizedFloat;
                vx: MuQuantizedFloat;
                vy: MuQuantizedFloat;
                vz: MuQuantizedFloat;
            }>>;
        }>;
    }>>;
    playerDelta: MuStruct<{
        upserts: MuSortedArray<MuStruct<{
            id: MuVarint;
            physGround: MuBoolean;
            physFluid: MuQuantizedFloat;
            platformX: MuQuantizedFloat;
            platformY: MuQuantizedFloat;
            platformZ: MuQuantizedFloat;
            occupancy: MuUint8;
            flags: MuSchema<import("../player/player-schema").PlayerFlags>;
            walkSpeed: MuQuantizedFloat;
            walkAcceleration: MuQuantizedFloat;
            runSpeed: MuQuantizedFloat;
            runAcceleration: MuQuantizedFloat;
            crouchSpeed: MuQuantizedFloat;
            crouchAcceleration: MuQuantizedFloat;
            swimSpeed: MuQuantizedFloat;
            swimAcceleration: MuQuantizedFloat;
            flySpeed: MuQuantizedFloat;
            flyAcceleration: MuQuantizedFloat;
            jumpSpeedFactor: MuQuantizedFloat;
            jumpAccelerationFactor: MuQuantizedFloat;
            jumpPower: MuQuantizedFloat;
            doubleJumpPower: MuQuantizedFloat;
            freezedForwardAngle: MuUint16;
            inputDirectionState: MuUint8;
            stepHeight: MuQuantizedFloat;
        }>>;
        remove: MuArray<MuUint32>;
    }>;
    bodyDelta: MuStruct<{
        upserts: MuSortedArray<MuSchema<import("../physics/physics-schema").RigidBody> & {
            pool: import("../physics/physics-schema").RigidBody[];
            stats: () => any;
        }>;
        remove: MuArray<MuUint32>;
    }>;
    physicsDelta: MuStruct<{
        patch: MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: MuBoolean;
        }>;
        changed: MuBoolean;
    }>;
    filterChanged: MuBoolean;
    filter: MuArray<MuSortedArray<MuVarint>>;
    zoneChanged: MuBoolean;
    zones: MuSortedArray<MuStruct<{
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
    zoneSelectors: MuSortedArray<MuStruct<{
        id: MuVarint;
        groupBits: MuSortedArray<MuVarint>;
    }>>;
}>;
export type NetInput = typeof NetInputSchema.identity;
export declare enum NetMessageType {
    PUBLIC = 0,
    SECRET = 1,
    SHIFT = 1,
    MASK = 1
}
export declare const ClientScriptSrcSchema: MuDictionary<MuUTF8>;
export declare const NetProtocolSchema: {
    name: string;
    client: {
        scriptEvents: MuStruct<{
            damage: MuStruct<{
                hurt: MuArray<MuStruct<{
                    id: MuVarint;
                    damage: MuVarint;
                }>>;
                respawn: MuArray<MuVarint>;
                die: MuArray<MuVarint>;
            }>;
        }>;
        exceedUserLimit: MuVarint;
        kickSessionReason: MuUint8;
        syncClientScriptModules: MuDictionary<MuUTF8>;
    };
    server: {
        join: MuVoid;
        synchronize: MuVoid;
        acknowledge: MuUint32;
        unpause: MuUint32;
        pause: MuVoid;
        input: MuStruct<{
            tick: MuRelativeVarint;
            input: MuStruct<{
                inputState: MuUint16;
                inputAngle: MuUint8;
                inputPitch: MuUint8;
                inputCameraAngle: MuUint8;
                bodies: MuSortedArray<MuStruct<{
                    id: MuVarint;
                    px: MuQuantizedFloat;
                    py: MuQuantizedFloat;
                    pz: MuQuantizedFloat;
                    vx: MuQuantizedFloat;
                    vy: MuQuantizedFloat;
                    vz: MuQuantizedFloat;
                }>>;
            }>;
            pauseCounter: MuRelativeVarint;
            events: MuArray<MuStruct<{
                tick: MuQuantizedFloat;
                position: QuantizedVec3Schema;
                rayTime: MuQuantizedFloat;
                rayHitEntity: MuVarint;
                rayHitVoxelX: MuVarint;
                rayHitVoxelY: MuVarint;
                rayHitVoxelZ: MuVarint;
                rayHitNormal: MuSchema<import("gl-matrix").vec3>;
                rayOrigin: QuantizedVec3Schema;
                rayDirection: QuantizedVec3Schema;
                buttonState: MuSchema<NetInputEventBits>;
                prevButtonState: MuSchema<NetInputEventBits>;
            }>>;
        }>;
        sendKeyBoardEvent: MuStruct<{
            id: MuVarint;
            tick: MuVarint;
            keyDownState: MuArray<MuUint8>;
            prevKeyDownState: MuArray<MuUint8>;
        }>;
    };
};
export declare const NetSecretSchema: MuStruct<{
    id: MuVarint;
    userId: MuUTF8;
    userName: MuUTF8;
    userAvatar: MuUTF8;
    avatarSkin: MuStruct<{
        hips: import("@box/mudb/schema").MuASCII;
        torso: import("@box/mudb/schema").MuASCII;
        neck: import("@box/mudb/schema").MuASCII;
        head: import("@box/mudb/schema").MuASCII;
        leftShoulder: import("@box/mudb/schema").MuASCII;
        leftUpperArm: import("@box/mudb/schema").MuASCII;
        leftLowerArm: import("@box/mudb/schema").MuASCII;
        leftHand: import("@box/mudb/schema").MuASCII;
        rightShoulder: import("@box/mudb/schema").MuASCII;
        rightUpperArm: import("@box/mudb/schema").MuASCII;
        rightLowerArm: import("@box/mudb/schema").MuASCII;
        rightHand: import("@box/mudb/schema").MuASCII;
        leftUpperLeg: import("@box/mudb/schema").MuASCII;
        leftLowerLeg: import("@box/mudb/schema").MuASCII;
        leftFoot: import("@box/mudb/schema").MuASCII;
        rightUpperLeg: import("@box/mudb/schema").MuASCII;
        rightLowerLeg: import("@box/mudb/schema").MuASCII;
        rightFoot: import("@box/mudb/schema").MuASCII;
    }>;
    loginState: MuSchema<PlayerLoginState>;
    onlineInfo: MuStruct<{
        onlineCount: MuVarint;
        offlineCount: MuVarint;
    }>;
    netPaused: MuBoolean;
    environmentZones: MuSortedArray<MuStruct<{
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
            skyType: MuSchema<import("../project/project-rda").EnvironmentSkyType>;
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
            texture: MuUTF8;
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
    replica: MuStruct<{
        id: MuVarint;
        colorLUT: import("@box/mudb/schema").MuASCII;
        enableCursor: MuBoolean;
        music: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        camera: MuStruct<{
            mode: MuSchema<import("../camera/camera-schema").CameraMode>;
            targetId: MuVarint;
            eye: QuantizedVec3Schema;
            up: QuantizedVec3Schema;
            target: QuantizedVec3Schema;
            freezedAxis: MuUint8;
            fovY: import("../utils/quantized-schema").QuantizedScalar;
            distance: import("../utils/quantized-schema").QuantizedScalar;
        }>;
        gamepad: MuStruct<{
            joystickBackground: MuUTF8;
            joystickController: MuUTF8;
            flyButton: MuUTF8;
            flyingBackground: MuUTF8;
            flyingController: MuUTF8;
            jump: MuUTF8;
            crouch: MuUTF8;
            actionA: MuUTF8;
            actionB: MuUTF8;
        }>;
    }>;
}>;
export declare const NetPublicSchema: MuStruct<{
    tick: MuRelativeVarint;
    frameSkip: MuRelativeVarint;
    state: MuStruct<{
        players: MuSortedArray<MuStruct<{
            id: MuVarint;
            physGround: MuBoolean;
            physFluid: MuQuantizedFloat;
            platformX: MuQuantizedFloat;
            platformY: MuQuantizedFloat;
            platformZ: MuQuantizedFloat;
            occupancy: MuUint8;
            flags: MuSchema<import("../player/player-schema").PlayerFlags>;
            walkSpeed: MuQuantizedFloat;
            walkAcceleration: MuQuantizedFloat;
            runSpeed: MuQuantizedFloat;
            runAcceleration: MuQuantizedFloat;
            crouchSpeed: MuQuantizedFloat;
            crouchAcceleration: MuQuantizedFloat;
            swimSpeed: MuQuantizedFloat;
            swimAcceleration: MuQuantizedFloat;
            flySpeed: MuQuantizedFloat;
            flyAcceleration: MuQuantizedFloat;
            jumpSpeedFactor: MuQuantizedFloat;
            jumpAccelerationFactor: MuQuantizedFloat;
            jumpPower: MuQuantizedFloat;
            doubleJumpPower: MuQuantizedFloat;
            freezedForwardAngle: MuUint16;
            inputDirectionState: MuUint8;
            stepHeight: MuQuantizedFloat;
        }>>;
        playerInputs: MuSortedArray<MuStruct<{
            id: MuUint32;
            state: MuUint16;
            angle: MuUint8;
            cameraAngle: MuUint8;
            pitch: MuUint8;
        }>>;
        physics: MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: MuBoolean;
        }>;
        bodies: MuSortedArray<MuSchema<import("../physics/physics-schema").RigidBody> & {
            pool: import("../physics/physics-schema").RigidBody[];
            stats: () => any;
        }>;
        collisionFilter: MuArray<MuSortedArray<MuVarint>>;
        zones: MuSortedArray<MuStruct<{
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
        zoneSelectors: MuSortedArray<MuStruct<{
            id: MuVarint;
            groupBits: MuSortedArray<MuVarint>;
        }>>;
    }>;
    replica: MuStruct<{
        running: MuBoolean;
        sync: MuBoolean;
        environment: MuStruct<{
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
            sky: MuStruct<{
                skyType: MuSchema<import("../project/project-rda").EnvironmentSkyType>;
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
            snow: MuStruct<{
                texture: MuUTF8;
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
            drawDistance: import("@box/mudb/schema").MuFloat32;
            bakedShadow: MuStruct<{
                texture: import("@box/mudb/schema").MuASCII;
                data: import("@box/mudb/schema").MuASCII;
                chunkShift: MuVarint;
            }>;
        }>;
        models: MuSortedArray<MuStruct<{
            id: MuVarint;
            meshId: MuVarint;
            invisible: MuBoolean;
            red: MuUint8;
            green: MuUint8;
            blue: MuUint8;
            alpha: MuUint8;
            emissive: MuQuantizedFloat;
            shininess: MuQuantizedFloat;
            metalness: MuQuantizedFloat;
            scaleX: MuQuantizedFloat;
            scaleY: MuQuantizedFloat;
            scaleZ: MuQuantizedFloat;
            offsetX: MuQuantizedFloat;
            offsetY: MuQuantizedFloat;
            offsetZ: MuQuantizedFloat;
            motion: MuStruct<{
                defaultMotionId: import("@box/mudb/schema").MuASCII;
                paused: MuBoolean;
                pausedTick: import("@box/mudb/schema").MuFloat64;
                startTick: import("@box/mudb/schema").MuFloat64;
                playback: MuStruct<{
                    motions: MuArray<MuStruct<{
                        motionId: import("@box/mudb/schema").MuASCII;
                        cycleCount: import("@box/mudb/schema").MuInt32;
                    }>>;
                    startTick: import("@box/mudb/schema").MuFloat64;
                    cycleCount: import("@box/mudb/schema").MuInt32;
                }>;
            }>;
            staticShadow: MuBoolean;
            name: MuUTF8;
        }>>;
        players: MuSortedArray<MuStruct<{
            id: MuVarint;
            flags: MuSchema<import("../player/player-schema").PlayerDisplayFlags>;
            name: MuUTF8;
            tag: MuVarint;
            avatarSkin: MuStruct<{
                hips: MuVarint;
                torso: MuVarint;
                neck: MuVarint;
                head: MuVarint;
                leftShoulder: MuVarint;
                leftUpperArm: MuVarint;
                leftLowerArm: MuVarint;
                leftHand: MuVarint;
                rightShoulder: MuVarint;
                rightUpperArm: MuVarint;
                rightLowerArm: MuVarint;
                rightHand: MuVarint;
                leftUpperLeg: MuVarint;
                leftLowerLeg: MuVarint;
                leftFoot: MuVarint;
                rightUpperLeg: MuVarint;
                rightLowerLeg: MuVarint;
                rightFoot: MuVarint;
            }>;
            userId: MuUTF8;
            avatar_hash: import("@box/mudb/schema").MuASCII;
            skinInvisible: MuStruct<{
                hips: MuBoolean;
                torso: MuBoolean;
                neck: MuBoolean;
                head: MuBoolean;
                leftShoulder: MuBoolean;
                leftUpperArm: MuBoolean;
                leftLowerArm: MuBoolean;
                leftHand: MuBoolean;
                rightShoulder: MuBoolean;
                rightUpperArm: MuBoolean;
                rightLowerArm: MuBoolean;
                rightHand: MuBoolean;
                leftUpperLeg: MuBoolean;
                leftLowerLeg: MuBoolean;
                leftFoot: MuBoolean;
                rightUpperLeg: MuBoolean;
                rightLowerLeg: MuBoolean;
                rightFoot: MuBoolean;
            }>;
            mapSkin: MuStruct<{
                hips: MuVarint;
                torso: MuVarint;
                neck: MuVarint;
                head: MuVarint;
                leftShoulder: MuVarint;
                leftUpperArm: MuVarint;
                leftLowerArm: MuVarint;
                leftHand: MuVarint;
                rightShoulder: MuVarint;
                rightUpperArm: MuVarint;
                rightLowerArm: MuVarint;
                rightHand: MuVarint;
                leftUpperLeg: MuVarint;
                leftLowerLeg: MuVarint;
                leftFoot: MuVarint;
                rightUpperLeg: MuVarint;
                rightLowerLeg: MuVarint;
                rightFoot: MuVarint;
            }>;
            color: QuantizedVec3Schema;
            metalness: MuQuantizedFloat;
            emissive: MuQuantizedFloat;
            shininess: MuQuantizedFloat;
            scale: MuQuantizedFloat;
            attachments: MuStruct<{
                hips: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                torso: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                neck: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                head: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftShoulder: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftUpperArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftLowerArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftHand: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightShoulder: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightUpperArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightLowerArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightHand: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftUpperLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftLowerLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftFoot: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightUpperLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightLowerLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightFoot: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
            }>;
        }>>;
        particles: MuStruct<{
            emitters: MuSortedArray<MuStruct<{
                countLimit: MuVarint;
                emitRate: MuQuantizedFloat;
                emitSpread: MuQuantizedFloat;
                lifetime: MuQuantizedFloat;
                lifetimeSpread: MuQuantizedFloat;
                velocity: QuantizedVec3Schema;
                velocitySpread: QuantizedVec3Schema;
                id: MuVarint;
                particleId: MuVarint;
            }>>;
            prototypes: MuSortedArray<MuStruct<{
                acceleration: QuantizedVec3Schema;
                noiseAmpl: MuQuantizedFloat;
                noiseFreq: MuQuantizedFloat;
                targetId: MuVarint;
                targetWeight: MuQuantizedFloat;
                color0: MuUint32;
                color1: MuUint32;
                color2: MuUint32;
                color3: MuUint32;
                color4: MuUint32;
                size0: MuQuantizedFloat;
                size1: MuQuantizedFloat;
                size2: MuQuantizedFloat;
                size3: MuQuantizedFloat;
                size4: MuQuantizedFloat;
                sizeSpread: MuQuantizedFloat;
                damping: MuQuantizedFloat;
                id: MuVarint;
            }>>;
        }>;
        damage: MuSortedArray<MuStruct<{
            id: MuVarint;
            showHealthBar: MuBoolean;
            hp: MuQuantizedFloat;
            maxHp: MuQuantizedFloat;
        }>>;
        interactive: MuSortedArray<MuStruct<{
            id: MuVarint;
            radius: MuQuantizedFloat;
            hint: MuUTF8;
            color: QuantizedVec3Schema;
        }>>;
        entityName: MuSortedArray<MuStruct<{
            id: MuVarint;
            radius: MuQuantizedFloat;
            name: MuUTF8;
            color: QuantizedVec3Schema;
        }>>;
        sound: MuStruct<{
            ambientSound: MuStruct<{
                ambient: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                breakVoxel: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                placeVoxel: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                playerJoin: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                playerLeave: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>;
            entitySound: MuSortedArray<MuStruct<{
                id: MuVarint;
                chat: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                hurt: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                die: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                interact: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>>;
            playerSound: MuSortedArray<MuStruct<{
                id: MuVarint;
                spawn: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                jump: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                doubleJump: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                land: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                crouch: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                step: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                swim: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                action0: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                action1: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                enterWater: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                leaveWater: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                startFly: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                endFly: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>>;
        }>;
        keyframes: MuStruct<{
            entity: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[MuVarint, MuBoolean, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{}>, MuStruct<{}>, MuUint32]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{}>, MuStruct<{} | {
                        [x: string]: MuQuantizedFloat;
                    }>, MuStruct<{} | {
                        [x: string]: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
                        color0: MuUint32;
                        color1: MuUint32;
                        color2: MuUint32;
                        color3: MuUint32;
                        color4: MuUint32;
                    }>, MuStruct<{
                        size0: MuQuantizedFloat;
                        size1: MuQuantizedFloat;
                        size2: MuQuantizedFloat;
                        size3: MuQuantizedFloat;
                        size4: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuVarint, MuSchema<number>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
                        r: MuQuantizedFloat;
                    } & {
                        g: MuQuantizedFloat;
                    } & {
                        b: MuQuantizedFloat;
                    }>]>]>;
                }>>;
            }>>;
            player: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        r: MuQuantizedFloat;
                    } & {
                        g: MuQuantizedFloat;
                    } & {
                        b: MuQuantizedFloat;
                    }>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
                }>>;
            }>>;
            world: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>]>]>;
                }>>;
            }>>;
        }>;
        entities: MuSortedArray<MuVarint>;
    }>;
}>;
export type NetPublic = typeof NetPublicSchema.identity;
export declare function compareNetPublic(x: NetPublic, y: NetPublic): number;
export declare const NetPublicSetSchema: MuSortedArray<MuStruct<{
    tick: MuRelativeVarint;
    frameSkip: MuRelativeVarint;
    state: MuStruct<{
        players: MuSortedArray<MuStruct<{
            id: MuVarint;
            physGround: MuBoolean;
            physFluid: MuQuantizedFloat;
            platformX: MuQuantizedFloat;
            platformY: MuQuantizedFloat;
            platformZ: MuQuantizedFloat;
            occupancy: MuUint8;
            flags: MuSchema<import("../player/player-schema").PlayerFlags>;
            walkSpeed: MuQuantizedFloat;
            walkAcceleration: MuQuantizedFloat;
            runSpeed: MuQuantizedFloat;
            runAcceleration: MuQuantizedFloat;
            crouchSpeed: MuQuantizedFloat;
            crouchAcceleration: MuQuantizedFloat;
            swimSpeed: MuQuantizedFloat;
            swimAcceleration: MuQuantizedFloat;
            flySpeed: MuQuantizedFloat;
            flyAcceleration: MuQuantizedFloat;
            jumpSpeedFactor: MuQuantizedFloat;
            jumpAccelerationFactor: MuQuantizedFloat;
            jumpPower: MuQuantizedFloat;
            doubleJumpPower: MuQuantizedFloat;
            freezedForwardAngle: MuUint16;
            inputDirectionState: MuUint8;
            stepHeight: MuQuantizedFloat;
        }>>;
        playerInputs: MuSortedArray<MuStruct<{
            id: MuUint32;
            state: MuUint16;
            angle: MuUint8;
            cameraAngle: MuUint8;
            pitch: MuUint8;
        }>>;
        physics: MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: MuBoolean;
        }>;
        bodies: MuSortedArray<MuSchema<import("../physics/physics-schema").RigidBody> & {
            pool: import("../physics/physics-schema").RigidBody[];
            stats: () => any;
        }>;
        collisionFilter: MuArray<MuSortedArray<MuVarint>>;
        zones: MuSortedArray<MuStruct<{
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
        zoneSelectors: MuSortedArray<MuStruct<{
            id: MuVarint;
            groupBits: MuSortedArray<MuVarint>;
        }>>;
    }>;
    replica: MuStruct<{
        running: MuBoolean;
        sync: MuBoolean;
        environment: MuStruct<{
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
            sky: MuStruct<{
                skyType: MuSchema<import("../project/project-rda").EnvironmentSkyType>;
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
            snow: MuStruct<{
                texture: MuUTF8;
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
            drawDistance: import("@box/mudb/schema").MuFloat32;
            bakedShadow: MuStruct<{
                texture: import("@box/mudb/schema").MuASCII;
                data: import("@box/mudb/schema").MuASCII;
                chunkShift: MuVarint;
            }>;
        }>;
        models: MuSortedArray<MuStruct<{
            id: MuVarint;
            meshId: MuVarint;
            invisible: MuBoolean;
            red: MuUint8;
            green: MuUint8;
            blue: MuUint8;
            alpha: MuUint8;
            emissive: MuQuantizedFloat;
            shininess: MuQuantizedFloat;
            metalness: MuQuantizedFloat;
            scaleX: MuQuantizedFloat;
            scaleY: MuQuantizedFloat;
            scaleZ: MuQuantizedFloat;
            offsetX: MuQuantizedFloat;
            offsetY: MuQuantizedFloat;
            offsetZ: MuQuantizedFloat;
            motion: MuStruct<{
                defaultMotionId: import("@box/mudb/schema").MuASCII;
                paused: MuBoolean;
                pausedTick: import("@box/mudb/schema").MuFloat64;
                startTick: import("@box/mudb/schema").MuFloat64;
                playback: MuStruct<{
                    motions: MuArray<MuStruct<{
                        motionId: import("@box/mudb/schema").MuASCII;
                        cycleCount: import("@box/mudb/schema").MuInt32;
                    }>>;
                    startTick: import("@box/mudb/schema").MuFloat64;
                    cycleCount: import("@box/mudb/schema").MuInt32;
                }>;
            }>;
            staticShadow: MuBoolean;
            name: MuUTF8;
        }>>;
        players: MuSortedArray<MuStruct<{
            id: MuVarint;
            flags: MuSchema<import("../player/player-schema").PlayerDisplayFlags>;
            name: MuUTF8;
            tag: MuVarint;
            avatarSkin: MuStruct<{
                hips: MuVarint;
                torso: MuVarint;
                neck: MuVarint;
                head: MuVarint;
                leftShoulder: MuVarint;
                leftUpperArm: MuVarint;
                leftLowerArm: MuVarint;
                leftHand: MuVarint;
                rightShoulder: MuVarint;
                rightUpperArm: MuVarint;
                rightLowerArm: MuVarint;
                rightHand: MuVarint;
                leftUpperLeg: MuVarint;
                leftLowerLeg: MuVarint;
                leftFoot: MuVarint;
                rightUpperLeg: MuVarint;
                rightLowerLeg: MuVarint;
                rightFoot: MuVarint;
            }>;
            userId: MuUTF8;
            avatar_hash: import("@box/mudb/schema").MuASCII;
            skinInvisible: MuStruct<{
                hips: MuBoolean;
                torso: MuBoolean;
                neck: MuBoolean;
                head: MuBoolean;
                leftShoulder: MuBoolean;
                leftUpperArm: MuBoolean;
                leftLowerArm: MuBoolean;
                leftHand: MuBoolean;
                rightShoulder: MuBoolean;
                rightUpperArm: MuBoolean;
                rightLowerArm: MuBoolean;
                rightHand: MuBoolean;
                leftUpperLeg: MuBoolean;
                leftLowerLeg: MuBoolean;
                leftFoot: MuBoolean;
                rightUpperLeg: MuBoolean;
                rightLowerLeg: MuBoolean;
                rightFoot: MuBoolean;
            }>;
            mapSkin: MuStruct<{
                hips: MuVarint;
                torso: MuVarint;
                neck: MuVarint;
                head: MuVarint;
                leftShoulder: MuVarint;
                leftUpperArm: MuVarint;
                leftLowerArm: MuVarint;
                leftHand: MuVarint;
                rightShoulder: MuVarint;
                rightUpperArm: MuVarint;
                rightLowerArm: MuVarint;
                rightHand: MuVarint;
                leftUpperLeg: MuVarint;
                leftLowerLeg: MuVarint;
                leftFoot: MuVarint;
                rightUpperLeg: MuVarint;
                rightLowerLeg: MuVarint;
                rightFoot: MuVarint;
            }>;
            color: QuantizedVec3Schema;
            metalness: MuQuantizedFloat;
            emissive: MuQuantizedFloat;
            shininess: MuQuantizedFloat;
            scale: MuQuantizedFloat;
            attachments: MuStruct<{
                hips: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                torso: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                neck: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                head: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftShoulder: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftUpperArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftLowerArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftHand: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightShoulder: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightUpperArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightLowerArm: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightHand: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftUpperLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftLowerLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                leftFoot: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightUpperLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightLowerLeg: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
                rightFoot: MuArray<MuStruct<{
                    meshId: MuVarint;
                    red: MuQuantizedFloat;
                    green: MuQuantizedFloat;
                    blue: MuQuantizedFloat;
                    emissive: MuQuantizedFloat;
                    shininess: MuQuantizedFloat;
                    metalness: MuQuantizedFloat;
                    offset: QuantizedVec3Schema;
                    scale: QuantizedVec3Schema;
                    orientation: MuSchema<import("gl-matrix").quat>;
                }>>;
            }>;
        }>>;
        particles: MuStruct<{
            emitters: MuSortedArray<MuStruct<{
                countLimit: MuVarint;
                emitRate: MuQuantizedFloat;
                emitSpread: MuQuantizedFloat;
                lifetime: MuQuantizedFloat;
                lifetimeSpread: MuQuantizedFloat;
                velocity: QuantizedVec3Schema;
                velocitySpread: QuantizedVec3Schema;
                id: MuVarint;
                particleId: MuVarint;
            }>>;
            prototypes: MuSortedArray<MuStruct<{
                acceleration: QuantizedVec3Schema;
                noiseAmpl: MuQuantizedFloat;
                noiseFreq: MuQuantizedFloat;
                targetId: MuVarint;
                targetWeight: MuQuantizedFloat;
                color0: MuUint32;
                color1: MuUint32;
                color2: MuUint32;
                color3: MuUint32;
                color4: MuUint32;
                size0: MuQuantizedFloat;
                size1: MuQuantizedFloat;
                size2: MuQuantizedFloat;
                size3: MuQuantizedFloat;
                size4: MuQuantizedFloat;
                sizeSpread: MuQuantizedFloat;
                damping: MuQuantizedFloat;
                id: MuVarint;
            }>>;
        }>;
        damage: MuSortedArray<MuStruct<{
            id: MuVarint;
            showHealthBar: MuBoolean;
            hp: MuQuantizedFloat;
            maxHp: MuQuantizedFloat;
        }>>;
        interactive: MuSortedArray<MuStruct<{
            id: MuVarint;
            radius: MuQuantizedFloat;
            hint: MuUTF8;
            color: QuantizedVec3Schema;
        }>>;
        entityName: MuSortedArray<MuStruct<{
            id: MuVarint;
            radius: MuQuantizedFloat;
            name: MuUTF8;
            color: QuantizedVec3Schema;
        }>>;
        sound: MuStruct<{
            ambientSound: MuStruct<{
                ambient: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                breakVoxel: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                placeVoxel: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                playerJoin: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                playerLeave: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>;
            entitySound: MuSortedArray<MuStruct<{
                id: MuVarint;
                chat: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                hurt: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                die: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                interact: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>>;
            playerSound: MuSortedArray<MuStruct<{
                id: MuVarint;
                spawn: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                jump: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                doubleJump: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                land: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                crouch: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                step: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                swim: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                action0: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                action1: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                enterWater: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                leaveWater: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                startFly: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
                endFly: MuStruct<{
                    sampleId: MuVarint;
                    radius: MuQuantizedFloat;
                    gain: MuQuantizedFloat;
                    gainRange: MuQuantizedFloat;
                    pitch: MuQuantizedFloat;
                    pitchRange: MuQuantizedFloat;
                }>;
            }>>;
        }>;
        keyframes: MuStruct<{
            entity: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[MuVarint, MuBoolean, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{}>, MuStruct<{}>, MuUint32]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{}>, MuStruct<{} | {
                        [x: string]: MuQuantizedFloat;
                    }>, MuStruct<{} | {
                        [x: string]: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
                        color0: MuUint32;
                        color1: MuUint32;
                        color2: MuUint32;
                        color3: MuUint32;
                        color4: MuUint32;
                    }>, MuStruct<{
                        size0: MuQuantizedFloat;
                        size1: MuQuantizedFloat;
                        size2: MuQuantizedFloat;
                        size3: MuQuantizedFloat;
                        size4: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        x: MuQuantizedFloat;
                    } & {
                        y: MuQuantizedFloat;
                    } & {
                        z: MuQuantizedFloat;
                    }>, MuSchema<number>, MuSchema<number>, MuVarint, MuSchema<number>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
                        r: MuQuantizedFloat;
                    } & {
                        g: MuQuantizedFloat;
                    } & {
                        b: MuQuantizedFloat;
                    }>]>]>;
                }>>;
            }>>;
            player: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>, MuSchema<number>, MuSchema<number>, MuStruct<{
                        r: MuQuantizedFloat;
                    } & {
                        g: MuQuantizedFloat;
                    } & {
                        b: MuQuantizedFloat;
                    }>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
                }>>;
            }>>;
            world: MuSortedArray<MuStruct<{
                id: MuVarint;
                targetId: MuVarint;
                startTick: MuQuantizedFloat;
                endTicks: MuQuantizedFloat;
                cycleTicks: MuQuantizedFloat;
                cyclePhase: MuQuantizedFloat;
                cycleCount: MuQuantizedFloat;
                playbackMode: MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
                keyframes: MuSortedArray<MuStruct<{
                    tick: MuQuantizedFloat;
                    easeIn: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    easeOut: MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                    components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuSchema<number>, MuSchema<number>]>]>;
                }>>;
            }>>;
        }>;
        entities: MuSortedArray<MuVarint>;
    }>;
}>>;
