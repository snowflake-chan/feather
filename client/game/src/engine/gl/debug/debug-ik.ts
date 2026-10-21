import { REGLLoader } from '../regl';
import { vec3, mat4, quat } from 'gl-matrix';
import glDebugLine from './debug-line';
import glDebugPoint from './debug-point';
import glDebugArrow from './debug-arrow';
import glDebugBox from './debug-box';
import glDebugText from '../text';
import {
  IKPose,
  IKPoints,
  IKConfiguration,
} from '@box/schema/animation/ik-schema';

export default function glRigMain(regl, requireREGL: REGLLoader) {
  const drawBox = requireREGL.require(glDebugBox);
  const drawText = requireREGL.require(glDebugText);
  const drawArrow = requireREGL.require(glDebugArrow);
  const drawLine = requireREGL.require(glDebugLine);
  const drawPoint = requireREGL.require(glDebugPoint);

  const x = mat4.create();
  function marker(p: vec3, o: quat, label: string, color: vec3, scale: number) {
    drawBox({
      bounds: [
        vec3.sub(vec3.create(), p, [scale, scale, scale]),
        vec3.add(vec3.create(), p, [scale, scale, scale]),
      ],
      color,
      model: mat4.identity(mat4.create()),
    });
    mat4.fromQuat(x, o);
    /*
        drawText.text3D({
            text: label,
            position: p,
            color,
            size: scale,
        });
        */
    mat4.scale(x, x, [scale, scale, scale]);
    drawArrow([
      {
        origin: p,
        direction: vec3.fromValues(x[0], x[1], x[2]),
        color: vec3.fromValues(1, 0, 0),
      },
      {
        origin: p,
        direction: vec3.fromValues(x[4], x[5], x[6]),
        color: vec3.fromValues(0, 1, 0),
      },
      {
        origin: p,
        direction: vec3.fromValues(x[8], x[9], x[10]),
        color: vec3.fromValues(0, 0, 1),
      },
    ]);
  }

  function link(model: mat4, label: string, color: vec3, scale: number) {
    drawBox({
      bounds: [
        [-scale, -scale, -scale],
        [scale, scale, scale],
      ],
      color,
      model,
    });
    /*
        drawText.text3D({
            text: label,
            position:
                vec3.fromValues(
                    model[12],
                    model[13],
                    model[14]),
            color,
            size: scale,
        });
        */
  }

  function point(p: vec3, label: string, color: vec3, scale: number) {
    drawPoint(p, 8, color);
    /*
        drawText.text3D({
            text: label,
            position: p,
            color,
            size: scale,
        });
        */
  }

  return {
    configuration: (cfg: IKConfiguration, color: vec3, scale: number) => {
      link(cfg.leftHand, 'l hand', color, scale);
      link(cfg.leftLowerArm, 'l bt arm', color, scale);
      link(cfg.leftUpperArm, 'l up arm', color, scale);
      link(cfg.leftShoulder, 'l shoulder', color, scale);

      link(cfg.rightHand, 'r hand', color, scale);
      link(cfg.rightLowerArm, 'r bt arm', color, scale);
      link(cfg.rightUpperArm, 'r up arm', color, scale);
      link(cfg.rightShoulder, 'r shoulder', color, scale);

      link(cfg.head, 'head', color, scale);
      link(cfg.neck, 'neck', color, scale);
      link(cfg.torso, 'torso', color, scale);
      link(cfg.hips, 'hips', color, scale);

      link(cfg.leftFoot, 'l foot', color, scale);
      link(cfg.leftLowerLeg, 'l bt leg', color, scale);
      link(cfg.leftUpperLeg, 'l up leg', color, scale);

      link(cfg.rightFoot, 'r foot', color, scale);
      link(cfg.rightLowerLeg, 'r bt leg', color, scale);
      link(cfg.rightUpperLeg, 'r up leg', color, scale);
    },

    points: (points: IKPoints, color: vec3, scale: number) => {
      drawLine([points.leftFoot, points.leftToe], color);
      drawLine([points.leftFoot, points.leftKnee], color);
      drawLine([points.leftKnee, points.leftHip], color);
      drawLine([points.leftShoulder, points.leftElbow], color);
      drawLine([points.leftElbow, points.leftHand], color);
      drawLine([points.leftHip, points.hips], color);
      drawLine([points.leftShoulder, points.neck], color);

      drawLine([points.rightToe, points.rightFoot], color);
      drawLine([points.rightFoot, points.rightKnee], color);
      drawLine([points.rightKnee, points.rightHip], color);
      drawLine([points.rightHip, points.hips], color);
      drawLine([points.rightShoulder, points.rightElbow], color);
      drawLine([points.rightElbow, points.rightHand], color);
      drawLine([points.rightShoulder, points.neck], color);

      drawLine([points.hips, points.spine], color);
      drawLine([points.spine, points.neck], color);
      drawLine([points.neck, points.head], color);

      point(points.leftToe, 'l toe', vec3.fromValues(1, 0, 0), scale);
      point(points.leftFoot, 'l foot', vec3.fromValues(1, 0, 0), scale);
      point(points.leftKnee, 'l knee', vec3.fromValues(1, 0, 0), scale);
      point(points.leftHip, 'l hip', vec3.fromValues(1, 0, 0), scale);

      point(points.leftShoulder, 'l shoulder', vec3.fromValues(1, 0, 0), scale);
      point(points.leftElbow, 'l elbow', vec3.fromValues(1, 0, 0), scale);
      point(points.leftHand, 'l hand', vec3.fromValues(1, 0, 0), scale);

      point(points.rightToe, 'r toe', vec3.fromValues(1, 0, 0), scale);
      point(points.rightFoot, 'r foot', vec3.fromValues(1, 0, 0), scale);
      point(points.rightKnee, 'r knee', vec3.fromValues(1, 0, 0), scale);
      point(points.rightHip, 'r hip', vec3.fromValues(1, 0, 0), scale);

      point(
        points.rightShoulder,
        'r shoulder',
        vec3.fromValues(1, 0, 0),
        scale,
      );
      point(points.rightElbow, 'r elbow', vec3.fromValues(1, 0, 0), scale);
      point(points.rightHand, 'r hand', vec3.fromValues(1, 0, 0), scale);

      point(points.hips, 'hips', vec3.fromValues(1, 0, 0), scale);
      point(points.spine, 'spine', vec3.fromValues(1, 0, 0), scale);
      point(points.neck, 'neck', vec3.fromValues(1, 0, 0), scale);
      point(points.head, 'head', vec3.fromValues(1, 0, 0), scale);
    },

    params: (params: IKPose, color: vec3, scale: number) => {
      marker(params.headPosition, params.headOrientation, 'head', color, scale);
      marker(params.hipPosition, params.hipOrientation, 'hips', color, scale);
      marker(
        params.leftHandPosition,
        params.leftHandOrientation,
        'l hand',
        color,
        scale,
      );
      marker(
        params.rightHandPosition,
        params.rightHandOrientation,
        'r hand',
        color,
        scale,
      );
      marker(
        params.leftShoulderPosition,
        params.hipOrientation,
        'l shoulder',
        color,
        scale,
      );
      marker(
        params.rightShoulderPosition,
        params.hipOrientation,
        'r shoulder',
        color,
        scale,
      );

      point(
        params.leftFootPosition,
        'l foot',
        color,
        scale * (1 + params.leftPlant),
      );
      point(
        params.rightFootPosition,
        'r foot',
        color,
        scale * (1 + params.rightPlant),
      );
      point(
        params.leftToePosition,
        'l toe',
        color,
        scale * (1 + params.leftPlant),
      );
      point(
        params.rightToePosition,
        'r toe',
        color,
        scale * (1 + params.rightPlant),
      );
    },
  };
}
