import { NavigatorEventType } from '@box/schema/api/js/api';
import { MuClientProtocol } from '@box/mudb/client';
import { ScriptEntityWrapper } from '../script/bindings/entity-synchronizer';
import { ScriptShell } from '../script/script-shell';
import {
  MessageEventSchema,
  MessageEventType,
  NavigatorEventListener,
  PostMessageScriptType,
} from '@box/schema/navigator/navigator-schema';
import { NavigatorScriptProtocol } from './navigator-script-protocol';

export class NavigatorScriptShell {
  public protocol: MuClientProtocol<typeof NavigatorScriptProtocol>;
  public listeners: Record<number, NavigatorEventListener[]> = {};
  private notifyMessage(playerId: number, event: MessageEventType) {
    if (!this.listeners[playerId]) {
      return;
    }

    const entity = this.shell.world.entity.entityIndex.get(playerId);
    if (!entity) {
      return;
    }

    if (entity.destroyed) {
      delete this.listeners[playerId];
      return;
    }

    const _event = MessageEventSchema.clone(event);
    this.shell.scheduler.schedule(() =>
      this.listeners[playerId].forEach((listener) => {
        listener(_event);
      }),
    );
  }

  // only support message event for now
  public addEventListener = (
    wrapper: ScriptEntityWrapper,
    type: NavigatorEventType,
    listener: NavigatorEventListener,
  ) => {
    // entity id(自增id)和wrapper.entity.uid为同一个
    const { id } = wrapper;
    if (!this.listeners[id]) {
      this.listeners[id] = [listener];
    } else {
      this.listeners[id].push(listener);
    }
  };

  public postMessage = (
    wrapper: ScriptEntityWrapper,
    content: PostMessageScriptType,
  ) => {
    try {
      this.protocol.server.message.postMessage({
        playerId: wrapper.id,
        content: {
          type: content.type,
          value: JSON.stringify(content.value),
          isOld: content.isOld,
        },
      });
    } catch (error) {
      this.shell.logger.error(`trying post invalid value to ${wrapper.id}.`);
    }
  };

  constructor(private shell: ScriptShell) {
    this.protocol = shell.client.protocol(NavigatorScriptProtocol);
    this.protocol.configure({
      message: {
        notifyMessageEvent: ({ playerId, event }) => {
          this.notifyMessage(playerId, event);
        },
        reset: () => {
          this.listeners = {};
        },
      },
    });
  }
}
