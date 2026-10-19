import { MuSchema } from '@box/mudb/schema/schema';
import { vec3, vec2, vec4 } from 'gl-matrix';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
export declare class QuantizedScalar implements MuSchema<number> {
    precision: number;
    invPrecision: number;
    identity: number;
    json: {
        type: 'quantized-scalar';
        precision: number;
        identity: number;
    };
    muData: {
        type: 'quantized-scalar';
        precision: number;
        identity: number;
    };
    readonly muType = "quantized-scalar";
    constructor(precision: number, identity?: number);
    assign(x: number, y: number): number;
    clone(y: number): number;
    alloc(): number;
    free(): void;
    toJSON(x: number): number;
    fromJSON(x: any): number;
    equal(x: number, y: number): boolean;
    diff(base: number, target: number, stream: MuWriteStream): boolean;
    patch(base: number, stream: MuReadStream): number;
}
export declare class QuantizedVec2Schema implements MuSchema<vec2> {
    precision: number;
    invPrecision: number;
    identity: vec2;
    json: {
        type: 'quantized-vec2';
        precision: number;
        identity: number[];
    };
    muData: {
        type: 'quantized-vec2';
        precision: number;
        identity: number[];
    };
    readonly muType = "quantized-vec2";
    constructor(precision: number, identity?: vec2);
    assign(x: vec2, y: vec2): vec2;
    clone(x: vec2): vec2;
    alloc(): vec2;
    free(x: vec2): void;
    toJSON(x: vec2): number[];
    fromJSON(x: any): vec2;
    equal(x: vec2, y: vec2): boolean;
    diff(base: vec2, target: vec2, stream: MuWriteStream): boolean;
    patch(base: vec2, stream: MuReadStream): vec2;
}
export declare class QuantizedVec3Schema implements MuSchema<vec3> {
    precision: number;
    invPrecision: number;
    identity: vec3;
    json: {
        type: 'quantized-vec3';
        precision: number;
        identity: number[];
    };
    muData: {
        type: 'quantized-vec3';
        precision: number;
        identity: number[];
    };
    readonly muType = "quantized-vec3";
    pool: any;
    constructor(precision: number, identity?: vec3);
    assign(x: vec3, y: vec3): vec3;
    clone(x: vec3): vec3;
    alloc(): vec3;
    free(x: vec3): void;
    toJSON(x: vec3): number[];
    fromJSON(x: any): vec3;
    equal(x: vec3, y: vec3): boolean;
    diff(base: vec3, target: vec3, stream: MuWriteStream): boolean;
    patch(base: vec3, stream: MuReadStream): vec3;
}
export declare class QuantizedVec4Schema implements MuSchema<vec4> {
    precision: number;
    invPrecision: number;
    identity: vec4;
    json: {
        type: 'quantized-vec4';
        precision: number;
        identity: number[];
    };
    muData: {
        type: 'quantized-vec4';
        precision: number;
        identity: number[];
    };
    readonly muType = "quantized-vec4";
    constructor(precision: number, identity?: vec4);
    assign(x: vec4, y: vec4): vec4;
    clone(x: vec4): vec4;
    alloc(): vec4;
    free(x: vec4): void;
    toJSON(x: vec4): number[];
    fromJSON(x: any): vec4;
    equal(x: vec4, y: vec4): boolean;
    diff(base: vec4, target: vec4, stream: MuWriteStream): boolean;
    patch(base: vec4, stream: MuReadStream): vec4;
}
