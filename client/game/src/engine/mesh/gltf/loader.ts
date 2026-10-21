import { mat3, quat, vec3 } from 'gl-matrix';
import { MuReadStream } from '@box/mudb/stream';
import {
  ACCESSOR_TYPE_TO_NUM,
  AccessorComponentType,
  GLTF,
  GLTFMeshPrimitive,
  GLTFNode,
  GLTFNodes,
  ParsedGLTFMesh,
} from './interfaces';
import { NodeInfoSchema } from '../parse/mesh-schema';
import { addBuffer, NodeInfo } from '../parse/mesh-controller';
import { GLTFBinaryExtension } from './binary-extension';

export class GLTFLoader {
  private glbExtension?: GLTFBinaryExtension;

  private gltf?: GLTF;

  /**
   * 记录当前有效的nodeInfo索引
   * 只有存在mesh数据的节点的nodeInfo，才会计数
   */
  private idxDataCount = 0;

  private posMin: vec3 = [0, 0, 0];
  private posMax: vec3 = [0, 0, 0];

  private loading: Promise<void> | undefined;

  private list: (() => Promise<void>)[] = [];

  /**
   * 添加GLB加载解析任务
   * - 在WebGL中出现奇怪的情况，如果在同一帧内生成多个GLTFMesh，会出错
   *   - GL_INVALID_OPERATION: Vertex buffer is not big enough for the draw call.
   *   - GL_INVALID_OPERATION: insufficient buffer size.
   * - 检测过数据以及regl内部，暂未排查到问题
   * - 只要不是同一帧生成就不会有问题
   * - WebGPU一直正常
   * - 因此先用异步的方式错开解析
   */
  public async addLoadingGLB(arrayBuffer: ArrayBuffer) {
    return new Promise<ParsedGLTFMesh | undefined>((resolve) => {
      const task = async () => {
        resolve(await this.loadGLB(arrayBuffer));
      };

      this.list.push(task);

      this.queue();
    });
  }

  private queue = () => {
    if (this.loading) {
      return;
    }

    const task = this.list.shift();

    if (!task) {
      return;
    }

    this.loading = task().then(() => {
      this.loading = undefined;
      this.queue();
    });
  };

  private async loadGLB(arrayBuffer: ArrayBuffer) {
    let parsedGLTFMesh: ParsedGLTFMesh | undefined;

    try {
      this.glbExtension = new GLTFBinaryExtension(arrayBuffer);

      // 目前只处理content和body都存在，才继续处理
      if (this.glbExtension.content && this.glbExtension.body) {
        const gltf = JSON.parse(this.glbExtension.content);

        this.gltf = gltf;

        parsedGLTFMesh = await this.loadGLTF(gltf);
      } else {
        console.error(
          `Missing data in GLB, typeof content: ${typeof this.glbExtension
            .content}; typeof body: ${this.glbExtension.body}`,
        );
      }
    } catch (err) {
      console.error('Failed to load GLB', err);
    }

    this.gltf = undefined;
    this.glbExtension = undefined;

    return parsedGLTFMesh;
  }

  /**
   * TODO 记录一下目前的局限性
   * - scenes只会解析一个，只解析scene指向的节点
   */
  public async loadGLTF(gltf: GLTF) {
    const { scene, scenes, nodes } = gltf;

    // 从scene节点开始检索
    const sceneSpec = scenes[scene];

    const out: ParsedGLTFMesh = {
      meshData: new Float32Array(),
      uvData: new Float32Array(),
      idxData: new Uint16Array(),
      indicesData: new Uint16Array(),
      nodesInfo: [],
      // textures能否合并，存疑
      textures: [],
      normalData: new Float32Array(),
      /**
       * 要记录各个节点的count总和
       */
      count: 0,
      // 直接从positions的min和max读取出来，按照规格文档，POSITIONS一定会有min和max
      lox: 0,
      loy: 0,
      loz: 0,
      hix: 0,
      hiy: 0,
      hiz: 0,
    };

    // 先构造一个scene节点的NodeInfo
    const nodeInfo = NodeInfoSchema.alloc();

    this.updateNodeInfo(nodeInfo, {}, -1);

    out.nodesInfo.push(nodeInfo);

    vec3.set(this.posMin, Infinity, Infinity, Infinity);
    vec3.set(this.posMax, -Infinity, -Infinity, -Infinity);

    this.idxDataCount = 0;

    await this.loadNodes(out, sceneSpec.nodes, nodes, 0);

    out.lox = this.posMin[0];
    out.loy = this.posMin[1];
    out.loz = this.posMin[2];
    out.hix = this.posMax[0];
    out.hiy = this.posMax[1];
    out.hiz = this.posMax[2];

    return out;
  }

