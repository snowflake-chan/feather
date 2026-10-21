fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var uv = position.xy;
  var shape = vec2f(textureDimensions(targetTexture));

  if (uni.underwater > 0.)
  {
    let d = uv / shape - 0.5;

    uv += -10. * d +
    vec2f(
    0.3 * cos(0.05 * uv.x + 0.2 * uni.tick) + 8. * cos(0.02 * uv.y + 0.7 * uni.tick),
    5. * cos(0.009 * uv.x + uni.tick) + 0.5 * cos(0.073 * uv.y + 0.3 * uni.tick));
  }

  var color = textureLoad(targetTexture, vec2u(uv), 0).rgb;

  //开启后期处理，revertToneMapping效果，进行后期处理颜色叠加
  //叠加后重新做ToneMapping
  if (uni.enabled > 0.)
  {
    color = pow(color, vec3f(commonUniform.gamma));
    color = revertToneMapping(color) / commonUniform.exposure;
  }

  //ssao环境遮蔽
  if (uni.ssao > 0.)
  {
    var occlusion = 0.;
    for (var i = - 2; i <= 2; i++)
    {
      for (var j = - 2; j <= 2; j++)
      {
        occlusion += textureLoad(ssaoTarget, vec2u(uv + vec2f(f32(i), f32(j))), 0).r;
      }
    }

    color = color * (occlusion / 25.);
  }

  //depth景深
  if (uni.enabled > 0. && uni.depthOfField > 0.)
  {
    var centerDepth = fetchDepth(vec2u(uv));
    var centerSize = blurSize(centerDepth, uni.playerDepth, uni.depthOfField);

    var tot = 1.0;

    var dv = vec2f(cos(ANGLE_STEP), sin(ANGLE_STEP));
    var v = dv;
    var radius = RAD_STEP;
    for (var i = 0; i < 16; i++)
    {
      var tc = uv + radius * v;
      var sampleColor = textureLoad(targetTexture, vec2u(tc), 0).rgb;
      sampleColor = pow(sampleColor, vec3f(commonUniform.gamma));
      sampleColor = revertToneMapping(sampleColor) / commonUniform.exposure;
      var sampleDepth = fetchDepth(vec2u(tc));
      var sampleSize = blurSize(sampleDepth, uni.playerDepth, uni.depthOfField);

      if (sampleDepth > centerDepth)
      {
        sampleSize = clamp(sampleSize, 0., 2. * centerSize);
      }

      color +=
      mix(
      color / tot,
      sampleColor,
      smoothstep(radius - 0.5, radius + 0.5, sampleSize));

      tot += 1.0;
      radius += RAD_STEP;
      v = vec2f(v.x * dv.x - v.y * dv.y, v.x * dv.y + v.y * dv.x);
    }
    color /= tot;
  }

  //volumetric scattering
  if (uni.scattering > 0.)
  {
    color += volumetricScattering(vec2u(uv), shape);
  }

  if (uni.enabled > 0.)
  {
    //apply exposure correction
    color *= commonUniform.exposure;
  }

  //bloom荧光
  //add bloom (exposure correction is already applied)
  if (uni.bloom > 0.)
  {
    color += 2. * textureSample(bloom, postSampler, uv / shape).rgb;
  }

  if (uni.enabled > 0.)
  {
    color = toneMapping(color);
  }

  if (uni.lutEnabled > 0.)
  {
    //如果没有开后期处理，需要先将颜色值转到计算gamma值之前，在进行滤镜叠加计算
    if (uni.enabled == 0.)
    {
      color = pow(color, vec3f(commonUniform.gamma));
    }

    color = applyLUT(lut, postSampler, color);

    //如果没有开启后期处理，需要在这一步再进行gamma的计算转回来
    if (uni.enabled == 0.)
    {
      color = pow(color, vec3f(1. / commonUniform.gamma));
    }
  }

  if (uni.enabled > 0.)
  {
    color = pow(color, vec3f(1. / commonUniform.gamma));
  }

  //outline计算
  //取上，下，左，右四个点的深度模板值
  var uvOffset = vec4u(u32(1), u32(0), u32(0), u32(1));
  var c1 = readOutlineDepth(vec2u(uv) + uvOffset.xy);
  var c2 = readOutlineDepth(vec2u(uv) - uvOffset.xy);
  var c3 = readOutlineDepth(vec2u(uv) + uvOffset.yw);
  var c4 = readOutlineDepth(vec2u(uv) - uvOffset.yw);

  //取对角线差值，任意一个对角线有插值即为边界点
  var diff1 = c1 - c2;
  var diff2 = c3 - c4;
  var d = length(vec2f(diff1, diff2));
  var outlineColor = OUTLINE_COLOR * vec4f(d);

  color = color * (1. - outlineColor.a) + outlineColor.rgb * outlineColor.a;

  return vec4f(color, 1.);
}

fn fetchDepthStencil(xy : vec2 < u32>) -> f32 {
  var depth = textureLoad(depthTexture, xy, 0);
  var transparentDepth = textureLoad(transparentDepthTexture, xy, 0);
  return min(depth, transparentDepth);
}

fn fetchDepth(xy : vec2 < u32>) -> f32 {
  var zn = fetchDepthStencil(xy);
  return 2. * uni.zNear * uni.zFar / (uni.zFar + uni.zNear - zn * (uni.zFar - uni.zNear));
}

fn blurSize(depth : f32, focusPoint : f32, focusScale : f32) -> f32 {
  return MAX_BLUR_SIZE * clamp(focusScale * abs(1. / focusPoint - 1. / depth), 0., 1.);
}

//简化为有深度or无深度两个状态
fn readOutlineDepth(xy : vec2 < u32>) -> f32 {
  return floor(textureLoad(outlineDepth, xy, 0));
}

fn volumetricScattering(xy : vec2 < u32>, shape : vec2f) -> vec3f {
  var uv = vec2f(xy) / shape;

  var lightXY = 0.5 * (1. + uni.screenLightPos.xy);
  lightXY = vec2f(lightXY.x, 1. - lightXY.y);
  var delta = sign(uni.screenLightPos.z) * (uv - lightXY);
  var r = length(delta);
  delta *= 0.5 * min(r, 1.) / (r * f32(NUM_RADIAL_BLUR_STEPS));

  var accum = vec3f(0.);
  var weight = 1. / f32(NUM_RADIAL_BLUR_STEPS);

  var depth = fetchDepthStencil(xy);

  for (var i = 0; i < NUM_RADIAL_BLUR_STEPS; i++)
  {
    uv -= delta;
    var d = fetchDepthStencil(vec2u(uv * shape));
    var scatterColor = textureSample(scatteringTarget, postSampler, uv).rgb;
    scatterColor = pow(scatterColor, vec3f(commonUniform.gamma));
    scatterColor = revertToneMapping(scatterColor) / commonUniform.exposure;
    accum += (weight * step(depth * 0.99, d)) * scatterColor;
    weight *= uni.eyeFogExtinction;
  }

  return accum;
}
