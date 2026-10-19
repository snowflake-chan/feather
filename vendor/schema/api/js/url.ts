// Polyfills for the URL and URLSearchParams APIs
const ENTRIES = Symbol('entries');

function strcmp(a: string, b: string) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

function encodeQueryComponent(x: string) {
  return encodeURIComponent(x)
    .replace(/\!/g, '%21')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\~/g, '%7E')
    .replace(/\%20/g, '+');
}

export class URLSearchParams {
  constructor(args: any) {
    let init: string = '';
    if (args instanceof URLSearchParams) {
      init = '' + args.toString();
    } else if (typeof args === 'string') {
      init = args;
    }
    Object.defineProperties(this, {
      [ENTRIES]: {
        enumerable: false,
        writable: false,
        value: [],
      },
    });

    const attributes = init.replace(/^\?/, '').split('&');
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i].split('=');
      this.append(
        decodeURIComponent('' + attribute[0]),
        attribute.length > 1 ? decodeURIComponent(attribute[1]) : '',
      );
    }

    if (typeof args === 'object') {
      if (Array.isArray(args)) {
        args.forEach((item) => this.append(item[0], item[1]));
      } else {
        Object.keys(args).forEach((key) => this.append(key, args[key]));
      }
    }
  }
  public append(name: string, value: string) {
    value = '' + value;
    name = '' + name;
    if (name) {
      this[ENTRIES].push({ key: name, value });
    }
  }
  public delete(name: string) {
    name = '' + name;
    let ptr = 0;
    for (let i = 0; i < this[ENTRIES].length; ++i) {
      if (this[ENTRIES][i].key !== name) {
        this[ENTRIES][ptr++] = this[ENTRIES][i];
      }
    }
    this[ENTRIES].length = ptr;
  }
  public get(name: string): string | null {
    name = '' + name;
    for (let i = 0; i < this[ENTRIES].length; ++i) {
      if (this[ENTRIES][i].key === name) {
        return this[ENTRIES][i].value;
      }
    }
    return null;
  }
  public getAll(name: string): string[] {
    const result: string[] = [];
    name = '' + name;
    for (let i = 0; i < this[ENTRIES].length; ++i) {
      if (this[ENTRIES][i].key === name) {
        result.push(this[ENTRIES][i].value);
      }
    }
    return result;
  }
  public forEach(
    callback: (
      this: URLSearchParams,
      value: string,
      key: string,
      url: URLSearchParams,
    ) => any,
  ) {
    for (let i = 0; i < this[ENTRIES].length; ++i) {
      const entry = this[ENTRIES][i];
      callback.call(this, entry.value, entry.key, this);
    }
  }
  public has(name: string) {
    return this.get(name) !== null;
  }
  public set(name: string, value: string) {
    this.delete(name);
    this.append(name, value);
  }
  public keys() {
    const items: string[] = [];
    this.forEach(function (_, key) {
      items.push(key);
    });
    return items[Symbol.iterator]();
  }
  public values() {
    const items: string[] = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return items[Symbol.iterator]();
  }
  public entries() {
    const items: string[][] = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return items[Symbol.iterator]();
  }
  public sort() {
    this[ENTRIES].sort(
      (a, b) => strcmp(a.key, b.key) || strcmp(a.value, b.value),
    );
  }
  public toString() {
    let searchString = '';
    this.forEach(function (value, name) {
      if (searchString.length > 0) {
        searchString += '&';
      }
      searchString +=
        encodeQueryComponent(name) + '=' + encodeQueryComponent(value);
    });
    return searchString;
  }
  public [Symbol.iterator]() {
    return this.entries();
  }
}

const PATTERNS = {
  protocol: '(?:([^:/?#]+):)',
  authority: '(?://([^/?#]*))',
  path: '([^?#]*)',
  query: '(\\?[^#]*)',
  hash: '(#.*)',
  authentication: '(?:([^:]*)(?::([^@]*))?@)',
  hostname: '([^:]+)',
  port: '(?::(\\d+))',
};
const URL_REGEXP = new RegExp(
  '^' +
    PATTERNS.protocol +
    '?' +
    PATTERNS.authority +
    '?' +
    PATTERNS.path +
    PATTERNS.query +
    '?' +
    PATTERNS.hash +
    '?',
);
const AUTHORITY_REGEXP = new RegExp(
  '^' +
    PATTERNS.authentication +
    '?' +
    PATTERNS.hostname +
    PATTERNS.port +
    '?$',
);

const PARTS = Symbol('parts');

type URLParseResult = {
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  path: string;
  query: URLSearchParams;
  hash: string;
};

