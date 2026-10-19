import { ContentServer, Hash } from './index';

export class RemoteStoreBrowser implements ContentServer {
  private storeURL: string;
  private retrieveURL: string;

  constructor(cdnPath: string, ipfsPath = cdnPath) {
    this.storeURL = `${ipfsPath}/block`;
    this.retrieveURL = `${cdnPath}/block`;
  }

  public async init() {}

  public async store(raw_content: Uint8Array): Promise<Hash> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.storeURL, true);
      xhr.onerror = reject;
      xhr.onabort = reject;
      xhr.ontimeout = reject;
      xhr.onload = (oEvent) => {
        resolve(xhr.responseText);
      };
      xhr.send(raw_content);
    });
  }

  public async retrieve(hashOfBlob: Hash): Promise<Uint8Array | undefined> {
    return new Promise<Uint8Array | undefined>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.retrieveURL}/${hashOfBlob}`, true);
      xhr.responseType = 'arraybuffer';
      xhr.onerror = reject;
      xhr.onabort = reject;
      xhr.ontimeout = reject;
      xhr.onload = (oEvent) => {
        const arrayBuffer = xhr.response;
        if (arrayBuffer) {
          resolve(new Uint8Array(arrayBuffer));
        } else {
          resolve(void 0);
        }
      };
      xhr.send();
    });
  }
}
