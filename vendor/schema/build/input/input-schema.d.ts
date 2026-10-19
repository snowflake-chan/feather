import { MuStruct, MuUint8, MuArray, MuSchema, MuBoolean, MuInt32, MuInt8, MuFloat64, MuVarint } from '@box/mudb/schema';
export declare enum GameKeys {
    LEFT = 0,
    RIGHT = 1,
    UP = 2,
    DOWN = 3,
    JUMP = 4,
    CROUCH = 5,
    ACTION_0 = 6,
    ACTION_1 = 7,
    RUN = 8,
    INTERACT = 9,
    NUM_1 = 10,
    NUM_2 = 11,
    NUM_3 = 12,
    NUM_4 = 13,
    NUM_5 = 14,
    NUM_6 = 15,
    NUM_7 = 16,
    NUM_8 = 17,
    NUM_9 = 18,
    INVENTORY = 19,
    ESC = 20,
    CHAT = 21,
    TAB = 22,
    X = 23,
    TURN_LEFT = 24,
    TURN_RIGHT = 25,
    LOOK_UP = 26,
    LOOK_DOWN = 27,
    NEXT_ENTITY = 28,
    PREV_ENTITY = 29,
    KEY_COUNT = 30,
    META = 31,
    LEFT_CTRL = 32
}
export declare enum MouseState {
    release = 0,
    press = 1,
    drag = 2
}
export declare enum MouseButton {
    left = 0,
    middle = 1,
    right = 2,
    none = 3
}
export declare enum InputPauseFlags {
    RELEASE = 0,
    POINTER_LOCK = 1,
    MOUSE = 2,
    KEYBOARD = 4,
    ALL = 7
}
export type InputPauseChange = (prev: InputPauseFlags, next: InputPauseFlags) => void;
export declare enum CameraBindingMode {
    leftKey = 0,
    rightKey = 1
}
export declare const InputTouchSchema: MuStruct<{
    screenXY: MuSchema<import("gl-matrix").vec2>;
    mouse: MuSchema<import("gl-matrix").vec2>;
    identifier: MuVarint;
}>;
export type InputTouch = typeof InputTouchSchema.identity;
export declare const InputTouchSetSchema: MuArray<MuStruct<{
    screenXY: MuSchema<import("gl-matrix").vec2>;
    mouse: MuSchema<import("gl-matrix").vec2>;
    identifier: MuVarint;
}>>;
export type InputTouchSet = typeof InputTouchSetSchema.identity;
export declare const InputStateSchema: MuStruct<{
    keyState: MuArray<MuUint8>;
    keyLastPressed: MuArray<MuUint8>;
    keyboardState: MuArray<MuUint8>;
    mouseState: MuSchema<MouseState>;
    mouseButton: MuSchema<MouseButton>;
    mouse: MuSchema<import("gl-matrix").vec2>;
    touches: MuArray<MuStruct<{
        screenXY: MuSchema<import("gl-matrix").vec2>;
        mouse: MuSchema<import("gl-matrix").vec2>;
        identifier: MuVarint;
    }>>;
    touchStart: MuBoolean;
    touchStartTime: MuFloat64;
    disableAxis: MuUint8;
    fullscreen: MuBoolean;
    useCrossHair: MuBoolean;
    cameraBindingMode: MuInt8;
    keyPauseCount: MuInt32;
    pointerLockPauseCount: MuInt32;
    mousePauseCount: MuInt32;
    joystick: MuSchema<import("gl-matrix").vec2>;
    joystickEnabled: MuBoolean;
}>;
export type InputState = typeof InputStateSchema['identity'];
//# sourceMappingURL=input-schema.d.ts.map