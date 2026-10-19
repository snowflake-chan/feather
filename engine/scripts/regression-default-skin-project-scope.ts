import assert from 'assert';

import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import { mergeExtraProjectInfo } from '../src/project/project-extra';

function extra(defaultSkinName = '') {
  const value = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  value.defaultSkinName = defaultSkinName;
  return value;
}

assert.equal(
  mergeExtraProjectInfo(extra('Old skin__local_9'), extra()).defaultSkinName,
  '',
);
assert.equal(
  mergeExtraProjectInfo(extra('Imported cloud skin'), extra()).defaultSkinName,
  'Imported cloud skin',
);
assert.equal(
  mergeExtraProjectInfo(extra('Imported cloud skin'), extra('Local skin__local_4'))
    .defaultSkinName,
  'Local skin__local_4',
);

console.log('game server default skin project scope regression passed');
