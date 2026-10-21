fn fragMain(@builtin(position) position : vec4f,
@location(0) worldPos : vec3f,
@location(1) uv : vec2f,
@location(2) voxelXZ : vec2f,
@location(3) voxelY : f32,
) -> @location(0) vec4 < f32> {

  //check if snow is within height limit
  var heightLimit = uni.positionRange.y * textureSample(voxelHeight, snowSampler, voxelXZ).r;
  if (voxelY < heightLimit)
  {
    discard;
  }

  //透明像素点如果深度值超过了不透明的物体，直接discard，不会进入像素链表进行绘制
  var depth = textureLoad(depthTexture, vec2u(position.xy), 0);
  if (depth < position.z)
  {
    discard;
  }

  var c = textureSample(snowTexture, snowSampler, uv) * uni.color;
  var frag : PostFrag;
  frag.color = vec4f(c.rgb * commonUniform.color, c.a);
  frag.eye = commonUniform.eye;
  frag.position = worldPos;

  var color = vec4f(outputFragment(frag).rgb, c.a);
  oitStorePixels(color, position);
  return color;
}
