import { MuReadStream } from '@box/mudb/stream';
import {
  ExtraProjectInfo,
  ExtraProjectInfoSchema,
} from '@box/schema/project/hot-schema';

/**
 * Decodes the persisted shared project-resource index.
 *
 * A diff from the identity object to itself is deliberately an empty byte
 * sequence. The content store still assigns that sequence a hash, so callers
 * must regard it as the identity rather than pass it to MuStruct.patch.
 */
export function decodeExtraProjectInfo(bytes: Uint8Array): ExtraProjectInfo {
  if (bytes.byteLength === 0) {
    return ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  }
  return ExtraProjectInfoSchema.patch(
    ExtraProjectInfoSchema.identity,
    new MuReadStream(bytes),
  );
}
