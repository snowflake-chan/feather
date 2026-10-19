import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { JSONValue } from '@box/schema/api/common';
import { ServerEvent } from '@box/schema/api/js/remote-channel';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import { Logger } from '@box/utils/logger';

import { RemoteChannelScriptProtocol } from './channel-script-protocol';

export class RemoteChannelScriptShell {
  private protocol: MuClientProtocol<typeof RemoteChannelScriptProtocol>;
  public onRemoteChannel = new ScriptDispatcher<ServerEvent>();

  constructor(client: MuClient, public logger: Logger) {
    this.protocol = client.protocol(RemoteChannelScriptProtocol);
  }

  public sendEventToClients = (ids: number[], args: JSONValue) => {
    // check ids and args
    if (ids.length > 0) {
      try {
        const data = JSON.stringify(args);
        this.protocol.server.message.sendEventToClients({
          entityIds: ids,
          args: data,
        });
      } catch (error) {
        this.logger.error(error);
      }
    }
  };

  public sendEventToAllClient = (args: JSONValue) => {
    try {
      const data = JSON.stringify(args);
      this.protocol.server.message.broadcastEvent(data);
    } catch (error) {}
  };
}
