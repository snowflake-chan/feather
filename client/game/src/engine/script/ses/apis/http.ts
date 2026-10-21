import { isSafeUrl } from 'src/engine/utils/safe-url';

export class ClientHttp {
  public async fetch(url: string, options: RequestInit = {}) {
    if (!isSafeUrl(url)) {
      throw new Error(`Blocked url: ${url}`);
    }
    return fetch(url, options);
  }
}
