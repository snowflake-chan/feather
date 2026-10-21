import REGL from 'regl';
import { REGLLoader } from '../regl';
import { RigidBodySet } from '@box/schema/physics/physics-schema';
import glBox from './debug-box';
import glArrow from './debug-arrow';
import { mat4, vec3 } from 'gl-matrix';

export default function (regl: REGL.Regl, loader: REGLLoader) {
  const drawBox = loader.require(glBox);
  const debugArrow = loader.require(glArrow);

  return function (bodies: RigidBodySet, color: number[]) {
    drawBox(
      bodies.map((b) => {
        debugArrow({
          origin: b.getPosition(),
          direction: b.getVelocity(),
          color,
        });
        const m = mat4.create();
        mat4.identity(m);
        // const [ax0, ax1, ax2, ay0, ay1, ay2, az0, az1, az2] = b.getRotation();
        // m[0] = ax0;
        // m[1] = ax1;
        // m[2] = ax2;
        // m[4] = ay0;
        // m[5] = ay1;
        // m[6] = ay2;
        // m[8] = az0;
        // m[9] = az1;
        // m[10] = az2;
        m[12] = b.px;
        m[13] = b.py;
        m[14] = b.pz;
        return {
          // bounds: [
          //   vec3.sub(vec3.create(), [0, 0, 0], [b.hsx, b.hsy, b.hsz]),
          //   vec3.add(vec3.create(), [0, 0, 0], [b.hsx, b.hsy, b.hsz]),
          // ],
          bounds: [
            vec3.sub(vec3.create(), [0, 0, 0], [b.rx, b.ry, b.rz]),
            vec3.add(vec3.create(), [0, 0, 0], [b.rx, b.ry, b.rz]),
          ],
          color,
          model: m,
        };
      }),
    );
  };
}
