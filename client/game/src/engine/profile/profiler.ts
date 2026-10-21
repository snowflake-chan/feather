import type { GameClientState } from '../game-client-schema';
import type {
  GLMesh,
  GLMeshInstanceList,
} from '../mesh/gl-controller/gl-mesh-schema';
import type {
  GPUMesh,
  GPUMeshInstanceList,
  GPUMeshInstanceListDict,
} from '../mesh/gpu-controller/gpu-mesh-schema';
import { RenderableType } from '../mesh/parse/mesh-schema';
import type { Renderable } from '../mesh/renderable-schema';
import type { SoundNode } from '../sound/client-sound-state';

/**
 * 用了按位计算，所以这里必须是 2 的幂次
 */
const PROFILING_FRAME_COUNT = 512;

export class EngineProfiler {
  /**
   * 开启后将持续录制画面数据
   */
  public viewProfilingEnabled = false;
  /**
   * 已录制的画面数据
   */
  public viewOpaqueProfile: EnginePassProfileData | undefined;
  public viewTransparentProfile: EnginePassProfileData | undefined;
  /**
   * 开启后将持续读取音频数据
   */
  public viewAudioProfilingEnabled = false;
  public viewActiveSoundEffects: SoundNode[] | undefined;
  constructor(private gameState: GameClientState) {}
  /**
   * 获取当前地图的数据
   */
  public profileMap() {
    const opaque: EngineModelProfileData[] = [];
    for (let i = 0; i < this.gameState.opaqueModels.length; i++) {
      const profile = this.renderableToProfile(
        this.gameState.opaqueModels[i].glRef,
      );
      if (profile) {
        opaque.push(profile);
      }
    }

    const transparent: EngineModelProfileData[] = [];
    for (let i = 0; i < this.gameState.transparentModels.length; i++) {
      const profile = this.renderableToProfile(
        this.gameState.transparentModels[i].glRef,
      );
      if (profile) {
        transparent.push(profile);
      }
    }

    return new EngineProfileData(
      new EnginePassProfileData(opaque),
      new EnginePassProfileData(transparent),
    );
  }

  /**
   * 获取画面数据，需要先设置 viewProfilingEnabled 进行录制。
   * 由于是取的录制结果，如果修改返回值，同一帧内其他调用得到的也会是修改后的值。
   */
  public profileView() {
    if (!this.viewOpaqueProfile || !this.viewTransparentProfile) {
      throw new Error('profiler not enabled!');
    }

    return new EngineProfileData(
      this.viewOpaqueProfile,
      this.viewTransparentProfile,
    );
  }

  /**
   * 将渲染过程中的 Models 记录到 frameProfiles 中
   * @param models
   */
  public performProfileGpu(
    opaqueModelsDict: GPUMeshInstanceListDict,
    transparentModelsDict: GPUMeshInstanceListDict,
  ) {
    this.viewOpaqueProfile = this.meshListToProfile(
      this.dictToList(opaqueModelsDict),
    );
    this.viewTransparentProfile = this.meshListToProfile(
      this.dictToList(transparentModelsDict),
    );
  }

  /**
   * 单独记录不透明模型
   * @param models
   */
  public profileViewOpaqueModels(
    models: GPUMeshInstanceList | GLMeshInstanceList,
  ) {
    this.viewOpaqueProfile = this.meshListToProfile(models);
  }

  public profileViewTransparentModels(
    models: GPUMeshInstanceList | GLMeshInstanceList,
  ) {
    this.viewTransparentProfile = this.meshListToProfile(models);
  }

  private dictToList(dict: GPUMeshInstanceListDict) {
    return Object.keys(dict).flatMap((key) => dict[key]);
  }

  private meshListToProfile(models: GPUMeshInstanceList | GLMeshInstanceList) {
    const statistics: EngineModelProfileData[] = [];
    models.map((model) => {
      if (!model) return;
      const modelProfile = this.renderableToProfile(model.part);
      if (modelProfile) {
        statistics.push(modelProfile);
      }
    });

    return new EnginePassProfileData(statistics);
  }

