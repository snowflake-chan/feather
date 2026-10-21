import {
  MuStruct,
  MuUint8,
  MuArray,
  MuSchema,
  MuBoolean,
  MuInt32,
  MuInt8,
  MuFloat64,
  MuVarint,
} from '@box/mudb/schema';
import { Vec2Schema } from '../utils/math-schema';
import { initArray } from '@box/utils/init-array';

// Bindable keys
export enum GameKeys {
  // basic actions
  LEFT,
  RIGHT,
  UP,
  DOWN,
  JUMP,
  CROUCH,
  ACTION_0,
  ACTION_1,
  RUN,
  INTERACT,

  // function keys (currently unused)
  NUM_1,
  NUM_2,
  NUM_3,
  NUM_4,
  NUM_5,
  NUM_6,
  NUM_7,
  NUM_8,
  NUM_9,
  INVENTORY,
  ESC,
  CHAT,
  TAB,
  X,

  // Turn keys
  TURN_LEFT,
  TURN_RIGHT,
  LOOK_UP,
  LOOK_DOWN,

  // cycle through active entities
  NEXT_ENTITY,
  PREV_ENTITY,

  KEY_COUNT,

  META,
  LEFT_CTRL,
}

export enum MouseState {
  release = 0,
  press = 1,
  drag = 2,
}

export enum MouseButton {
  left = 0,
  middle = 1,
  right = 2,
  none = 3,
}

export enum InputPauseFlags {
  RELEASE = 0,
  POINTER_LOCK = 1 << 0,
  MOUSE = 1 << 1,
  KEYBOARD = 1 << 2,

  ALL = POINTER_LOCK | MOUSE | KEYBOARD,
}

export type InputPauseChange = (
  prev: InputPauseFlags,
  next: InputPauseFlags,
) => void;

export enum CameraBindingMode {
  leftKey,
  rightKey,
}

export const InputTouchSchema = new MuStruct({
  screenXY: Vec2Schema,
  mouse: Vec2Schema,
  identifier: new MuVarint(),
});

export type InputTouch = typeof InputTouchSchema.identity;

export const InputTouchSetSchema = new MuArray(InputTouchSchema, Infinity);
export type InputTouchSet = typeof InputTouchSetSchema.identity;

export const InputStateSchema = new MuStruct({
  // raw input state
  keyState: new MuArray(
    new MuUint8(0),
    Infinity,
    initArray(GameKeys.KEY_COUNT, () => 0),
  ),
  keyLastPressed: new MuArray(
    new MuUint8(0),
    Infinity,
    initArray(GameKeys.KEY_COUNT, () => 0),
  ),
  keyboardState: new MuArray(new MuUint8(0), Infinity),
  mouseState: <MuSchema<MouseState>>new MuUint8(0),
  mouseButton: <MuSchema<MouseButton>>new MuUint8(3),
  mouse: Vec2Schema,

  touches: InputTouchSetSchema,
  touchStart: new MuBoolean(false),
  touchStartTime: new MuFloat64(),

  // pointerlock and fullscreen state
  disableAxis: new MuUint8(0),
  fullscreen: new MuBoolean(false),

  // use crossHair as mousePointer or not
  useCrossHair: new MuBoolean(false),

  // camera binding
  cameraBindingMode: new MuInt8(CameraBindingMode.leftKey),

  // input pause counters
  keyPauseCount: new MuInt32(0),
  pointerLockPauseCount: new MuInt32(0),
  mousePauseCount: new MuInt32(0),

  // joystick controllers
  joystick: Vec2Schema,
  joystickEnabled: new MuBoolean(false),
});
export type InputState = typeof InputStateSchema['identity'];
