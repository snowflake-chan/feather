struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) uv : vec2f,
  @location(1) @interpolate(flat) atlasIdx: u32,
};

@group(1) @binding(0) var fontSampler: sampler;
@group(1) @binding(1) var fontAtlas: texture_2d_array<f32>;
@group(1) @binding(2) var<uniform>texSize: vec2f;

struct GlyphMatrix {
  size: vec2f,
  // glyphSize: vec2f,
  /**
   * 原本是glyphSize，目前看来暂时用不上，因为有advance控制
   * 改成引用position和fontIdx
   */
  posIdx: f32,
  fontIdx: f32,
  bearing: vec2f,
  pos: vec2f,
  advance: f32,
}

@group(2) @binding(0) var<storage, read> uTextPos: array<vec3f>;
@group(2) @binding(1) var<storage, read> glyphMatrix: array<GlyphMatrix>;