  private async loadNodes(
    out: ParsedGLTFMesh,
    nodeList: number[],
    nodes: GLTFNodes,
    parentIdx: number,
  ) {
    if (!this.gltf) {
      console.error('[loadNodes] Missing GLTF.');
      return;
    }

    for (let i = 0; i < nodeList.length; i++) {
      const nodeIdx = nodeList[i];

      const nodeSpec = nodes[nodeIdx];

      // 先解析节点RTS信息
      const nodeInfo = NodeInfoSchema.alloc();
      this.updateNodeInfo(nodeInfo, nodeSpec, parentIdx);

      out.nodesInfo.push(nodeInfo);

      // 解析Mesh信息
      if (typeof nodeSpec.mesh !== 'undefined') {
        await this.accessMesh(out, nodeSpec.mesh, this.gltf);
      }

      if (nodeSpec.children) {
        await this.loadNodes(
          out,
          nodeSpec.children,
          nodes,
          out.nodesInfo.length,
        );
      }
    }
  }

  private updateNodeInfo(
    out: NodeInfo,
    node: Pick<GLTFNode, 'matrix' | 'rotation' | 'translation' | 'scale'>,
    parent: number,
  ) {
    out.parent = parent;

    // TODO 从matrix中解析
    if (node.matrix) {
      console.warn('[updateNodeInfo] node.matrix is not supported yet');
    }

    if (node.rotation) {
      quat.copy(out.rotation, node.rotation);
    } else {
      quat.identity(out.rotation);
    }

    if (node.translation) {
      vec3.copy(out.translate, node.translation);
    } else {
      vec3.zero(out.translate);
    }

    if (node.scale) {
      vec3.copy(out.scale, node.scale);
    } else {
      vec3.copy(out.scale, [1, 1, 1]);
    }

    // TODO 这个是自定义的透明概念，需要从GLTF的其他数据解析出来
    out.alpha = 1;
    // 这个是为了单轴缩放自定义的值，一般gltf不会有
    mat3.identity(out.parentScaleMat3);
  }

