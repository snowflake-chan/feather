import axios from 'axios';
import { createHash } from 'crypto';
import { lookup } from 'dns/promises';
import type { Logger } from 'pino';

import type { ContentServer } from '@box/content-server';
import { voxaInternalHeaders } from '../project/voxa-internal-auth';

/**
 * Local projects use one filesystem directory for both IPFS and OSS-style
 * content. Project-scoped directories do not necessarily contain blobs owned
 * by the separate local VOXA service, so both read paths need the same VOXA
 * fallback.
 */
export function createLocalContentWithVoxa(
  localContentServer: ContentServer,
  logger: Pick<Logger, 'debug'>,
  voxaURL = process.env.VOXA_INTERNAL_URL || process.env.VOXA_URL || '',
  retrieveVoxaBlob = async (hash: string) => {
    const response = await axios.get(
      `${voxaURL.replace(/\/$/, '')}/api/local/blobs/${encodeURIComponent(hash)}`,
      {
        headers: voxaInternalHeaders(),
        responseType: 'arraybuffer',
        timeout: 30_000,
      },
    );
    return new Uint8Array(response.data);
  },
  bundledContentServer?: ContentServer,
  groupContentServer?: ContentServer,
  externalDistribution?: { cdnBaseUrl: string; hashes: string[] },
): ContentServer {
  const externalBaseURL = safeExternalBaseURL(externalDistribution?.cdnBaseUrl);
  const externalHashes = new Set(
    (externalDistribution?.hashes || []).filter((hash) => isContentHash(hash)),
  );

  const retrieveExternalBlob = async (hash: string) => {
    const normalized = hash.split('.')[0];
    if (!externalBaseURL || !externalHashes.has(normalized)) return undefined;
    if (await resolvesToPrivateAddress(new URL(externalBaseURL).hostname)) {
      throw new Error('external asset CDN resolves to a private address');
    }
    const response = await axios.get(
      `${externalBaseURL}/engine/m/${encodeURIComponent(normalized)}`,
      {
        responseType: 'arraybuffer',
        timeout: 30_000,
        maxRedirects: 0,
        maxContentLength: 256 * 1024 * 1024,
        validateStatus: (status) => status === 200,
      },
    );
    const content = new Uint8Array(response.data);
    if (!matchesContentHash(normalized, content)) {
      throw new Error('external asset content hash mismatch');
    }
    return content;
  };

  return {
    init: async () => {
      await localContentServer.init();
      await bundledContentServer?.init();
      await groupContentServer?.init();
    },
    store: (content, options) => localContentServer.store(content, options),
    retrieve: async (hash, options) => {
      const local = await localContentServer.retrieve(hash, options);
      if (local) return local;
      const group = await groupContentServer?.retrieve(hash, options);
      if (group) return group;
      const bundled = await bundledContentServer?.retrieve(hash, options);
      if (bundled) return bundled;
      try {
        const external = await retrieveExternalBlob(hash);
        if (external) return external;
      } catch (error) {
        logger.debug(`external CDN blob not found: ${hash}: ${String(error)}`);
      }
      if (!voxaURL) return undefined;
      try {
        return await retrieveVoxaBlob(hash);
      } catch (error) {
        logger.debug(`local VOXA blob not found: ${hash}: ${String(error)}`);
        return undefined;
      }
    },
  };
}

function safeExternalBaseURL(value: string | undefined): string | undefined {
  try {
    const parsed = new URL(String(value || ''));
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return undefined;
    if (parsed.protocol !== 'https:') return undefined;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

async function resolvesToPrivateAddress(hostname: string) {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.some(({ address }) => {
    const normalized = address.toLowerCase();
    if (normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    const octets = normalized.split('.').map(Number);
    if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value))) return false;
    return octets[0] === 10 || octets[0] === 127 || octets[0] === 0 || octets[0] === 169 && octets[1] === 254 || octets[0] === 192 && octets[1] === 168 || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31;
  });
}

function isContentHash(hash: string) {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^[A-Za-z0-9_-]{43}$/.test(hash);
}

function decodeBase58(value: string): Buffer | undefined {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = [0];
  for (const character of value) {
    const digit = alphabet.indexOf(character);
    if (digit < 0) return undefined;
    let carry = digit;
    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry >>= 8;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const character of value) {
    if (character !== '1') break;
    bytes.push(0);
  }
  return Buffer.from(bytes.reverse());
}

function matchesContentHash(hash: string, content: Uint8Array) {
  const digest = createHash('sha256').update(content).digest();
  if (/^[A-Za-z0-9_-]{43}$/.test(hash)) {
    return digest.toString('base64url') === hash;
  }
  const multihash = decodeBase58(hash);
  return !!multihash &&
    multihash.length === 34 &&
    multihash[0] === 0x12 &&
    multihash[1] === 0x20 &&
    digest.equals(multihash.subarray(2));
}
