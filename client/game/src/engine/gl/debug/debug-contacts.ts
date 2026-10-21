import REGL from 'regl';
import { REGLLoader } from '../regl';
import { ContactIndex, RigidBody } from '@box/schema/physics/physics-schema';
import glBox from './debug-box';
import glArrow from './debug-arrow';
import glText from '../text';
import glLine from './debug-line';
import { vec3 } from 'gl-matrix';
import { getById } from '@box/utils/id';

export default function (regl: REGL.Regl, loader: REGLLoader) {
  const drawBox = loader.require(glBox);
  const debugArrow = loader.require(glArrow);
  const debugLine = loader.require(glLine);
  const text = loader.require(glText);

  return function (
    bodies: RigidBody[],
    contacts: ContactIndex,
    color: number[],
  ) {
    contacts.forEach((c) => {
      const body = getById(bodies, c.id);
      if (!body) {
        return;
      }
      c.body.forEach((b) => {
        const o = getById(bodies, b.otherId);
        if (!o) {
          return;
        }
        debugLine([body.getPosition(), o.getPosition()], <any>color);
      });
      c.voxel.forEach((v) => {
        const normal = vec3.create();
        if (v.axis === 1) {
          normal[0] += 1;
        } else if (v.axis === -1) {
          normal[0] -= 1;
        } else if (v.axis === 2) {
          normal[1] += 1;
        } else if (v.axis === -2) {
          normal[1] -= 1;
        } else if (v.axis === 3) {
          normal[2] += 1;
        } else if (v.axis === -3) {
          normal[2] -= 1;
        }
        const origin = vec3.fromValues(
          v.x + 0.5 * (normal[0] + 1),
          v.y + 0.5 * (normal[1] + 1),
          v.z + 0.5 * (normal[2] + 1),
        );
        debugLine([body.getPosition(), origin], <any>color);
        debugArrow({
          origin,
          direction: normal,
          color,
        });
        debugArrow({
          origin,
          direction: [v.fx, v.fy, v.fz],
          color,
        });
        drawBox({
          bounds: [
            [v.x - 0.1, v.y - 0.1, v.z - 0.1],
            [v.x + 1.1, v.y + 1.1, v.z + 1.1],
          ],
          color,
        });
      });
    });
  };
}