  private async accessMesh(
    out: ParsedGLTFMesh,
    mesh: number,
    spec: Pick<GLTF, 'meshes' | 'accessors' | 'bufferViews' | 'buffers'>,
  ) {
    if (!this.gltf) {
      console.error('[accessMesh] missing GLTF');
      return;
    }

    const meshSpec = spec.meshes[mesh];

    // TODO 当前只支持解析首个primitive（子网格）
    const [primitiveSpec] = meshSpec.primitives;

    if (meshSpec.primitives.length > 1) {
      console.warn('[accessMesh] multi primitives is not supported yet');
    }

    // 处理position，转成meshData
    const positions = this.accessBufferByAccessor(
      primitiveSpec.attributes.POSITION,
      this.gltf,
      true,
    );
    out.meshData = addBuffer(
      out.meshData.buffer,
      new Float32Array(positions).buffer,
      Float32Array,
    );

    const positionLength = positions.length / 4;
    // 构造等长的idxData，用于在shader中索引nodesInfo
    const idxBuffer = new Uint16Array(positionLength);
    idxBuffer.fill(this.idxDataCount);
    out.idxData = addBuffer(out.idxData.buffer, idxBuffer.buffer, Uint16Array);

    // 增加idx计数
    this.idxDataCount++;

    // 处理indices（elements）
    if (typeof primitiveSpec.indices !== 'undefined') {
      const indices = this.accessBufferByAccessor(
        primitiveSpec.indices,
        this.gltf,
      );
      out.indicesData = addBuffer(
        out.indicesData.buffer,
        new Uint16Array(indices).buffer,
        Uint16Array,
      );

      out.count += indices.length;
    } else {
      out.count += positionLength;
    }

    if (typeof primitiveSpec.attributes.NORMAL !== 'undefined') {
      const normals = await this.accessBufferByAccessor(
        primitiveSpec.attributes.NORMAL,
        spec,
      );

      out.normalData = addBuffer(
        out.normalData.buffer,
        new Float32Array(normals).buffer,
        Float32Array,
      );
    }

    // 处理material
    if (typeof primitiveSpec.material !== 'undefined') {
      const { imageBitmap, texCoords } = await this.accessMaterial(
        primitiveSpec.material,
        primitiveSpec,
        this.gltf,
      );

      if (!texCoords) {
        throw new Error('[accessMesh] Failed to get texCoords');
      }

      out.textures.push(imageBitmap);

      out.uvData = addBuffer(
        out.uvData.buffer,
        new Float32Array(texCoords).buffer,
        Float32Array,
      );
    }
  }

  private accessBufferByAccessor(
    accessor: number,
    spec: Pick<GLTF, 'accessors' | 'bufferViews' | 'buffers'>,
    isPosition = false,
  ) {
    if (!this.gltf) {
      throw new Error('[accessBufferByAccessor] missing GLTF');
    }

    const accessorSpec = spec.accessors[accessor];

    const { byteOffset, bufferView, componentType, type, min, max } =
      accessorSpec;

    // see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes-overview
    if (isPosition) {
      if (!isVec3(min) || !isVec3(max)) {
        throw new Error(
          `[accessBufferByAccessor] Missing min: ${
            typeof min === 'undefined'
          } or max: ${typeof max === 'undefined'} in POSITION`,
        );
      }

      vec3.min(this.posMin, this.posMin, min);
      vec3.max(this.posMax, this.posMax, max);
    }

    const arrayBuffer = this.accessBuffer(bufferView, this.gltf, byteOffset);

    if (!arrayBuffer) {
      throw new Error('[accessBufferByAccessor] Failed to get arrayBuffer');
    }

    // type决定了每个数据的类型
    const elementLength = ACCESSOR_TYPE_TO_NUM[type];

    const out: number[] = [];

    const readStream = new MuReadStream(new Uint8Array(arrayBuffer));

    let readComponent: () => void;

    switch (componentType) {
      case AccessorComponentType.Byte:
        readComponent = () => {
          out.push(readStream.readInt8());
        };
        break;
      case AccessorComponentType.UnsignedByte:
        readComponent = () => {
          out.push(readStream.readUint8());
        };
        break;
      case AccessorComponentType.Short:
        readComponent = () => {
          out.push(readStream.readInt16());
        };
        break;
      case AccessorComponentType.UnsignedShort:
        readComponent = () => {
          out.push(readStream.readUint16());
        };
        break;
      case AccessorComponentType.UnsignedInt:
        readComponent = () => {
          out.push(readStream.readUint32());
        };
        break;
      case AccessorComponentType.Float:
        readComponent = () => {
          out.push(readStream.readFloat32());
        };
        break;
    }

    const readElement = isPosition
      ? () => {
          for (let i = 0; i < elementLength; i++) {
            readComponent();
          }

          // position按照vec4填充
          out.push(0);
        }
      : () => {
          for (let i = 0; i < elementLength; i++) {
            readComponent();
          }
        };

    while (readStream.offset < arrayBuffer.byteLength) {
      readElement();
    }

    return out;
  }

