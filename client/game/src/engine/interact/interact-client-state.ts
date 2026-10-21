import {
  MuStruct,
  MuArray,
  MuVarint,
  MuFloat64,
  MuBoolean,
} from '@box/mudb/schema';

export const InteractClientStateSchema = new MuStruct({
  currentInteractive: new MuVarint(0),
  /**
   * currentInteractive按钮是否被按下
   */
  interacting: new MuBoolean(false),
  nearbyInteractive: new MuArray(new MuVarint(), Infinity, []),

  lastInteract: new MuFloat64(),
  interactLocked: new MuBoolean(false),

  hoveringPlayerId: new MuVarint(0),
});

export type InteractClientState = typeof InteractClientStateSchema.identity;
