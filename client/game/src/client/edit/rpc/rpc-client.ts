import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { EditRPCProtocol } from './rpc-schema';
import { ClientStateType } from '../edit-schema';

export class EditRPCClient {
  private _protocol: MuClientProtocol<typeof EditRPCProtocol>;
  private _state: ClientStateType;
  public callbacks: { [id: number]: (data) => void } = {};
  public onErrors: { [id: number]: (data) => void } = {};
  private cbId = 0;

  constructor(spec: { client: MuClient; state: ClientStateType }) {
    this._state = spec.state;
    const protocol = (this._protocol = spec.client.protocol(EditRPCProtocol));
    protocol.configure({
      message: {
        buildVoxelResponse: ({ id, meshHash }) => {
          if (this.callbacks[id]) {
            this.callbacks[id](meshHash);
            delete this.callbacks[id];
          }
        },
        uploadAudioResponse: ({ id, audioHash }) => {
          if (this.callbacks[id]) {
            this.callbacks[id](audioHash);
            delete this.callbacks[id];
          }
          if (this.onErrors[id]) {
            delete this.onErrors[id];
          }
        },
        uploadImageResponse: ({ id, imgHash }) => {
          if (this.callbacks[id]) {
            this.callbacks[id](imgHash);
            delete this.callbacks[id];
          }
        },
        uploadAudioReject: ({ id, reason }) => {
          if (this.onErrors[id]) {
            this.onErrors[id](reason);
            delete this.onErrors[id];
          }
          if (this.callbacks[id]) {
            delete this.callbacks[id];
          }
        },
      },
    });
  }

  public buildVoxel = (projectHash: string, cb: (meshHash: string) => void) => {
    const id = this.cbId++;
    this.callbacks[id] = cb;
    this._protocol.server.message.buildVoxel({ id, hash: projectHash });
  };
  public uploadImage = (
    imageData: ArrayBuffer,
    type: string,
    width: number,
    height: number,
    cb: (imageHash: string) => void,
  ) => {
    const id = this.cbId++;
    this.callbacks[id] = cb;
    this._protocol.server.message.genImageFromUploader({
      id,
      imgBuffer: new Uint8Array(imageData),
      type,
      width,
      height,
    });
  };

  public uploadAudio = (
    audioData: ArrayBuffer,
    quality: number,
    onSuccess: (audioHash: string) => void,
    onError: (reason: string) => void,
  ) => {
    const id = this.cbId++;
    this.callbacks[id] = onSuccess;
    this.onErrors[id] = onError;
    this._protocol.server.message.genAudioFromUploader({
      id,
      sampleRate: quality,
      buffer: new Uint8Array(audioData),
    });
  };

  public toggleHackingVisual = (hacking: boolean) =>
    this._protocol.server.message.setHacking(hacking);
}
