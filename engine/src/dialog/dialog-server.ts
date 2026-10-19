import { MuServerProtocol, MuServer } from '@box/mudb/server';
import {
  DialogProtocol,
  DialogConfig,
  OpenDialogSchema,
  DialogConfigSchema,
  DialogResultSchema,
} from '@box/schema/dialog/dialog-protocol';
import {
  DialogConnectionSchema,
  PendingDialogSchema,
  DialogEventSchema,
} from './dialog-server-schema';
import { GameServerState } from '../game-server-schema';
import { getById } from '@box/utils/id';
import { GameScriptRunState, scriptRunState } from '../script/script-schema';
import { filterSwear } from '@box/utils/swears/index';
import { getConfigSync } from '../../config/server';

function censorDialog(configs: DialogConfig) {
  const config = getConfigSync();
  const common = configs.data.common;
  common.content = filterSwear(common.content, config.SWEAR_KEY);
  common.title = filterSwear(common.title, config.SWEAR_KEY);
}

export class DialogServer {
  public protocol: MuServerProtocol<typeof DialogProtocol>;
  public state: GameServerState;

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this.protocol = spec.server.protocol(DialogProtocol);
    this.state = spec.state;

    this.protocol.configure({
      message: {
        close: (client, reply) => {
          if (
            scriptRunState(this.state.script) !== GameScriptRunState.RUNNING
          ) {
            return;
          }

          const connection = this.state.connections[client.sessionId];
          if (!connection) {
            this.state.logger.error(
              'dialog reply from invalid session id: ' + client.sessionId,
            );
            return;
          }

          const dialogState = connection.dialog;

          const pending = dialogState.pendingDialogs[reply.rpcId];
          if (!pending) {
            this.state.logger.warn(
              `dialog reply from client ${client.sessionId} for dialog rpc ${reply.rpcId} type ${reply.result.type} invalid`,
            );
            return;
          }

          delete dialogState.pendingDialogs[reply.rpcId];

          // create a dialog event
          const event = DialogEventSchema.alloc();
          event.id = connection.id;
          event.tick = this.state.clock.tick;
          event.promiseId = pending.promiseId;

          // copy event data only if consistent with client
          if (
            reply.result.type === 'close' ||
            pending.type === reply.result.type
          ) {
            DialogResultSchema.assign(event.result, reply.result);
          } else {
            event.result.type = 'close';
            event.result.data = void 0;
          }

          // push the event into the script events queue
          this.state.script.curTickEvent.events.dialogEvents.push(event);
        },
      },
      disconnect: (client) => {
        if (scriptRunState(this.state.script) !== GameScriptRunState.RUNNING) {
          return;
        }

        const connection = this.state.connections[client.sessionId];
        if (!connection) {
          return;
        }

        const dialogState = connection.dialog.pendingDialogs;
        Object.keys(dialogState).forEach((id) => {
          // create a dialog event
          const event = DialogEventSchema.alloc();
          event.id = connection.id;
          event.tick = this.state.clock.tick;
          event.promiseId = dialogState[id].promiseId;
          event.result.type = 'close';
          event.result.data = void 0;

          // push the event into the script events queue
          this.state.script.curTickEvent.events.dialogEvents.push(event);
        });
      },
    });
  }

  public openDialog = (
    playerId: number,
    promiseId: number,
    config: DialogConfig,
  ) => {
    const connection = getById(this.state.connectionSet, playerId);
    if (!connection) {
      this.state.logger.warn(
        'attempt to open dialog on closed connection: ' + playerId,
      );
      return;
    }

    const client = this.protocol.clients[connection.sessionId];
    if (!client) {
      return;
    }

    const dialogState = connection.dialog;
    const rpcId = dialogState.rpcCounter++;

    // store an entry in the client's pending RPC table
    const pending = PendingDialogSchema.alloc();
    pending.promiseId = promiseId;
    pending.type = config.type;
    dialogState.pendingDialogs[rpcId] = pending;

    // send message to client to open the dialog
    const message = OpenDialogSchema.alloc();
    message.rpcId = rpcId;
    DialogConfigSchema.assign(message.config, config);
    censorDialog(message.config);
    client.message.open(message);
    OpenDialogSchema.free(message);
  };

  public cancelDialog = () => {
    // clear all open dialogs on all clients
    this.protocol.broadcast.cancelDialogs();

    // clear all pending dialogs
    this.state.connectionSet.forEach(({ dialog }) => {
      DialogConnectionSchema.muData.pendingDialogs.assign(
        dialog.pendingDialogs,
        {},
      );
    });
  };

  public cancelAllPlayerDialogs = (playerId: number) => {
    const conn = getById(this.state.connectionSet, playerId);
    if (!conn) {
      return;
    }
    const client = this.protocol.clients[conn.sessionId];
    if (!client) {
      return;
    }

    // cancel all dialogs in client
    client.message.cancelDialogs();

    // send cancel message to client
    const pendingDialogs = conn.dialog.pendingDialogs;
    const rpcIds = Object.keys(pendingDialogs);
    for (let i = 0; i < rpcIds.length; ++i) {
      const rpcId = +rpcIds[i];
      const dialog = pendingDialogs[rpcId];

      // create a dialog event
      const event = DialogEventSchema.alloc();
      event.id = playerId;
      event.tick = this.state.clock.tick;
      event.promiseId = dialog.promiseId;
      event.result.type = 'close';
      event.result.data = void 0;

      // push the event into the script events queue
      this.state.script.curTickEvent.events.dialogEvents.push(event);

      // remove from pending dialogs
      PendingDialogSchema.free(dialog);
      delete pendingDialogs[rpcId];
    }
  };

  public cancelPlayerDialog = (playerId: number, promiseId: number) => {
    const conn = getById(this.state.connectionSet, playerId);
    if (!conn) {
      return;
    }
    const client = this.protocol.clients[conn.sessionId];
    if (!client) {
      return;
    }

    // send cancel message to client
    const pendingDialogs = conn.dialog.pendingDialogs;
    const rpcIds = Object.keys(pendingDialogs);
    for (let i = 0; i < rpcIds.length; ++i) {
      const rpcId = +rpcIds[i];
      const dialog = pendingDialogs[rpcId];
      if (dialog.promiseId === promiseId) {
        // send cancel dialog message
        client.message.cancelDialog(rpcId);

        // create a dialog event
        const event = DialogEventSchema.alloc();
        event.id = playerId;
        event.tick = this.state.clock.tick;
        event.promiseId = promiseId;
        event.result.type = 'close';
        event.result.data = void 0;

        // push the event into the script events queue
        this.state.script.curTickEvent.events.dialogEvents.push(event);

        // remove from pending dialogs
        PendingDialogSchema.free(dialog);
        delete pendingDialogs[rpcId];

        // stop loop
        break;
      }
    }
  };
}
