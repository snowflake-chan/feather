import { MuProtocolSchema } from '@box/mudb/protocol';
import { MuBoolean, MuStruct, MuUTF8 } from '@box/mudb/schema';
import { PictureAssetSetSchema } from '../project/hot-schema';
import { UITreeRDA } from '../project/ui-rda/defs';

const ResetSchema = new MuStruct({
  running: new MuBoolean(),
  uiTree: UITreeRDA.stateSchema,
  pictureAssets: PictureAssetSetSchema,
  defaultScreenId: new MuUTF8(''),
});

export const GameUIProtocol: MuProtocolSchema<
  {
    reset: typeof ResetSchema;
  },
  {}
> = {
  name: 'gameUI',
  client: {
    reset: ResetSchema,
  },
  server: {},
};
