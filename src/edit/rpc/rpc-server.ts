import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { EditRPCProtocol } from './rpc-schema';
import { EditServerState } from '../edit-server-schema';
import { setPlayerHacking } from '../../player/player-server-controller';
import { Logger } from '@box/utils/logger';
import { MuStruct, MuVarint, MuArray, MuUTF8 } from '@box/mudb/schema';

export class EditRPCServer {
  private _protocol: MuServerProtocol<typeof EditRPCProtocol>;
  private _state: EditServerState;
  private _logger: Logger;

  constructor(spec: { server: MuServer; state: EditServerState }) {
    const state = (this._state = spec.state);
    const logger = (this._logger = state.logger.create('rpc'));
    const protocol = (this._protocol = spec.server.protocol(EditRPCProtocol));

    protocol.configure({
      message: {
        setHacking: (client, hacking) => {
          setPlayerHacking(state.game.state, client.sessionId, hacking);
        },

        genAudioFromUploader: async (client, { id, sampleRate, buffer }) => {
          try {
            const rawHash = await state.contentServer.store(buffer);
            this._state.buildSystem
              .build('genOptimizedAudio', rawHash, sampleRate)
              .then((rst) => {
                client.message.uploadAudioResponse({ id, audioHash: rst });
              })
              .catch((err) => {
                client.message.uploadAudioReject({ id, reason: err });
                logger.error(
                  `game rpcServer uploadAudioResponse error :${err}`,
                );
              });
          } catch (err) {
            client.message.uploadAudioReject({ id, reason: err });
            logger.error(`game rpcServer genOptimizedAudio error: ${err}`);
          }
        },

        genImageFromUploader: async (
          client,
          { id, imgBuffer, type, width, height },
        ) => {
          try {
            const hash = await state.contentServer.store(imgBuffer);
            const imgHash = await this._state.buildSystem.build(
              'genImageFromUploader',
              hash,
              type,
              width,
              height,
            );
            client.message.uploadImageResponse({ id, imgHash });
          } catch (err) {
            logger.error(`upload image errpr: ${err}`);
          }
        },
        buildVoxel: async (client, { id, hash }) => {
          try {
            const rst = await this._state.buildSystem.build('buildVoxel', hash);
            client.message.buildVoxelResponse({ id, meshHash: rst });
          } catch (e) {
            logger.error(
              `game rpcServer buildVoxle error, prijectHash: ${hash}`,
            );
          }
        },
      },
    });
  }
}