  private accessBuffer(
    bufferView: number,
    spec: Pick<GLTF, 'bufferViews' | 'buffers'>,
    accessorByteOffset = 0,
  ) {
    if (!this.glbExtension || !this.glbExtension.body) {
      console.error('[accessBuffer] missing GLB or body of GLB');
      return;
    }
    const bufferViewSpec = spec.bufferViews[bufferView];

    const byteOffset = accessorByteOffset + bufferViewSpec.byteOffset;

    const bufferSpec = spec.buffers[bufferViewSpec.buffer];

    // uri不存在，直接从glbExtension.body中取
    if (bufferSpec.uri) {
      // TODO 从uri中加载先不处理
      throw new Error(
        `[accessBuffer] load buffer by uri is not supported yet, uri: ${bufferSpec.uri}`,
      );
    }

    return this.glbExtension.body.slice(
      byteOffset,
      byteOffset + bufferViewSpec.byteLength,
    );
  }

  private async accessMaterial(
    material: number,
    primitive: GLTFMeshPrimitive,
    spec: GLTF,
  ) {
    if (!spec.materials) {
      throw new Error('[accessMaterial] Missing materials in GLTF');
    }

    const materialSpec = spec.materials[material];

    const { pbrMetallicRoughness, emissiveTexture } = materialSpec;

    let textureIdx: number;
    let texCoordIdx: number;

    if (
      typeof pbrMetallicRoughness !== 'undefined' &&
      typeof pbrMetallicRoughness.baseColorTexture !== 'undefined'
    ) {
      textureIdx = pbrMetallicRoughness.baseColorTexture.index;
      texCoordIdx = pbrMetallicRoughness.baseColorTexture.texCoord || 0;
    } else if (typeof emissiveTexture !== 'undefined') {
      textureIdx = emissiveTexture.index;
      texCoordIdx = emissiveTexture.texCoord || 0;
    } else {
      throw new Error(
        `
          [accessMaterial] Missing valid textureInfo
          baseColorTexture: ${typeof pbrMetallicRoughness?.baseColorTexture},
          emissiveTexture: ${typeof pbrMetallicRoughness?.baseColorTexture},
        `,
      );
    }

    const imageBitmap = await this.accessTexture(textureIdx, spec);

    const texCoordAttribute = `TEXCOORD_${texCoordIdx}`;

    const texCoords = this.accessBufferByAccessor(
      primitive.attributes[texCoordAttribute],
      spec,
    );

    return {
      imageBitmap,
      texCoords,
    };
  }

  private async accessTexture(texture: number, spec: GLTF) {
    if (!spec.textures) {
      throw new Error('[accessTexture] Missing textures in GLTF');
    }

    const textureSpec = spec.textures[texture];

    // TODO 目前只支持处理source
    if (typeof textureSpec.source === 'undefined') {
      throw new Error('[accessTexture] Missing source in texture');
    }

    const imageBitmap = await this.accessImage(textureSpec.source, spec);

    // TODO sampler还没处理

    return imageBitmap;
  }

  private async accessImage(image: number, spec: GLTF) {
    if (!spec.images) {
      throw new Error('[accessImage] Missing images in GLTF');
    }

    const imageSpec = spec.images[image];

    // TODO 目前只支持处理bufferView
    if (typeof imageSpec.bufferView === 'undefined') {
      throw new Error('[accessImage] Missing bufferView in image');
    }

    const arrayBuffer = this.accessBuffer(imageSpec.bufferView, spec);

    if (!arrayBuffer) {
      throw new Error('[accessImage] Cannot get arrayBuffer');
    }

    const blob = new Blob([arrayBuffer], { type: imageSpec.mimeType });

    return createImageBitmap(blob);
  }
}

function isVec3(val: any): val is vec3 {
  return Array.isArray(val) && val.length === 3;
}
