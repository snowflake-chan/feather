/**
 * 控制、处理事件流程的公共模块。有关具体事件的信息，请查阅对应功能模块。
 * @module 事件
 */

/**
 * You can subscribe to events coming from some object using an EventChannel.
 *
 * Event channels take an event handler as input and return a token which can be used to cancel the handler.
 *
 * **Example:**
 * ```typescript
 * const token = world.onTick(() => console.log("tick !"));
 * setTimeout(() => {
 *      console.log('cancel tick handler');
 *      token.cancel();
 *      // no more tick events will be logged
 * }, 1000);
 * ```
 *
 * @param handler The handler callback which is invoked whenever the event is fired
 * @typeParam EventType The type of the event which is emitted by the channel
 * @returns An event handler token which can be used to cancel the event handler
 
 */
export type GameEventChannel<EventType> = (
  handler: (event: EventType) => void,
) => GameEventHandlerToken;

/**
 * Returned by a {@link GameEventChannel} whenever a handler is registered.  Can be used to cancel the handler.
 */
export interface GameEventHandlerToken {
  /**
   * Cancels the event handler
   */
  cancel(): void;

  /**
   * Resumes listening with the event handler
   */
  resume(): void;

  /**
   * Checks if the handler is active
   */
  active(): boolean;
}

/**
 * Promises give another way to work with events. You can use promises to organize long sequences of events
 * with structured programming.  In some cases this can lead to much simpler and cleaner code, but you must
 * use caution.  Asynchronous code can be interrupted when it is waiting, which means things in the world
 * can change outside your code.  Also errors generated in asynchronous code do not get stack traces,
 * which can complicate debugging.  Consider these things and use promises carefully
 *
 * **Example:**
 * ```typescript
 * // Wait for 2 players to enter the world
 * async function waitForPlayers (count) {
 *      while (world.querySelectorAll('player').length < 2) {
 *          const { entity } = await world.nextPlayerJoin();
 *          world.say(entity.player.name + ' joined');
 *      }
 * }
 *
 * waitForPlayers.then(() => world.say('game ready'));
 * ```
 *
 * @param filter An optional function which checks the type of event.  If the filter is not true, then the event is not dispatched.  If no filter is supplied, then the future will fire on the next event.
 * @typeParam EventType The type of the event which is emitted by the channel
 * @returns A promise which resolves once an event which matches the filter fires
 */
export type GameEventFuture<EventType> = (
  filter?: (event: EventType) => boolean,
) => Promise<EventType>;
