import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { AdminProtocol } from '@box/schema/admin/admin-gateway-protocol';

/**
 * Player builds do not expose administrator or editor controls, but the
 * protocol still has to be registered. MuDB compares protocols by their
 * registration order during the WebSocket handshake; omitting this entry in
 * the player-only bundle makes it incompatible with the game server.
 */
export class GameAdminClient {
  public protocol: MuClientProtocol<typeof AdminProtocol>;

  constructor(spec: { client: MuClient }) {
    this.protocol = spec.client.protocol(AdminProtocol);
    this.protocol.configure({
      message: {
        redirect: () => undefined,
        alert: () => undefined,
      },
    });
  }

  public init() {}
}
