'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

exports.REWGPUType = void 0;
(function (REWGPUType) {
  REWGPUType[REWGPUType["Buffer"] = 0] = "Buffer";
  REWGPUType[REWGPUType["Texture"] = 1] = "Texture";
  REWGPUType[REWGPUType["Cube"] = 2] = "Cube";
  REWGPUType[REWGPUType["Sampler"] = 3] = "Sampler";
  REWGPUType[REWGPUType["Group"] = 4] = "Group";
})(exports.REWGPUType || (exports.REWGPUType = {}));

function objectName(str) {
  return '[object ' + str + ']';
}
function classString(x) {
  return Object.prototype.toString.call(x);
}
const CANVAS_CLASS = objectName('HTMLCanvasElement');
const OFFSCREEN_CANVAS_CLASS = objectName('OffscreenCanvas');
const BITMAP_CLASS = objectName('ImageBitmap');
const IMAGE_DATA_CLASS = objectName('ImageData');
const IMAGE_CLASS = objectName('HTMLImageElement');
const VIDEO_CLASS = objectName('HTMLVideoElement');
const VIDEO_FRAME_CLASS = objectName('VideoFrame');
function isCanvasElement(object) {
  return classString(object) === CANVAS_CLASS;
}
function isOffscreenCanvas(object) {
  return classString(object) === OFFSCREEN_CANVAS_CLASS;
}
function isImageBitmap(object) {
  return classString(object) === BITMAP_CLASS;
}
function isImageData(object) {
  return classString(object) === IMAGE_DATA_CLASS;
}
function isHTMLImageElement(object) {
  return classString(object) === IMAGE_CLASS;
}
function isHTMLVideoElement(object) {
  return classString(object) === VIDEO_CLASS;
}
function isVideoFrame(object) {
  return classString(object) === VIDEO_FRAME_CLASS;
}
function setTextureData(device, texture, data, origin, mipLevel, size, dataLayout) {
  if (isCanvasElement(data) || isOffscreenCanvas(data) || isImageBitmap(data) || isImageData(data)) {
    device.queue.copyExternalImageToTexture({
      source: data
    }, {
      texture,
      origin,
      mipLevel
    }, {
      width: data.width,
      height: data.height
    });
  } else if (isHTMLImageElement(data)) {
    device.queue.copyExternalImageToTexture({
      source: data
    }, {
      texture,
      origin,
      mipLevel
    }, {
      width: data.naturalWidth,
      height: data.naturalHeight
    });
  } else if (isHTMLVideoElement(data)) {
    device.queue.copyExternalImageToTexture({
      source: data
    }, {
      texture,
      origin,
      mipLevel
    }, {
      width: data.videoWidth,
      height: data.videoHeight
    });
  } else if (isVideoFrame(data)) {
    device.queue.copyExternalImageToTexture({
      source: data
    }, {
      texture,
      origin,
      mipLevel
    }, {
      width: data.codedWidth,
      height: data.codedHeight
    });
  } else {
    device.queue.writeTexture({
      texture,
      origin,
      mipLevel
    }, data, dataLayout ? dataLayout : {}, size ? size : {
      width: texture.width,
      height: texture.height
    });
  }
}
class TextureManager {
  constructor(device) {
    this.device = device;
    this.textureCount = 0;
    this.textureSet = new Map();
    this.cubeCount = 0;
    this.cubeSet = new Map();
  }
  create(descriptor) {
    const {
      label,
      data,
      usage,
      size,
      format,
      dataLayout,
      mipLevelCount
    } = descriptor;
    const texture = this.device.createTexture({
      label,
      size,
      format,
      mipLevelCount,
      usage: usage | GPUTextureUsage.COPY_DST
    });
    const reTexture = new REWGPUTexture(this.device, this.textureSet, this.textureCount++, texture);
    this.textureSet.set(reTexture.id, reTexture);
    if (data) {
      reTexture.update(data, {
        size,
        dataLayout
      });
    }
    return reTexture;
  }
  createCube(descriptor) {
    const {
      label,
      data,
      usage,
      size,
      format,
      dataLayout
    } = descriptor;
    const texture = this.device.createTexture({
      label,
      size: [size, size, 6],
      format,
      usage: usage | GPUTextureUsage.COPY_DST
    });
    const reCube = new REWGPUCube(this.device, this.cubeSet, this.cubeCount++, texture);
    this.cubeSet.set(reCube.id, reCube);
    if (data) {
      reCube.update(data, {
        size: [size, size],
        dataLayout
      });
    }
    return reCube;
  }
  destroy() {
    for (const [_, reTexture] of this.textureSet) {
      reTexture.destroy();
    }
    this.textureSet.clear();
    this.textureCount = 0;
    for (const [_, reCube] of this.cubeSet) {
      reCube.destroy();
    }
    this.cubeSet.clear();
    this.cubeCount = 0;
  }
}
class REWGPUTexture {
  constructor(device, cache, id, texture) {
    this.device = device;
    this.cache = cache;
    this.id = id;
    this.texture = texture;
    this.type = exports.REWGPUType.Texture;
  }
  update(data, options) {
    if (!this.texture) {
      return;
    }
    setTextureData(this.device, this.texture, data, options === null || options === void 0 ? void 0 : options.origin, options === null || options === void 0 ? void 0 : options.mipLevel, options === null || options === void 0 ? void 0 : options.size, options === null || options === void 0 ? void 0 : options.dataLayout);
  }
  destroy() {
    var _a;
    (_a = this.texture) === null || _a === void 0 ? void 0 : _a.destroy();
    this.texture = undefined;
    this.cache.delete(this.id);
  }
}
class REWGPUCube {
  constructor(device, cache, id, texture) {
    this.device = device;
    this.cache = cache;
    this.id = id;
    this.texture = texture;
    this.type = exports.REWGPUType.Cube;
  }
  update(data, options) {
    if (!this.texture) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      setTextureData(this.device, this.texture, data[i], [0, 0, i], options === null || options === void 0 ? void 0 : options.mipLevel, options === null || options === void 0 ? void 0 : options.size, options === null || options === void 0 ? void 0 : options.dataLayout);
    }
  }
  destroy() {
    var _a;
    (_a = this.texture) === null || _a === void 0 ? void 0 : _a.destroy();
    this.texture = undefined;
    this.cache.delete(this.id);
  }
}

