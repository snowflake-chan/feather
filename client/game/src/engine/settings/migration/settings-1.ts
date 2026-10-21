import { Settings } from '../settings-schema';
import { GameKeys } from '@box/schema/input/input-schema';

export default function (settings: Settings) {
  settings.masterMute = true;
  settings.keyBindings[219] = GameKeys.PREV_ENTITY;
  settings.keyBindings[221] = GameKeys.NEXT_ENTITY;
}
