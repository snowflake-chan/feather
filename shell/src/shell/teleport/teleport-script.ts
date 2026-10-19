import { MuClientProtocol, MuClient } from '@box/mudb/client';
import type {
  TELEPORT_ERROR_STATUS,
  TeleportResult,
} from '@box/schema/api/js/api';
import type { CommonError } from '@box/schema/api/js/error';

import { PromiseWrapper } from '../utils/script-promise';
import { TeleportScriptProtocol } from './teleport-script-protocol';

export type ErrorType = CommonError<TELEPORT_ERROR_STATUS>;
const errorMsgList: { [k in TELEPORT_ERROR_STATUS]: ErrorType } = {
  PLAYER_OFFLINE: {
    status: 'PLAYER_OFFLINE',
    code: 400,
    msg: 'Teleport cannot be completed, some of the specified players are currently offline.',
  },
  ACCESS_DENIED: {
    status: 'ACCESS_DENIED',
    code: 401,
    msg: 'The map does not have the necessary permissions to utilize the teleport API.',
  },
  UNKNOWN: {
    status: 'UNKNOWN',
    code: 500,
    msg: 'Internal Server Error.',
  },
};

export class TeleportScriptShell {
  public wrappers: { [handle: number]: PromiseWrapper<any> } = {};
  private handleCounter = 0;
  private protocol: MuClientProtocol<typeof TeleportScriptProtocol>;

  constructor(client: MuClient, public schedule: (event: () => void) => void) {
    this.protocol = client.protocol(TeleportScriptProtocol);
    this.protocol.configure({
      message: {
        teleportDone: ({ handle, serverId }) => {
          const wrapper = this.wrappers[handle];
          if (!wrapper) return;
          wrapper.notifyDone(<TeleportResult>{ serverId });
          delete this.wrappers[handle];
        },
        teleportError: ({ handle, error }) => {
          const wrapper = this.wrappers[handle];
          if (!wrapper) return;
          wrapper.notifyError(new Error(this._getErrorMsg(error)));
          delete this.wrappers[handle];
        },
      },
    });
  }

  public teleport = (
    mapId: string,
    playerIds: number[],
    serverId: string = '',
  ) => {
    const wrapper = new PromiseWrapper<TeleportResult>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;
    this.protocol.server.message.teleport({
      handle,
      mapId,
      playerIds,
      serverId,
    });
    return wrapper.query;
  };

  private _getErrorMsg(err: { key: TELEPORT_ERROR_STATUS; msg?: string }) {
    const base = errorMsgList[err.key] || errorMsgList.UNKNOWN;
    return JSON.stringify(err.msg ? { ...base, msg: err.msg } : base);
  }
}
