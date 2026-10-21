import { GameClientState } from '../game-client-schema';

export function resizeRenderTarget(
  state: GameClientState,
  width: number,
  height: number,
) {
  const { rewgpu } = state.gpu;
  if (!rewgpu) {
    return;
  }
  state.gpu.targetSizeDirty = true;

  state.gpu.depth?.destroy();
  state.gpu.depth = rewgpu.texture({
    size: [width, height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  state.gpu.transparentDepth?.destroy();
  state.gpu.transparentDepth = rewgpu.texture({
    size: [width, height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  state.gpu.target?.destroy();
  state.gpu.target = rewgpu.texture({
    size: [width, height],
    format: rewgpu.config.presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  state.gpu.transparentTarget?.destroy();
  state.gpu.transparentTarget = rewgpu.texture({
    size: [width, height],
    format: rewgpu.config.presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  /**
   * oit存储分为三个storage，按照画面分为上中下三个画面，每个画面存储 width * perHeight 的画面
   * 切分为三个的storage存储的原因是
   * 1. 当画面精度过高的时候，oitNodesBufferSize很容易就超过最大限制maxStorageBufferBindingSize，存储像素点的空间不够用，画面渲染会出比较明显视觉上的错误
   * 2. 只有一个storage存储的时候，shader在做offset的原子计数的时候，所有并行计算的shader会争抢一个storage空间进行上锁解锁，对性能有影响
   * 3. 切分大于三个的时候，也有问题
   *    (1) web这边限制maxStorageBuffersPerShaderStage最多8个，超过这个数害得为他写个兼容，很麻烦没必要
   *    (2) 切断多了读取的storage也变多，在shader中的if判断或者select也变多，对性能都有影响，需要做个取舍
   */
  const perHeight = Math.ceil(height / 3);

  const { maxStorageBufferBindingSize, minStorageBufferOffsetAlignment } =
    rewgpu.config.device.limits;

  // 大概分配每个像素可以积累10个透明颜色
  const perPixelCount = 10;

  // 分配的存储空间不得超过最大限制
  state.gpu.oitNodesBufferSize = Math.min(
    width * perHeight * 12 * perPixelCount,
    maxStorageBufferBindingSize,
  );

  state.gpu.oitStaticNodeBuffer0?.destroy();
  state.gpu.oitStaticNodeBuffer0 = rewgpu.buffer({
    size: state.gpu.oitNodesBufferSize,
    usage: GPUBufferUsage.STORAGE,
  });

  const bufferSize =
    Math.ceil((width * perHeight * 4 + 4) / minStorageBufferOffsetAlignment) *
    minStorageBufferOffsetAlignment;

  state.gpu.oitOffsetBuffer0?.destroy();
  state.gpu.oitOffsetBuffer0 = rewgpu.buffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE,
  });

  state.gpu.oitStaticNodeBuffer1?.destroy();
  state.gpu.oitStaticNodeBuffer1 = rewgpu.buffer({
    size: state.gpu.oitNodesBufferSize,
    usage: GPUBufferUsage.STORAGE,
  });

  state.gpu.oitOffsetBuffer1?.destroy();
  state.gpu.oitOffsetBuffer1 = rewgpu.buffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE,
  });

  state.gpu.oitStaticNodeBuffer2?.destroy();
  state.gpu.oitStaticNodeBuffer2 = rewgpu.buffer({
    size: state.gpu.oitNodesBufferSize,
    usage: GPUBufferUsage.STORAGE,
  });

  state.gpu.oitOffsetBuffer2?.destroy();
  state.gpu.oitOffsetBuffer2 = rewgpu.buffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE,
  });
}
