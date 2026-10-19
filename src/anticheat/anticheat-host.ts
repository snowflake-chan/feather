import type { MuServer } from '@box/mudb/server';
import { AnticheatProtocol } from './anticheat-protocol';
import { MovementGate } from './movement-gate';
import { setMovementInspector } from './movement-inspector';
import { MessageInspector } from './message-inspector';
import type { GameServerState } from '../game-server-schema';
import { auditIdentity, auditRejection } from './audit';
import { observesMessage } from './message-subscriptions';

export class AnticheatHost {
  public reset: () => void;
  public running: () => void;
  constructor(server: MuServer, gameServer: MuServer, state: GameServerState, ready: (sessionId: string) => boolean,
    trusted: (sessionId: string) => boolean = ready, audit: (record: object) => void = () => {}) {
    const protocol = server.protocol(AnticheatProtocol);
    let subscriber: any;
    let messageSubscriber: any;
    let movementEnabled = false;
    let messageEnabled = false;
    let messageMask = 0;
    let protectedMask = 0;
    let recovering = true;
    let protectMovement = false;
    let protectMessages = false;
    let initializedPeer = '';
    let initialized = false;
    const messages = new MessageInspector(gameServer, state, audit);
    const gate = new MovementGate((handle, sample) => {
      if (!subscriber || !ready(subscriber.sessionId)) throw new Error('Script unavailable');
      subscriber.message.movement({ handle, playerId: sample.playerId, payload: JSON.stringify(sample) });
    });
    const updateMessages = () => messages.listen(messageEnabled || (recovering && protectMessages)
      ? (handle, playerId, payload) => {
        if (!messageSubscriber || !ready(messageSubscriber.sessionId)) throw new Error('Script unavailable');
        messageSubscriber.message.clientMessage({ handle, playerId, payload });
      } : undefined, event => {
        // Keep connection health alive while an armed worker is unavailable.
        if ((!messageSubscriber || !ready(messageSubscriber.sessionId)) && event.protocol === 'game-net' &&
          ['join', 'synchronize', 'acknowledge', 'pause', 'unpause'].includes(event.message)) return false;
        return observesMessage(event.protocol, event.message, messageMask | (recovering ? protectedMask : 0));
      });
    this.reset = () => {
      protectMovement = protectMovement || movementEnabled;
      protectMessages = protectMessages || messageEnabled;
      protectedMask |= messageMask;
      recovering = true; initialized = false; initializedPeer = '';
      gate.reset(); subscriber = undefined; messageSubscriber = undefined;
      updateMessages();
    };
    this.running = () => {
      if (!initialized || !initializedPeer || !trusted(initializedPeer) || !ready(initializedPeer)) return;
      recovering = false; protectMovement = false; protectMessages = false; protectedMask = 0;
      updateMessages();
    };
    protocol.configure({ disconnect: (client) => {
      if (subscriber?.sessionId === client.sessionId || messageSubscriber?.sessionId === client.sessionId) this.reset();
    }, message: {
      initialized: (client) => {
        if (!trusted(client.sessionId)) return;
        initializedPeer = client.sessionId; initialized = true;
        this.running();
      },
      listenMessages: (client, enabled) => {
        if (!trusted(client.sessionId)) return;
        if (!Number.isInteger(Number(enabled)) || Number(enabled) < 0 || Number(enabled) > 127) return;
        messageMask = Number(enabled);
        messageEnabled = !!messageMask;
        messageSubscriber = enabled ? client : undefined;
        updateMessages();
      },
      messageDecision: (client, message) => {
        if (!messageSubscriber || client.sessionId !== messageSubscriber.sessionId || !ready(client.sessionId)) return;
        messages.decide(message.handle, message.playerId, message.allow, message.reason);
      },
      listen: (client, enabled) => {
        if (!trusted(client.sessionId)) return;
        movementEnabled = enabled;
        gate.reset();
        subscriber = enabled ? client : undefined;
      },
      decision: (client, message) => {
        if (!subscriber || client.sessionId !== subscriber.sessionId || !ready(client.sessionId)) return;
        gate.decide(message.handle, message.playerId, message.allow, message.reason);
      },
    } });
    setMovementInspector(state, (sample, complete) => {
      if (!movementEnabled && !(recovering && protectMovement)) return false;
      const identity = auditIdentity(state, sample.playerId);
      const finish = (allow: boolean, reason?: string) => {
        if (!allow) audit(auditRejection(identity, 'movement', reason, {
          serverTick: sample.serverTick, inputTick: sample.inputTick, mode: sample.mode,
          from: sample.from, to: sample.to, velocity: sample.velocity,
        }));
        complete(allow);
      };
      if (!subscriber || !ready(subscriber.sessionId)) { finish(false, 'script-unavailable'); return true; }
      gate.submit(sample, finish);
      return true;
    });
  }
}
