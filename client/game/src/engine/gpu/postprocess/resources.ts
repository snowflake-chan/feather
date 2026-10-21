import type { IREWGPUBuffer, IREWGPUTexture, ReWGPU } from '@box/rewgpu';
import type { GameClientState } from 'src/engine/game-client-schema';
import { rootLogger } from 'src/utils/logger';
import { F32, UniformStructF32, VEC3F } from '../uniform-pool';
import { BloomResources } from './bloom-pass';
import { FinalResources } from './final-pass';
import { FxaaResources } from './fxaa-pass';
import { OitResources } from './oit-pass';
import { SsaoResources } from './ssao-pass';

const logger = rootLogger.child({ caller: 'postprocess/resources' });
export class PostprocessResources {
  // 可被缓存的数据
  public readonly postprocessUniformView = new UniformStructF32({
    enabled: F32,
    ssao: F32,
    depthOfField: F32,
    playerDepth: F32,
    zNear: F32,
    zFar: F32,
    scattering: F32,
    screenLightPos: VEC3F,
    eyeFogExtinction: F32,
    bloom: F32,
    underwater: F32,
    /**
     * 当前渲染的帧的总数 * 0.01
     * 对应regl内部提供的context变量'tick'，The number of frames rendered
     */
    tick: F32,
    lutEnabled: F32,
  });
  public readonly colorOnlyPassDescriptor: GPURenderPassDescriptor;
  public readonly final: FinalResources;
  public readonly oit: OitResources;
  public bloom: BloomResources | undefined;
  public fxaa: FxaaResources | undefined;
  public ssao: SsaoResources | undefined;

  // 需要跟随destroy被销毁的资源数据
  private state: GameClientState | undefined;
  public commonUniform?: IREWGPUBuffer;
  public postprocessUniform?: IREWGPUBuffer;
  public lutTexture: IREWGPUTexture | undefined;

  constructor(private rewgpu: ReWGPU) {
    this.postprocessUniformView.struct.tick[0] = 0;

    this.colorOnlyPassDescriptor = {
      colorAttachments: [
        {
          view: undefined as any, // will be replace every frame
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    this.oit = new OitResources(rewgpu);
    this.final = new FinalResources(rewgpu);
  }

  public init(state: GameClientState, commonUniform: IREWGPUBuffer) {
    this.state = state;
    this.commonUniform = commonUniform;

    this.postprocessUniform = this.rewgpu.buffer({
      label: 'postprocess:commonUniforms',
      size: this.postprocessUniformView.data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bloom?.init();
  }

  public destroy(state: GameClientState) {
    this.oit.destroy();
    this.bloom?.destroy(state);
    this.fxaa?.destroy(state);
    this.ssao?.destroy(state);
    this.destroyLut(state);
    this.final.destroy();

    this.commonUniform = undefined;
    this.postprocessUniform = undefined;
  }

  /**
   * 每帧执行的更新操作
   * @returns
   */
  public update() {
    if (!this.state) {
      logger.warn('postprocess resources not init.');
      return;
    }

    this.oit.update(this.state);

    // if never enable, create fxaa resource
    if (this.state.gpuPostProcess.fxaaEnabled) {
      if (!this.fxaa) {
        this.fxaa = new FxaaResources(this.rewgpu);
        this.state.gpuPostProcess.groupDirty = true;
      }
    }
    this.fxaa?.update(this.state, this.oit);

    if (this.state.gpuPostProcess.blurEnabled) {
      if (!this.bloom) {
        this.bloom = new BloomResources(this.rewgpu);
        this.bloom.init();
        this.state.gpuPostProcess.groupDirty = true;
      }
    }
    this.bloom?.update(this.state, this.oit);

    if (this.state.gpuPostProcess.ssaoEnabled) {
      if (!this.ssao) {
        this.ssao = new SsaoResources(this.rewgpu);
        this.state.gpuPostProcess.groupDirty = true;
      }
    }
    this.ssao?.update(this.state);

    if (this.state.gpuPostProcess.lutEnabled) {
      this.updateLut();
    }

    this.final.update(this.state, this);

    // 更新 postprocess 的 common uniform
    const { data, struct } = this.postprocessUniformView;
    struct.tick[0] += 0.01;
    struct.enabled[0] = +this.state.settings.postprocess;
    struct.ssao[0] = +this.state.gpuPostProcess.ssaoEnabled;
    struct.depthOfField[0] = this.state.settings.depthOfField;
    struct.playerDepth[0] = this.state.camera.focalDistance;
    struct.zNear[0] = this.state.camera.zNear;
    struct.zFar[0] = this.state.camera.zFar;
    struct.scattering[0] = +(
      this.state.gpuPostProcess.scatteringEnabled &&
      this.state.camera.eyeFogAmount > 0.01
    );
    struct.eyeFogExtinction[0] = this.state.camera.eyeFogAmount;
    struct.bloom[0] = +this.state.gpuPostProcess.blurEnabled;
    struct.underwater[0] = +this.state.camera.underwater;
    struct.lutEnabled[0] = +this.state.gpuPostProcess.lutEnabled;
    this.postprocessUniform?.update(data);
  }

  private static readonly LUT_WIDTH = 256;
  private static readonly LUT_HEIGHT = 16;
  private static readonly LUT_DATA = (() => {
    const lutData = new Uint8Array(
      PostprocessResources.LUT_WIDTH * PostprocessResources.LUT_HEIGHT * 4,
    );

    // 填充默认数据，避免未加载完成图片影响渲染效果
    for (let r = 0; r < 16; ++r) {
      for (let g = 0; g < 16; ++g) {
        for (let b = 0; b < 16; ++b) {
          const ptr = 4 * (r + 16 * b + 256 * g);
          lutData[ptr] = r * 16;
          lutData[ptr + 1] = g * 16;
          lutData[ptr + 2] = b * 16;
          lutData[ptr + 3] = 255;
        }
      }
    }

    return lutData;
  })();
  private currentLutHash: string = '';
  private updateLut() {
    if (!this.state) {
      logger.warn('postprocess resources not init.');
      return;
    }

    if (!this.state.gpuPostProcess.lutEnabled) {
      this.destroyLut(this.state);
      return;
    }

    if (!this.lutTexture) {
      const size = [
        PostprocessResources.LUT_WIDTH,
        PostprocessResources.LUT_HEIGHT,
      ];
      this.lutTexture = this.rewgpu.texture({
        label: 'postprocess:lut',
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT, // Web 环境下会被识别为 attachment
        size,
      });

      this.lutTexture.update(PostprocessResources.LUT_DATA, {
        size,
        dataLayout: {
          /**
           * 数据不止一行，需要显示声明该值，表示每行的字节数
           * 详见：https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/writeTexture#bytesperrow
           */
          bytesPerRow: PostprocessResources.LUT_WIDTH * 4,
        },
      });

      this.state.gpuPostProcess.groupDirty = true;
    }

    if (this.currentLutHash !== this.state.secret.replica.colorLUT) {
      const newLutHash = this.state.secret.replica.colorLUT;

      const req = this.state.content.fetchImage(newLutHash);

      if (req.loaded && req.image) {
        this.lutTexture.update(req.image, {
          size: [
            PostprocessResources.LUT_WIDTH,
            PostprocessResources.LUT_HEIGHT,
          ],
        });

        this.currentLutHash = newLutHash;
      }
    }
  }

  private destroyLut(state: GameClientState) {
    this.lutTexture?.destroy();
    delete this.lutTexture;
    this.currentLutHash = '';

    state.gpuPostProcess.groupDirty = true;
  }
}
