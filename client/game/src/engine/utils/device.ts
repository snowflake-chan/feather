/**
 * 根据运行环境不同，使用不同的方式创建画布和上下文（仅用于绘制2d内容的画布）
 * TODO 在rusty_box android，多次调用后导致app崩溃
 */
export function getCanvas2DContext(): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
} {
  let canvas: HTMLCanvasElement;

  if (
    typeof document !== 'undefined' &&
    typeof document.createElement !== 'undefined'
  ) {
    canvas = document.createElement('canvas');
  } else {
    // in rusty_box
    canvas = new window['CanvasSurface']();
  }

  const context = canvas.getContext('2d');

  return { canvas, context };
}

export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}
