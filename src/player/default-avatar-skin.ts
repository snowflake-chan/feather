import {
  PlayerSkinHash,
  PlayerSkinHashSchema,
} from '@box/schema/player/player-schema';
import manifest from './default-avatar.json';

const defaultAvatarParts = manifest.parts as PlayerSkinHash;

export const DEFAULT_AVATAR_NAME = manifest.name;

export function createDefaultAvatarSkin(): PlayerSkinHash {
  return PlayerSkinHashSchema.clone(defaultAvatarParts);
}
