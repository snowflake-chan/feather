import { REGLLoader } from '../regl';
import glPoint from './debug-point';
import glText from '../text';
import { vec4, vec3 } from 'gl-matrix';
import { drawText3D } from '../../overlay/overlays';
import { GameClientState } from '../../game-client-schema';

const points = ['x0', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7'];
const lights = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];

export default function glDebugLightMap(regl, loader: REGLLoader) {
  const text = loader.require(glText);
  const drawPoint = loader.require(glPoint);
  return function (state: GameClientState) {
    const light = state.light.probes;
    const ids = Object.keys(light);
    for (let i = 0; i < ids.length; ++i) {
      const probe = light[+ids[i]];
      const center = vec3.create();
      for (let j = 0; j < points.length; ++j) {
        vec3.add(center, center, probe[points[j]]);
        const c: vec4 = probe[lights[j]];
        drawPoint(
          probe[points[j]],
          2,
          vec3.fromValues(
            c[0] + 0.25 * c[3],
            c[1] + 0.25 * c[3],
            c[2] + 0.25 * c[3],
          ),
        );
      }
      vec3.scale(center, center, 0.125);
      drawText3D(state, ids[i], center);
    }
  };
}
