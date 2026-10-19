"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerAnimationSetSchema = exports.PlayerAnimationSchema = exports.PLAYER_ANIM_BINDING = void 0;
const api_1 = require("../../api/js/api");
const game_private_replica_1 = require("../../replica/game-private-replica");
const camera_schema_1 = require("../../camera/camera-schema");
const player_schema_1 = require("../../player/player-schema");
const keyframe_binding_1 = require("../keyframe-binding");
const PLAYER = new keyframe_binding_1.AnimationBindingFactory('player');
const SKIN = PLAYER.component('skin', player_schema_1.PlayerDisplaySchema.identity);
const REPLICA = PLAYER.component('replica', game_private_replica_1.GamePrivateReplicaSchema.identity);
// TODO: Implement binding for camera properties
exports.PLAYER_ANIM_BINDING = PLAYER.create({
    singleton: false,
    keyframe: {
        components: PLAYER.keyframe(SKIN.bind(SKIN.num('emissive', 'emissive'), SKIN.num('metalness', 'metalness'), SKIN.num('shininess', 'shininess'), SKIN.num('scale', 'scale'), SKIN.rgb('color', 'color'), SKIN.bit('invisible', 'flags', player_schema_1.PlayerDisplayFlags.INVISIBLE), SKIN.bit('showName', 'flags', player_schema_1.PlayerDisplayFlags.SHOW_NAME), SKIN.bit('showIndicator', 'flags', player_schema_1.PlayerDisplayFlags.SHOW_INDICATOR)), REPLICA.bind(REPLICA.asset('colorLUT', 'colorLUT', api_1.GameAssetType.COLOR_LUT), ...REPLICA.nestEngine('camera', (CAMERA) => [
            CAMERA.enum('cameraMode', 'mode', {
                fps: camera_schema_1.CameraMode.FPS,
                fixed: camera_schema_1.CameraMode.FIXED,
                follow: camera_schema_1.CameraMode.FOLLOW,
                relative: camera_schema_1.CameraMode.RELATIVE,
            }),
            CAMERA.enum('cameraFreezedAxis', 'freezedAxis', {
                '': camera_schema_1.CameraFreezedAxis.NONE,
                'x': camera_schema_1.CameraFreezedAxis.X,
                'y': camera_schema_1.CameraFreezedAxis.Y,
                'z': camera_schema_1.CameraFreezedAxis.Z,
                'xy': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y,
                'yx': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y,
                'xz': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Z,
                'zx': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Z,
                'yz': camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'zy': camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'xyz': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'xzy': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'yxz': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'yzx': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'zxy': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
                'zyx': camera_schema_1.CameraFreezedAxis.X | camera_schema_1.CameraFreezedAxis.Y | camera_schema_1.CameraFreezedAxis.Z,
            }),
            CAMERA.num('cameraFovY', 'fovY'),
            CAMERA.num('cameraDistance', 'distance'),
            CAMERA.vec3('cameraUp', 'up'),
            CAMERA.vec3('cameraPosition', 'eye'),
            CAMERA.vec3('cameraTarget', 'target'),
            CAMERA.entity('cameraEntity', 'targetId'),
        ]))),
        props: {},
    },
    props: {},
});
exports.PlayerAnimationSchema = exports.PLAYER_ANIM_BINDING.schema;
exports.PlayerAnimationSetSchema = exports.PLAYER_ANIM_BINDING.setSchema;
//# sourceMappingURL=player-animation.js.map