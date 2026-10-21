export declare let encodeUTF8: (str: string) => Uint8Array;
export declare let decodeUTF8: (bytes: Uint8Array) => string;
export declare class MuBuffer {
    buffer: ArrayBuffer;
    dataView: DataView;
    uint8: Uint8Array;
    constructor(buffer: ArrayBuffer);
}
export declare function allocBuffer(size: number): MuBuffer;
export declare function freeBuffer(buffer: MuBuffer): void;
export declare class MuWriteStream {
    buffer: MuBuffer;
    offset: number;
    constructor(capacity: number);
    bytes(): Uint8Array;
    destroy(): void;
    grow(bytes: number): void;
    writeInt8(x: number): void;
    writeInt16(x: number): void;
    writeInt32(x: number): void;
    writeUint8(x: number): void;
    writeUint16(x: number): void;
    writeUint32(x: number): void;
    writeFloat32(x: number): void;
    writeFloat64(x: number): void;
    writeVarint(x: number): void;
    writeASCII(str: string): void;
    writeString(str: string): void;
    writeUint8At(offset: number, x: number): void;
    writeUint32At(offset: number, x: number): void;
}
export declare class MuReadStream {
    buffer: MuBuffer;
    offset: number;
    length: number;
    constructor(data: Uint8Array);
    bytes(): Uint8Array;
    checkBounds(): void;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readUint8(): number;
    readUint16(): number;
    readUint32(): number;
    readFloat32(): number;
    readFloat64(): number;
    readVarint(): number;
    readASCII(length: number): string;
    readString(): string;
    readUint8At(offset: number): number;
}
//# sourceMappingURL=index.d.ts.map