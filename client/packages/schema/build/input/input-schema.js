"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputStateSchema = exports.InputTouchSetSchema = exports.InputTouchSchema = exports.CameraBindingMode = exports.InputPauseFlags = exports.MouseButton = exports.MouseState = exports.GameKeys = void 0;
const schema_1 = require("@box/mudb/schema");
const math_schema_1 = require("../utils/math-schema");
const init_array_1 = require("@box/utils/init-array");
// Bindable keys
var GameKeys;
(function (GameKeys) {
    // basic actions
    GameKeys[GameKeys["LEFT"] = 0] = "LEFT";
    GameKeys[GameKeys["RIGHT"] = 1] = "RIGHT";
    GameKeys[GameKeys["UP"] = 2] = "UP";
    GameKeys[GameKeys["DOWN"] = 3] = "DOWN";
    GameKeys[GameKeys["JUMP"] = 4] = "JUMP";
    GameKeys[GameKeys["CROUCH"] = 5] = "CROUCH";
    GameKeys[GameKeys["ACTION_0"] = 6] = "ACTION_0";
    GameKeys[GameKeys["ACTION_1"] = 7] = "ACTION_1";
    GameKeys[GameKeys["RUN"] = 8] = "RUN";
    GameKeys[GameKeys["INTERACT"] = 9] = "INTERACT";
    // function keys (currently unused)
    GameKeys[GameKeys["NUM_1"] = 10] = "NUM_1";
    GameKeys[GameKeys["NUM_2"] = 11] = "NUM_2";
    GameKeys[GameKeys["NUM_3"] = 12] = "NUM_3";
    GameKeys[GameKeys["NUM_4"] = 13] = "NUM_4";
    GameKeys[GameKeys["NUM_5"] = 14] = "NUM_5";
    GameKeys[GameKeys["NUM_6"] = 15] = "NUM_6";
    GameKeys[GameKeys["NUM_7"] = 16] = "NUM_7";
    GameKeys[GameKeys["NUM_8"] = 17] = "NUM_8";
    GameKeys[GameKeys["NUM_9"] = 18] = "NUM_9";
    GameKeys[GameKeys["INVENTORY"] = 19] = "INVENTORY";
    GameKeys[GameKeys["ESC"] = 20] = "ESC";
    GameKeys[GameKeys["CHAT"] = 21] = "CHAT";
    GameKeys[GameKeys["TAB"] = 22] = "TAB";
    GameKeys[GameKeys["X"] = 23] = "X";
    // Turn keys
    GameKeys[GameKeys["TURN_LEFT"] = 24] = "TURN_LEFT";
    GameKeys[GameKeys["TURN_RIGHT"] = 25] = "TURN_RIGHT";
    GameKeys[GameKeys["LOOK_UP"] = 26] = "LOOK_UP";
    GameKeys[GameKeys["LOOK_DOWN"] = 27] = "LOOK_DOWN";
    // cycle through active entities
    GameKeys[GameKeys["NEXT_ENTITY"] = 28] = "NEXT_ENTITY";
    GameKeys[GameKeys["PREV_ENTITY"] = 29] = "PREV_ENTITY";
    GameKeys[GameKeys["KEY_COUNT"] = 30] = "KEY_COUNT";
    GameKeys[GameKeys["META"] = 31] = "META";
    GameKeys[GameKeys["LEFT_CTRL"] = 32] = "LEFT_CTRL";
})(GameKeys || (exports.GameKeys = GameKeys = {}));
var MouseState;
(function (MouseState) {
    MouseState[MouseState["release"] = 0] = "release";
    MouseState[MouseState["press"] = 1] = "press";
    MouseState[MouseState["drag"] = 2] = "drag";
})(MouseState || (exports.MouseState = MouseState = {}));
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["left"] = 0] = "left";
    MouseButton[MouseButton["middle"] = 1] = "middle";
    MouseButton[MouseButton["right"] = 2] = "right";
    MouseButton[MouseButton["none"] = 3] = "none";
})(MouseButton || (exports.MouseButton = MouseButton = {}));
var InputPauseFlags;
(function (InputPauseFlags) {
    InputPauseFlags[InputPauseFlags["RELEASE"] = 0] = "RELEASE";
    InputPauseFlags[InputPauseFlags["POINTER_LOCK"] = 1] = "POINTER_LOCK";
    InputPauseFlags[InputPauseFlags["MOUSE"] = 2] = "MOUSE";
    InputPauseFlags[InputPauseFlags["KEYBOARD"] = 4] = "KEYBOARD";
    InputPauseFlags[InputPauseFlags["ALL"] = 7] = "ALL";
})(InputPauseFlags || (exports.InputPauseFlags = InputPauseFlags = {}));
var CameraBindingMode;
(function (CameraBindingMode) {
    CameraBindingMode[CameraBindingMode["leftKey"] = 0] = "leftKey";
    CameraBindingMode[CameraBindingMode["rightKey"] = 1] = "rightKey";
})(CameraBindingMode || (exports.CameraBindingMode = CameraBindingMode = {}));
exports.InputTouchSchema = new schema_1.MuStruct({
    screenXY: math_schema_1.Vec2Schema,
    mouse: math_schema_1.Vec2Schema,
    identifier: new schema_1.MuVarint(),
});
exports.InputTouchSetSchema = new schema_1.MuArray(exports.InputTouchSchema, Infinity);
exports.InputStateSchema = new schema_1.MuStruct({
    // raw input state
    keyState: new schema_1.MuArray(new schema_1.MuUint8(0), Infinity, (0, init_array_1.initArray)(GameKeys.KEY_COUNT, () => 0)),
    keyLastPressed: new schema_1.MuArray(new schema_1.MuUint8(0), Infinity, (0, init_array_1.initArray)(GameKeys.KEY_COUNT, () => 0)),
    keyboardState: new schema_1.MuArray(new schema_1.MuUint8(0), Infinity),
    mouseState: new schema_1.MuUint8(0),
    mouseButton: new schema_1.MuUint8(3),
    mouse: math_schema_1.Vec2Schema,
    touches: exports.InputTouchSetSchema,
    touchStart: new schema_1.MuBoolean(false),
    touchStartTime: new schema_1.MuFloat64(),
    // pointerlock and fullscreen state
    disableAxis: new schema_1.MuUint8(0),
    fullscreen: new schema_1.MuBoolean(false),
    // use crossHair as mousePointer or not
    useCrossHair: new schema_1.MuBoolean(false),
    // camera binding
    cameraBindingMode: new schema_1.MuInt8(CameraBindingMode.leftKey),
    // input pause counters
    keyPauseCount: new schema_1.MuInt32(0),
    pointerLockPauseCount: new schema_1.MuInt32(0),
    mousePauseCount: new schema_1.MuInt32(0),
    // joystick controllers
    joystick: math_schema_1.Vec2Schema,
    joystickEnabled: new schema_1.MuBoolean(false),
});
//# sourceMappingURL=input-schema.js.map