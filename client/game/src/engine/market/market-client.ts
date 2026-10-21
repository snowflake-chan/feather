import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import { MarketProtocol } from '@box/schema/market/market-protocol';
import { isCreatera } from 'src/utils/appEdition';
import { messenger } from 'src/messenger';
import { clientConfig } from 'src/config/client';
import type { InputController } from '../input/input-controller';

export class MarketClient {
  public protocol: MuClientProtocol<typeof MarketProtocol>;
  public state: GameClientState;
  public stopAcceptOpenMarketplace: boolean;

  private readonly inputController: InputController;

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    inputController: InputController;
  }) {
    this.protocol = spec.client.protocol(MarketProtocol);
    this.state = spec.state;
    this.stopAcceptOpenMarketplace = false;
    this.inputController = spec.inputController;

    this.protocol.configure({
      message: {
        openMarketplace: (ev) => {
          if (isCreatera()) {
            this.inputController.exitPointerLock();

            messenger.messageTool.emitEvent('openStore', {
              productIds: ev.productIds,
              mapId: clientConfig.mapInfo.contentId,
            });
          }
        },
      },
    });
  }
}
