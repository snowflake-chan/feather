fn fragMain(@builtin(position) position : vec4f,
@location(0) fog : vec4f,
@location(1) faceNormalAmbient : vec4f,
@location(2) worldPos : vec3f
) -> @location(0) vec4f {
  //透明像素点如果深度值超过了不透明的物体，直接discard，不会进入像素链表进行绘制
  var depth = textureLoad(depthTexture, vec2u(position.xy), 0);
  if (depth < position.z)
  {
    discard;
  }

  //unpack normal and ambient occlusion values
  var faceNormal = faceNormalAmbient.xyz;
  var ambientOcclusion = faceNormalAmbient.w;

  //calculate water height and gradient
  var U = vec3f(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
  var V = vec3f(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));
  var data = waterHeight(faceNormal, U, V, worldPos);
  var fragNormal = data.rgb;
  var height = data.a;

  //compute screen space view direction
  var viewDir = normalize(worldPos - commonUniform.eye);
  var reflectDir = reflect(viewDir, fragNormal);
  var lightDir = commonUniform.direction;

  //calculate reflection
  var reflectColor = 0.125 * (ambientOcclusion / (abs(reflectDir.x) + abs(reflectDir.y) + abs(reflectDir.z))) * (
  max(reflectDir.x, 0.) * commonUniform.skyLeft +
  max(-reflectDir.x, 0.) * commonUniform.skyRight +
  max(reflectDir.y, 0.) * commonUniform.skyTop +
  max(-reflectDir.y, 0.) * commonUniform.skyBottom +
  max(reflectDir.z, 0.) * commonUniform.skyFront +
  max(-reflectDir.z, 0.) * commonUniform.skyBack);
  var opticalDepth = 18. - 4. * height;

  //compute specular contribution
  var specular = (ambientOcclusion * (68. / (PI * 8.))) * pow(clamp(dot(reflectDir, lightDir), 0., 1.), 60.);

  //compute extinction
  var extinction = clamp(1. - exp(-0.1 * opticalDepth * fog.a), 0., 1.);

  //compute fresnel weight
  var fresnel = 1. - 0.65 * pow5(1.0 - max(0., dot(fragNormal, viewDir)));
  var fragColor = vec4f(
  specular * commonUniform.color +
  fresnel * reflectColor +
  extinction * fog.rgb,
  extinction);

  var frag : PostFrag;
  frag.color = fragColor;
  frag.eye = commonUniform.eye;
  frag.position = worldPos;
  var color = outputFragment(frag);
  oitStorePixels(color, position);
  return color;
}

fn waterHeight(faceNormal : vec3f, faceU : vec3f, faceV : vec3f, position : vec3f) -> vec4f {
  var uv = vec2f(
  dot(position, faceU),
  dot(position, faceV));
  var info =
  textureSample(waterBumpTexture, voxelSampler,
  vec2f(-0.09034713652888932, 0.04168606254177097) * uv.x +
  vec2f(-0.04168606254177097, -0.09034713652888932) * uv.y +
  vec2f(0.09047047097772415, -0.17836786112152822) * commonUniform.now).rgb +
  textureSample(waterBumpTexture, voxelSampler,
  vec2f(0.03761523317359175, -0.0905008243239295) * uv.x +
  vec2f(0.0905008243239295, 0.03761523317359175) * uv.y +
  vec2f(-0.19970633443880023, 0.010834204401712169) * commonUniform.now).rgb +
  textureSample(waterBumpTexture, voxelSampler,
  vec2f(0.03281944212910051, 0.08971935294507542) * uv.x +
  vec2f(-0.08971935294507542, 0.03281944212910051) * uv.y +
  vec2f(0.109235863461076, 0.16753365671981604) * commonUniform.now).rgb;
  var grad = info.rg - 1.5;
  return vec4f(
  normalize(
  4. * faceNormal +
  grad.x * faceU +
  grad.y * faceV),
  info.b / 3.);
}

fn pow5(x : f32) -> f32
{
  var x2 = x * x;
  return x2 * x2 * x;
}
