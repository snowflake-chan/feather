import { DamageEventSchema } from './damage-event-schema';
import { MuStruct } from '@box/mudb/schema/struct';

export const ScriptSentEventSchema = new MuStruct({
  damage: DamageEventSchema,
});
