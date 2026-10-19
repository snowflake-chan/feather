import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuStruct } from '@box/mudb/schema/struct';
export declare const GameReplicaSchema: MuStruct<{
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
            chunkShift: import("@box/mudb/schema").MuVarint;
        }>;
    }>;
    models: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        meshId: import("@box/mudb/schema").MuVarint;
        invisible: MuBoolean;
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
        motion: MuStruct<{
            defaultMotionId: import("@box/mudb/schema").MuASCII;
            paused: MuBoolean;
            pausedTick: import("@box/mudb/schema").MuFloat64;
            startTick: import("@box/mudb/schema").MuFloat64;
            playback: MuStruct<{
                motions: import("@box/mudb/schema").MuArray<MuStruct<{
                    motionId: import("@box/mudb/schema").MuASCII;
                    cycleCount: import("@box/mudb/schema").MuInt32;
                }>>;
                startTick: import("@box/mudb/schema").MuFloat64;
                cycleCount: import("@box/mudb/schema").MuInt32;
            }>;
        }>;
        staticShadow: MuBoolean;
        name: import("@box/mudb/schema").MuUTF8;
    }>>;
    players: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        flags: import("@box/mudb/schema").MuSchema<import("../player/player-schema").PlayerDisplayFlags>;
        name: import("@box/mudb/schema").MuUTF8;
        tag: import("@box/mudb/schema").MuVarint;
        avatarSkin: MuStruct<{
            hips: import("@box/mudb/schema").MuVarint;
            torso: import("@box/mudb/schema").MuVarint;
            neck: import("@box/mudb/schema").MuVarint;
            head: import("@box/mudb/schema").MuVarint;
            leftShoulder: import("@box/mudb/schema").MuVarint;
            leftUpperArm: import("@box/mudb/schema").MuVarint;
            leftLowerArm: import("@box/mudb/schema").MuVarint;
            leftHand: import("@box/mudb/schema").MuVarint;
            rightShoulder: import("@box/mudb/schema").MuVarint;
            rightUpperArm: import("@box/mudb/schema").MuVarint;
            rightLowerArm: import("@box/mudb/schema").MuVarint;
            rightHand: import("@box/mudb/schema").MuVarint;
            leftUpperLeg: import("@box/mudb/schema").MuVarint;
            leftLowerLeg: import("@box/mudb/schema").MuVarint;
            leftFoot: import("@box/mudb/schema").MuVarint;
            rightUpperLeg: import("@box/mudb/schema").MuVarint;
            rightLowerLeg: import("@box/mudb/schema").MuVarint;
            rightFoot: import("@box/mudb/schema").MuVarint;
        }>;
        userId: import("@box/mudb/schema").MuUTF8;
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
            hips: import("@box/mudb/schema").MuVarint;
            torso: import("@box/mudb/schema").MuVarint;
            neck: import("@box/mudb/schema").MuVarint;
            head: import("@box/mudb/schema").MuVarint;
            leftShoulder: import("@box/mudb/schema").MuVarint;
            leftUpperArm: import("@box/mudb/schema").MuVarint;
            leftLowerArm: import("@box/mudb/schema").MuVarint;
            leftHand: import("@box/mudb/schema").MuVarint;
            rightShoulder: import("@box/mudb/schema").MuVarint;
            rightUpperArm: import("@box/mudb/schema").MuVarint;
            rightLowerArm: import("@box/mudb/schema").MuVarint;
            rightHand: import("@box/mudb/schema").MuVarint;
            leftUpperLeg: import("@box/mudb/schema").MuVarint;
            leftLowerLeg: import("@box/mudb/schema").MuVarint;
            leftFoot: import("@box/mudb/schema").MuVarint;
            rightUpperLeg: import("@box/mudb/schema").MuVarint;
            rightLowerLeg: import("@box/mudb/schema").MuVarint;
            rightFoot: import("@box/mudb/schema").MuVarint;
        }>;
        color: import("../utils/quantized-schema").QuantizedVec3Schema;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        scale: import("@box/mudb/schema").MuQuantizedFloat;
        attachments: MuStruct<{
            hips: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            torso: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            neck: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            head: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftShoulder: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperArm: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerArm: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftHand: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightShoulder: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperArm: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerArm: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightHand: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperLeg: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerLeg: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftFoot: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperLeg: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerLeg: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightFoot: import("@box/mudb/schema").MuArray<MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
        }>;
    }>>;
    particles: MuStruct<{
        emitters: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            countLimit: import("@box/mudb/schema").MuVarint;
            emitRate: import("@box/mudb/schema").MuQuantizedFloat;
            emitSpread: import("@box/mudb/schema").MuQuantizedFloat;
            lifetime: import("@box/mudb/schema").MuQuantizedFloat;
            lifetimeSpread: import("@box/mudb/schema").MuQuantizedFloat;
            velocity: import("../utils/quantized-schema").QuantizedVec3Schema;
            velocitySpread: import("../utils/quantized-schema").QuantizedVec3Schema;
            id: import("@box/mudb/schema").MuVarint;
            particleId: import("@box/mudb/schema").MuVarint;
        }>>;
        prototypes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            acceleration: import("../utils/quantized-schema").QuantizedVec3Schema;
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
        }>>;
    }>;
    damage: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        showHealthBar: MuBoolean;
        hp: import("@box/mudb/schema").MuQuantizedFloat;
        maxHp: import("@box/mudb/schema").MuQuantizedFloat;
    }>>;
    interactive: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        hint: import("@box/mudb/schema").MuUTF8;
        color: import("../utils/quantized-schema").QuantizedVec3Schema;
    }>>;
    entityName: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        name: import("@box/mudb/schema").MuUTF8;
        color: import("../utils/quantized-schema").QuantizedVec3Schema;
    }>>;
    sound: MuStruct<{
        ambientSound: MuStruct<{
            ambient: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            breakVoxel: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            placeVoxel: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            playerJoin: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            playerLeave: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
        }>;
        entitySound: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            chat: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            hurt: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            die: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            interact: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
        }>>;
        playerSound: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            spawn: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            jump: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            doubleJump: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            land: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            crouch: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            step: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            swim: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            action0: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            action1: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            enterWater: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            leaveWater: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            startFly: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
            endFly: MuStruct<{
                sampleId: import("@box/mudb/schema").MuVarint;
                radius: import("@box/mudb/schema").MuQuantizedFloat;
                gain: import("@box/mudb/schema").MuQuantizedFloat;
                gainRange: import("@box/mudb/schema").MuQuantizedFloat;
                pitch: import("@box/mudb/schema").MuQuantizedFloat;
                pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
            }>;
        }>>;
    }>;
    keyframes: MuStruct<{
        entity: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            targetId: import("@box/mudb/schema").MuVarint;
            startTick: import("@box/mudb/schema").MuQuantizedFloat;
            endTicks: import("@box/mudb/schema").MuQuantizedFloat;
            cycleTicks: import("@box/mudb/schema").MuQuantizedFloat;
            cyclePhase: import("@box/mudb/schema").MuQuantizedFloat;
            cycleCount: import("@box/mudb/schema").MuQuantizedFloat;
            playbackMode: import("@box/mudb/schema").MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
            keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                tick: import("@box/mudb/schema").MuQuantizedFloat;
                easeIn: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                easeOut: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuVarint, MuBoolean, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{}>, MuStruct<{}>, import("@box/mudb/schema").MuUint32]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{}>, MuStruct<{} | {
                    [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
                }>, MuStruct<{} | {
                    [x: string]: import("@box/mudb/schema").MuQuantizedFloat;
                }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{
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
                }>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
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
                }>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuVarint, import("@box/mudb/schema").MuSchema<number>]>, import("../keyframes/mu-array-union").MuArrayUnion<[MuStruct<{
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
            playbackMode: import("@box/mudb/schema").MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
            keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                tick: import("@box/mudb/schema").MuQuantizedFloat;
                easeIn: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                easeOut: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, MuStruct<{
                    r: import("@box/mudb/schema").MuQuantizedFloat;
                } & {
                    g: import("@box/mudb/schema").MuQuantizedFloat;
                } & {
                    b: import("@box/mudb/schema").MuQuantizedFloat;
                }>, MuBoolean, MuBoolean, MuBoolean]>, import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
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
            playbackMode: import("@box/mudb/schema").MuSchema<import("../keyframes/type").AnimationPlaybackMode>;
            keyframes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                tick: import("@box/mudb/schema").MuQuantizedFloat;
                easeIn: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                easeOut: import("@box/mudb/schema").MuSchema<import("../keyframes/type").KeyframeEaseMode>;
                components: import("../keyframes/mu-array-union").MuArrayUnion<[import("../keyframes/mu-array-union").MuArrayUnion<[]>, import("../keyframes/mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>]>]>;
            }>>;
        }>>;
    }>;
    entities: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuVarint>;
}>;
export type GameReplica = typeof GameReplicaSchema.identity;
