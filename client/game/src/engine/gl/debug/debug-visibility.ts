import REGL from 'regl';
import { REGLLoader } from '../regl';

import glBox from './debug-box';
import glArrow from './debug-arrow';
import glLine from './debug-line';
import glText from '../text';
import { GameClientState } from '../../game-client-schema';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';
import { ChunkVisibilityFlags } from '../../voxel/visibility-flags';
import { vec3 } from 'gl-matrix';

export default function (regl: REGL.Regl, loader: REGLLoader) {
  const drawBox = loader.require(glBox);
  const debugArrow = loader.require(glArrow);
  const debugLine = loader.require(glLine);
  const debugText = loader.require(glText);

  const FACE_CENTER = [
    [0, CHUNK_SIZE / 2, CHUNK_SIZE / 2],
    [CHUNK_SIZE / 2, 0, CHUNK_SIZE / 2],
    [CHUNK_SIZE / 2, CHUNK_SIZE / 2, 0],
  ];

  const CHUNK_STEP = [
    [-CHUNK_SIZE, 0, 0],
    [0, -CHUNK_SIZE, 0],
    [0, 0, -CHUNK_SIZE],
  ];

  const pointOffset = [
    [CHUNK_SIZE, CHUNK_SIZE / 2, CHUNK_SIZE / 2],
    [0, CHUNK_SIZE / 2, CHUNK_SIZE / 2],
    [CHUNK_SIZE / 2, CHUNK_SIZE, CHUNK_SIZE / 2],
    [CHUNK_SIZE / 2, 0, CHUNK_SIZE / 2],
    [CHUNK_SIZE / 2, CHUNK_SIZE / 2, CHUNK_SIZE],
    [CHUNK_SIZE / 2, CHUNK_SIZE / 2, 0],
  ];
  const faces = ['posX', 'negX', 'posY', 'negY', 'posZ', 'negZ'];
  const flags = [
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.NEG_X,
    ChunkVisibilityFlags.POS_Y,
    ChunkVisibilityFlags.NEG_Y,
    ChunkVisibilityFlags.POS_Z,
    ChunkVisibilityFlags.NEG_Z,
  ];
  const colors = [
    vec3.fromValues(1, 0, 0),
    vec3.fromValues(0, 1, 1),
    vec3.fromValues(0, 1, 0),
    vec3.fromValues(1, 0, 1),
    vec3.fromValues(0, 0, 1),
    vec3.fromValues(1, 1, 0),
  ];

  let red = 1;
  let white = 0;

  function setColor(ptr: number) {
    red = 0.5 * (Math.cos(184438.333 * ptr) + 1);
    white = 0.5 * (Math.sin(3377.37411 * ptr) + 1);
  }

  let t = 0;

  function animateLine(a: vec3, b: vec3) {
    const u = (t + red + 3 * white) % 1;
    debugLine(
      [
        vec3.lerp(vec3.create(), a, b, u),
        vec3.lerp(vec3.create(), a, b, Math.min(1, u + 0.8)),
      ],
      vec3.fromValues(red, white, white),
    );
  }

  function renderFaceVis(
    cx: number,
    cy: number,
    cz: number,
    face: number,
    mask: number,
  ) {
    const offset = FACE_CENTER[face];
    const step = CHUNK_STEP[face];
    for (let i = 0; i < flags.length; ++i) {
      const dir = pointOffset[i];
      if (mask & flags[i]) {
        animateLine(
          vec3.fromValues(cx + offset[0], cy + offset[1], cz + offset[2]),
          vec3.fromValues(cx + dir[0], cy + dir[1], cz + dir[2]),
        );
      }
      if (mask & (flags[i] << 6)) {
        animateLine(
          vec3.fromValues(cx + offset[0], cy + offset[1], cz + offset[2]),
          vec3.fromValues(
            cx + dir[0] + step[0],
            cy + dir[1] + step[1],
            cz + dir[2] + step[2],
          ),
        );
      }
    }
  }

  return function (state: GameClientState) {
    t = (state.clock.clock * 0.001) % 1;

    state.voxelMesh.chunks.forEach((chunk) => {
      const index = chunk.index;
      const x = index[0] * CHUNK_SIZE;
      const y = index[1] * CHUNK_SIZE;
      const z = index[2] * CHUNK_SIZE;

      drawBox({
        bounds: [
          [x + 5, y + 5, z + 5],
          [x + CHUNK_SIZE - 5, y + CHUNK_SIZE - 5, z + CHUNK_SIZE - 5],
        ],
        color: [1, 1, 1],
      });

      for (let i = 0; i < faces.length; ++i) {
        const start = pointOffset[faces[i]];
        const chunkFlags = chunk[faces[i]];
        for (let j = 0; j < i; ++j) {
          if ((chunkFlags & flags[j]) === 0) {
            continue;
          }
          const end = pointOffset[faces[j]];
          debugLine(
            [
              vec3.fromValues(x + start[0], y + start[1], z + start[2]),
              vec3.fromValues(x + end[0], y + end[1], z + end[2]),
            ],
            colors[(i + j) % colors.length],
          );
        }
      }
    });

    // render contents of visited queue
    // const BFS_INFO:{
    //     nx:number, ny:number, nz:number,
    //     adj:Uint16Array,
    //     visited:Uint8Array,
    //     queue:Uint32Array,
    //     queueTail:number,
    // } = (<any>window).BFS_INFO;

    // for (let z = 0; z < BFS_INFO.nz; ++z) {
    //     for (let y = 0; y < BFS_INFO.ny; ++y) {
    //         for (let x = 0; x < BFS_INFO.nx; ++x) {
    //             const ptr = 3 * (x + BFS_INFO.nx * (y + BFS_INFO.ny * z));
    //             if (BFS_INFO.visited[ptr]) {
    //                 setColor(ptr);
    //                 drawBox({
    //                     bounds: [
    //                         [ (x - 1) * CHUNK_SIZE - 0.5, (y - 1) * CHUNK_SIZE + 2, (z - 1) * CHUNK_SIZE + 2],
    //                         [ (x - 1) * CHUNK_SIZE + 0.5, y * CHUNK_SIZE - 2, z * CHUNK_SIZE  - 2],
    //                     ],
    //                     color: [ red, white, white ],
    //                 });
    //                 renderFaceVis((x - 1) * CHUNK_SIZE, (y - 1) * CHUNK_SIZE, (z - 1) * CHUNK_SIZE, 0, BFS_INFO.adj[ptr]);
    //             }
    //             if (BFS_INFO.visited[ptr + 1]) {
    //                 setColor(ptr + 1);
    //                 drawBox({
    //                     bounds: [
    //                         [ (x - 1) * CHUNK_SIZE + 2 , (y - 1) * CHUNK_SIZE - 0.5, (z - 1) * CHUNK_SIZE + 2],
    //                         [ x * CHUNK_SIZE - 2 , (y - 1) * CHUNK_SIZE + 0.5, z * CHUNK_SIZE - 2],
    //                     ],
    //                     color: [ red, white, white ],
    //                 });
    //                 renderFaceVis((x - 1) * CHUNK_SIZE, (y - 1) * CHUNK_SIZE, (z - 1) * CHUNK_SIZE, 1, BFS_INFO.adj[ptr + 1]);
    //             }
    //             if (BFS_INFO.visited[ptr + 2]) {
    //                 setColor(ptr + 2);
    //                 drawBox({
    //                     bounds: [
    //                         [ (x - 1) * CHUNK_SIZE + 2, (y - 1) * CHUNK_SIZE + 2, (z - 1) * CHUNK_SIZE - 0.5 ],
    //                         [ x * CHUNK_SIZE - 2, y * CHUNK_SIZE - 2, (z - 1) * CHUNK_SIZE + 0.5 ],
    //                     ],
    //                     color: [ red, white, white ],
    //                 });
    //                 renderFaceVis((x - 1) * CHUNK_SIZE, (y - 1) * CHUNK_SIZE, (z - 1) * CHUNK_SIZE, 2, BFS_INFO.adj[ptr + 2]);
    //             }
    //         }
    //     }
    // }

    // for (let i = 0; i < BFS_INFO.queueTail; ++i) {
    //     const code = BFS_INFO.queue[i];
    //     const chunk = code >> 2;
    //     const faceId = code & 3;

    //     const cz = Math.floor(chunk / (BFS_INFO.nx * BFS_INFO.ny));
    //     const cxy = chunk % (BFS_INFO.nx * BFS_INFO.ny);
    //     const cy = Math.floor(cxy / BFS_INFO.nx);
    //     const cx = cxy % BFS_INFO.nx;

    //     const D = FACE_CENTER[faceId];

    //     setColor(3 * chunk + faceId);

    //     debugText.text3D(
    //         state.camera.viewProjection,
    //         i + '',
    //         vec3.fromValues(D[0] + (cx - 1) * CHUNK_SIZE, D[1] + (cy - 1) * CHUNK_SIZE, D[2] + (cz - 1) * CHUNK_SIZE), {
    //             size: 2,
    //             color: [red, white, white],
    //         });
    // }
  };
}
