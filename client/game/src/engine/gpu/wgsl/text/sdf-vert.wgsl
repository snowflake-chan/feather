fn vertexMain(
  @location(0) aPosition: vec2<f32>,
  @location(1) aTexCoord: vec2<f32>,
  @builtin(instance_index) instance: u32
) -> VertexOutput {
  var output: VertexOutput;

  let matrix = glyphMatrix[instance];
  let position = uTextPos[u32(matrix.posIdx)];

  // TODO 应该和postion一样，通过storage传入
  let scale = 0.005;

  let left = matrix.bearing.x * scale;
  let top = 0. - (matrix.size.y - matrix.bearing.y) * scale;

  let width = matrix.size.x * scale;
  let height = matrix.size.y * scale;

  let size = aPosition * vec2(width, height);

  var pos = commonUniform.viewProj * vec4(position, 1.0);
  // 透视除法，转换为设备坐标系（笛卡尔坐标系）
  pos /= pos.w;

  pos.x += size.x + left + matrix.advance * scale;
  pos.y += size.y + top;

  output.position = pos;

  // 计算uv
  let uv = aTexCoord * matrix.size + matrix.pos;

  output.uv = uv / texSize;
  output.atlasIdx = u32(matrix.fontIdx);

  return output;
}