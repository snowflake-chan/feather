import { Stream } from 'stream';
import ndarray from 'ndarray';
import savePixels from 'save-pixels';
import {
  Mesher,
  textureToMeshTexture,
  unpackMeshData,
  unpackTextureData,
} from './index';
import { MeshTextureSchema } from 'schema';

export interface GLTFNode {
  name?: string;
  mesh?: number;
  alpha?: number;
  rotation?: number[];
  scale?: number[];
  translation?: number[];
  children?: number[];
}

function getMeshDataSizes(meshData: ReturnType<typeof unpackMeshData>) {
  const positionSize = (meshData.meshData.length / 4) * 3 * 4;
  const texcoordSize = meshData.uvData.length * 4;
  const vertexCount = positionSize / 3;
  const indexSize =
    meshData.count * (vertexCount > 0x10000 ? 4 : vertexCount > 0x100 ? 2 : 1);
  return {
    positionSize,
    texcoordSize,
    indexSize,
  };
}

function readStream(stream: Stream) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function generatePNG(
  texture: typeof MeshTextureSchema.identity,
  channels: number[],
) {
  const image = ndarray(
    unpackTextureData(texture, channels),
    [texture.width, texture.data.length / texture.width, channels.length],
    [channels.length, channels.length * texture.width, 1],
  );
  return readStream(savePixels(image, 'png'));
}

function roundUp4Diff(a: number) {
  return (4 - (a & 3)) & 3;
}

function pick<T extends Object, U extends keyof T>(o: T, keys: U[]) {
  const obj = {} as Pick<T, U>;
  for (const key of keys) {
    if (key in o) {
      obj[key] = o[key];
    }
  }
  return obj;
}

