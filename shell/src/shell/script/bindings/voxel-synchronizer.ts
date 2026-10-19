import { VoxelView, allocVoxels, freeVoxels } from '@box/utils/voxel';
import { VoxelWriteSchema } from '@box/schema/voxel/voxel-protocol';
import {
  ScriptVoxelResetSchema,
  ScriptVoxelPreTickSchema,
} from '../script-protocol';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';
import { blitBoxesToChunk } from '@box/schema/voxel/box-decode';
import { GameVector3 } from '@box/schema/api/js/math';
import { MuArray } from '@box/mudb/schema';
import { Logger } from '@box/utils/logger';
import { GameVoxels } from '@box/schema/api/js/api';
import { BlockIndex, BlockInfo } from '@box/schema/voxel/block-schema';

export const VOXEL_ROTATION_SHIFT = 14;
export const VOXEL_TYPE_MASK = ~(3 << VOXEL_ROTATION_SHIFT);

class PendingVoxelWrite {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public b: number,
    public p: number,
    public t: number,
  ) {}
}

function compareWrite(a: PendingVoxelWrite, b: PendingVoxelWrite) {
  return a.x - b.x || a.y - b.y || a.z - b.z || a.t - b.t;
}

type VoxelWrite = typeof VoxelWriteSchema.identity;

export const ScriptVoxelUpdateSchema = new MuArray(VoxelWriteSchema, Infinity);

export class ScriptVoxelSync {
  public voxelAPI: GameVoxels;
  public voxels: VoxelView;
  public logger: Logger;

  private _shape = new GameVector3(32, 32, 32);

  public isValidVoxelType(b: number) {
    return this.blockIndex.valid[b & VOXEL_TYPE_MASK];
  }

  public voxelId = (name: string) => {
    if (typeof name !== 'string' || !(name in this.blockIndex.id)) {
      return 0;
    }
    return this.blockIndex.id[name] | 0;
  };

  public voxelName = (id: number) => {
    if (typeof id !== 'number' || !this.isValidVoxelType(id)) {
      return '';
    }
    return '' + this.blockIndex.name[id & VOXEL_TYPE_MASK];
  };

  public cuteBlockType(b: number | string) {
    if (typeof b === 'string') {
      return this.voxelId(b);
    }
    const r = b & VOXEL_TYPE_MASK;
    if (this.isValidVoxelType(r)) {
      return r;
    }
    return 0;
  }

  public cuteRotation(r: number | string) {
    if (typeof r === 'number') {
      return r & 3;
    } else {
      switch (r) {
        case 'north':
        case 'n':
        case '北':
        case '0':
          return 0;
        case 'south':
        case 's':
        case '南':
        case '1':
          return 1;
        case 'east':
        case 'e':
        case '东':
        case '2':
          return 2;
        case 'west':
        case 'w':
        case '西':
        case '3':
          return 3;
      }
    }
    return 0;
  }

  public cuteVoxelId(b: number | string, r: number | string) {
    return (
      this.cuteBlockType(b) | (this.cuteRotation(r) << VOXEL_ROTATION_SHIFT)
    );
  }

  constructor(
    public blockInfo: BlockInfo,
    public blockIndex: BlockIndex,
    logger: Logger,
  ) {
    this.logger = logger.create('voxels');
    this.voxels = allocVoxels(32, 32, 32);

    this.voxelAPI = new GameVoxels(
      this._shape,
      blockIndex.name.slice(),
      this.voxelId,
      this.voxelName,
      this.setVoxel,
      this.getVoxel,
      this.getVoxelRotation,
      this.setVoxelId,
      this.getVoxelId,
    );
  }

  private _writeCounter: number = 0;
  private _pendingWrites: PendingVoxelWrite[] = [];

