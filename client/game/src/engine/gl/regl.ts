import _REGL from 'regl';
import { isMobile } from '../../utils/mobile';

export type REGL = _REGL.Regl;

function _moduleLoader<ModType>(
  _: (regl: _REGL.Regl, requireREGL: REGLLoader) => ModType,
): ModType {
  return <ModType>(<any>void 0);
}

export interface REGLProfileData {
  count: number;
  cpuTime: number;
  gpuTime: number;
}

export interface REGLLoader {
  /**
   * regl本re
   */
  regl: _REGL.Regl;
  /**
   * 文件引用，不知道干啥的，为了统一管理？
   */
  require: typeof _moduleLoader;
  /**
   * 做缓存？重点看
   * @param name
   * @param commandSpec
   * @param profile
   * @param flags
   * @returns
   */
  cache: <StateType, PropType>(
    name: string,
    commandSpec: _REGL.DrawConfig,
    profile: boolean,
    flags?: { [symbol: string]: (state: StateType) => boolean | number },
  ) => (state: StateType) => (prop?: PropType, ...rest) => void;
  /**
   * emmm真的有用到么 看性能的，雕花就先放着八
   * @returns
   */
  stats: () => { [name: string]: REGLProfileData };
  /**
   * webgl兼容特色，webgpu暂不考虑
   */
  floatBuffer: {
    type: 'uint8' | 'half float' | 'float';
    filter: 'nearest' | 'linear';
  };
  /**
   * 这个重点看
   * @param state
   * @returns
   */
  preloadShaders: <PropType>(state: PropType) => void;
}

class CachedREGLCommand {
  constructor(
    // 常驻变量的方法
    public flagFunc: ((state: any) => number | boolean)[],
    // 常驻变量真正的值
    public flags: number[],
    public cmd: any,
  ) {}

  public test(state: any) {
    const { flags, flagFunc } = this;
    for (let i = 0; i < flags.length; ++i) {
      if (flags[i] !== +flagFunc[i](state)) {
        return false;
      }
    }
    return true;
  }
}

