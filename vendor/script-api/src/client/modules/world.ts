interface WritableProperty<T> extends PropertyDescriptor {
  get(): T;
  set(value: unknown): void;
}

/**
 * 代表客户端上的游戏世界
 */
export class ClientWorld {
  /**
   * 控制是否渲染3D场景。
   * 当关闭时，3D 场景的渲染将在客户端暂停，画面会停留在最后一次渲染的状态。
   * 2D UI 不受此属性影响，除 3D 渲染外的客户端行为不受此属性影响。
   * @example
   * const renderingBtn = ui.findChildByName('rendering3d');
   * renderingBtn.events.on('pointerdown', () => {
   *    console.info('Rendering switch!');
   *    world.rendering3d = !world.rendering3d;
   * })
   */
  public rendering3d = true;
  /**
   * @ignore
   */
  constructor(rendering3d: WritableProperty<boolean>) {
    Object.defineProperties(this, {
      rendering3d,
    });
  }
}

export declare const world: ClientWorld;
