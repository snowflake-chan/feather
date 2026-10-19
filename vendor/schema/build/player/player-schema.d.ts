import { MuStruct, MuUint32, MuUTF8, MuASCII, MuUint8, MuSortedArray, MuUint16, MuVarint, MuSchema, MuBoolean, MuArray, MuDictionary, MuQuantizedFloat } from '@box/mudb/schema';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { vec3, quat } from 'gl-matrix';
export declare enum PlayerLoginState {
    UNKNOWN = 0,
    USER = 1,
    GUEST = 2
}
export declare const PlayerAttachmentSchema: MuStruct<{
    meshId: MuVarint;
    red: MuQuantizedFloat;
    green: MuQuantizedFloat;
    blue: MuQuantizedFloat;
    emissive: MuQuantizedFloat;
    shininess: MuQuantizedFloat;
    metalness: MuQuantizedFloat;
    offset: QuantizedVec3Schema;
    scale: QuantizedVec3Schema;
    orientation: MuSchema<quat>;
}>;
export type PlayerAttachment = typeof PlayerAttachmentSchema.identity;
export declare const PlayerAttachmentSetSchema: MuArray<MuStruct<{
    meshId: MuVarint;
    red: MuQuantizedFloat;
    green: MuQuantizedFloat;
    blue: MuQuantizedFloat;
    emissive: MuQuantizedFloat;
    shininess: MuQuantizedFloat;
    metalness: MuQuantizedFloat;
    offset: QuantizedVec3Schema;
    scale: QuantizedVec3Schema;
    orientation: MuSchema<quat>;
}>>;
export declare enum BodyPart {
    hips = 0,
    torso = 1,
    neck = 2,
    head = 3,
    leftShoulder = 4,
    leftUpperArm = 5,
    leftLowerArm = 6,
    leftHand = 7,
    rightShoulder = 8,
    rightUpperArm = 9,
    rightLowerArm = 10,
    rightHand = 11,
    leftUpperLeg = 12,
    leftLowerLeg = 13,
    leftFoot = 14,
    rightUpperLeg = 15,
    rightLowerLeg = 16,
    rightFoot = 17
}
/**
 * 美术规定皮肤文件默认缩放值
 */
export declare const BODY_PART_DEFAULT_SCALE = 0.042;
/**
 * 美术规定皮肤文件默认旋转度数
 */
