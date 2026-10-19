import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDictionary } from '@box/mudb/schema/dictionary';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuRelativeVarint } from '@box/mudb/schema/rvarint';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint16 } from '@box/mudb/schema/uint16';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuRefSchema } from '../utils/ref-schema';
import { RelativeArray } from '../utils/relative-array';
export declare enum BlockSoundGroup {
    default = 0
}
export declare enum BlockCategory {
    default = 0,
    symbol = 1,
    number = 2,
    letter = 3,
    color = 4,
    nature = 5,
    structure = 6,
    light = 7,
    food = 8,
    element = 9
}
export declare const BlockInfoSchema: MuStruct<{
    ids: RelativeArray<MuRelativeVarint>;
    names: MuArray<MuUTF8>;
    emissive: RelativeArray<MuVarint>;
    texture: RelativeArray<MuRelativeVarint>;
    animLength: RelativeArray<MuVarint>;
    friction: RelativeArray<MuQuantizedFloat>;
    restitution: RelativeArray<MuQuantizedFloat>;
    velocity: RelativeArray<MuFloat32>;
    fluids: MuArray<MuStruct<{
        id: MuVarint;
        info: MuUint32;
        mass: MuFloat64;
    }>>;
    category: MuDictionary<RelativeArray<MuRelativeVarint>>;
    atlasRadius: MuVarint;
    blockBumpShift: MuVarint;
    blockColorShift: MuVarint;
    colorAtlas: MuArray<import("@box/mudb/schema").MuASCII>;
    materialAtlas: MuArray<import("@box/mudb/schema").MuASCII>;
    bumpAtlas: MuArray<import("@box/mudb/schema").MuASCII>;
}>;
export type BlockInfo = typeof BlockInfoSchema.identity;
export declare const BlockIndexSchema: MuStruct<{
    id: MuDictionary<MuVarint>;
    valid: MuArray<MuBoolean>;
    name: MuArray<MuUTF8>;
    emissive: MuArray<MuUint16>;
    texture: MuArray<MuUint32>;
    mass: MuArray<MuFloat64>;
    restitution: MuArray<MuFloat64>;
    friction: MuArray<MuFloat64>;
    fluid: MuArray<MuVarint>;
    fluidInfo: MuArray<MuUint32>;
    velocity: MuArray<MuFloat32>;
    isFluid: MuRefSchema<Uint8Array>;
}>;
export type BlockIndex = typeof BlockIndexSchema.identity;
