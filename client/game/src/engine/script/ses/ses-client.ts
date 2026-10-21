import { ClientScriptSrcSchema } from '@box/schema/net/net-schema';
import type {
  ClientConsole,
  EventEmitter,
  UiEvent,
  UiNodeEvents,
} from '@box/script-api';
import type { Logger } from 'pino';
import { GetGlobalsSpec, getGlobals } from './apis';
import { ScriptClientConsole } from './apis/console';
import { clearClientScriptContext } from './apis/context';
import type { ScreenResizeEvent } from './apis/screen';

type EvalCodeSpec = Omit<GetGlobalsSpec, 'scriptClientConsole'> & {
  clientConsole: ClientConsole;
};

/**
 * 沙箱窗口类型定义
 * 扩展标准 Window 对象，包含脚本运行时需要的自定义全局变量
 */
interface ScriptWindow extends Window {
  /** 输入管理器 */
  input?: {
    /** 指针按下事件通知 */
    onPointerDown: { notify: (event: UiEvent) => void };
    /** UI 事件发射器 */
    uiEvents: EventEmitter<UiNodeEvents>;
    /** 清理方法 */
    destroy?: () => void;
  };
  /** 屏幕对象 */
  screen: Screen & {
    /** 窗口大小变化回调 */
    onResize?: (event: ScreenResizeEvent) => void;
  };
  /** 媒体管理器 */
  media?: {
    /** 清理方法 */
    destroy?: () => void;
  };
  /** 屏幕宽度（逻辑像素） */
  screenWidth?: number;
  /** 屏幕高度（逻辑像素） */
  screenHeight?: number;
}

/**
 * 客户端脚本沙箱执行环境
 *
 * 使用 iframe 作为隔离的沙箱环境执行客户端脚本，支持 ES Module。
 * 通过 Import Maps 实现模块解析，确保脚本在受控环境中运行。
 *
 * @example
 * ```typescript
 * const context = new SesContext(logger, modules);
 * context.evalCode('main.js', {
 *   guiClient,
 *   scheduler,
 *   clientConsole,
 *   // ...其他全局变量
 * });
 * ```
 */
export class SesContext {
  /**
   * 沙箱 iframe 实例
   */
  private iframe?: HTMLIFrameElement;

  /**
   * 创建的 Blob URL 列表，用于资源清理
   */
  private blobUrls: string[] = [];

  /**
   * 脚本控制台实例，用于输出日志
   */
  private scriptClientConsole?: ScriptClientConsole;

  /**
   * 错误事件处理器
   */
  private errorHandler?: (event: ErrorEvent) => void;

  /**
   * Promise 拒绝事件处理器
   */
  private rejectionHandler?: (event: PromiseRejectionEvent) => void;

  /**
   * 创建脚本执行上下文
   *
   * @param logger - 日志记录器
   * @param modules - 客户端脚本模块映射表
   */
  constructor(
    private logger: Logger,
    private modules: typeof ClientScriptSrcSchema.identity,
  ) {}

  /**
   * 通知运行环境中的 InputManager
   *
   * @param event - UI 事件对象
   * @deprecated 后续直接用UiEvents的EventEmitter派发事件
   */
  public notifyPointerDown(event: UiEvent) {
    const win = this.iframe?.contentWindow as ScriptWindow | null;
    win?.input?.onPointerDown?.notify(event);
  }

  /**
   * 通知运行环境中的 ClientScreen 尺寸变化
   *
   * @param event - 屏幕尺寸变化事件
   */
  public notifyResize(event: ScreenResizeEvent) {
    this.updateGlobalScreenSize(event.screenWidth, event.screenHeight);
    const win = this.iframe?.contentWindow as ScriptWindow | null;
    win?.screen?.onResize?.(event);
  }

  /**
   * 修改运行环境中的 screenWidth 和 screenHeight
   *
   * @param width - 屏幕宽度（逻辑像素）
   * @param height - 屏幕高度（逻辑像素）
   */
  public updateGlobalScreenSize(width: number, height: number) {
    if (!this.iframe?.contentWindow) {
      return;
    }
    const win = this.iframe.contentWindow as ScriptWindow;
    win.screenWidth = width;
    win.screenHeight = height;
  }

  /**
   * 获取运行环境中的 screenWidth 和 screenHeight
   *
   * @returns 包含宽度和高度的对象
   */
  public getGlobalScreenSize = () => {
    const win = this.iframe?.contentWindow as ScriptWindow | null;
    return {
      width: win?.screenWidth || 0,
      height: win?.screenHeight || 0,
    };
  };

