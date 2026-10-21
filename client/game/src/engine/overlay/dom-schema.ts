import { MuStruct, MuUTF8, MuBoolean, MuFloat64 } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

export const GameDOMSchema = new MuStruct({
  // if true, enable some dumb hacks
  isIOS: new MuBoolean(false),
  width: new MuFloat64(),
  height: new MuFloat64(),

  // ios joystick gape
  joystickBottomGap: new MuFloat64(0),

  autoCreateElement: new MuBoolean(true),
  element: new MuRefSchema<HTMLElement>(),
  canvas: new MuRefSchema<HTMLCanvasElement>(),
  canvas2D: new MuRefSchema<HTMLCanvasElement>(),

  // CSS props
  visible: new MuBoolean(true),
  hiddenCSS: new MuUTF8(''),
  visibilityChangeCSS: new MuUTF8(''),

  // bake element
  bakeShadow: new MuBoolean(false),
  bakeCanvas: new MuRefSchema<HTMLCanvasElement>(),
});

export type GameDOM = typeof GameDOMSchema.identity;
