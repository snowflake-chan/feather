import { GamePlayerKeyframe } from '../../api/js/api';
import { CameraMode } from '../../camera/camera-schema';
import { PlayerDisplayFlags } from '../../player/player-schema';
export declare const PLAYER_ANIM_BINDING: import("../keyframe-binding").AnimationBinding<GamePlayerKeyframe, import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
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
        skin: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    } & {
        replica: import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
        }>;
    }>;
}>, {
    skin: (index: import("@box/mudb/schema/struct").Struct<{
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
            skin: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            replica: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        flags: import("@box/mudb/schema").MuSchema<PlayerDisplayFlags>;
        name: import("@box/mudb/schema").MuUTF8;
        tag: import("@box/mudb/schema").MuVarint;
        avatarSkin: import("@box/mudb/schema").MuStruct<{
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
        skinInvisible: import("@box/mudb/schema").MuStruct<{
            hips: import("@box/mudb/schema").MuBoolean;
            torso: import("@box/mudb/schema").MuBoolean;
            neck: import("@box/mudb/schema").MuBoolean;
            head: import("@box/mudb/schema").MuBoolean;
            leftShoulder: import("@box/mudb/schema").MuBoolean;
            leftUpperArm: import("@box/mudb/schema").MuBoolean;
            leftLowerArm: import("@box/mudb/schema").MuBoolean;
            leftHand: import("@box/mudb/schema").MuBoolean;
            rightShoulder: import("@box/mudb/schema").MuBoolean;
            rightUpperArm: import("@box/mudb/schema").MuBoolean;
            rightLowerArm: import("@box/mudb/schema").MuBoolean;
            rightHand: import("@box/mudb/schema").MuBoolean;
            leftUpperLeg: import("@box/mudb/schema").MuBoolean;
            leftLowerLeg: import("@box/mudb/schema").MuBoolean;
            leftFoot: import("@box/mudb/schema").MuBoolean;
            rightUpperLeg: import("@box/mudb/schema").MuBoolean;
            rightLowerLeg: import("@box/mudb/schema").MuBoolean;
            rightFoot: import("@box/mudb/schema").MuBoolean;
        }>;
        mapSkin: import("@box/mudb/schema").MuStruct<{
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
        color: import("../../utils/quantized-schema").QuantizedVec3Schema;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        scale: import("@box/mudb/schema").MuQuantizedFloat;
        attachments: import("@box/mudb/schema").MuStruct<{
            hips: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            torso: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            neck: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            head: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftShoulder: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftHand: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightShoulder: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightHand: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftFoot: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightFoot: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
        }>;
    }>[]) => void;
} & {
    replica: (index: import("@box/mudb/schema/struct").Struct<{
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
            skin: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            replica: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, components: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        colorLUT: import("@box/mudb/schema").MuASCII;
        enableCursor: import("@box/mudb/schema").MuBoolean;
        music: import("@box/mudb/schema").MuStruct<{
            sampleId: import("@box/mudb/schema").MuVarint;
            radius: import("@box/mudb/schema").MuQuantizedFloat;
            gain: import("@box/mudb/schema").MuQuantizedFloat;
            gainRange: import("@box/mudb/schema").MuQuantizedFloat;
            pitch: import("@box/mudb/schema").MuQuantizedFloat;
            pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
        }>;
        camera: import("@box/mudb/schema").MuStruct<{
            mode: import("@box/mudb/schema").MuSchema<CameraMode>;
            targetId: import("@box/mudb/schema").MuVarint;
            eye: import("../../utils/quantized-schema").QuantizedVec3Schema;
            up: import("../../utils/quantized-schema").QuantizedVec3Schema;
            target: import("../../utils/quantized-schema").QuantizedVec3Schema;
            freezedAxis: import("@box/mudb/schema").MuUint8;
            fovY: import("../../utils/quantized-schema").QuantizedScalar;
            distance: import("../../utils/quantized-schema").QuantizedScalar;
        }>;
        gamepad: import("@box/mudb/schema").MuStruct<{
            joystickBackground: import("@box/mudb/schema").MuUTF8;
            joystickController: import("@box/mudb/schema").MuUTF8;
            flyButton: import("@box/mudb/schema").MuUTF8;
            flyingBackground: import("@box/mudb/schema").MuUTF8;
            flyingController: import("@box/mudb/schema").MuUTF8;
            jump: import("@box/mudb/schema").MuUTF8;
            crouch: import("@box/mudb/schema").MuUTF8;
            actionA: import("@box/mudb/schema").MuUTF8;
            actionB: import("@box/mudb/schema").MuUTF8;
        }>;
    }>[]) => void;
}, {
    skin: (index: import("@box/mudb/schema/struct").Struct<{
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
            skin: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            replica: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        flags: import("@box/mudb/schema").MuSchema<PlayerDisplayFlags>;
        name: import("@box/mudb/schema").MuUTF8;
        tag: import("@box/mudb/schema").MuVarint;
        avatarSkin: import("@box/mudb/schema").MuStruct<{
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
        skinInvisible: import("@box/mudb/schema").MuStruct<{
            hips: import("@box/mudb/schema").MuBoolean;
            torso: import("@box/mudb/schema").MuBoolean;
            neck: import("@box/mudb/schema").MuBoolean;
            head: import("@box/mudb/schema").MuBoolean;
            leftShoulder: import("@box/mudb/schema").MuBoolean;
            leftUpperArm: import("@box/mudb/schema").MuBoolean;
            leftLowerArm: import("@box/mudb/schema").MuBoolean;
            leftHand: import("@box/mudb/schema").MuBoolean;
            rightShoulder: import("@box/mudb/schema").MuBoolean;
            rightUpperArm: import("@box/mudb/schema").MuBoolean;
            rightLowerArm: import("@box/mudb/schema").MuBoolean;
            rightHand: import("@box/mudb/schema").MuBoolean;
            leftUpperLeg: import("@box/mudb/schema").MuBoolean;
            leftLowerLeg: import("@box/mudb/schema").MuBoolean;
            leftFoot: import("@box/mudb/schema").MuBoolean;
            rightUpperLeg: import("@box/mudb/schema").MuBoolean;
            rightLowerLeg: import("@box/mudb/schema").MuBoolean;
            rightFoot: import("@box/mudb/schema").MuBoolean;
        }>;
        mapSkin: import("@box/mudb/schema").MuStruct<{
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
        color: import("../../utils/quantized-schema").QuantizedVec3Schema;
        metalness: import("@box/mudb/schema").MuQuantizedFloat;
        emissive: import("@box/mudb/schema").MuQuantizedFloat;
        shininess: import("@box/mudb/schema").MuQuantizedFloat;
        scale: import("@box/mudb/schema").MuQuantizedFloat;
        attachments: import("@box/mudb/schema").MuStruct<{
            hips: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            torso: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            neck: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            head: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftShoulder: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftHand: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightShoulder: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerArm: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightHand: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftUpperLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftLowerLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            leftFoot: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightUpperLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightLowerLeg: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
            rightFoot: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                meshId: import("@box/mudb/schema").MuVarint;
                red: import("@box/mudb/schema").MuQuantizedFloat;
                green: import("@box/mudb/schema").MuQuantizedFloat;
                blue: import("@box/mudb/schema").MuQuantizedFloat;
                emissive: import("@box/mudb/schema").MuQuantizedFloat;
                shininess: import("@box/mudb/schema").MuQuantizedFloat;
                metalness: import("@box/mudb/schema").MuQuantizedFloat;
                offset: import("../../utils/quantized-schema").QuantizedVec3Schema;
                scale: import("../../utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            }>>;
        }>;
    }>[]) => void;
} & {
    replica: (index: import("@box/mudb/schema/struct").Struct<{
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
            skin: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        } & {
            replica: import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                frameOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                dataOffset: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                typeData: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
                animData: import("@box/mudb/schema").MuArray<import("../../utils/ref-schema").MuRefSchema<any>>;
            }>;
        }>;
    }>, dst: import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuVarint;
        colorLUT: import("@box/mudb/schema").MuASCII;
        enableCursor: import("@box/mudb/schema").MuBoolean;
        music: import("@box/mudb/schema").MuStruct<{
            sampleId: import("@box/mudb/schema").MuVarint;
            radius: import("@box/mudb/schema").MuQuantizedFloat;
            gain: import("@box/mudb/schema").MuQuantizedFloat;
            gainRange: import("@box/mudb/schema").MuQuantizedFloat;
            pitch: import("@box/mudb/schema").MuQuantizedFloat;
            pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
        }>;
        camera: import("@box/mudb/schema").MuStruct<{
            mode: import("@box/mudb/schema").MuSchema<CameraMode>;
            targetId: import("@box/mudb/schema").MuVarint;
            eye: import("../../utils/quantized-schema").QuantizedVec3Schema;
            up: import("../../utils/quantized-schema").QuantizedVec3Schema;
            target: import("../../utils/quantized-schema").QuantizedVec3Schema;
            freezedAxis: import("@box/mudb/schema").MuUint8;
            fovY: import("../../utils/quantized-schema").QuantizedScalar;
            distance: import("../../utils/quantized-schema").QuantizedScalar;
        }>;
        gamepad: import("@box/mudb/schema").MuStruct<{
            joystickBackground: import("@box/mudb/schema").MuUTF8;
            joystickController: import("@box/mudb/schema").MuUTF8;
            flyButton: import("@box/mudb/schema").MuUTF8;
            flyingBackground: import("@box/mudb/schema").MuUTF8;
            flyingController: import("@box/mudb/schema").MuUTF8;
            jump: import("@box/mudb/schema").MuUTF8;
            crouch: import("@box/mudb/schema").MuUTF8;
            actionA: import("@box/mudb/schema").MuUTF8;
            actionB: import("@box/mudb/schema").MuUTF8;
        }>;
    }>[]) => void;
}, import("@box/mudb/schema").MuStruct<{
    skin: import("@box/mudb/schema").MuVarint;
} & {
    replica: import("@box/mudb/schema").MuVarint;
}>>;
export declare const PlayerAnimationSchema: import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
    }>>;
}>;
export type PlayerAnimation = typeof PlayerAnimationSchema.identity;
export declare const PlayerAnimationSetSchema: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
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
        components: import("../mu-array-union").MuArrayUnion<[import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuSchema<number>, import("@box/mudb/schema").MuStruct<{
            r: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            g: import("@box/mudb/schema").MuQuantizedFloat;
        } & {
            b: import("@box/mudb/schema").MuQuantizedFloat;
        }>, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean, import("@box/mudb/schema").MuBoolean]>, import("../mu-array-union").MuArrayUnion<[import("@box/mudb/schema").MuASCII]>]>;
    }>>;
}>>;
//# sourceMappingURL=player-animation.d.ts.map