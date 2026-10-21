fn fragMain(input : VertexOutput) -> @location(0) vec4 <f32> {
  let blockColor = textureSample(colorAtlasTexture, breakSampler, input.texCoord);
  let blockMaterial = textureSample(materialAtlasTexture, breakSampler, input.texCoord);

  //unpack surface info
  var surf : SurfaceProperties;
  surf.position = input.worldPos;
  surf.albedo = blockColor.rgb;

  surf.normal = input.normal;
  surf.ao = input.ambientLight.a;

  surf.emissive = blockMaterial.b;
  surf.faceU = input.tangentU;
  surf.faceV = input.tangentV;

  surf.light00 = input.ambientLight;
  surf.light01 = input.ambientLight;
  surf.light10 = input.ambientLight;
  surf.light11 = input.ambientLight;

  //compute shadow values
  surf.shadow = step(0., dot(surf.normal, commonUniform.direction));
  if (shadowData.enabled > 0.)
  {
    surf.shadow *= sampleShadows(shadowData, shadowMap, surf.position, surf.normal, input.position, breakSampler);
  } else {
    surf.shadow *= input.ambientLight.a;
  }

  var frag : PostFrag;
  frag.color = vec4f(getShadedColor(surf), surf.shadow);
  frag.eye = commonUniform.eye;
  frag.position = input.worldPos.xyz;

  return outputFragment(frag);
}
