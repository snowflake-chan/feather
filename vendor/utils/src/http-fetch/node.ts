import { FetchAPI, QueryType, isNon200Error } from './type';
import http from 'http';
import https from 'https';
import url from 'url';

export { isNon200Error };

export class NodeFetch implements FetchAPI {
  private requestOptions: http.RequestOptions;
  private requestHeaders: { [header: string]: string };

  constructor(baseURL: string, auth = '') {
    const urlInfo = url.parse(baseURL);
    this.requestOptions = {
      protocol: urlInfo.protocol || 'http:',
      hostname: urlInfo.hostname || '127.0.0.1',
      port: +(urlInfo.port
        ? urlInfo.port
        : urlInfo.protocol === 'http:'
        ? 80
        : 443),
      timeout: 99000,
    };
    this.requestHeaders = {
      Authorization: auth,
    };
  }

  public async get(path: string, query: QueryType = {}) {
    const keys = Object.keys(query);
    const options = {
      method: 'GET',
      path:
        path +
        ((keys.length > 0 &&
          `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`) ||
          ''),
      headers: this.requestHeaders,
    };
    return await nodeRequest(Object.assign(options, this.requestOptions));
  }

  public async post(path: string, data: { [name: string]: any }) {
    const options = {
      method: 'POST',
      path,
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
        },
        this.requestHeaders,
      ),
    };
    const body = JSON.stringify(data);
    return await nodeRequest(Object.assign(options, this.requestOptions), body);
  }
}

export function nodeRequest(options: http.RequestOptions, body?: string) {
  return new Promise<string>((resolve, reject) => {
    const httx = options.protocol === 'http:' ? http : https;
    const req = httx.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        resolve(data);
      });
      if (res.statusCode !== 200) {
        reject(
          JSON.stringify({
            non200: true,
            method: options.method,
            url: options.path,
            data: body,
            status: res.statusCode,
            res: res.statusMessage,
          }),
        );
        return;
      }
    });
    req.on('timeout', () => {
      reject(new Error('request timeout'));
    });
    req.on('error', (e) => {
      reject(e);
    });
    if (body) {
      req.write(body);
    }
    req.end();
  });
}
