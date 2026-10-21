export interface GPUConfig {
    device: GPUDevice;
    presentationFormat: GPUTextureFormat;
    usage?: GPUCanvasConfiguration['usage'];
    alphaMode?: GPUCanvasConfiguration['alphaMode'];
    viewFormats?: GPUCanvasConfiguration['viewFormats'];
}
export declare enum REWGPUType {
    Buffer = 0,
    Texture = 1,
    Cube = 2,
    Sampler = 3,
    Group = 4
}
export type REWGPUObject = IREWGPUBuffer | IREWGPUTexture | IREWGPUCube | IREWGPUSampler;
export interface IREWGPUBuffer {
    readonly type: REWGPUType.Buffer;
    id: number;
    buffer?: GPUBuffer;
    groupSize?: number;
    update: (data: SharedArrayBuffer | BufferSource, bufferOffset?: number, dataOffset?: number, size?: number) => void;
    destroy: () => void;
}
export type UpdateTextureFn = (data: TextureData, options?: {
    size?: GPUExtent3DStrict;
    dataLayout?: GPUImageDataLayout;
    origin?: GPUOrigin3D;
    mipLevel?: GPUIntegerCoordinate;
}) => void;
export type UpdateCubeFn = (data: CubeData, options?: {
    size?: GPUExtent3DStrict;
    dataLayout?: GPUImageDataLayout;
    mipLevel?: GPUIntegerCoordinate;
}) => void;
export interface IREWGPUTexture {
    readonly type: REWGPUType.Texture;
    id: number;
    texture?: GPUTexture;
    destroy: () => void;
    update: UpdateTextureFn;
}
export interface IREWGPUCube {
    readonly type: REWGPUType.Cube;
    id: number;
    texture?: GPUTexture;
    destroy: () => void;
    update: UpdateCubeFn;
}
export interface IREWGPUSampler {
    readonly type: REWGPUType.Sampler;
    id: number;
    sampler?: GPUSampler;
    destroy: () => void;
}
export interface IREWGPUGroup {
    readonly type: REWGPUType.Group;
    dynamicOffsets?: number[];
    id: number;
    group?: GPUBindGroup;
    destroy: () => void;
}
export interface BufferDescriptor {
    label?: string;
    data?: SharedArrayBuffer | BufferSource;
    size: GPUSize64;
    usage: GPUBufferUsageFlags;
    isDynamic?: boolean;
}
export type TextureData = BufferSource | SharedArrayBuffer | GPUImageCopyExternalImageSource;
export interface BaseTextureDescriptor {
    label?: string;
    format: GPUTextureFormat;
    usage: GPUTextureUsageFlags;
    dataLayout?: GPUImageDataLayout;
    mipLevelCount?: GPUIntegerCoordinate;
}
export interface TextureDescriptor extends BaseTextureDescriptor {
    size: GPUExtent3DStrict;
    data?: TextureData;
}
export type CubeData = [
    TextureData,
    TextureData,
    TextureData,
    TextureData,
    TextureData,
    TextureData
];
export interface CubeDescriptor extends BaseTextureDescriptor {
    size: number;
    data?: CubeData;
}
export type DrawCommand = (passEncoder: GPURenderPassEncoder | GPURenderBundleEncoder) => void;
export type CreateCommand = (descriptor: CommandDescriptor) => DrawCommand;
export type CreatePipeline = (descriptor: PipelineDescriptor) => GPURenderPipeline;
export interface GroupEntry {
    binding: GPUIndex32;
    resource: REWGPUObject;
}
export interface GroupDescriptor {
    label?: string;
    entries: GroupEntry[];
    layout: GPUBindGroupLayout;
}
export interface PipelineDescriptor {
    label?: string;
    layout?: GPURenderPipelineDescriptor['layout'];
    struct?: string;
    frag?: {
        content: string;
        entryPoint?: string;
        blend?: GPUBlendState;
        format?: GPUTextureFormat;
        constants?: GPUProgrammableStage['constants'];
    };
    vert: {
        content: string;
        entryPoint?: string;
        buffers?: GPUVertexBufferLayout[];
        constants?: GPUProgrammableStage['constants'];
    };
    primitive?: GPUPrimitiveState;
    depthStencil?: GPUDepthStencilState;
}
export interface IndexBufferDescriptor {
    reBuffer: IREWGPUBuffer;
    indexFormat: GPUIndexFormat;
    offset?: GPUSize64;
    size?: GPUSize64;
}
export interface CommandDescriptor {
    pipeline: GPURenderPipeline;
    count: GPUSize32;
    instanceCount?: GPUSize32;
    first?: GPUSize32;
    baseVertex?: GPUSignedOffset32;
    firstInstance?: GPUSize32;
    vertBuffers?: IREWGPUBuffer[];
    groups?: IREWGPUGroup[];
    indexBuffer?: IndexBufferDescriptor;
}
export interface RenderDescriptor {
    renderPassDescriptor: GPURenderPassDescriptor;
    draw: (passEncoder: GPURenderPassEncoder) => void;
}
export type RenderContext = {
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    commandBuffer: GPUCommandBuffer;
};
export type RenderContexts = RenderContext[];
export interface ReWGPU {
    config: GPUConfig;
    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    clear: () => void;
    destroy: () => void;
    createPipeline: CreatePipeline;
    createCommand: CreateCommand;
    render: (renderPassDescriptor: GPURenderPassDescriptor, draw: (passEncoder: GPURenderPassEncoder) => void) => RenderContexts;
    renderMulti: (descriptors: RenderDescriptor[]) => RenderContexts;
    buffer: (descriptor: BufferDescriptor) => IREWGPUBuffer;
    texture: (descriptor: TextureDescriptor) => IREWGPUTexture;
    cube: (descriptor: CubeDescriptor) => IREWGPUCube;
    sampler: (descriptor?: GPUSamplerDescriptor) => IREWGPUSampler;
    group: (descriptor: GroupDescriptor) => IREWGPUGroup;
    createBindGroupLayout: (descriptor: GPUBindGroupLayoutDescriptor) => GPUBindGroupLayout;
    createPipelineLayout: (descriptor: GPUPipelineLayoutDescriptor) => GPUPipelineLayout;
}
