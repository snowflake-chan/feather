import {
  PermissionToken,
  PermissionTokenSchema,
} from '@box/schema/permissions/permission-rda';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import crypto from 'crypto';

const HMAC_LENGTH = 42;
const MAX_TOKEN_LENGTH = 256;
const HMAC_TYPE = 'sha256';

export function generatePermissionToken(
  secret: string,
  token: PermissionToken,
) {
  const stream = new MuWriteStream(512);
  try {
    // serialize and base64 encode stream
    if (
      !PermissionTokenSchema.diff(PermissionTokenSchema.identity, token, stream)
    ) {
      return '';
    }
    const bytes = stream.bytes();
    const buffer = Buffer.from(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
    const payload = buffer.toString('base64');

    // compute hmac
    const hmac = crypto.createHmac(HMAC_TYPE, secret);
    hmac.update(payload);
    const digest = hmac.digest('base64').slice(0, HMAC_LENGTH);

    return digest + payload;
  } finally {
    stream.destroy();
  }
  return '';
}

export function parsePermissionToken(secret: string, message: string) {
  if (message.length > MAX_TOKEN_LENGTH || message.length <= HMAC_LENGTH) {
    return null;
  }

  const payload = message.slice(HMAC_LENGTH);
  const hmac = crypto.createHmac(HMAC_TYPE, secret);
  hmac.update(payload);
  const digest = hmac.digest('base64');
  if (digest.slice(0, HMAC_LENGTH) !== message.slice(0, HMAC_LENGTH)) {
    return null;
  }

  try {
    const buffer = new Buffer(payload, 'base64');
    const stream = new MuReadStream(new Uint8Array(buffer));
    const token = PermissionTokenSchema.patch(
      PermissionTokenSchema.identity,
      stream,
    );
    if (token.expireAt < new Date()) {
      PermissionTokenSchema.free(token);
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
}
