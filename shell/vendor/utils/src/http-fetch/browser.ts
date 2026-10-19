import { FetchAPI, QueryType, isNon200Error } from './type';

export { isNon200Error };

export class BrowserFetch implements FetchAPI {
  private baseURL: string;
  constructor(baseURL = 'http://127.0.0.1:9902') {
    this.baseURL = baseURL;
  }

  public async get(path: string, query: QueryType = {}) {
    const keys = Object.keys(query);
    return await fetch(
      'get',
      this.baseURL +
        path +
        ((keys.length > 0 &&
          `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`) ||
          ''),
    );
  }

  public async post(path: string, data: { [name: string]: any }) {
    return await fetch('post', this.baseURL + path, JSON.stringify(data));
  }
}

export function fetch(
  method: string,
  url: string,
  data?: string | FormData,
  timeout = 0,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.timeout = timeout;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(
            JSON.stringify({
              non200: true,
              method,
              url,
              data,
              status: xhr.status,
              res: xhr.responseText,
            }),
          );
        }
      }
    };
    xhr.open(method, url, true);
    xhr.send(data);
  });
}
