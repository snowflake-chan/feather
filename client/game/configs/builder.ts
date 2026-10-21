import { AppEdition } from '@box/schema/types/appEdition';

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

export function a(val?: any) {
  if (val === undefined) {
    return;
  }

  if (typeof val !== 'string') {
    throw new Error('config must be string, but got ' + val);
  }

  return val.split(',');
}

export function n(val: any) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    throw new Error('config must be number, but got ' + val);
  }
  return num;
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

export function validateAppEdition(appEdition?: string): AppEdition {
  if (appEdition !== 'box3' && appEdition !== 'createra') {
    throw new Error(
      'appEdition must be box3 or createra, but got ' + appEdition,
    );
  }
  return appEdition;
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