  private renderableToProfile(renderable: Renderable) {
    switch (renderable.renderableType) {
      case RenderableType.GLMesh:
        const meshBuffer = (renderable as GLMesh).meshBuffer;
        const vao = (renderable as GLMesh).vao;

        const glIndexCount = vao ? vao['_vao'].count : 0;
        return new EngineModelProfileData(
          (renderable as GLMesh).hash,
          glIndexCount / 3,
          meshBuffer
            ? meshBuffer['_buffer'].byteLength / 4 // 除去每个坐标的4个值，得到顶点个数
            : 0,
          glIndexCount,
        );
      case RenderableType.GPUMesh:
        const gpuIndexCount = (renderable as GPUMesh).count;
        return new EngineModelProfileData(
          (renderable as GPUMesh).hash,
          gpuIndexCount / 3,
          ((renderable as GPUMesh).meshBuffer?.buffer?.size || 0) / 4,
          (renderable as GPUMesh).count,
        );
      case RenderableType.GLTexture:
        console.info('GLTexture not supported: &o', renderable);
        return;
      case RenderableType.GPUModelTexture:
        console.info('GPUModelTexture not supported: &o', renderable);
        return;
    }
  }

  public profileActiveSoundEffects(nodes: SoundNode[]) {
    this.viewActiveSoundEffects = nodes.slice();
  }

  private fpsFrameTimes: number[] = new Array(PROFILING_FRAME_COUNT).fill(0);
  private fpsFrameTimesPtr = 0;
  public profileFps(delta: number) {
    this.fpsFrameTimes[this.fpsFrameTimesPtr] = delta;
    this.fpsFrameTimesPtr =
      (this.fpsFrameTimesPtr + 1) & (PROFILING_FRAME_COUNT - 1); // 用按位与操作代替取模
  }

  private getFpsStatistics() {
    let maxFrameTime = 0;
    let minFrameTime = Infinity;
    let totalFrameTime = 0;

    for (let i = 0; i < PROFILING_FRAME_COUNT; i++) {
      let frameTime = this.fpsFrameTimes[i];
      if (frameTime === 0) continue; // 跳过无效帧时间

      maxFrameTime = Math.max(maxFrameTime, frameTime);
      minFrameTime = Math.min(minFrameTime, frameTime);
      totalFrameTime += frameTime;
    }

    return {
      maxFrameTime,
      minFrameTime,
      totalFrameTime,
    };
  }

  public getFps() {
    const result = this.getFpsStatistics();

    return {
      maxFps: Math.round(
        result.minFrameTime === 0 ? Infinity : 1000 / result.minFrameTime,
      ),
      minFps: Math.round(
        result.maxFrameTime === Infinity ? 0 : 1000 / result.maxFrameTime,
      ),
      avgFps: Math.round(
        1000 / (result.totalFrameTime / PROFILING_FRAME_COUNT),
      ),
    };
  }
}

class EnginePassProfileData {
  public summary: EnginePassProfileSummary;
  constructor(public models: EngineModelProfileData[]) {
    this.summary = new EnginePassProfileSummary(models);
  }
}

export class EngineModelProfileData {
  constructor(
    /**
     *  管理员显示的 id 为模型名称，否则为模型Hash
     */
    public id: string,
    /**
     * 模型三角形面数
     */
    public faceCount: number,
    /**
     * 实体顶点数，是渲染时绘制的顶点数量，由于部分面可能重合，所以有可能比真实的顶点数多。
     */
    public vertexCount: number,
    /**
     * 实体顶点的索引数
     */
    public indexCount: number,
  ) {}
}

class EnginePassProfileSummary {
  public totalVertexCount: number;
  public totalFaceCount: number;
  public totalIndexCount: number;
  constructor(models: EngineModelProfileData[]) {
    this.totalVertexCount = models.reduce(
      (acc, model) => acc + model.vertexCount,
      0,
    );
    this.totalFaceCount = models.reduce(
      (acc, model) => acc + model.faceCount,
      0,
    );
    this.totalIndexCount = models.reduce(
      (acc, model) => acc + model.indexCount,
      0,
    );
  }
}

export class EngineProfileData {
  constructor(
    public opaque: EnginePassProfileData,
    public transparent: EnginePassProfileData,
  ) {}
}
