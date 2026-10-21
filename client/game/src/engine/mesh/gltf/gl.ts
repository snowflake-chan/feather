import { vec3 } from 'gl-matrix';
import REGL from 'regl';
import { GLMeshSchema } from '../gl-controller/gl-mesh-schema';
import { setTextureData } from '../parse/model-animation';
import type { ParsedGLTFMesh } from './interfaces';
import { AnimationsSchema, NodesInfoSchema } from '../parse/mesh-schema';
import type { GameClientState } from 'src/engine/game-client-schema';
import type { MeshRenderable } from '../renderable-schema';
import { ceilPowerOfTwo } from '../util';

/**
 * 从GLTF到GLMesh
 */
export function parseGLTFToGLMesh(
  state: GameClientState,
  regl: REGL.Regl,
  parsedGLTF: ParsedGLTFMesh,
  modelHash: string,
): MeshRenderable {
  const {
    lox,
    loy,
    loz,
    hix,
    hiy,
    hiz,
    textures,
    // 这里会和体素的不同，
    meshData,
    uvData,
    idxData,
    // GLTF独有的
    indicesData,
    normalData,
    // 应该是各个节点的count总和
    count,
    nodesInfo,
  } = parsedGLTF;

  const mesh = GLMeshSchema.alloc();

  // TODO 暂时没有透明的gltf模型
  mesh.staticIsTransparent = false;

  // 在gltf中，uv有可能已经是Normalized，此时就不需要用uv去除以这个shape了
  mesh.textureShape[0] = 1;
  mesh.textureShape[1] = 1;

  mesh.lox = lox;
  mesh.loy = loy;
  mesh.loz = loz;
  mesh.hix = hix;
  mesh.hiy = hiy;
  mesh.hiz = hiz;

  mesh.nodesInfo = NodesInfoSchema.clone(nodesInfo);
  mesh.animations = AnimationsSchema.clone([]);

  // 这个是啥
  mesh.staticNodesMatrix = [];

  // 没有锚点
  vec3.set(mesh.renderBoxOffset, 0, 0, 0);

  const elements = regl.elements(indicesData);

  // 暂时只考虑只有一个texture的情况
  mesh.texture = regl.texture(textures[0]);

  // 一个像素点记录四个数字，四个像素点一组记录一个mat4

  // nodesInfo.length个节点就起码需要 nodesInfo.length * 4个像素点记录偏移矩阵
  // 开方表示换算成size * size尺寸的图片

  let matrixSize = Math.sqrt(nodesInfo.length * 4);
  // size需要取2的次幂，4的倍数，保证16个数字信息在同一行里
  matrixSize = ceilPowerOfTwo(matrixSize);
  // 尺寸最小为4
  matrixSize = Math.max(matrixSize, 4);
  mesh.matrixTextureSize = matrixSize;

  // 透明度texture需要与节点数量相等的像素点
  let alphaSize = Math.sqrt(nodesInfo.length);
  alphaSize = ceilPowerOfTwo(alphaSize);
  alphaSize = Math.max(alphaSize, 2);
  mesh.alphaTextureSize = alphaSize;

  // 一个像素点4个数字，一共可记录 size * size * 4个数字
  const staticMatrixData = new Float32Array(matrixSize * matrixSize * 4);
  const staticAlphaData = new Uint8Array(alphaSize * alphaSize * 4);

  setTextureData(
    {
      matrixData: staticMatrixData,
      alphaData: staticAlphaData,
    },
    nodesInfo,
  );

  mesh.staticMatrixTexture = regl.texture({
    data: staticMatrixData,
    width: matrixSize,
    height: matrixSize,
  });

  mesh.staticAlphaTexture = regl.texture({
    data: staticAlphaData,
    width: alphaSize,
    height: alphaSize,
  });

  mesh.meshBuffer = regl.buffer(meshData);
  mesh.uvBuffer = regl.buffer(uvData);
  mesh.idxBuffer = regl.buffer(idxData);

  mesh.s0.buffer = mesh.meshBuffer;
  mesh.s0.offset = 0;
  mesh.s0.stride = 4 * 4;
  mesh.s0.size = 4;
  mesh.s0.divisor = 0;
  mesh.s0.normalize = false;

  mesh.s1.buffer = mesh.idxBuffer;
  mesh.s1.offset = 0;
  mesh.s1.stride = 2;
  mesh.s1.size = 1;
  mesh.s1.divisor = 0;
  mesh.s1.normalize = false;

  mesh.uv.buffer = mesh.uvBuffer;
  mesh.uv.offset = 0;
  mesh.uv.stride = 4 * 2;
  mesh.uv.size = 2;
  mesh.uv.divisor = 0;
  mesh.uv.normalize = false;

  // GLTF独有
  mesh.normalsBuffer = regl.buffer(normalData);
  mesh.normals.buffer = mesh.normalsBuffer;
  mesh.normals.offset = 0;
  mesh.normals.stride = 4 * 3;
  mesh.normals.size = 3;
  mesh.normals.divisor = 0;
  mesh.normals.normalize = false;

  mesh.vao = regl.vao({
    attributes: [mesh.s0, mesh.s1, mesh.uv, mesh.normals],
    elements,
    count,
    offset: 0,
    instances: -1,
    primitive: 'triangles',
  });

  mesh.isGLTF = true;

  state.modelCache.modelIndex[modelHash] = mesh;
  state.modelCache.glCache.push(mesh);

  return mesh;
}
