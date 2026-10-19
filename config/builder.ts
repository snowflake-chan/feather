import { LogLevel } from '@box/utils/logger';
import path from 'path';
import { rootLogger } from '../src/utils/logger';

export type MethodType = 'web' | 'local';
export type ModeType = 'edit' | 'play';
export type EnvType =
  | 'development'
  | 'staging'
  | 'preprod'
  | 'production'
  | 'test';

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

// overload config for special boolean
const boolArgMap = {
  local: 'method',
  web: 'method',
  edit: 'mode',
  play: 'mode',
  production: 'env',
  development: 'env',
  staging: 'env',
  preprod: 'env',
};

export function getEnv() {
  const e = process.env;
  let envPath = e.ENV_PATH || path.join(__dirname, '../.env.local');
  const APP_EDITION = e['NEXT_PUBLIC_APP_EDITION'] || 'createra';
  rootLogger.info('APP_EDITION: %s', APP_EDITION);
  // load dotenv
  const dotenv = require('dotenv').config({ path: envPath });
  if (!dotenv.error) {
    const { parsed } = dotenv;
    for (const key in parsed) {
      if (!e[key] && parsed[key]) {
        e[key] = parsed[key];
      }
    }
  }

  return e;
}

export function configBuilder() {
  const argv = require('minimist')(process.argv.slice(2));
  const e = getEnv();
  const defaultEnv = {} as { [name: string]: string };

  function B(envVarName: string, defaultValue = false) {
    defaultEnv[envVarName] = defaultValue.toString();
    return e[envVarName]! in string_to_boolean
      ? string_to_boolean[e[envVarName]!]
      : defaultValue;
  }

  function N<T extends number>(envVarName: string, defaultValue: T) {
    defaultEnv[envVarName] = defaultValue.toString();
    const n = parseFloat(e[envVarName]!);
    return isNaN(n) ? defaultValue : n;
  }

  function S<T extends string>(envVarName: string, defaultValue: T) {
    defaultEnv[envVarName] = defaultValue;
    return typeof e[envVarName] === 'string' ? e[envVarName]! : defaultValue;
  }

  function build<T>(config: T): T {
    for (const name in argv) {
      const val = argv[name];
      const tv = typeof val;
      const tc = typeof config[name];
      if (tv === tc) {
        config[name] = val;
      } else if (
        tv === 'string' &&
        tc === 'number' &&
        name.toLowerCase() == 'loglevel'
      ) {
        config[name] = LogLevel[<string>val];
      } else if (
        tv === 'string' &&
        tc === 'boolean' &&
        val in string_to_boolean
      ) {
        config[name] = string_to_boolean[val];
      } else if (tv === 'string' && tc === 'boolean') {
        throw new Error(
          `String to boolean conversion error in config: "${val}" not valid for option "${name}"`,
        );
      } else if (tv === 'string' && tc === 'number') {
        const n = Number(val);
        if (!isNaN(n)) {
          config[name] = n;
        }
      }
    }
    for (const name in boolArgMap) {
      if (argv[name] === true) {
        config[boolArgMap[name]] = name;
      }
    }
    return config;
  }

  return {
    argv,
    defaultEnv,
    B,
    N,
    S,
    build,
  };
}

export function maybeStringArray(envVar?: string, defaultValue?: string[]) {
  if (typeof envVar !== 'string') {
    return;
  }

  return envVar.split(',');
}
