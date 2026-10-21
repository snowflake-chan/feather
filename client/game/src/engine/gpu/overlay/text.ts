import { mat3 } from 'gl-matrix';
import { nextPow2 } from 'bit-twiddle';
import type {
  CommandDescriptor,
  DrawCommand,
  IREWGPUBuffer,
  IREWGPUGroup,
  ReWGPU,
} from '@box/rewgpu';
import type { GameClientState } from '../../game-client-schema';
import type { CommonUniforms } from '../interface';
import sdfStruct from '../wgsl/text/sdf-struct.wgsl';
import sdfVert from '../wgsl/text/sdf-vert.wgsl';
import sdfFrag from '../wgsl/text/sdf-frag.wgsl';
import { FontsManager } from './font-manager';
import { getQuadIndexBuffer } from '../quad';
import type { GPUOverlayInstanceList } from 'src/engine/overlay/gpu-overlay-schema';
import { alloc, free } from 'src/engine/utils/pool';

// 每个文本的position分配的Float32Array大小，vec3 + 1，1是为了对齐
const POSITION_SIZE = 3 + 1;

// m每个字型的matrix分配的Float32Array大小，mat3 + 1，1是为了对齐
const GLYPH_SIZE = 9 + 1;

export function gpuTextOverlay(rewgpu: ReWGPU, commonUniforms: CommonUniforms) {
  const pipeline = rewgpu.createPipeline({
    label: 'textOverlayPipeline',
    struct: `
            ${commonUniforms.structCode}
            ${sdfStruct}
          `,
    vert: {
      content: sdfVert,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              format: 'float32x2',
              offset: 0,
              shaderLocation: 0,
            },
            {
              format: 'float32x2',
              offset: 8,
              shaderLocation: 1,
            },
          ],
        },
      ],
    },
    frag: {
      content: sdfFrag,
      entryPoint: 'fragmentMain',
    },
  });

  const commonGroup = rewgpu.group({
    label: 'textOverlayCommonGroup',
    layout: pipeline.getBindGroupLayout(0),
    entries: commonUniforms.entries,
  });

  let command: DrawCommand | undefined;

  const groups: IREWGPUGroup[] = [commonGroup];

  const vertices = new Float32Array(4 * 4);

  vertices[0] = 0; // 左上角 坐标x
  vertices[1] = 0; // 左上角 坐标y

  vertices[2] = 0; // 左上角 uv x
  vertices[3] = 1; // 左上角 uv y

  vertices[4] = 1; // 右上角 坐标x
  vertices[5] = 0; // 右上角 坐标y

  vertices[6] = 1; // 右上角 uv x
  vertices[7] = 1; // 右上角 uv y

  vertices[8] = 0; // 左下角 坐标x
  vertices[9] = 1; // 左下角 坐标y

  vertices[10] = 0; // 左下角 uv x
  vertices[11] = 0; // 左下角 uv y

  vertices[12] = 1; // 右下角 坐标x
  vertices[13] = 1; // 右下角 坐标y

  vertices[14] = 1; // 右下角 uv x
  vertices[15] = 0; // 右下角 uv y

  const verticesBuffer = rewgpu.buffer({
    data: vertices,
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  let curPositions: Float32Array | undefined;
  let positionsBuffer: IREWGPUBuffer | undefined;

  let curGlyphs: Float32Array | undefined;
  let glyphsBuffer: IREWGPUBuffer | undefined;

  let textGroup: IREWGPUGroup | undefined;

  const commandDescriptor: CommandDescriptor = {
    count: 6,
    pipeline,
    groups,
    vertBuffers: [verticesBuffer],
    indexBuffer: undefined,
    // 根据glyph数量动态修改
    instanceCount: 0,
  };

  const init = (state: GameClientState) => {
    state.gpu.overlay.text.textPipeline = pipeline;

    state.gpu.overlay.text.fontsManager = new FontsManager(rewgpu);

    const indexBuffer = getQuadIndexBuffer(state.gpu, commandDescriptor.count);

    if (indexBuffer) {
      commandDescriptor.indexBuffer = indexBuffer;
    }
  };

  const forward = (
    state: GameClientState,
    renderPassEncoder: GPURenderPassEncoder,
    pass: GPUOverlayInstanceList,
    glyphsCount: number,
  ) => {
    const { rewgpu, linearSampler, overlay } = state.gpu;

    if (!rewgpu || !linearSampler || !overlay.text.fontsTextureGroup) {
      return;
    }

    const newPosSize = pass.length * POSITION_SIZE * 4;
    const newGlyphSize = glyphsCount * GLYPH_SIZE * 4;

    let posSizeChanged = false;
    let glyphSizeChanged = false;

    /**
     * 按需创建/重建positions的Float32Array，以及positionsBuffer
     * 对比“当前数组字节长度”和“所需字节长度的下一个2的N次幂”，因为通过alloc分配同样会取入参的nextPow2
     * 如果长度不够，就重新创建
     */
    if (!curPositions || curPositions.byteLength < nextPow2(newPosSize)) {
      curPositions && free(curPositions.buffer);
      curPositions = new Float32Array(alloc(newPosSize));

      posSizeChanged = true;
    }

    /**
     * 按需创建/重建glyphs的Float32Array，以及glyphsBuffer。
     * 原理同positions
     */
    if (!curGlyphs || curGlyphs.byteLength < nextPow2(newGlyphSize)) {
      curGlyphs && free(curGlyphs.buffer);
      curGlyphs = new Float32Array(alloc(newGlyphSize));

      glyphSizeChanged = true;
    }

    const positions = curPositions;
    const glyphMatrixes = curGlyphs;

    let glyphIdx = 0;

    pass.forEach((overlayInstance, passIdx) => {
      const { glyphs, position } = overlayInstance;

      const pos = positions.subarray(passIdx * 4, passIdx * 4 + 4);

      pos[0] = position[0];
      pos[1] = position[1];
      pos[2] = position[2];

      let xAdvance = 0;

      glyphs.forEach((glyph) => {
        if (!glyph) {
          return;
        }

        const matrix = glyphMatrixes.subarray(
          glyphIdx * GLYPH_SIZE,
          (glyphIdx + 1) * GLYPH_SIZE,
        );

        mat3.copy(matrix, glyph.matrix);

        /**
         * 原本是glyphSize，目前看来暂时用不上，因为有advance控制
         * 改成引用position和fontIdx
         */
        matrix[2] = passIdx;
        matrix[3] = glyph.fontIdx;

        // 原本是单个字符的xAdvance，需要换成在当前文本的中的总xAdvance
        matrix[8] = xAdvance;

        const advance = glyph.matrix[8];

        xAdvance += advance;

        glyphIdx++;
      });
    });

    groups[1] = overlay.text.fontsTextureGroup;

    let groupChanged = false;

    if (!positionsBuffer || posSizeChanged) {
      positionsBuffer?.destroy();

      positionsBuffer = rewgpu.buffer({
        data: positions,
        size: positions.byteLength,
        usage: GPUBufferUsage.STORAGE,
      });

      groupChanged = true;
    } else {
      positionsBuffer.update(positions);
    }

    if (!glyphsBuffer || glyphSizeChanged) {
      glyphsBuffer?.destroy();

      glyphsBuffer = rewgpu.buffer({
        data: glyphMatrixes,
        size: glyphMatrixes.byteLength,
        usage: GPUBufferUsage.STORAGE,
      });

      groupChanged = true;
    } else {
      glyphsBuffer.update(glyphMatrixes);
    }

    if (!textGroup || groupChanged) {
      textGroup?.destroy();

      textGroup = rewgpu.group({
        label: 'overlay:text:textGroup',
        layout: pipeline.getBindGroupLayout(2),
        entries: [
          {
            binding: 0,
            resource: positionsBuffer,
          },
          {
            binding: 1,
            resource: glyphsBuffer,
          },
        ],
      });

      groups[2] = textGroup;
    }

    commandDescriptor.instanceCount = glyphsCount;

    command = rewgpu.createCommand(commandDescriptor);

    command(renderPassEncoder);
  };

  return { init, forward };
}
