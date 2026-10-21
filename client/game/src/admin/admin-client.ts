import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { AdminProtocol } from '@box/schema/admin/admin-gateway-protocol';
import {
  AdminCommand,
  AdminCommandSchema,
  AdminEventSchema,
  AdminUserSchema,
  AdminUserSetSchema,
} from '@box/schema/admin/admin-protocol';
import { ClientStateType } from 'src/client/edit/edit-schema';
import { EditRPCClient } from 'src/client/edit/rpc/rpc-client';
import { AssetController } from 'src/client/edit/state-controller/asset-controller';
import { SeedController } from 'src/client/edit/state-controller/seed-controller';
import type { AdminConsole } from './admin-console';
import type { PlayClient } from 'src/client/play/play-client';
import type { EditClient } from 'src/client/edit/edit-client';
import type { EditContentStorage } from 'src/client/edit/content';

export class GameAdminClient {
  public protocol: MuClientProtocol<typeof AdminProtocol>;
  public app: PlayClient | EditClient;
  public rpc?: EditRPCClient;
  public seedController?: SeedController;
  public assetController?: AssetController;
  public editContentStorage?: EditContentStorage;
  public editClientState?: ClientStateType;

  private _cachedUsers = AdminUserSetSchema.alloc();
  private _pollActive = false;
  public adminConsole: AdminConsole | undefined;

  public toggleUI = () => {
    this.app.game.state.hideUI = !this.app.game.state.hideUI;
  };

  public users = () => {
    if (!this._pollActive) {
      const players = this.app.game.state.replica.players;
      let dirty = false;
      for (let i = 0; i < players.length; ++i) {
        let idx = -1;
        for (let j = 0; j < this._cachedUsers.length; ++j) {
          if (this._cachedUsers[j].entityId === players[i].id) {
            idx = j;
            break;
          }
        }
        if (idx === -1) {
          dirty = true;
          const user = AdminUserSchema.alloc();
          user.entityId = players[i].id;
          user.userId = players[i].userId;
          user.name = players[i].name;
          user.ipAddress = '?';
          this._cachedUsers.push(user);
        }
      }
      if (dirty) {
        this._sendCommand({
          type: 'pollUsers',
          data: void 0,
        });
        this._pollActive = true;
      }
    }
    const result = new Map();
    return this._cachedUsers.filter(
      (item) => !result.has(item['userId']) && result.set(item['userId'], 1),
    );
  };

  constructor(spec: {
    client: MuClient;
    app: PlayClient | EditClient;
    rpc?: EditRPCClient;
    seedController?: SeedController;
    assetController?: AssetController;
    editContentStorage?: EditContentStorage;
  }) {
    const protocol = (this.protocol = spec.client.protocol(AdminProtocol));
    this.app = spec.app;
    this.rpc = spec.rpc;
    this.seedController = spec.seedController;
    this.assetController = spec.assetController;
    this.editContentStorage = spec.editContentStorage;

    protocol.configure({
      message: {
        redirect: (href) => {
          console.log('redirect: ', href);
        },
        alert: (message) => {
          console.log('alert: ', message);
        },
      },
      raw: (bytes) => {
        if (typeof bytes === 'string') {
          return;
        }
        const stream = new MuReadStream(bytes);
        const event = AdminEventSchema.patch(AdminEventSchema.identity, stream);
        switch (event.type) {
          case 'users':
            this._pollActive = false;
            AdminUserSetSchema.assign(
              this._cachedUsers,
              event.data as typeof AdminUserSetSchema.identity,
            );
            break;
          case 'log':
            console.log('LOG: ' + event.data);
            break;
        }
      },
    });
  }

  /**
   * 当作为管理员登录时，进行相关功能的初始化
   */
  public init() {
    import('./admin-console').then(({ AdminConsole }) => {
      this.adminConsole = new AdminConsole(this.app);
      window['adminConsole'] = this.adminConsole;
    });
  }

  private _sendCommand = (cmd: AdminCommand) => {
    const stream = new MuWriteStream(1024);
    if (AdminCommandSchema.diff(AdminCommandSchema.identity, cmd, stream)) {
      this.protocol.server.sendRaw(stream.bytes());
    }
    stream.destroy();
  };

  public banUser = (userId: number) => {
    this._sendCommand({
      type: 'ban',
      data: userId,
    });
  };

  public banIP = (ipAddress: string) => {
    this._sendCommand({
      type: 'banIp',
      data: ipAddress,
    });
  };

  public alert = (userId: number, message: string) => {
    this._sendCommand({
      type: 'alert',
      data: {
        userId,
        message,
      },
    });
  };

  public redirect = (userId: number, href: string) => {
    this._sendCommand({
      type: 'redirect',
      data: {
        userId,
        href,
      },
    });
  };

  public kickUser = (userId: number) => {
    this._sendCommand({
      type: 'kick',
      data: userId,
    });
  };

  public setGhost = (x: boolean) => {
    this._sendCommand({
      type: 'ghost',
      data: x,
    });
  };

  public getUserByName = (name: string) => {
    const users = this.users();
    for (let i = 0; i < users.length; ++i) {
      if (users[i].name === name) {
        return users[i];
      }
    }
    return null;
  };

  public eval = (expr: string) => {
    this._sendCommand({
      type: 'scriptEval',
      data: expr,
    });
  };

  public serverEval = (expr: string) => {
    this._sendCommand({
      type: 'serverEval',
      data: expr,
    });
  };

  public stopScripts = () => {
    console.warn('stopping scripts');
    this._sendCommand({
      type: 'stopScripts',
      data: void 0,
    });
  };

  public reloadProject = () => {
    console.warn('reloading project');
    this._sendCommand({
      type: 'reloadProject',
      data: void 0,
    });
  };

  public selfDestruct = () => {
    console.warn('EXIT PROCESS.  i hope you know what you are doing....');
    this._sendCommand({
      type: 'exitProcess',
      data: void 0,
    });
  };

  public restartContainer = () => {
    console.warn(
      'RESTARTING CONTAINER.  i hope you know what you are doing....',
    );
    this._sendCommand({
      type: 'restartContainer',
      data: void 0,
    });
  };

  public updateHash = (hash: string) => {
    this._sendCommand({
      type: 'updateHash',
      data: hash,
    });
  };

  public closeWebSocket = () => {
    this.protocol.server.message.closeWebsocket();
  };

  public logCurrentStore = () => {
    this.protocol.server.message.logCurrentStore();
  };
}
