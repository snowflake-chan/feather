import { MuStruct } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import type { GUIStage } from './components/stage';

export const GUISchema = new MuStruct({
  stage: new MuRefSchema<GUIStage>(),
});

export type GUI = typeof GUISchema.identity;