export async function exportToGLTF(
  name: string,
  mesher: Mesher,
  palette: number[] | [number, number, number][],
  emissivePalette: number[],
  nodes: GLTFNode[] = [{ name: 'root', mesh: 0 }],
) {
  const { texture } = mesher.getTextureData();
  const image = await textureToMeshTexture(texture, palette, emissivePalette);

  const imageData = await generatePNG(image, [24, 16, 8]);
  const emissiveImageData = await generatePNG(image, [0]);
  let bufferSize = imageData.byteLength + emissiveImageData.byteLength;

  const alphaValues: number[] = [];
  const meshIds: number[] = [];
  function meshHash(meshId: number, alpha = 255) {
    let meshIdx = meshIds.indexOf(meshId);
    if (meshIdx === -1) {
      meshIdx = meshIds.length;
      meshIds.push(meshId);
    }
    let alphaIdx = alphaValues.indexOf(alpha);
    if (alphaIdx === -1) {
      alphaIdx = alphaValues.length;
      alphaValues.push(alpha);
    }
    return `${meshIdx}_${alphaIdx}`;
  }
  const meshHashes: string[] = [];
  nodes = nodes.map((node) => {
    const newNode = pick(node, [
      'name',
      'mesh',
      'rotation',
      'scale',
      'translation',
      'children',
    ]);
    if (newNode.mesh === -1) {
      delete newNode.mesh;
    } else {
      const hash = meshHash(newNode.mesh, node.alpha);
      let meshHashIdx = meshHashes.indexOf(hash);
      if (meshHashIdx === -1) {
        meshHashIdx = meshHashes.length;
        meshHashes.push(hash);
      }
      newNode.mesh = meshHashIdx;
    }
    if (newNode.children && !newNode.children.length) {
      delete newNode.children;
    }
    return newNode;
  });

  const meshData = Array<ReturnType<typeof unpackMeshData>>(meshIds.length);
  for (let i = 0; i < meshIds.length; i++) {
    const mesh = mesher.getMesh(meshIds[i]);
    let UVDataType =
      Math.max(texture.width, texture.height) > 255 ? Uint16Array : Uint8Array;
    meshData[i] = unpackMeshData(mesh, Uint16Array, UVDataType);
    const { positionSize, texcoordSize, indexSize } = getMeshDataSizes(
      meshData[i],
    );
    bufferSize += positionSize;
    bufferSize += texcoordSize;
    bufferSize += indexSize;
    bufferSize += roundUp4Diff(bufferSize);
  }
  const buffer = new Uint8Array(bufferSize);
  const dataView = new DataView(buffer.buffer);
  let ptr = 0;
  function writeFloat32(a: number) {
    dataView.setFloat32(ptr, a, true);
    ptr += 4;
  }
  function writeUint32(a: number) {
    dataView.setUint32(ptr, a, true);
    ptr += 4;
  }
  function writeUint16(a: number) {
    dataView.setUint16(ptr, a, true);
    ptr += 2;
  }
  function writeUint8(a: number) {
    buffer[ptr++] = a;
  }
  function writeBuffer(buf: ArrayLike<number>) {
    buffer.set(buf, ptr);
    ptr += buf.length;
  }

  const asset = {
    generator: 'Box3 Mesh Exporter',
    version: '2.0',
  };
  const bufferViews: any[] = [];
  const accessors: any[] = [];
  const meshes: any[] = [];
  for (let i = 0; i < meshIds.length; i++) {
    const { positionSize, texcoordSize, indexSize } = getMeshDataSizes(
      meshData[i],
    );
    const positionOffset = ptr;
    for (let j = 0; j < meshData[i].meshData.length; j += 4) {
      writeFloat32(meshData[i].meshData[j + 0]);
      writeFloat32(meshData[i].meshData[j + 1]);
      writeFloat32(meshData[i].meshData[j + 2]);
    }

    const txtMin = Array(2).fill(Infinity);
    const txtMax = Array(2).fill(-Infinity);
    const texcoordOffset = ptr;
    for (let j = 0; j < texcoordSize / 4; j += 2) {
      const u = meshData[i].uvData[j + 0] / texture.width;
      const v = meshData[i].uvData[j + 1] / texture.height;
      writeFloat32(u);
      writeFloat32(v);
      txtMin[0] = Math.min(txtMin[0], u);
      txtMin[1] = Math.min(txtMin[1], v);
      txtMax[0] = Math.max(txtMax[0], u);
      txtMax[1] = Math.max(txtMax[1], v);
    }
    const vertexCount = positionSize / 3 / 4;
    const writeUintX =
      vertexCount > 0x10000
        ? writeUint32
        : vertexCount > 0x100
        ? writeUint16
        : writeUint8;
    let idxMin = Infinity;
    let idxMax = -Infinity;
    const idxMap = [0, 1, 2, 2, 1, 3];
    const indexOffset = ptr;
    for (let j = 0; j < meshData[i].count; j += idxMap.length) {
      for (let k = 0; k < idxMap.length; k++) {
        const idx = Math.floor(j / idxMap.length) * 4 + idxMap[k];
        writeUintX(idx);
        idxMin = Math.min(idxMin, idx);
        idxMax = Math.max(idxMax, idx);
      }
    }

    ptr += roundUp4Diff(ptr);
    bufferViews.push(
      {
        name: `bufferView_positions_${i}`,
        buffer: 0,
        byteLength: positionSize,
        byteOffset: positionOffset,
        byteStride: 3 * 4,
        target: 34962, // ARRAY_BUFFER
      },
      {
        name: `bufferView_texcoords_${i}`,
        buffer: 0,
        byteLength: texcoordSize,
        byteOffset: texcoordOffset,
        byteStride: 2 * 4,
        target: 34962, //ARRAY_BUFFER
      },
      {
        name: `bufferView_indices_${i}`,
        buffer: 0,
        byteLength: indexSize,
        byteOffset: indexOffset,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
    );
    accessors.push(
      {
        name: `positions_${i}`,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: 'VEC3',
        bufferView: i * 3 + 0,
        byteOffset: 0,
        min: [meshData[i].lox, meshData[i].loy, meshData[i].loz],
        max: [meshData[i].hix, meshData[i].hiy, meshData[i].hiz],
      },
      {
        name: `texcoords_${i}`,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: 'VEC2',
        bufferView: i * 3 + 1,
        byteOffset: 0,
        min: txtMin,
        max: txtMax,
      },
      {
        name: `indices_${i}`,
        componentType:
          vertexCount > 0x10000
            ? 5125 // UNSIGNED_INT
            : vertexCount > 0x100
            ? 5123 // UNSIGNED_SHORT
            : 5121, // UNSIGNED_BYTE
        count: meshData[i].count,
        type: 'SCALAR',
        bufferView: i * 3 + 2,
        byteOffset: 0,
        min: [idxMin],
        max: [idxMax],
      },
    );
  }
  bufferViews.push({
    name: 'bufferView_image',
    buffer: 0,
    byteLength: imageData.byteLength,
    byteOffset: ptr,
  });
  writeBuffer(imageData);
  bufferViews.push({
    name: 'bufferView_emissive_image',
    buffer: 0,
    byteLength: emissiveImageData.byteLength,
    byteOffset: ptr,
  });
  writeBuffer(emissiveImageData);

  const buffers = [
    {
      name,
      byteLength: buffer.byteLength,
      uri:
        'data:application/octet-stream;base64,' +
        Buffer.from(buffer).toString('base64'),
    },
  ];
  const images = [
    {
      name: 'image',
      mimeType: 'image/png',
      bufferView: bufferViews.length - 2,
    },
    {
      name: 'emissive image',
      mimeType: 'image/png',
      bufferView: bufferViews.length - 1,
    },
  ];
  const materials = alphaValues.map((alpha) => ({
    name: 'material',
    pbrMetallicRoughness: {
      baseColorTexture: {
        index: 0,
      },
      baseColorFactor: [1, 1, 1, alpha / 255],
      metallicFactor: 0,
      roughnessFactor: 1,
    },
    emissiveTexture: {
      index: 1,
    },
    emissiveFactor: [0, 0, 0],
    alphaMode: alpha === 255 ? 'OPAQUE' : 'BLEND',
    doubleSided: false,
  }));

  for (let i = 0; i < meshHashes.length; i++) {
    const [meshId, matId] = meshHashes[i].split('_').map((x) => parseInt(x));
    meshes.push({
      name: `mesh_${i}`,
      primitives: [
        {
          attributes: {
            POSITION: meshId * 3 + 0,
            TEXCOORD_0: meshId * 3 + 1,
          },
          indices: meshId * 3 + 2,
          material: matId,
          mode: 4, // TRIANGLES
        },
      ],
    });
  }
  const samplers = [
    {
      wrapS: 33071, // CLAMP_TO_EDGE
      wrapT: 33071, // CLAMP_TO_EDGE
      magFilter: 9728, // NEAREST
      minFilter: 9728, // NEAREST
    },
  ];
  const scene = 0;
  const scenes = [
    {
      nodes: [0],
    },
  ];
  const textures = [
    {
      name: 'texture',
      sampler: 0,
      source: 0,
    },
    {
      name: 'emissive texture',
      sampler: 0,
      source: 1,
    },
  ];
  const gltf = {
    asset,
    accessors,
    bufferViews,
    buffers,
    images,
    materials,
    meshes,
    nodes,
    samplers,
    scene,
    scenes,
    textures,
  };
  return JSON.stringify(gltf, null, 2);
}
