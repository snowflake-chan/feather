import type { ReWGPU, IREWGPUBuffer } from '@box/rewgpu';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import type { GameClientState } from 'src/engine/game-client-schema';
import { rootLogger } from 'src/utils/logger';
import { recordBloomPass } from './bloom-pass';
import { recordFinalPass } from './final-pass';
import { recordFxaaPass } from './fxaa-pass';
import { recordOitPass } from './oit-pass';
import { PostprocessResources } from './resources';
import { recordSsaoPass } from './ssao-pass';

const logger = rootLogger.child({ caller: 'postprocess' });

export class PostprocessRenderer {
  private readonly resources: PostprocessResources;
  private state?: GameClientState;
  constructor(private rewgpu: ReWGPU) {
    this.resources = new PostprocessResources(this.rewgpu);
  }

  public init(state: GameClientState, commonUniform: IREWGPUBuffer) {
    this.state = state;

    this.resources.init(state, commonUniform);

    Vec3Schema.free(state.camera.screenLightPos);
    state.camera.screenLightPos =
      this.resources.postprocessUniformView.struct.screenLightPos;
  }

  public update() {
    if (!this.state) {
      console.warn('postprocess renderer not init.');
      return;
    }

    this.updateState();

    this.resources.update();
  }

  /**
   * 根据后期处理的需要更新 GameState
   * @returns
   */
  private updateState() {
    if (!this.state) {
      logger.debug('postprocess renderer not init.');
      return;
    }

    // Allocate fxaa buffer
    this.state.gpuPostProcess.fxaaEnabled =
      this.state.settings.postprocess && this.state.settings.fxaa;

    // Allocate blur buffers
    this.state.gpuPostProcess.blurEnabled =
      this.state.settings.postprocess && this.state.settings.bloom;

    // volumetric scattering 体积散射
    this.state.gpuPostProcess.scatteringEnabled =
      this.state.settings.postprocess &&
      this.state.settings.volumetricScattering &&
      this.state.camera.eyeFogAmount > 0.01;

    // ssao
    this.state.gpuPostProcess.ssaoEnabled =
      this.state.settings.postprocess &&
      !this.state.camera.underwater &&
      this.state.settings.ambientOcclusion;

    // allocate/update LUT 滤镜不属于用户可以关闭的后期效果
    this.state.gpuPostProcess.lutEnabled =
      this.state.secret.replica.colorLUT !== '';
  }

  public record(encoder: GPUCommandEncoder) {
    if (!this.state) {
      console.warn('postprocess renderer not init.');
      return;
    }

    const passEncoders: GPURenderPassEncoder[] = [];

    if (this.state.gpu.useOIT) {
      const pass = recordOitPass(encoder, this.state, this.resources);

      pass && passEncoders.push(pass);
    }

    if (this.state.gpuPostProcess.blurEnabled) {
      const bloomPasses = recordBloomPass(encoder, this.resources);

      if (bloomPasses) {
        passEncoders.push(...bloomPasses);
      }
    }

    if (this.state.gpuPostProcess.fxaaEnabled) {
      const pass = recordFxaaPass(encoder, this.resources);

      pass && passEncoders.push(pass);
    }

    if (this.state.gpuPostProcess.ssaoEnabled) {
      const pass = recordSsaoPass(encoder, this.state, this.resources);

      pass && passEncoders.push(pass);
    }

    const pass = recordFinalPass(encoder, this.rewgpu, this.resources);

    passEncoders.push(pass);

    return passEncoders;
  }

  public destroy(state: GameClientState) {
    this.resources.destroy(state);
    state.camera.screenLightPos = Vec3Schema.alloc();
  }
}
