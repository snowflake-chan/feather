export function s(val: any) {
  if (typeof val !== 'string') {
    throw new Error('config must be string, but got ' + val);
  }
  return val + '';
}

export function maybeS(val: any) {
  if (val === undefined) {
    return;
  }

  if (typeof val !== 'string') {
    throw new Error('config must be string, but got ' + val);
  }
  return val + '';
}

export function n(val: any) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    throw new Error('config must be number, but got ' + val);
  }
  return num;
}

export function maybeN(val: any) {
  if (val === undefined) {
    return;
  }
  return n(val);
}

export function b(val: any) {
  const string_to_boolean: { [k: string]: boolean } = {
    TRUE: true,
    1: true,
    true: true,
    True: true,
    T: true,
    t: true,
    FALSE: false,
    0: false,
    false: false,
    False: false,
    F: false,
    f: false,
    null: false,
  };

  return !!string_to_boolean[val];
}

export type AppEnv =
  | 'development'
  | 'staging'
  | 'production'
  | 'preprod'
  | 'test';
export function validateAppEnv(appEnv?: string): AppEnv {
  if (
    appEnv !== 'development' &&
    appEnv !== 'staging' &&
    appEnv !== 'production' &&
    appEnv !== 'preprod' &&
    appEnv !== 'test'
  ) {
    return 'production';
  } else {
    return appEnv;
  }
}

export function removeConfigUndefined<T extends {}>(props: T): T {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as T;
}
