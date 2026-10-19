import { DamageEventSchema } from './damage-event-schema';
import { MuStruct } from '@box/mudb/schema';

export const ScriptSentEventSchema = new MuStruct({
  damage: DamageEventSchema,
});