class BufferManager {
  constructor(device) {
    this.device = device;
    this.bufferCount = 0;
    this.bufferSet = new Map();
    this.dynamicBufferSet = new Map();
  }
  create(descriptor) {
    const {
      label,
      data,
      size,
      usage,
      isDynamic
    } = descriptor;
    const buffer = this.device.createBuffer({
      label,
      size,
      usage: usage | GPUBufferUsage.COPY_DST
    });
    if (data) {
      this.device.queue.writeBuffer(buffer, 0, data);
    }
    const cache = isDynamic ? this.dynamicBufferSet : this.bufferSet;
    const reBuffer = new REWGPUBuffer(this.device, cache, this.bufferCount++, buffer, isDynamic ? data : undefined);
    cache.set(reBuffer.id, reBuffer);
    return reBuffer;
  }
  update() {
    for (const [_, reBuffer] of this.dynamicBufferSet) {
      if (!reBuffer.buffer || !reBuffer.data) {
        continue;
      }
      this.device.queue.writeBuffer(reBuffer.buffer, 0, reBuffer.data);
    }
  }
  destroy() {
    for (const [_, reBuffer] of this.bufferSet) {
      reBuffer.destroy();
    }
    this.bufferSet.clear();
    for (const [_, reBuffer] of this.dynamicBufferSet) {
      reBuffer.destroy();
    }
    this.dynamicBufferSet.clear();
    this.bufferCount = 0;
  }
}
class REWGPUBuffer {
  constructor(device, cache, id, buffer, data) {
    this.device = device;
    this.cache = cache;
    this.id = id;
    this.buffer = buffer;
    this.data = data;
    this.type = exports.REWGPUType.Buffer;
  }
  update(data, bufferOffset = 0, dataOffset, size) {
    if (!this.buffer) {
      return;
    }
    this.device.queue.writeBuffer(this.buffer, bufferOffset, data, dataOffset, size);
    if (this.data) {
      this.data = data;
    }
  }
  destroy() {
    var _a;
    (_a = this.buffer) === null || _a === void 0 ? void 0 : _a.destroy();
    this.buffer = undefined;
    this.data = undefined;
    this.cache.delete(this.id);
  }
}

