import { GamePlayerEntity } from '@box/schema/api/js/api';
import { GameGUI, GameGUIEventListener } from '@box/schema/api/js/gui';
import { MuClientProtocol } from '@box/mudb/client';
import { GameUIDEntity } from '../script/bindings/entity-synchronizer';
import { ScriptShell } from '../script/script-shell';
import { GUIScriptProtocol } from './gui-script-protocol';
import { PromiseWrapper } from '@box/utils/promise-wrapper';
import { GUIConfig, GUIData } from '@box/schema/gui/types';

export class GUIScriptShell {
  public protocol: MuClientProtocol<typeof GUIScriptProtocol>;
  public guiAPI: GameGUI;
  public listeners: GameGUIEventListener[] = [];
  private wrappers = {} as { [handle: number]: PromiseWrapper<any> };
  private handleCounter = 0;

  public init = async <T extends string, U extends T>(
    entity: GamePlayerEntity,
    config: GUIConfig<T, U>,
  ) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.init({
      handle,
      id: (entity as GameUIDEntity).uid,
      data: JSON.stringify(config),
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  };

  public append = async (
    entity: GamePlayerEntity,
    selector: string,
    data: (string | GUIData)[],
  ) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.append({
      handle,
      id: (entity as GameUIDEntity).uid,
      selector,
      data: JSON.stringify(data),
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  };

  public show = async (
    entity: GamePlayerEntity,
    name: string,
    allowMultiple = false,
  ) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.show({
      handle,
      id: (entity as GameUIDEntity).uid,
      name,
      allowMultiple,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  };

  public remove = async (entity: GamePlayerEntity, selector: string) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.remove({
      handle,
      id: (entity as GameUIDEntity).uid,
      selector,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  };

  public getAttribute = async (
    entity: GamePlayerEntity,
    selector: string,
    name: string,
  ) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.getAttribute({
      handle,
      id: (entity as GameUIDEntity).uid,
      selector,
      name,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return wrapper.promise;
  };

  public setAttribute = async (
    entity: GamePlayerEntity,
    selector: string,
    name: string,
    value: any,
  ) => {
    const handle = this.handleCounter++;
    this.protocol.server.message.setAttribute({
      handle,
      id: (entity as GameUIDEntity).uid,
      selector,
      name,
      value: JSON.stringify(value),
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  };

  public addEventListener = (listener: GameGUIEventListener) => {
    this.listeners.push(listener);
  };

  private notifyMessage(entity: GamePlayerEntity, name: string, payload: any) {
    for (const l of this.listeners) {
      l({ entity, name, payload });
    }
  }

  constructor(private shell: ScriptShell) {
    this.protocol = shell.client.protocol(GUIScriptProtocol);
    const resolve = ({ handle, value }: any) => {
      const p = this.wrappers[handle];
      if (p) {
        p.resolve(value ? JSON.parse(value) : undefined);
      }
    };
    const reject = ({ handle, message }: any) => {
      const p = this.wrappers[handle];
      if (p) {
        p.reject(new Error(message));
      }
    };
    this.protocol.configure({
      message: {
        sendMessage: ({ id, name, payload }) => {
          const entity = shell.world.entity.entityIndex.get(id);
          if (entity) {
            this.notifyMessage(
              <GamePlayerEntity>entity.entity,
              name,
              JSON.parse(payload),
            );
          }
        },
        return: resolve,
        throw: reject,
      },
    });

    this.guiAPI = new GameGUI(
      this.init,
      this.show,
      this.remove,
      this.getAttribute,
      this.setAttribute,
      this.addEventListener,
    );
  }
}