export function createREGLCache(regl, profile: boolean): REGLLoader {
  const definitionCache: any[] = [];
  const valueCache: any[] = [];

  const commandCache: { [id: string]: CachedREGLCommand[] } = {};
  const commandDefinitionSet: ((state) => any)[] = [];

  // 一下代码做兼容用，暂不考虑
  let type = 'half float';
  let filter = 'linear';
  if (regl.hasExtension('OES_texture_half_float')) {
    if (!regl.hasExtension('OES_texture_half_float_linear')) {
      filter = 'nearest';
    }
  } else if (regl.hasExtension('OES_texture_float')) {
    type = 'float';
    if (!regl.hasExtension('OES_texture_float_linear')) {
      filter = 'nearest';
    }
  } else {
    type = 'uint8';
  }

  // check that framebuffer configuration is renderable
  // on some phones they say half float is supported, but they really aren't
  if (type !== 'uint8') {
    const gl: WebGLRenderingContext = regl._gl;
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const color = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, color);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      2,
      2,
      0,
      gl.RGBA,
      type === 'float' ? gl.FLOAT : 0x8d61,
      null,
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      color,
      0,
    );
    if (
      gl.getError() ||
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
    ) {
      type = 'uint8';
      filter = 'linear';
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(color);
    regl._refresh();
  }

  /**
   * emmm怎么能叫preloadShaders呢，每次常驻定义发生变化都需要调一次调整常驻定义的值
   * @param state
   * @returns
   */
  function preloadShaders(state) {
    if (isMobile()) {
      return;
    }
    for (let i = 0; i < commandDefinitionSet.length; ++i) {
      commandDefinitionSet[i](state);
    }
  }

  const loader: REGLLoader = {
    regl,
    cache: cacheCommand,
    require: requireModule,
    stats: () => {
      const result: { [id: string]: REGLProfileData } = {};
      Object.keys(commandCache).map((key) => {
        const commands = commandCache[key];
        const x = {
          count: 0,
          cpuTime: 0,
          gpuTime: 0,
        };
        for (let i = 0; i < commands.length; ++i) {
          x.count += commands[i].cmd.stats.count;
          x.cpuTime += commands[i].cmd.stats.cpuTime;
          x.gpuTime += commands[i].cmd.stats.gpuTime;
        }
        result[key] = x;
      });
      return result;
    },
    floatBuffer: {
      type: <any>type,
      filter: <any>filter,
    },
    preloadShaders,
  };

  /**
   * 就是cache功能，这里缓存所有的draw call数据
   * @param name 随便起的名字，作为缓存Id
   * @param commandSpec 就是绘制的一些配置啦，重点
   * @param noProfile 啥玩意，一般是true。哦no，profile是false，他永远是false，这个没用了
   * @param flags 常驻变量，数字or布尔值
   * @returns
   */
  function cacheCommand(
    name: string,
    commandSpec: any,
    noProfile: boolean,
    flags?: { [symbol: string]: (state) => boolean | number },
  ) {
    const commandList: CachedREGLCommand[] = [];

    let baseFrag = commandSpec.frag;
    const baseVert = commandSpec.vert;

    // 一些gl兼容特色，不管
    if (baseFrag && regl.hasExtension('OES_standard_derivatives')) {
      baseFrag = '#extension GL_OES_standard_derivatives : enable\n' + baseFrag;
    }
    if (baseFrag && regl.hasExtension('EXT_shader_texture_lod')) {
      baseFrag = '#extension GL_EXT_shader_texture_lod : enable\n' + baseFrag;
    }

    if (!flags) {
      const spec = Object.assign({
        ...commandSpec,
        profile: profile && !noProfile, // profile是regl的配置？不知道干啥的，但是永远是false
      });
      if (baseFrag) {
        spec.frag = baseFrag;
      }
      if (baseVert) {
        spec.vert = baseVert;
      }
      // regl的方法，生成regl可用的draw cmd
      const cmd = regl(spec);
      commandList.push(new CachedREGLCommand([], [], cmd));
      return cmd;
    }

    commandCache[name] = commandList;

    const flagSymbol = Object.keys(flags);
    const flagFunc = flagSymbol.map((sym) => flags[sym]);

    // 生成glsl可用的常量语句
    function generatePrefix(flagVals: number[]) {
      const result: string[] = [];
      for (let i = 0; i < flagSymbol.length; ++i) {
        if (flagVals[i]) {
          result.push(`#define ${flagSymbol[i]} ${flagVals[i].toFixed(1)}`);
        }
      }
      return result.join('\n') + '\n';
    }

    function generateCommand(state) {
      // 布尔值也转数字，这就是真正的值了
      const flagVals = flagFunc.map((f) => +f(state));
      const cmd = regl({
        ...commandSpec,
        frag: generatePrefix(flagVals) + baseFrag,
        vert: generatePrefix(flagVals) + baseVert,
        profile,
      });
      commandList.unshift(new CachedREGLCommand(flagFunc, flagVals, cmd));
      return cmd;
    }

    function getCommand(state) {
      for (let i = 0; i < commandList.length; ++i) {
        const cmd = commandList[i];

        // 测试这个常驻值是否没变化，true表示所有的都没变化
        // 也就是说所有的常驻值的版本都会存缓存，第0个永远是当前版本正确的配置
        if (cmd.test(state)) {
          if (i > 0) {
            // move to front of list
            for (let j = i; j > 0; --j) {
              commandList[j] = commandList[j - 1];
            }
            commandList[0] = cmd;
          }
          return cmd.cmd;
        }
      }
      return generateCommand(state);
    }

    commandDefinitionSet.push(getCommand);

    return getCommand;
  }

  // 以防。。重复调用？但其实不会
  function requireModule<ModuleType>(
    moduleDefinition: (regl: _REGL.Regl, requireRegl: REGLLoader) => ModuleType,
  ): ModuleType {
    const idx = definitionCache.indexOf(moduleDefinition);
    if (idx >= 0) {
      return valueCache[idx];
    }
    const moduleValue = moduleDefinition(regl, loader);
    definitionCache.push(moduleDefinition);
    valueCache.push(moduleValue);
    return moduleValue;
  }

  return loader;
}

export function safeProp<PropType extends { [key: string]: any }>(
  regl: _REGL.Regl,
) {
  function next<U extends { [key: string]: any }, P>(
    ret: (string | number | symbol)[],
    prop: P,
  ) {
    function m<K extends keyof U>(key: K) {
      const r = ret.slice();
      r.push(key);
      const p = regl.prop<U, typeof key>(<any>r.join('.'));
      return next<U[K], typeof p>(r, p);
    }
    return Object.assign(m, {
      prop,
    });
  }
  const _prop = regl.prop<{ p: PropType }, 'p'>(<any>'');
  return next<PropType, typeof _prop>([], <typeof _prop>(<any>((_, x) => x)));
}
