import { toWebSocketURL } from '../../shared/websocket-url';
import type { ClientConfig } from 'src/config/client';

export interface GameServerTarget {
  sessionURL: string;
  assetBaseURL: string;
  socketServerURL?: string;
  isRemote: boolean;
}

export function normalizeRemoteServerURL(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const browserOrigin =
    typeof location !== 'undefined' ? location.origin : 'http://127.0.0.1';
  const fallbackProtocol = new URL(browserOrigin).protocol;
  const parsed = trimmed.startsWith('/')
    ? new URL(trimmed, browserOrigin)
    : new URL(
        /^https?:\/\//i.test(trimmed)
          ? trimmed
          : `${fallbackProtocol}//${trimmed}`,
      );

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Server URL must use http or https');
  }

  parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

export function resolveGameServerTarget(
  config: Pick<
    ClientConfig,
    'mode' | 'ARENA_URL' | 'CDN_PATH' | 'remoteGameServerURL' | 'launcherServiceWorkerMode'
  >,
): GameServerTarget {
  const localTarget = (): GameServerTarget => {
    const arenaURL =
      typeof location === 'undefined' ||
      process.env.NEXT_PUBLIC_EXPORT_MODE === 'true'
        ? config.ARENA_URL
        : location.origin;
    return {
      sessionURL: `${arenaURL.replace(/\/$/, '')}/api/createSession`,
      assetBaseURL: config.CDN_PATH,
      isRemote: false,
    };
  };

  if (config.mode !== 'play' || typeof window === 'undefined') {
    return localTarget();
  }

  const configuredValue = config.remoteGameServerURL || '';
  if (!configuredValue) {
    return localTarget();
  }

  const baseURL = normalizeRemoteServerURL(configuredValue);
  return {
    sessionURL: `${baseURL}/api/session`,
    assetBaseURL: config.launcherServiceWorkerMode ? config.CDN_PATH : baseURL,
    socketServerURL: toWebSocketURL(baseURL).replace(/\/$/, ''),
    isRemote: true,
  };
}
