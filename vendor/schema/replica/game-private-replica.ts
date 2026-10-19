import { HashSchema } from '../content-server/index';
import {
  MuBoolean,
  MuSortedArray,
  MuStruct,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import { CameraConfigurationSchema } from '../camera/camera-schema';
import { SoundEffectSchema } from '../sound/sound-protocol';
import { Gamepad } from '../api/js/api';

export const PlayerGamepadSchema: MuStruct<{ [K in keyof Gamepad]: MuUTF8 }> =
  new MuStruct({
    joystickBackground: new MuUTF8(''),
    joystickController: new MuUTF8(''),
    flyButton: new MuUTF8(''),
    flyingBackground: new MuUTF8(''),
    flyingController: new MuUTF8(''),
    jump: new MuUTF8(''),
    crouch: new MuUTF8(''),
    actionA: new MuUTF8(''),
    actionB: new MuUTF8(''),
  });
export type PlayerGamepad = typeof PlayerGamepadSchema['identity'];

export const GamePrivateReplicaSchema = new MuStruct({
  id: new MuVarint(),

  // color LUT
  colorLUT: HashSchema,

  // enable cursor
  enableCursor: new MuBoolean(false),

  // music
  music: SoundEffectSchema,

  // camera state
  camera: CameraConfigurationSchema,

  //gamepad
  gamepad: PlayerGamepadSchema,
});

export type GamePrivateReplica = typeof GamePrivateReplicaSchema.identity;

export const GamePrivateReplicaSetSchema = new MuSortedArray(
  GamePrivateReplicaSchema,
  Infinity,
  compareId,
);