  /**
   * 获取运行环境中的 UI 事件发射器
   *
   * @returns UI 事件发射器，如果未初始化则返回 undefined
   */
  public getUiEvents(): EventEmitter<UiNodeEvents> | undefined {
    const win = this.iframe?.contentWindow as ScriptWindow | null;
    return win?.input?.uiEvents;
  }

  /**
   * 在沙箱中执行脚本代码
   *
   * @param entry - 入口模块名称（如 'main.js'）
   * @param globals - 注入到沙箱的全局变量
   * @throws 当浏览器不支持 Import Maps 时抛出错误
   */
  public evalCode(entry: string, globals: EvalCodeSpec) {
    // 重置之前的状态
    this.reset();

    // 初始化控制台
    if (!this.scriptClientConsole) {
      this.scriptClientConsole = new ScriptClientConsole(globals.clientConsole);
    }

    this.logger.debug('eval script via iframe...');

    try {
      // 检查 Import Maps 支持
      if (
        typeof HTMLScriptElement !== 'undefined' &&
        HTMLScriptElement.supports &&
        !HTMLScriptElement.supports('importmap')
      ) {
        throw new Error('Browser does not support Import Maps');
      }

      // 创建 iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      this.iframe = iframe;
      const win = iframe.contentWindow as ScriptWindow | null;

      if (!win) {
        throw new Error('Failed to create iframe window');
      }

      // 注入全局变量
      const globalContext = getGlobals({
        getGlobalScreenSize: this.getGlobalScreenSize,
        scriptClientConsole: this.scriptClientConsole,
        ...globals,
      });

      // 构建 Import Map
      // 注意：这里我们保持相对路径 Key，依赖 <base> 标签来正确解析
      const imports = this.buildImportMap();

      // 构造完整的 HTML 内容
      // 1. 使用 history.replaceState 将 iframe URL 伪装成沙箱根路径 (SANDBOX_ROOT)，
      //    使其成为 hierarchical URL，从而支持相对路径解析。
      // 2. 使用 <base> 标签作为双重保障。
      // 3. 注入 Import Map (使用绝对路径 Key)。
      const sandboxRoot = new URL('/__sandbox__/', window.location.origin).href;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <script>
            try {
              window.history.replaceState(null, '', '${sandboxRoot}');
            } catch(e) {
              console.error('Failed to replace state in sandbox', e);
            }
          </script>
          <base href="${sandboxRoot}">
          <script type="importmap">
            ${JSON.stringify({ imports })}
          </script>
        </head>
        <body>
        </body>
        </html>
      `;

      win.document.open();
      win.document.write(htmlContent);
      win.document.close();

      // 重新获取 win 和 doc，因为 document.write 可能重置了它们
      // 注意：在某些浏览器中，document.write 后 window 对象可能保持不变，但为了安全起见
      const newWin = iframe.contentWindow as ScriptWindow;
      if (!newWin)
        throw new Error('Failed to access iframe window after write');

      // 注入全局变量到新窗口
      // 特殊处理 navigator，避免覆盖只读的 window.navigator
      if ('navigator' in globalContext) {
        const customNavigator = globalContext.navigator;
        const { navigator: _, ...restContext } = globalContext;

        try {
          Object.defineProperty(newWin, 'navigator', {
            value: customNavigator,
            writable: false,
            enumerable: true,
            configurable: true,
          });
        } catch (e) {
          this.logger.warn(e, 'Failed to override navigator');
        }

        Object.assign(newWin, restContext);
      } else {
        Object.assign(newWin, globalContext);
      }

      // 错误处理
      this.errorHandler = (event: ErrorEvent) => {
        globals.clientConsole.error(event.error || event.message);
      };
      this.rejectionHandler = (event: PromiseRejectionEvent) => {
        globals.clientConsole.error(event.reason);
      };

      newWin.addEventListener('error', this.errorHandler);
      newWin.addEventListener('unhandledrejection', this.rejectionHandler);

      // 执行入口模块
      const entryScript = newWin.document.createElement('script');
      entryScript.type = 'module';
      // 标准化入口路径：确保以 ./ 开头
      const entryKey = entry.startsWith('./') ? entry : './' + entry;
      // 这里的 import 语句会因为 iframe URL 已被 replaceState 修改，
      // 而被解析为绝对路径，进而匹配到 Import Map 中的绝对路径 Key。
      // 注意：入口脚本是内联的，它的 Base URL 是文档 URL (即 sandboxRoot)，
      // 所以这里不需要像 transformRelativeImports 那样手动转换，浏览器会自动处理。
      // 但为了保险起见，我们也可以手动转换一下。
      const absoluteEntryKey = new URL(entryKey, sandboxRoot).href;
      entryScript.textContent = `import '${absoluteEntryKey}';`;
      newWin.document.body.appendChild(entryScript);
    } catch (err) {
      this.logger.error(err, 'eval script failed.');
      globals.clientConsole.error(err);
      this.reset();
      throw err;
    }
    this.logger.debug('eval script finished.');
  }

  /**
   * 构建 Import Map 配置
   *
   * 为了解决在 iframe (about:blank) 中相对路径解析失败的问题 (Invalid relative url)，
   * 以及 Blob URL 模块内部无法正确解析相对路径 import 的问题，
   * 我们采取以下策略：
   * 1. 定义一个虚拟的沙箱根路径 (SANDBOX_ROOT)。
   * 2. 将所有模块代码中的相对路径 import 替换为基于 SANDBOX_ROOT 的绝对路径。
   * 3. 将 Import Map 的 Key 也注册为基于 SANDBOX_ROOT 的绝对路径。
   * 4. 将 iframe 的 URL 伪装为 SANDBOX_ROOT。
   *
   * @returns Import Map 的 imports 对象
   * @private
   */
  private buildImportMap(): Record<string, string> {
    const imports: Record<string, string> = {};
    // 使用当前 Origin 下的特定路径作为沙箱根目录，确保以 / 结尾
    const sandboxRoot = new URL('/__sandbox__/', window.location.origin).href;

    for (const [name, code] of Object.entries(this.modules)) {
      // 预处理代码：将相对路径 import 转换为绝对路径
      // Keep a stable module filename in browser stack traces. The source still
      // runs from a Blob for sandbox isolation, but DevTools and CLI diagnostics
      // now report clientIndex.js just like server scripts report index.js.
      const sourceName = name.replace(/[\r\n]/g, '');
      const transformedCode = `${this.transformRelativeImports(
        code,
        sandboxRoot,
      )}\n//# sourceURL=${sourceName}\n`;

      const blob = new Blob([transformedCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      this.blobUrls.push(url);

      // 构造相对路径
      const relativePath = `./${name}`;

      // 转换为绝对路径注册
      const absolutePath = new URL(relativePath, sandboxRoot).href;
      imports[absolutePath] = url;

      // 处理无扩展名的情况 (TypeScript 风格引用)
      if (relativePath.endsWith('.js')) {
        const noExtPath = relativePath.slice(0, -3);
        const absoluteNoExtPath = new URL(noExtPath, sandboxRoot).href;
        imports[absoluteNoExtPath] = url;
      }
    }

    return imports;
  }

  /**
   * 将代码中的相对路径 import 转换为绝对路径
   *
   * @param code - 源代码
   * @param baseUrl - 基础 URL
   * @returns 转换后的代码
   */
  private transformRelativeImports(code: string, baseUrl: string): string {
    // 匹配 import/export 语句中的相对路径
    // 1. import ... from './path' 或 export ... from './path'
    // 2. import './path'
    // 3. import('./path')
    const regex =
      /(import\s+['"]|from\s+['"]|import\s*\(\s*['"])(\.{1,2}\/[^'"]+)(['"])/g;

    return code.replace(regex, (match, prefix, path, suffix) => {
      try {
        const absolutePath = new URL(path, baseUrl).href;
        return `${prefix}${absolutePath}${suffix}`;
      } catch (e) {
        // 如果解析失败（例如路径不合法），保持原样
        return match;
      }
    });
  }

  /**
   * 重置沙箱环境，清理所有资源
   */
  public reset() {
    this.logger.debug('stopping script...');

    // 清理脚本上下文
    clearClientScriptContext();

    if (this.iframe) {
      const win = this.iframe.contentWindow as ScriptWindow | null;

      // 清理事件监听器
      if (win && this.errorHandler) {
        win.removeEventListener('error', this.errorHandler);
        this.errorHandler = undefined;
      }
      if (win && this.rejectionHandler) {
        win.removeEventListener('unhandledrejection', this.rejectionHandler);
        this.rejectionHandler = undefined;
      }

      // 调用清理方法
      win?.input?.destroy?.();
      win?.media?.destroy?.();

      // 移除 iframe
      if (this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
      }
      this.iframe = undefined;
    }

    // 清理 Blob URLs
    this.blobUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        this.logger.warn(e, `Failed to revoke URL: ${url}`);
      }
    });
    this.blobUrls = [];

    this.logger.debug('stopping script finished.');
  }
}