export declare const BODY_PART_DEFAULT_ROTATIONS: {
    rightHand: number[];
    leftHand: number[];
};
export declare const MeshBoundSchema: MuStruct<{
    lo: MuSchema<vec3>;
    hi: MuSchema<vec3>;
}>;
export type MeshBound = typeof MeshBoundSchema.identity;
export declare const PlayerMeshBoundSchema: MuStruct<{
    hips: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    torso: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    neck: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    head: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftShoulder: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftUpperArm: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftLowerArm: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftHand: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightShoulder: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightUpperArm: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightLowerArm: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightHand: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftUpperLeg: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftLowerLeg: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    leftFoot: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightUpperLeg: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightLowerLeg: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
    rightFoot: MuStruct<{
        lo: MuSchema<vec3>;
        hi: MuSchema<vec3>;
    }>;
}>;
export type PlayerMeshBound = typeof PlayerMeshBoundSchema.identity;
export declare const PlayerAttachmentStateSchema: MuStruct<{
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
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
        orientation: MuSchema<quat>;
    }>>;
}>;
export declare const PlayerSkinHashSchema: MuStruct<{
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
export type PlayerSkinHash = typeof PlayerSkinHashSchema['identity'];
export declare const PlayerSkinNameSchema: MuStruct<{
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
export type PlayerSkinName = typeof PlayerSkinNameSchema['identity'];
export declare const PlayerSkinIdSchema: MuStruct<{
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
export type PlayerSkinId = typeof PlayerSkinIdSchema['identity'];
export declare const PlayerSkinInvisibleSchema: MuStruct<{
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
export type PlayerSkinInvisible = typeof PlayerSkinInvisibleSchema['identity'];
export declare enum PlayerFlyState {
    SHIFT = 0,
    BITS = 1,
    MASK = 1,
    NOT_FLYING = 0,// player is controlled by usually physics/walking controller
    FLYING = 1
}
export declare enum PlayerWalkState {
    SHIFT = 2,
    BITS = 2,
    MASK = 12,
    CROUCH = 0,
    WALK = 4,
    RUN = 8
}
export declare enum PlayerButtonState {
    NONE = 0,
    SHIFT = 4,
    BITS = 5,
    MASK = 496,
    WALK = 16,
    JUMP = 32,
    CROUCH = 64,
    ACTION_0 = 128,
    ACTION_1 = 256
}
export declare enum PlayerJumpState {
    SHIFT = 9,
    BITS = 3,
    MASK = 3584,
    GROUND = 0,// true if player is on ground
    SWIM = 512,// true if player is swimming
    JUMP = 1024,// true for initial jump state
    FALL = 1536,// set when player releases jump but is in air
    DOUBLE_JUMP = 2048
}
export declare function playerStateBits(move: PlayerFlyState, walk: PlayerWalkState, jump: PlayerJumpState, buttons: PlayerButtonState): number;
export declare function playerFlyState(bits: number): PlayerFlyState;
export declare function playerWalkState(bits: number): PlayerWalkState;
export declare function playerJumpState(bits: number): PlayerJumpState;
export declare function playerButtonState(bits: number): PlayerButtonState;
export declare const PlayerInputSchema: MuStruct<{
    id: MuUint32;
    state: MuUint16;
    angle: MuUint8;
    cameraAngle: MuUint8;
    pitch: MuUint8;
}>;
export type PlayerInput = typeof PlayerInputSchema.identity;
export declare const PlayerInputSetSchema: MuSortedArray<MuStruct<{
    id: MuUint32;
    state: MuUint16;
    angle: MuUint8;
    cameraAngle: MuUint8;
    pitch: MuUint8;
}>>;
export type PlayerInputSet = typeof PlayerInputSetSchema.identity;
export declare enum PlayerDisplayFlags {
    INVISIBLE = 1,
    HACKING = 2,
    DEAD = 4,
    SHOW_NAME = 8,
    SHOW_INDICATOR = 16
}
export declare enum InputDirectionState {
    SWAP_DIRECTION = 1,
    REVERSE_VERTICAL = 2,
    REVERSE_HORIZONTAL = 4,
    DISABLE_VERTICAL = 8,
    DISABLE_HORIZONTAL = 16
}
export declare const PlayerDisplaySchema: MuStruct<{
    id: MuVarint;
    flags: MuSchema<PlayerDisplayFlags>;
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
    avatar_hash: MuASCII;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
        }>>;
    }>;
}>;
export type PlayerDisplay = typeof PlayerDisplaySchema.identity;
export declare const PlayerDisplaySetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    flags: MuSchema<PlayerDisplayFlags>;
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
    avatar_hash: MuASCII;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
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
            orientation: MuSchema<quat>;
        }>>;
    }>;
}>>;
export declare const PLAYER_CONFIG_PRECISION: number;
export declare enum PlayerFlags {
    NONE = 0,
    /**
     * 可穿墙的幽灵👻
     */
    SPECTATOR = 1,
    ALLOW_FLIGHT = 2,
    ALLOW_MOVE = 4,
    ALLOW_ACTION_0 = 8,
    ALLOW_ACTION_1 = 16,
    ALLOW_JUMP = 32,
    ALLOW_DOUBLE_JUMP = 64,
    ALLOW_CROUCH = 128
}
export declare enum PlayerOccupancyFlags {
    EDGE_BIT = 1,
    X_NEG_SHIFT = 0,
    X_POS_SHIFT = 1,
    Z_NEG_SHIFT = 2,
    Z_POS_SHIFT = 3,
    EDGE_X_NEG = 1,
    EDGE_X_POS = 2,
    EDGE_Z_NEG = 4,
    EDGE_Z_POS = 8
}
export declare const PlayerSchema: MuStruct<{
    id: MuVarint;
    physGround: MuBoolean;
    physFluid: MuQuantizedFloat;
    platformX: MuQuantizedFloat;
    platformY: MuQuantizedFloat;
    platformZ: MuQuantizedFloat;
    occupancy: MuUint8;
    flags: MuSchema<PlayerFlags>;
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
}>;
export type Player = typeof PlayerSchema.identity;
export declare const PlayerSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    physGround: MuBoolean;
    physFluid: MuQuantizedFloat;
    platformX: MuQuantizedFloat;
    platformY: MuQuantizedFloat;
    platformZ: MuQuantizedFloat;
    occupancy: MuUint8;
    flags: MuSchema<PlayerFlags>;
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
export type PlayerSet = typeof PlayerSetSchema.identity;
export declare const PlayerIndexSchema: MuDictionary<MuVarint>;
//# sourceMappingURL=player-schema.d.ts.map