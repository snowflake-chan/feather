import { MuStruct, MuSchema } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { GameServer } from '..';
import { Logger } from '@box/utils/logger';

export const PlayServerSchema = new MuStruct({
  game: <MuSchema<GameServer>>new MuRefSchema<GameServer>(),
  logger: <MuSchema<Logger>>new MuRefSchema<Logger>(),
});

export type PlayServerState = typeof PlayServerSchema.identity;