function parse(url: string): URLParseResult {
  const urlMatch = URL_REGEXP.exec('' + url);
  if (urlMatch !== null) {
    const authorityMatch = urlMatch[2]
      ? AUTHORITY_REGEXP.exec(urlMatch[2])
      : [null, null, null, null, null];
    if (authorityMatch !== null) {
      return {
        protocol: urlMatch[1] || '',
        username: authorityMatch[1] || '',
        password: authorityMatch[2] || '',
        hostname: encodeURIComponent(
          decodeURIComponent(authorityMatch[3] || ''),
        ),
        port: authorityMatch[4] || '',
        path: encodeURIComponent(
          decodeURIComponent(
            urlMatch[3]
              ? urlMatch[3].charAt(0) === '/'
                ? urlMatch[3]
                : '/' + urlMatch[3]
              : '',
          ),
        ).replace(/\%2[fF]/g, '/'),
        query: new URLSearchParams(urlMatch[4] || ''),
        hash: urlMatch[5] || '',
      };
    }
  }
  return {
    protocol: '',
    username: '',
    password: '',
    hostname: '',
    port: '',
    path: '',
    query: new URLSearchParams(''),
    hash: '',
  };
}

export class URL {
  constructor(url: any, base: any = '') {
    const baseParts = parse(base);
    let urlParts = parse(url);
    if (!urlParts.protocol) {
      urlParts = {
        protocol: baseParts.protocol,
        username: baseParts.username,
        password: baseParts.password,
        hostname: baseParts.hostname,
        port: baseParts.port,
        path: urlParts.path || baseParts.path,
        query: urlParts.query || baseParts.query,
        hash: urlParts.hash,
      };
    }
    Object.defineProperty(this, PARTS, {
      value: urlParts,
      writable: false,
      enumerable: false,
    });
  }

  public get hash() {
    return this[PARTS].hash;
  }
  public set hash(value: string) {
    value = '' + value;
    if (value.length === 0) {
      this[PARTS].hash = '';
    } else {
      if (value.charAt(0) !== '#') {
        value = '#' + value;
      }
      this[PARTS].hash = '#' + encodeURIComponent(value.substr(1));
    }
  }
  public get host() {
    return this.hostname + (this.port ? ':' + this.port : '');
  }
  public set host(value: string) {
    const url = new URL('http://' + value);
    this[PARTS].hostname = url.hostname;
    this[PARTS].port = url.port;
  }
  public get hostname() {
    return this[PARTS].hostname;
  }
  public set hostname(value) {
    value = value.toString();
    this[PARTS].hostname = encodeURIComponent(value);
  }
  public get port() {
    return this[PARTS].port;
  }
  public set port(value: string) {
    const port = parseInt('' + value);
    if (isNaN(port)) {
      this[PARTS].port = '';
    } else {
      this[PARTS].port = Math.max(0, port % (1 << 16)).toString();
    }
  }
  public get href() {
    const authentication =
      this.username || this.password
        ? this.username + (this.password ? ':' + this.password : '') + '@'
        : '';
    return (
      this.protocol +
      '//' +
      authentication +
      this.host +
      this.pathname +
      this.search +
      this.hash
    );
  }
  public set href(value: string) {
    Object.assign(this[PARTS], parse(value));
  }
  public get origin() {
    return this.protocol + '//' + this.host;
  }
  public get username() {
    return this[PARTS].username;
  }
  public set username(value: string) {
    value = value.toString();
    this[PARTS].username = encodeURIComponent(value);
  }
  public get password() {
    return this[PARTS].password;
  }
  public set password(value: string) {
    this[PARTS].password = encodeURIComponent('' + value);
  }
  public get pathname() {
    return this[PARTS].path || '/';
  }
  public set pathname(value: string) {
    value = '' + value;
    if (value.length === 0 || value.charAt(0) !== '/') {
      value = '/' + value;
    }
    this[PARTS].path = encodeURIComponent(value).replace(/\%2[fF]/g, '/');
  }
  public get protocol() {
    return this[PARTS].protocol + ':';
  }
  public set protocol(value: string) {
    value = '' + value || 'http';
    if (value.charAt(value.length - 1) === ':') {
      value = value.slice(0, -1);
    }
    this[PARTS].protocol = encodeURIComponent(value);
  }
  public get search() {
    const s = this[PARTS].query.toString();
    if (s) {
      return '?' + s;
    }
    return s;
  }
  public set search(value: string) {
    const params = new URLSearchParams(value);
    const prev = this[PARTS].query[ENTRIES];
    const next = params[ENTRIES];
    prev.length = 0;
    prev.push.apply(prev, next);
  }
  public get searchParams(): URLSearchParams {
    return this[PARTS].query;
  }
  public toString() {
    return this.href;
  }
  public toJSON() {
    return this.href;
  }
}
