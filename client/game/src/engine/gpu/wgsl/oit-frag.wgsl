fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var bgColor = textureLoad(targetTexture, vec2u(position.xy), 0);
  var shape = vec2f(textureDimensions(targetTexture));

  // oit存储分为三个storage，按照画面分为上中下三个画面，每个画面存储 width * perH 的画面
  var perH = u32(shape.y) / u32(3);

  // use1为使用中间区域的图
  var use1 = u32(position.y) >= perH && u32(position.y) < perH * 2;
  // use2为使用底部区域的图
  var use2 = u32(position.y) >= perH * 2;

  var ptrRatio = select(u32(0), u32(1), use1);
  ptrRatio = select(ptrRatio, u32(2), use2);

  var offsetPtr = u32(position.x) + u32(shape.x) * (u32(position.y) - u32(perH) * ptrRatio) + u32(1);

  var offset = select(offsets0[offsetPtr], offsets1[offsetPtr], use1);
  offset = select(offset, offsets2[offsetPtr], use2);

  var numPixels = 0;
  var sortedPixelsIdx : array<f32, 16>;

  //收集所有的透明像素点
  while (offset > u32(0))
  {
    sortedPixelsIdx[numPixels] = f32(offset);
    numPixels++;
    if (numPixels >= 16)
    {
      offset = u32(0);
    } else {
      var nextOffset = select(nodes0[offset].next, nodes1[offset].next, use1);
      nextOffset = select(nextOffset, nodes2[offset].next, use2);

      offset = nextOffset;
    }
  }

  //根据深度插入排序
  for (var i = 1; i < numPixels; i++)
  {
    for (var j = i - 1; j >= 0; j = j - 1)
    {
      var currIdx = sortedPixelsIdx[j];
      var nextIdx = sortedPixelsIdx[j + 1];

      var currDepth = select(nodes0[u32(currIdx)].data.depth, nodes1[u32(currIdx)].data.depth, use1);
      currDepth = select(currDepth, nodes2[u32(currIdx)].data.depth, use2);

      var nextDepth = select(nodes0[u32(nextIdx)].data.depth, nodes1[u32(nextIdx)].data.depth, use1);
      nextDepth = select(nextDepth, nodes2[u32(nextIdx)].data.depth, use2);

      if (currDepth < nextDepth)
      {
        sortedPixelsIdx[j] = nextIdx;
        sortedPixelsIdx[j + 1] = currIdx;
      }
      else
      {
        break;
      }
    }
  }

  //按照顺序进行通道混合计算
  var color = bgColor.rgb;
  for (var i = 0; i < numPixels; i++)
  {

    var idx = u32(sortedPixelsIdx[i]);
    var oitColor : u32 = select(nodes0[idx].data.color, nodes1[idx].data.color, use1);
    oitColor = select(oitColor, nodes2[idx].data.color, use2);

    var rgba = unpackColor(oitColor);

    color = color * (1. - rgba.a) + rgba.rgb * rgba.a;
  }

  return vec4f(color, bgColor.a);
}

fn unpackColor(color : u32) -> vec4f {
  let c = vec4f(f32(color & u32(0x000000ff)), f32((color & u32(0x0000ff00)) >> u32(8)), f32((color & u32(0x00ff0000)) >> u32(16)), f32(color >> u32(24)));

  return c / 255.;
}
