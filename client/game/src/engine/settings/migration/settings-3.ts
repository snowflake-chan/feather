import { Settings } from '../settings-schema';
import { GameKeys } from '@box/schema/input/input-schema';

export default function (settings: Settings) {
  settings.keyBindings[9] = GameKeys.TAB;
  settings.keyBindings[88] = GameKeys.X;
}
