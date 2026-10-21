mat4 getNodeMatrix(
  const float nodeIdx,
  const int matrixTextureSize,
  const sampler2D matrixTexture
) {
  // 一个像素点记录四个数字，四个像素点一组记录一个mat4
  // nodeIdx为节点的索引值，一个节点占四个像素位，步长为4
  // 计算出当前节点起始的位置为j
  float j = nodeIdx * 4.0;

  // 合成的matrix图片为 matrixTextureSize * matrixTextureSize 的正方形
  // 取余得x坐标，取floor得y坐标
  float x = mod(j, float(matrixTextureSize));
  float y = floor(j / float(matrixTextureSize));

  // 得到的x,y坐标是 matrixTextureSize * matrixTextureSize 尺寸下的坐标点
  // 转换为 1 * 1 尺寸下的坐标点
  float d = 1.0 / float(matrixTextureSize);
  y = d * y;

  vec4 v1 = texture2D(matrixTexture, vec2(d * x, y));
  vec4 v2 = texture2D(matrixTexture, vec2(d * (x + 1.), y));
  vec4 v3 = texture2D(matrixTexture, vec2(d * (x + 2.), y));
  vec4 v4 = texture2D(matrixTexture, vec2(d * (x + 3.), y));
  mat4 nodeMatrix = mat4(v1, v2, v3, v4);

  return nodeMatrix;
}

#pragma glslify:export(getNodeMatrix)