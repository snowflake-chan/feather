import { HashType } from '../project/hot-schema';
import { MuStruct, MuSortedArray, MuUTF8, MuUint8, MuVarint, MuBoolean, MuArray, MuQuantizedFloat, MuSchema, MuASCII, MuFloat64, MuInt32 } from '@box/mudb/schema';
export declare const HashSchema: MuASCII;
export declare const MotionPlaybackSchema: MuStruct<{
    motionId: MuASCII;
    /**
     * -1 means Infinity
     */
    cycleCount: MuInt32;
}>;
export declare const MotionsPlaybackSchema: MuArray<MuStruct<{
    motionId: MuASCII;
    /**
     * -1 means Infinity
     */
    cycleCount: MuInt32;
}>>;
export declare const PlaybackSchema: MuStruct<{
    motions: MuArray<MuStruct<{
        motionId: MuASCII;
        /**
         * -1 means Infinity
         */
        cycleCount: MuInt32;
    }>>;
    startTick: MuFloat64;
    /**
     * -1 means Infinity
     */
    cycleCount: MuInt32;
}>;
export declare const NetModelMotionSchema: MuStruct<{
    /**
     * 默认动作id
     */
    defaultMotionId: MuASCII;
    /**
     * 是否暂停
     */
    paused: MuBoolean;
    /**
     * 暂停时的帧数
     */
    pausedTick: MuFloat64;
    /**
     * 默认动作开始的帧数
     */
    startTick: MuFloat64;
    /**
     * 动作链数据
     */
    playback: MuStruct<{
        motions: MuArray<MuStruct<{
            motionId: MuASCII;
            /**
             * -1 means Infinity
             */
            cycleCount: MuInt32;
        }>>;
        startTick: MuFloat64;
        /**
         * -1 means Infinity
         */
        cycleCount: MuInt32;
    }>;
}>;
export type NetModelMotion = typeof NetModelMotionSchema.identity;
export declare const NetModelSchemaContent: {
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
        /**
         * 默认动作id
         */
        defaultMotionId: MuASCII;
        /**
         * 是否暂停
         */
        paused: MuBoolean;
        /**
         * 暂停时的帧数
         */
        pausedTick: MuFloat64;
        /**
         * 默认动作开始的帧数
         */
        startTick: MuFloat64;
        /**
         * 动作链数据
         */
        playback: MuStruct<{
            motions: MuArray<MuStruct<{
                motionId: MuASCII;
                /**
                 * -1 means Infinity
                 */
                cycleCount: MuInt32;
            }>>;
            startTick: MuFloat64;
            /**
             * -1 means Infinity
             */
            cycleCount: MuInt32;
        }>;
    }>;
    staticShadow: MuBoolean;
    name: MuUTF8;
};
export declare const NetModelSchema: MuStruct<{
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
        /**
         * 默认动作id
         */
        defaultMotionId: MuASCII;
        /**
         * 是否暂停
         */
        paused: MuBoolean;
        /**
         * 暂停时的帧数
         */
        pausedTick: MuFloat64;
        /**
         * 默认动作开始的帧数
         */
        startTick: MuFloat64;
        /**
         * 动作链数据
         */
        playback: MuStruct<{
            motions: MuArray<MuStruct<{
                motionId: MuASCII;
                /**
                 * -1 means Infinity
                 */
                cycleCount: MuInt32;
            }>>;
            startTick: MuFloat64;
            /**
             * -1 means Infinity
             */
            cycleCount: MuInt32;
        }>;
    }>;
    staticShadow: MuBoolean;
    name: MuUTF8;
}>;
export type NetModel = typeof NetModelSchema.identity;
export declare const NetMeshTableEntrySchema: MuStruct<{
    /**
     * 这里的hash是meshHash，真正渲染模型用的hash值
     */
    hash: MuASCII;
    hashType: MuSchema<HashType>;
    meshBX: MuQuantizedFloat;
    meshBY: MuQuantizedFloat;
    meshBZ: MuQuantizedFloat;
    bodyBX: MuQuantizedFloat;
    bodyBY: MuQuantizedFloat;
    bodyBZ: MuQuantizedFloat;
    bodyOffsetX: MuQuantizedFloat;
    bodyOffsetY: MuQuantizedFloat;
    bodyOffsetZ: MuQuantizedFloat;
    renderBoxOffsetX: MuQuantizedFloat;
    renderBoxOffsetY: MuQuantizedFloat;
    renderBoxOffsetZ: MuQuantizedFloat;
}>;
export type NetMeshTableEntry = typeof NetMeshTableEntrySchema.identity;
export declare const NetMeshTableSchema: MuArray<MuStruct<{
    /**
     * 这里的hash是meshHash，真正渲染模型用的hash值
     */
    hash: MuASCII;
    hashType: MuSchema<HashType>;
    meshBX: MuQuantizedFloat;
    meshBY: MuQuantizedFloat;
    meshBZ: MuQuantizedFloat;
    bodyBX: MuQuantizedFloat;
    bodyBY: MuQuantizedFloat;
    bodyBZ: MuQuantizedFloat;
    bodyOffsetX: MuQuantizedFloat;
    bodyOffsetY: MuQuantizedFloat;
    bodyOffsetZ: MuQuantizedFloat;
    renderBoxOffsetX: MuQuantizedFloat;
    renderBoxOffsetY: MuQuantizedFloat;
    renderBoxOffsetZ: MuQuantizedFloat;
}>>;
export type NetMeshTable = typeof NetMeshTableSchema.identity;
export declare const NetSkinPartSchema: MuStruct<{
    id: MuVarint;
    hash: MuASCII;
}>;
export type NetSkinPart = typeof NetSkinPartSchema.identity;
export declare const NetSkinPartTableSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    hash: MuASCII;
}>>;
export declare const NetModelSetSchema: MuSortedArray<MuStruct<{
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
        /**
         * 默认动作id
         */
        defaultMotionId: MuASCII;
        /**
         * 是否暂停
         */
        paused: MuBoolean;
        /**
         * 暂停时的帧数
         */
        pausedTick: MuFloat64;
        /**
         * 默认动作开始的帧数
         */
        startTick: MuFloat64;
        /**
         * 动作链数据
         */
        playback: MuStruct<{
            motions: MuArray<MuStruct<{
                motionId: MuASCII;
                /**
                 * -1 means Infinity
                 */
                cycleCount: MuInt32;
            }>>;
            startTick: MuFloat64;
            /**
             * -1 means Infinity
             */
            cycleCount: MuInt32;
        }>;
    }>;
    staticShadow: MuBoolean;
    name: MuUTF8;
}>>;
export type NetModelSet = typeof NetModelSetSchema.identity;
export declare const NetSkinSchema: MuStruct<{
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
export type NetSkin = typeof NetSkinSchema.identity;
export declare const NetSkinTableSchema: MuArray<MuStruct<{
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
export type NetSkinTable = typeof NetSkinTableSchema.identity;
export declare const ModelProtocol: {
    name: string;
    client: {
        appendMeshHashes: MuArray<MuStruct<{
            /**
             * 这里的hash是meshHash，真正渲染模型用的hash值
             */
            hash: MuASCII;
            hashType: MuSchema<HashType>;
            meshBX: MuQuantizedFloat;
            meshBY: MuQuantizedFloat;
            meshBZ: MuQuantizedFloat;
            bodyBX: MuQuantizedFloat;
            bodyBY: MuQuantizedFloat;
            bodyBZ: MuQuantizedFloat;
            bodyOffsetX: MuQuantizedFloat;
            bodyOffsetY: MuQuantizedFloat;
            bodyOffsetZ: MuQuantizedFloat;
            renderBoxOffsetX: MuQuantizedFloat;
            renderBoxOffsetY: MuQuantizedFloat;
            renderBoxOffsetZ: MuQuantizedFloat;
        }>>;
        appendSkinHashes: MuArray<MuStruct<{
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
        appendSkinPartHashes: MuSortedArray<MuStruct<{
            id: MuVarint;
            hash: MuASCII;
        }>>;
    };
    server: {};
};
/**
 * 转换一层，为了记录一些中间数据，比如bounds
 */
export type GLTFMetaData = {
    /**
     * GLB文件本体
     */
    hash: string;
    bounds: [number, number, number];
};
//# sourceMappingURL=model-schema.d.ts.map