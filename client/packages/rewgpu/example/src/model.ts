import { mat4, quat, vec3 } from 'gl-matrix';
import { createREWGPU } from '@box/rewgpu';
import {
  migrateModel,
  ModelMetaData,
  getModelMetaData,
  bodyPartBytesToSchema,
  modelV5,
} from '@box/voxa-project';
import { MeshTextureSchema } from '@box/mesher/schema';
import { unpackTextureData, unpackMeshData } from '@box/mesher';
import { ContentResolver } from '@box/content-server/content-fetch';
import {
  MuStruct,
  MuUint32,
  MuBoolean,
  MuInt32,
  MuDictionary,
  MuFloat64,
  MuArray,
  MuSchema,
  MuUTF8,
  MuVarint,
  MuFloat32,
  MuASCII,
  MuOption,
} from '@box/mudb/schema';
import {
  Mat3Schema,
  Mat4Schema,
  QuatSchema,
  Vec2Schema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { getCameraPosition, getCameraTarget } from './util';

export const NodeInfoSchema = new MuStruct({
  /**
   * 父节点索引值
   */
  parent: new MuInt32(-1),
  translate: Vec3Schema,
  rotation: QuatSchema,
  alpha: new MuFloat32(1),
});

export const NodesInfoSchema = new MuArray(NodeInfoSchema, Infinity);

type ModelData = typeof modelV5.ModelDataV5Schema.identity;
type ModelNodes = Pick<ModelData, 'nodes'>['nodes'];
type ModelTexture = Pick<ModelData, 'texture'>['texture'];
type ModelMeshes = Pick<ModelData, 'meshes'>['meshes'];

/**
 * 生成GLMeshSchema所需要的数据
 */
interface Meshes {
  /**
   * 最高点和最低点数据
   * 从voxa导出的模型中心点的偏移都会在nodesInfo的信息中做处理
   * voxa导出的模型文件最低点为0，最高点为bounds
   * 皮肤是单部件，需要输入单个部件体素坐标的最低点与最高点
   */

  /**
   * 最低点x
   */
  lox: number;
  /**
   * 最低点y
   */
  loy: number;
  /**
   * 最低点z
   */
  loz: number;
  /**
   * 最高点x
   */
  hix: number;
  /**
   * 最高点y
   */
  hiy: number;
  /**
   * 最高点z
   */
  hiz: number;
  /**
   * 贴图数据
   */
  texture: typeof MeshTextureSchema.identity;
  /**
   * 顶点数据
   */
  meshData: Uint8Array;
  /**
   * uv数据
   */
  uvData: Uint8Array | Uint16Array;
  /**
   * 顶点数量
   */
  count: number;
  /**
   * 当部件为多部件时，每个顶点对应的多部件索引值
   * 选填，默认为单部件
   */
  idxData: Uint8Array | Uint16Array;
  /**
   * 当部件为多部件时，每个部件索引值对应的信息，包含偏移信息和透明度信息
   * 选填，默认为单部件
   */
  nodesInfo: typeof NodesInfoSchema.identity;

  // /**
  //  * 当部件为多部件且有动画时，需要获取其动画信息
  //  * 选填，默认为无动画
  //  */
  // animations?: typeof AnimationsSchema.identity;

  /**
   * 静态模型是否为透明模型。
   * 多部件时，只要有一个部件透明度不为1，即视为透明模型
   * 选填，默认为否
   */
  staticIsTransparent: boolean;
}

const MAT4_IDENTITY = mat4.identity(mat4.create());

function ceilPowerOfTwo(value: number) {
  return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}

const content = new ContentResolver({
  cdnPath: '',
  ossCdnURL: 'https://assets.box3.fun',
  cacheIPFS: false,
});

export async function loadGLMesh(
  modelHash: string,
): Promise<Meshes | undefined> {
  try {
    const value = await content.retrieveFromS3(modelHash);
    if (!value) {
      console.error(`error retrieving voxel model from s3 ${modelHash}.`);
      return;
    }
    const metaData = getModelMetaData(modelHash, new Uint8Array(value));
    if (!metaData) {
      console.error(`error generate model metadata from s3 ${modelHash}.`);
      return;
    }
    const glMesh = await retrieveModelData(modelHash, metaData);
    return glMesh;
  } catch (err) {
    console.error(`error request model ${modelHash}, ${err}`);
    return;
  }
}

async function retrieveModelData(modelHash: string, metaData: ModelMetaData) {
  // const regl = state.gl.regl;
  // if (!regl) {
  //   return;
  // }
  try {
    const value = await content.retrieveFromS3(metaData.dataHash);
    if (!value) {
      console.error(
        `error retrieving model data from meta dataHash ${metaData.dataHash}.`,
      );
      return;
    }
    const bytes = new Uint8Array(value);
    const data = await migrateModel(bytes);
    if (!data) {
      console.error(`migrate model error ${metaData.dataHash}`);
      return;
    }
    // meshes长度为0表示没有体素，不需要渲染
    if (!data.meshes.length) {
      return;
    }

    // 解析多部件数据
    const { meshData, uvData, count, idxData, nodesInfo, staticIsTransparent } =
      parseModelNodes(data.nodes, data.texture, data.meshes);

    // // 解析动画数据
    // const animations = data.animations.map((animation, idx) => {
    //   return parseModelAnimation(
    //     animation,
    //     data.nodes,
    //     metaData.motionList ? metaData.motionList[idx] : undefined,
    //   );
    // });

    // const glMesh = createMesh(modelHash, {
    //   lox: 0,
    //   loy: 0,
    //   loz: 0,
    //   hix: metaData.bounds[0],
    //   hiy: metaData.bounds[1],
    //   hiz: metaData.bounds[2],
    //   texture: data.texture,
    //   meshData,
    //   uvData,
    //   count,
    //   idxData,
    //   nodesInfo,
    //   // animations,
    //   staticIsTransparent,
    // });
    // state.modelCache.modelSize[modelHash] = bytes.byteLength;

    return {
      lox: 0,
      loy: 0,
      loz: 0,
      hix: metaData.bounds[0],
      hiy: metaData.bounds[1],
      hiz: metaData.bounds[2],
      texture: data.texture,
      meshData,
      uvData,
      count,
      idxData,
      nodesInfo,
      // animations,
      staticIsTransparent,
    };
  } catch (err) {
    console.error(
      `error request model data from meta dataHash ${metaData.dataHash}, ${err}`,
    );
    return;
  }
}

function parseModelNodes(
  nodes: ModelNodes,
  texture: ModelTexture,
  meshes: ModelMeshes,
): Pick<
  Meshes,
  | 'texture'
  | 'meshData'
  | 'uvData'
  | 'count'
  | 'idxData'
  | 'nodesInfo'
  | 'staticIsTransparent'
> {
  const nodesInfo: typeof NodesInfoSchema.identity = [];

  let staticIsTransparent = false;

  // 数组索引值为node的索引值
  // 数组元素为node对应的mesh索引值
  const nodeMeshIdx: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (nodesInfo[i]) {
      nodesInfo[i].alpha = node.alpha;
      nodesInfo[i].translate = Vec3Schema.clone(node.translation);
      nodesInfo[i].rotation = QuatSchema.clone(node.rotation);
    } else {
      nodesInfo[i] = {
        parent: -1,
        translate: Vec3Schema.clone(node.translation),
        rotation: QuatSchema.clone(node.rotation),
        alpha: node.alpha,
      };
    }

    // 只要有一个部件透明度不为1，就需要整体在透明的渲染队列里渲染
    if (node.alpha !== 1 && !staticIsTransparent) {
      staticIsTransparent = true;
    }

    if (node.children) {
      node.children.forEach((childId) => {
        const newNodeInfo = NodeInfoSchema.alloc();
        newNodeInfo.parent = i;
        nodesInfo[childId] = newNodeInfo;
      });
    }

    nodeMeshIdx.push(node.mesh);
  }

  let meshData = new Uint8Array();

  const IdxDataType = nodes.length > 255 ? Uint16Array : Uint8Array;
  let idxData = new IdxDataType();

  const UvDataType = getUvDataType(texture);
  let uvData = new UvDataType();

  let count: number = 0;

  nodeMeshIdx.forEach((meshIdx, nodeIdx) => {
    if (meshIdx < 0) {
      return;
    }
    const unpackData = unpackMeshData(meshes[meshIdx], Uint8Array, UvDataType);

    const newIndexData = new IdxDataType(unpackData.meshData.length / 4);
    newIndexData.fill(nodeIdx);

    count += unpackData.count;

    meshData = addBuffer(
      meshData.buffer,
      unpackData.meshData.buffer,
      Uint8Array,
    );

    idxData = addBuffer(idxData.buffer, newIndexData.buffer, IdxDataType);

    uvData = addBuffer(uvData.buffer, unpackData.uvData.buffer, UvDataType);
  });
  return {
    texture,
    meshData,
    uvData,
    count,
    idxData,
    nodesInfo,
    staticIsTransparent,
  };
}

