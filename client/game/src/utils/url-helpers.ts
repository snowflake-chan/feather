import { URL, URLSearchParams } from '@box/schema/api/js/url';

export type QueryParams =
  | 'platform'
  | 'hash'
  | 'token'
  | 'triggered_from'
  | 'serverId'
  | 'mtm_source'
  | 'autoPlay'
  | 'mode';

export function getQueryParam(variable: QueryParams) {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return '';
  }
  const url = new URL(window.location.href);
  return url.searchParams.get(variable) || '';
}

export function deleteUrlParam(name: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  return url;
}

export function getHostname(url: string) {
  return new URL(url).hostname;
}

export function buildURLQuery(query: {
  [key: string]: string | number | boolean | undefined;
}) {
  const res = new URLSearchParams(query).toString();
  return res && '?' + res;
}

export function isInternalURL(targetUrl: string) {
  try {
    if (typeof window === 'undefined') return false;
    return new URL(targetUrl, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

export const isUrl = (url: string) => {
  if (typeof url !== 'string') {
    return false;
  }

  const match = url.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }
  return false;
};

export const localhostRegex = /^https?:\/\/localhost:\d+$/;
