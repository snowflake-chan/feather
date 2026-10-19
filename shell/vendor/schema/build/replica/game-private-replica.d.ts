import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { Gamepad } from '../api/js/api';
export declare const PlayerGamepadSchema: MuStruct<{
    [K in keyof Gamepad]: MuUTF8;
}>;
export type PlayerGamepad = typeof PlayerGamepadSchema['identity'];
export declare const GamePrivateReplicaSchema: MuStruct<{
    id: MuVarint;
    colorLUT: import("@box/mudb/schema").MuASCII;
    enableCursor: MuBoolean;
    music: MuStruct<{
        sampleId: MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        gain: import("@box/mudb/schema").MuQuantizedFloat;
        gainRange: import("@box/mudb/schema").MuQuantizedFloat;
        pitch: import("@box/mudb/schema").MuQuantizedFloat;
        pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
    }>;
    camera: MuStruct<{
        mode: import("@box/mudb/schema").MuSchema<import("../camera/camera-schema").CameraMode>;
        targetId: MuVarint;
        eye: import("../utils/quantized-schema").QuantizedVec3Schema;
        up: import("../utils/quantized-schema").QuantizedVec3Schema;
        target: import("../utils/quantized-schema").QuantizedVec3Schema;
        freezedAxis: import("@box/mudb/schema").MuUint8;
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
export type GamePrivateReplica = typeof GamePrivateReplicaSchema.identity;
export declare const GamePrivateReplicaSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    colorLUT: import("@box/mudb/schema").MuASCII;
    enableCursor: MuBoolean;
    music: MuStruct<{
        sampleId: MuVarint;
        radius: import("@box/mudb/schema").MuQuantizedFloat;
        gain: import("@box/mudb/schema").MuQuantizedFloat;
        gainRange: import("@box/mudb/schema").MuQuantizedFloat;
        pitch: import("@box/mudb/schema").MuQuantizedFloat;
        pitchRange: import("@box/mudb/schema").MuQuantizedFloat;
    }>;
    camera: MuStruct<{
        mode: import("@box/mudb/schema").MuSchema<import("../camera/camera-schema").CameraMode>;
        targetId: MuVarint;
        eye: import("../utils/quantized-schema").QuantizedVec3Schema;
        up: import("../utils/quantized-schema").QuantizedVec3Schema;
        target: import("../utils/quantized-schema").QuantizedVec3Schema;
        freezedAxis: import("@box/mudb/schema").MuUint8;
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
}>>;