function getUvDataType(texture: typeof MeshTextureSchema.identity) {
  const { width } = texture;
  const height = texture.data.length / width;
  return Math.max(width, height) > 255 ? Uint16Array : Uint8Array;
}

function addBuffer<
  R extends Uint16Array | Uint8Array | Float32Array,
  T extends new (...param: any[]) => R,
>(originBuffer: ArrayBufferLike, newBuffer: ArrayBufferLike, TypeArray: T): R {
  const originData = new TypeArray(originBuffer);
  const newData = new TypeArray(newBuffer);
  const newArray = new TypeArray(originData.length + newData.length);
  newArray.set(originData);
  newArray.set(newData, originData.length);
  return newArray;
}

export async function createMesh(canvas: HTMLCanvasElement, meshes: Meshes) {
  const rewgpu = await createREWGPU(canvas);
  if (!rewgpu) {
    return;
  }
  console.log('hash meshes', meshes);
  const {
    lox,
    loy,
    loz,
    hix,
    hiy,
    hiz,
    texture,
    meshData,
    uvData,
    count,
    idxData,
    nodesInfo,
    // animations: optionalAnimations,
    staticIsTransparent = false,
  } = meshes;

  // result.staticIsTransparent = staticIsTransparent;

  const { width } = texture;
  const height = texture.data.length / width;

  const textureBuffer = rewgpu.texture({
    size: [width, height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING,
    data: unpackTextureData(texture, [24, 16, 8, 0]),
    dataLayout: { bytesPerRow: width * 4 },
  });

  const sampler = rewgpu.sampler();

  const meshVerts = rewgpu.buffer({
    data: meshData,
    size: meshData.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const newIdx = new Uint32Array(idxData.length);
  for (let i = 0; i < newIdx.length; i++) {
    newIdx[i] = idxData[i];
  }

  const meshIdx = rewgpu.buffer({
    data: newIdx,
    size: newIdx.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const newUvData = new Float32Array(uvData.length);
  for (let i = 0; i < newUvData.length; i += 2) {
    newUvData[i] = uvData[i] / width;
    newUvData[i + 1] = uvData[i + 1] / height;
  }

  const uvBuffer = rewgpu.buffer({
    data: newUvData,
    size: newUvData.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  function initQuad(buffer: Uint32Array) {
    for (let i = 0, ptr = 0; ptr < buffer.length; i += 4) {
      buffer[ptr++] = i;
      buffer[ptr++] = i + 1;
      buffer[ptr++] = i + 2;
      buffer[ptr++] = i + 2;
      buffer[ptr++] = i + 1;
      buffer[ptr++] = i + 3;
    }
    return buffer;
  }
  const BIG_ELEMENT_SIZE = 3 << 20;
  const quadIdx = initQuad(new Uint32Array(BIG_ELEMENT_SIZE));
  const quadIdxBuffer = rewgpu.buffer({
    data: quadIdx,
    size: quadIdx.byteLength,
    usage: GPUBufferUsage.INDEX,
  });

  const matrixData = new Float32Array(nodesInfo.length * 16);

  const nodesMatrix: mat4[] = [];
  for (let i = 0; i < nodesInfo.length; i++) {
    const info = nodesInfo[i];
    const currMatrix = mat4.fromRotationTranslation(
      mat4.create(),
      info.rotation,
      info.translate,
    );
    if (info.parent > -1) {
      mat4.mul(currMatrix, nodesMatrix[info.parent], currMatrix);
    }
    nodesMatrix.push(currMatrix);

    matrixData.set(currMatrix, i * 16);
    // // 按照RGBA的规则给图片数据赋值，前三位为空，第四位放置透明度数据
    // out.alphaData.set([0, 0, 0, Math.round(info.alpha * 255)], i * 4);
  }

  const matrixDataBuffer = rewgpu.buffer({
    data: matrixData,
    size: matrixData.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  const matrixBuffer = new Float32Array(3 * 16);
  const model = matrixBuffer.subarray(0, 16);
  const view = matrixBuffer.subarray(16, 32);
  const projection = matrixBuffer.subarray(32, 48);
  mat4.perspective(
    projection,
    Math.PI / 4,
    canvas.width / canvas.height,
    1,
    1024,
  );
  const target = getCameraTarget([hix, hiy, hiz], [0, 0, 0]);
  const eye = getCameraPosition([hix, hiy, hiz], [0, 0, 0], target);
  mat4.lookAt(view, eye, target, [0, 1, 0]);
  mat4.identity(model);
  const pivot = vec3.negate(vec3.create(), target);
  const q = quat.create();
  const TEMP_POS = vec3.create();
  const uniformBuffer = rewgpu.buffer({
    data: matrixBuffer,
    size: matrixBuffer.byteLength,
    usage: GPUBufferUsage.UNIFORM,
    isDynamic: true,
  });

  const pipeline = rewgpu.createPipeline({
    struct: `
    struct Camera {
      model: mat4x4<f32>,
      view: mat4x4<f32>,
      proj: mat4x4<f32>,
    }

    @binding(0) @group(0) var<uniform> camera : Camera;
    @group(0) @binding(1) var ourSampler: sampler;
    @group(0) @binding(2) var ourTexture: texture_2d<f32>;

    struct Matrix {
      model: mat4x4<f32>,
    }

    @group(0) @binding(3) var<storage, read> nodesMatrix: array<Matrix>;

    struct VertexShaderOutput {
      @builtin(position) position: vec4f,
      @location(0) texcoord: vec2f,
    };`,
    frag: {
      content: `
      fn fragMain(fsInput: VertexShaderOutput) -> @location(0) vec4<f32> {
        return textureSample(ourTexture, ourSampler, fsInput.texcoord);
      }`,
      entryPoint: 'fragMain',
    },
    vert: {
      content: `
      fn vertMain(
        @location(0) meshPosition : vec4f,
        @location(1) idx: u32,
        @location(2) uv: vec2<f32>,
        ) -> VertexShaderOutput {
          var vsOutput: VertexShaderOutput;
          vsOutput.position = camera.proj * camera.view * camera.model * nodesMatrix[idx].model * vec4<f32>(meshPosition.xyz * 255., 1.0);
          vsOutput.texcoord = uv;
          return vsOutput;
        }`,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 4 * 1,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'unorm8x4',
            },
          ],
        },
        {
          arrayStride: 1 * 4,
          attributes: [
            {
              shaderLocation: 1,
              offset: 0,
              format: 'uint32',
            },
          ],
        },
        {
          arrayStride: 2 * 4,
          attributes: [
            {
              shaderLocation: 2,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const layout = pipeline.getBindGroupLayout(0);

  const group = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: uniformBuffer,
      },
      {
        binding: 1,
        resource: sampler,
      },
      {
        binding: 2,
        resource: textureBuffer,
      },
      {
        binding: 3,
        resource: matrixDataBuffer,
      },
    ],
    layout,
  });

  const command = rewgpu.createCommand({
    pipeline,
    count,
    vertBuffers: [meshVerts, meshIdx, uvBuffer],
    groups: [group],
    indexBuffer: {
      reBuffer: quadIdxBuffer,
      indexFormat: 'uint32',
    },
  });

  let depthTextureBuffer = rewgpu.texture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const resizeObserver = new ResizeObserver(() => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.max(
      1,
      Math.min(width, rewgpu.config.device.limits.maxTextureDimension2D),
    );
    canvas.height = Math.max(
      1,
      Math.min(height, rewgpu.config.device.limits.maxTextureDimension2D),
    );

    mat4.perspective(
      projection,
      Math.PI / 4,
      canvas.width / canvas.height,
      1,
      1024,
    );

    depthTextureBuffer.destroy();
    depthTextureBuffer = rewgpu.texture({
      size: [canvas.width, canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  });

  resizeObserver.observe(canvas);

  function frame(tick: number) {
    if (!rewgpu || !depthTextureBuffer.texture) {
      return;
    }
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: rewgpu.context.getCurrentTexture().createView(),
          clearValue: { r: 0.3, g: 0.25, b: 0.4, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depthTextureBuffer.texture.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    };
    quat.identity(q);
    quat.rotateY(q, q, 0.001 * tick);
    vec3.transformQuat(TEMP_POS, pivot, q);
    vec3.add(TEMP_POS, TEMP_POS, target);
    mat4.fromRotationTranslation(model, q, TEMP_POS);
    rewgpu.render(renderPassDescriptor, command);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