class SamplerManager {
  constructor(device) {
    this.device = device;
    this.samplerCount = 0;
    this.samplerSet = new Map();
  }
  create(descriptor) {
    const sampler = this.device.createSampler(descriptor);
    const reSampler = new REWGPUSampler(this.samplerSet, this.samplerCount++, sampler);
    this.samplerSet.set(reSampler.id, reSampler);
    return reSampler;
  }
  destroy() {
    for (const [_, reSampler] of this.samplerSet) {
      reSampler.destroy();
    }
    this.samplerSet.clear();
    this.samplerCount = 0;
  }
}
class REWGPUSampler {
  constructor(cache, id, sampler) {
    this.cache = cache;
    this.id = id;
    this.sampler = sampler;
    this.type = exports.REWGPUType.Sampler;
  }
  destroy() {
    this.sampler = undefined;
    this.cache.delete(this.id);
  }
}

function isREWGPUBuffer(object) {
  return object.type === exports.REWGPUType.Buffer;
}
function isREWGPUTexture(object) {
  return object.type === exports.REWGPUType.Texture;
}
function isREWGPUCube(object) {
  return object.type === exports.REWGPUType.Cube;
}
function isREWGPUSampler(object) {
  return object.type === exports.REWGPUType.Sampler;
}

class GroupManager {
  constructor(device) {
    this.device = device;
    this.groupCount = 0;
    this.groupSet = new Map();
    this.tempEntries = new Set();
  }
  create(descriptor) {
    this.tempEntries.clear();
    descriptor.entries.forEach(i => {
      let resource;
      if (isREWGPUBuffer(i.resource) && i.resource.buffer) {
        resource = {
          buffer: i.resource.buffer,
          size: i.resource.groupSize
        };
      }
      if (isREWGPUTexture(i.resource) && i.resource.texture) {
        resource = i.resource.texture.createView({
          format: i.resource.texture.format,
          mipLevelCount: i.resource.texture.mipLevelCount
        });
      }
      if (isREWGPUCube(i.resource) && i.resource.texture) {
        resource = i.resource.texture.createView({
          dimension: 'cube'
        });
      }
      if (isREWGPUSampler(i.resource) && i.resource.sampler) {
        resource = i.resource.sampler;
      }
      if (!resource) {
        return;
      }
      this.tempEntries.add({
        binding: i.binding,
        resource
      });
    });
    const group = this.device.createBindGroup({
      label: descriptor.label,
      layout: descriptor.layout,
      entries: this.tempEntries.values()
    });
    const reGroup = new REWGPUGroup(this.groupSet, this.groupCount++, group);
    this.groupSet.set(reGroup.id, reGroup);
    this.tempEntries.clear();
    return reGroup;
  }
  destroy() {
    for (const [_, reSampler] of this.groupSet) {
      reSampler.destroy();
    }
    this.groupSet.clear();
    this.groupCount = 0;
    this.tempEntries.clear();
  }
}
class REWGPUGroup {
  constructor(cache, id, group) {
    this.cache = cache;
    this.id = id;
    this.group = group;
    this.type = exports.REWGPUType.Group;
  }
  destroy() {
    this.group = undefined;
    this.cache.delete(this.id);
  }
}

