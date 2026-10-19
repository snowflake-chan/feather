export enum MessageSubscription {
  All = 1, Input = 2, Keyboard = 4, Interact = 8, Custom = 16, UI = 32, Action = 64,
}
/** Category routing uses engine metadata, not fields supplied inside a packet. */
export function observesMessage(protocol: string, message: string, mask: number): boolean {
  if (mask & MessageSubscription.All) return true;
  return !!(
    ((mask & (MessageSubscription.Input | MessageSubscription.Action)) && protocol === 'game-net' && message === 'input') ||
    ((mask & MessageSubscription.Keyboard) && protocol === 'game-net' && message === 'sendKeyBoardEvent') ||
    ((mask & MessageSubscription.Interact) && protocol === 'entity-interact' && message === 'interact') ||
    ((mask & MessageSubscription.Custom) && protocol === 'remote-channel' && message === 'sendServerEvent') ||
    ((mask & MessageSubscription.UI) && protocol === 'gui' && message === 'sendMessage')
  );
}
