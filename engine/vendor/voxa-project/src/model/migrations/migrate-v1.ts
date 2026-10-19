import { MuReadStream } from '@box/mudb/stream';
import type { ModelDataV1 } from '../schema-v1';
import type { ModelDataV2 } from '../schema-v2';
import { ModelNodeSchema } from '../schema-v2';
import { fastMeshDecoder } from '../../fast-mesh-decoder';
import { Vec3Schema } from '../../util';

export const migrateV1 = async (data: ModelDataV1): Promise<ModelDataV2> => {
  const firstId = Object.keys(data.meshes)[0];

  const rootNode = ModelNodeSchema.clone(ModelNodeSchema.identity);
  rootNode.children = [1];
  rootNode.rotation[3] = 1;

  const firstNode = ModelNodeSchema.clone(ModelNodeSchema.identity);
  firstNode.mesh = 0;
  firstNode.rotation[3] = 1;

  const bounds = Vec3Schema.clone(data.bounds);
  const meshes: number[][] = [];

  // 在v1版本中，如果bounds为0,0,0，说明为空体素文件
  // 不需要处理bounds+1以及新增mesh信息
  if (!Vec3Schema.equal(data.bounds, Vec3Schema.fromJSON([0, 0, 0]))) {
    // v1版本的bounds存储的是：体素结束坐标 - 体素开始坐标
    // 得到的bounds少了1，这里需要加回来
    bounds[0]++;
    bounds[1]++;
    bounds[2]++;

    const mesh = data.meshes[firstId];

    // 解析mesh数据，计算出在画布中体素的最低点坐标
    // 作为根节点的偏移量
    const decodedMesh = fastMeshDecoder(new MuReadStream(new Uint8Array(mesh)));

    if (decodedMesh) {
      // 画布中体素的最低点坐标
      const lo = [Infinity, Infinity, Infinity];
      for (let i = 0; i < decodedMesh.length; i += 12) {
        const x = decodedMesh[i];
        const y = decodedMesh[i + 1];
        const z = decodedMesh[i + 2];
        lo[0] = Math.min(x, lo[0]);
        lo[1] = Math.min(y, lo[1]);
        lo[2] = Math.min(z, lo[2]);
      }

      // 根目录下的节点需要减去根节点偏移量
      firstNode.translation[0] = -lo[0];
      firstNode.translation[1] = -lo[1];
      firstNode.translation[2] = -lo[2];
    }

    meshes.push(mesh);
  }

  return {
    version: 2,
    bounds,
    nodes: [rootNode, firstNode],
    meshes,
  };
};