function createREWGPU(canvas, config) {
  return __awaiter(this, void 0, void 0, function* () {
    let configuration = config;
    if (!configuration) {
      configuration = yield initWebGPU();
    }
    const context = canvas.getContext('webgpu');
    if (!context) {
      return Promise.reject('WebGPU context is null');
    }
    const {
        device,
        presentationFormat
      } = configuration,
      configs = __rest(configuration, ["device", "presentationFormat"]);
    context.configure(Object.assign(Object.assign({}, configs), {
      device,
      format: presentationFormat
    }));
    const bufferManager = new BufferManager(device);
    const textureManager = new TextureManager(device);
    const samplerManager = new SamplerManager(device);
    const groupManager = new GroupManager(device);
    const createPipeline = ({
      label,
      struct,
      frag,
      vert,
      primitive,
      depthStencil,
      layout = 'auto'
    }) => {
      const shaderModule = device.createShaderModule({
        label,
        code: `
    ${struct ? struct : ''}
    ${frag ? `
    @fragment
    ${frag.content}
    ` : ''}
    @vertex
    ${vert.content}
    `
      });
      return device.createRenderPipeline({
        label,
        layout,
        vertex: {
          module: shaderModule,
          entryPoint: vert.entryPoint,
          buffers: vert.buffers,
          constants: vert.constants
        },
        fragment: frag && {
          module: shaderModule,
          entryPoint: frag.entryPoint,
          targets: [{
            format: frag.format || presentationFormat,
            blend: frag.blend
          }],
          constants: frag.constants
        },
        primitive,
        depthStencil
      });
    };
    const createCommand = props => {
      return passEncoder => {
        var _a, _b;
        passEncoder.setPipeline(props.pipeline);
        (_a = props.groups) === null || _a === void 0 ? void 0 : _a.forEach((reGroup, idx) => {
          if (reGroup.group) {
            passEncoder.setBindGroup(idx, reGroup.group, reGroup.dynamicOffsets);
          }
        });
        (_b = props.vertBuffers) === null || _b === void 0 ? void 0 : _b.forEach((reBuffer, idx) => {
          if (reBuffer.buffer) {
            passEncoder.setVertexBuffer(idx, reBuffer.buffer);
          }
        });
        if (props.indexBuffer && props.indexBuffer.reBuffer.buffer) {
          passEncoder.setIndexBuffer(props.indexBuffer.reBuffer.buffer, props.indexBuffer.indexFormat, props.indexBuffer.offset, props.indexBuffer.size);
        }
        props.indexBuffer ? passEncoder.drawIndexed(props.count, props.instanceCount, props.first, props.baseVertex, props.firstInstance) : passEncoder.draw(props.count, props.instanceCount, props.first, props.firstInstance);
      };
    };
    const clear = () => {
      bufferManager.destroy();
      textureManager.destroy();
      samplerManager.destroy();
      groupManager.destroy();
    };
    const renderMulti = descriptors => {
      const commands = [];
      const contexts = descriptors.map(des => {
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(des.renderPassDescriptor);
        des.draw(passEncoder);
        passEncoder.end();
        const commandBuffer = commandEncoder.finish();
        commands.push(commandBuffer);
        return {
          commandEncoder,
          passEncoder,
          commandBuffer
        };
      });
      bufferManager.update();
      device.queue.submit(commands);
      return contexts;
    };
    return {
      config: configuration,
      canvas,
      context,
      clear,
      destroy: () => {
        clear();
        device.destroy();
      },
      render: (renderPassDescriptor, draw) => renderMulti([{
        renderPassDescriptor,
        draw
      }]),
      renderMulti,
      buffer: described => bufferManager.create(described),
      texture: described => textureManager.create(described),
      cube: descriptor => textureManager.createCube(descriptor),
      sampler: described => samplerManager.create(described),
      group: described => groupManager.create(described),
      createBindGroupLayout: described => device.createBindGroupLayout(described),
      createPipelineLayout: described => device.createPipelineLayout(described),
      createPipeline: createPipeline,
      createCommand
    };
  });
}
function initWebGPU() {
  return __awaiter(this, void 0, void 0, function* () {
    if (!navigator.gpu) {
      return Promise.reject('WebGPU not supported');
    }
    const adapter = yield navigator.gpu.requestAdapter();
    if (!adapter) {
      return Promise.reject(`Couldn't request WebGPU adapter.`);
    }
    const device = yield adapter.requestDevice();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    return {
      device,
      presentationFormat
    };
  });
}

exports.createREWGPU = createREWGPU;
exports.initWebGPU = initWebGPU;