  public reset(voxelConfig: typeof ScriptVoxelResetSchema.identity) {
    // reallocate voxels
    freeVoxels(this.voxels);
    this.voxels = allocVoxels(voxelConfig.x, voxelConfig.y, voxelConfig.z);

    // clear voxel array
    this.voxels.fill(0);

    // copy chunks
    let ptr = 0;
    for (let z = 0; z < voxelConfig.z; z += CHUNK_SIZE) {
      for (let y = 0; y < voxelConfig.y; y += CHUNK_SIZE) {
        for (let x = 0; x < voxelConfig.x; x += CHUNK_SIZE) {
          blitBoxesToChunk(
            this.voxels.slice(
              [x, y, z],
              [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
            ),
            voxelConfig.chunks[ptr++],
          );
        }
      }
    }

    this.voxelAPI.VoxelTypes = this.blockIndex.name.filter((x) => !!x).sort();
  }

  public preTick(voxelUpdate: typeof ScriptVoxelPreTickSchema.identity) {
    if (voxelUpdate.type === 'reset') {
      this.reset(<typeof ScriptVoxelResetSchema.identity>voxelUpdate.data);
    } else if (voxelUpdate.type === 'writes') {
      const writes = <VoxelWrite[]>voxelUpdate.data;
      for (let i = 0; i < writes.length; ++i) {
        const w = writes[i];
        this.voxels.setVoxel(w.x, w.y, w.z, w.b);
      }
    }

    // Synchronize voxel shape
    this._shape.x = this.voxels.shape[0] - 1;
    this._shape.y = this.voxels.shape[1] - 1;
    this._shape.z = this.voxels.shape[2] - 1;
  }

  public postTick(out: VoxelWrite[]) {
    out.length = 0;
    this._pendingWrites.sort(compareWrite);
    for (let i = 0; i < this._pendingWrites.length; ) {
      const w = this._pendingWrites[i];
      let b = w.b;
      for (; i < this._pendingWrites.length; ++i) {
        const o = this._pendingWrites[i];
        if (o.x !== w.x || o.y !== w.y || o.z !== w.z) {
          break;
        }
        b = o.b;
      }
      if (b !== w.p) {
        const ev = VoxelWriteSchema.alloc();
        ev.x = w.x;
        ev.y = w.y;
        ev.z = w.z;
        ev.b = b;
        out.push(ev);
      }
    }
    this._pendingWrites.length = 0;
  }

  public setVoxelId = (x: number, y: number, z: number, b_: number) => {
    const b = b_ | 0;
    if (
      x >= 0 &&
      y >= 0 &&
      z >= 0 &&
      x < this.voxels.shape[0] - 1 &&
      y < this.voxels.shape[1] - 1 &&
      z < this.voxels.shape[2] - 1 &&
      this.isValidVoxelType(b)
    ) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const prev = this.voxels.getVoxel(xi, yi, zi);
      if (prev !== b) {
        this._pendingWrites.push(
          new PendingVoxelWrite(xi, yi, zi, b, prev, this._writeCounter++),
        );
        this.voxels.setVoxel(xi, yi, zi, b);
      }
      return b;
    }
    return 0;
  };

  public setVoxel = (
    x: number,
    y: number,
    z: number,
    b: string | number,
    r?: string | number,
  ) => {
    return this.setVoxelId(x | 0, y | 0, z | 0, this.cuteVoxelId(b, r || 0));
  };

  public getVoxelId = (x: number, y: number, z: number) => {
    if (
      x >= 0 &&
      y >= 0 &&
      z >= 0 &&
      x < this.voxels.shape[0] - 1 &&
      y < this.voxels.shape[1] - 1 &&
      z < this.voxels.shape[2] - 1
    ) {
      return this.voxels.getVoxel(Math.floor(x), Math.floor(y), Math.floor(z));
    }
    return 0;
  };

  public getVoxel = (x: number, y: number, z: number) => {
    return this.getVoxelId(x, y, z) & VOXEL_TYPE_MASK;
  };

  public getVoxelRotation = (x: number, y: number, z: number) => {
    return this.getVoxelId(x, y, z) >>> VOXEL_ROTATION_SHIFT;
  };
}
