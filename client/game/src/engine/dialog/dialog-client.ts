import { MuClientProtocol, MuClient } from '@box/mudb/client';
import {
  DialogProtocol,
  DialogResult,
  OpenDialogSchema,
} from '@box/schema/dialog/dialog-protocol';
import { GameClientState } from '../game-client-schema';

export class DialogClient {
  private protocol: MuClientProtocol<typeof DialogProtocol>;
  private state: GameClientState;

  // // event is fired whenever a new dialog opening is requested
  // public onDialog = new EventBus<OpenDialog>();

  // // when event is fired should close all dialogs
  // public onCancelDialogs = new EventBus<void>();

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.protocol = spec.client.protocol(DialogProtocol);
    this.state = spec.state;

    this.protocol.configure({
      message: {
        open: (dialog) => {
          this.state.dialog.dialogQueue.push(OpenDialogSchema.clone(dialog));
          // this.onDialog.notify(dialog);
        },
        cancelDialogs: () => {
          // clear the queue
          for (let i = 0; i < this.state.dialog.dialogQueue.length; i++) {
            OpenDialogSchema.free(this.state.dialog.dialogQueue[i]);
          }
          this.state.dialog.dialogQueue.length = 0;
          // this.onCancelDialogs.notify();
        },
        cancelDialog: (rpcId: number) => {
          const dialogQueue = this.state.dialog.dialogQueue;
          for (let i = dialogQueue.length - 1; i >= 0; --i) {
            const dialog = dialogQueue[i];
            if (dialog.rpcId === rpcId) {
              dialogQueue.splice(i, 1);
              OpenDialogSchema.free(dialog);
              break;
            }
          }
        },
      },
    });
  }

  public resolveDialog = (rpcId: number, result: DialogResult) => {
    const dialog = this.state.dialog.dialogQueue.shift();
    if (dialog) {
      OpenDialogSchema.free(dialog);
    }
    this.protocol.server.message.close({
      rpcId,
      result,
    });
  };

  public rejectDialog = (rpcId: number) => {
    const dialog = this.state.dialog.dialogQueue.shift();
    if (dialog) {
      OpenDialogSchema.free(dialog);
    }
    this.protocol.server.message.close({
      rpcId,
      result: {
        type: 'close',
        data: void 0,
      },
    });
  };

  public cancelDialog = () => {
    const tempDialogQueue = this.state.dialog.dialogQueue.slice();
    this.state.dialog.dialogQueue.length = 0;
    for (let i = 0; i < tempDialogQueue.length; i++) {
      this.protocol.server.message.close({
        rpcId: tempDialogQueue[i].rpcId,
        result: {
          type: 'close',
          data: void 0,
        },
      });
      OpenDialogSchema.free(tempDialogQueue[i]);
    }
    tempDialogQueue.length = 0;
  };
}
