//存储静态像素链表数据 https://www.cnblogs.com/X-Jun/p/12272328.html#_lab2_4_1

@group(0) @binding(1) var depthTexture : texture_depth_2d;

@group(0) @binding(2) var<storage, read_write> staticNodes0 : array<StaticNode>;
@group(0) @binding(3) var<storage, read_write> startOffset0 : array<atomic < u32>>;

@group(0) @binding(4) var<storage, read_write> staticNodes1 : array<StaticNode>;
@group(0) @binding(5) var<storage, read_write> startOffset1 : array<atomic < u32>>;

@group(0) @binding(6) var<storage, read_write> staticNodes2 : array<StaticNode>;
@group(0) @binding(7) var<storage, read_write> startOffset2 : array<atomic < u32>>;

fn oitStorePixels(color : vec4f, position : vec4f)
{
  if (color.a < 1.0 / 255.0)
  {
    return;
  }

  // oit存储分为三个storage，按照画面分为上中下三个画面，每个画面存储 width * perH 的画面
  var perH = u32(commonUniform.viewport.y) / u32(3);

  if (u32(position.y) < perH)
  {

    //使用atomicXXX进行原子计算，处理shader并行计算导致的数据混乱
    //其实就是上锁
    var index = atomicAdd(&startOffset0[0], u32(1));

    //如果计入的像素数量超过分配的存储空间，直接return不记了
    if (index >= u32(commonUniform.oitNodesBufferSize) / u32(12))
    {
      return;
    }

    //进入原子计数器，正式记录透明像素点
    var offsetPtr = u32(position.x) + u32(commonUniform.viewport.x) * u32(position.y);
    var oldOffset = atomicExchange(&startOffset0[offsetPtr + u32(1)], index);

    var node : StaticNode;
    node.next = oldOffset;
    node.data.depth = position.z;
    node.data.color = packColor(color);
    staticNodes0[index] = node;
    return;
  }

  // 下面是另外两组画面的oit数据存储，过程都是一样的，只是读取storage不一样，不写注释了
  if (u32(position.y) >= perH && u32(position.y) < perH * 2)
  {
    var index = atomicAdd(&startOffset1[0], u32(1));

    if (index >= u32(commonUniform.oitNodesBufferSize) / u32(12))
    {
      return;
    }
    var offsetPtr = u32(position.x) + u32(commonUniform.viewport.x) * (u32(position.y) - u32(perH));
    var oldOffset = atomicExchange(&startOffset1[offsetPtr + u32(1)], index);

    var node : StaticNode;
    node.next = oldOffset;
    node.data.depth = position.z;
    node.data.color = packColor(color);
    staticNodes1[index] = node;
    return;
  }

  var index = atomicAdd(&startOffset2[0], u32(1));
  if (index >= u32(commonUniform.oitNodesBufferSize) / u32(12))
  {
    return;
  }
  var offsetPtr = u32(position.x) + u32(commonUniform.viewport.x) * (u32(position.y) - u32(perH) * u32(2));
  var oldOffset = atomicExchange(&startOffset2[offsetPtr + u32(1)], index);

  var node : StaticNode;
  node.next = oldOffset;
  node.data.depth = position.z;
  node.data.color = packColor(color);
  staticNodes2[index] = node;
}

fn packColor(color : vec4f) -> u32 {
  return u32(color.r * 255.) | (u32(color.g * 255.) << u32(8)) | (u32(color.b * 255.) << u32(16)) | (u32(color.a * 255.) << u32(24));
}
