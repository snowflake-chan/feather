export interface PlayerNavigator {
  emitEvent(type: string, event: string): Promise<void>;
}
