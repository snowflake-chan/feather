fn fragMain(input : VertexOutput) -> @location(0) vec4 < f32> {
  //透明像素点如果深度值超过了不透明的物体，直接discard，不会进入像素链表进行绘制
  var depth = textureLoad(depthTexture, vec2u(input.position.xy), 0);
  if (depth < input.position.z)
  {
    discard;
  }

  var rgbe = textureSample(modelTexture, modelSampler, input.texcoord) * model.colorMod;

  if (IS_GLTF) {
    rgbe.a = 0.;
  }

  var color = vec4f(rgbe.rgb, 1.);
  var pbr = vec4f(1. - (1. - 2.56 * vec3f(1., 1., rgbe.a)) * (1. - model.pbrMod), 0.);

  var surf : SurfaceProperties;
  surf.albedo = color.rgb;
  surf.position = input.worldPos;
  surf.normal = normalize(input.normal);
  surf.faceU = vec3f(0.);
  surf.faceV = vec3f(0.);

  surf.emissive = pbr.b;
  surf.ao = color.a;
  surf.light00 = input.ambient;
  surf.light01 = input.ambient;
  surf.light10 = input.ambient;
  surf.light11 = input.ambient;
  surf.shadow = step(0., dot(surf.normal, commonUniform.direction));

  if (shadowData.enabledBakedShadow > 0.)
  {
    surf.shadow *= sampleBakedShadows(bakeShadowMap, surf.position, surf.normal, input.position, modelSampler);
  }

  if (shadowData.enabled > 0.)
  {
    surf.shadow *= sampleShadows(shadowData, shadowMap, surf.position, surf.normal, input.position, modelSampler);
  } else {
    surf.shadow *= input.ambient.a;
  }

  var frag : PostFrag;
  var alpha = model.colorMod.a * input.alpha;
  frag.color = vec4f(getShadedColor(surf), alpha);
  frag.eye = commonUniform.eye;
  frag.position = input.worldPos;

  color = outputFragment(frag);
  oitStorePixels(color, input.position);
  return color;
}
