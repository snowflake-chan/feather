import { MuReadStream } from '@box/mudb/stream';
import { VoxelCollisionBox } from '../utils/rbush-schema';
export declare function deinterleave3(v_: number): number;
export declare function boxDecompress(inp: MuReadStream): VoxelCollisionBox[];
export declare function blitBoxesToChunk<T extends {
    setVoxelByPtr: (ptr: number, b: number) => void;
    stride: [number, number, number];
    offset: number;
}>(chunk: T, boxes: VoxelCollisionBox[]): void;
//# sourceMappingURL=box-decode.d.ts.map