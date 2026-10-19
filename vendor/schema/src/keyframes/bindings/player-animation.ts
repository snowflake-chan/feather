import { GameAssetType, GamePlayerKeyframe } from '../../api/js/api';
import {
  GamePrivateReplica,
  GamePrivateReplicaSchema,
} from '../../replica/game-private-replica';
import { CameraMode, CameraFreezedAxis } from '../../camera/camera-schema';
import {
  PlayerDisplay,
  PlayerDisplayFlags,
  PlayerDisplaySchema,
} from '../../player/player-schema';
import { AnimationBindingFactory } from '../keyframe-binding';

const PLAYER = new AnimationBindingFactory<GamePlayerKeyframe>('player');

const SKIN = PLAYER.component<PlayerDisplay, 'skin'>(
  'skin',
  PlayerDisplaySchema.identity,
);
const REPLICA = PLAYER.component<GamePrivateReplica, 'replica'>(
  'replica',
  GamePrivateReplicaSchema.identity,
);

// TODO: Implement binding for camera properties

export const PLAYER_ANIM_BINDING = PLAYER.create({
  singleton: false,
  keyframe: {
    components: PLAYER.keyframe(
      SKIN.bind(
        SKIN.num('emissive', 'emissive'),
        SKIN.num('metalness', 'metalness'),
        SKIN.num('shininess', 'shininess'),
        SKIN.num('scale', 'scale'),
        SKIN.rgb('color', 'color' as never),
        SKIN.bit('invisible', 'flags', PlayerDisplayFlags.INVISIBLE),
        SKIN.bit('showName', 'flags', PlayerDisplayFlags.SHOW_NAME),
        SKIN.bit('showIndicator', 'flags', PlayerDisplayFlags.SHOW_INDICATOR),
      ),
      REPLICA.bind(
        REPLICA.asset('colorLUT', 'colorLUT', GameAssetType.COLOR_LUT),
        ...REPLICA.nestEngine('camera', (CAMERA) => [
          CAMERA.enum('cameraMode', 'mode', {
            fps: CameraMode.FPS,
            fixed: CameraMode.FIXED,
            follow: CameraMode.FOLLOW,
            relative: CameraMode.RELATIVE,
          }),
          CAMERA.enum('cameraFreezedAxis', 'freezedAxis', {
            '': CameraFreezedAxis.NONE,
            'x': CameraFreezedAxis.X,
            'y': CameraFreezedAxis.Y,
            'z': CameraFreezedAxis.Z,
            'xy': CameraFreezedAxis.X | CameraFreezedAxis.Y,
            'yx': CameraFreezedAxis.X | CameraFreezedAxis.Y,
            'xz': CameraFreezedAxis.X | CameraFreezedAxis.Z,
            'zx': CameraFreezedAxis.X | CameraFreezedAxis.Z,
            'yz': CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'zy': CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'xyz':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'xzy':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'yxz':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'yzx':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'zxy':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
            'zyx':
              CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          }),
          CAMERA.num('cameraFovY', 'fovY'),
          CAMERA.num('cameraDistance', 'distance'),
          CAMERA.vec3('cameraUp', 'up' as never),
          CAMERA.vec3('cameraPosition', 'eye' as never),
          CAMERA.vec3('cameraTarget', 'target' as never),
          CAMERA.entity('cameraEntity', 'targetId'),
        ]),
      ),
    ),
    props: {},
  },
  props: {},
});

export const PlayerAnimationSchema = PLAYER_ANIM_BINDING.schema;
export type PlayerAnimation = typeof PlayerAnimationSchema.identity;
export const PlayerAnimationSetSchema = PLAYER_ANIM_BINDING.setSchema;
