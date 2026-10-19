import type { IncomingMessage, ServerResponse } from 'http';
import { createSession, type Session } from 'better-sse';
import type { EditReplicaServer } from './replica/replica-server';
import type { EditServerState } from './edit-server-schema';
import type { CreatorConsoleEvent, DebuggerServer } from './debugger/debugger-server';

type RuntimePhase = 'idle' | 'starting' | 'ready' | 'stopping' | 'error';
type RuntimeEvent = CreatorConsoleEvent | {
  type: 'status';
  phase: RuntimePhase;
  running: boolean;
  message: string;
  at: string;
};

type BufferedEvent = RuntimeEvent & { id: number };

const MAX_EVENTS = 500;
const MAX_MESSAGE_LENGTH = 16 * 1024;

/**
 * The single seam between Creator CLI and an already-running edit runtime.
 * It owns status observation, bounded replay and SSE sessions; callers only
 * need start, stop, status and subscribe.  It deliberately delegates the
 * actual operation to EditReplicaServer so browser and CLI share one preview.
 */
export class CreatorPreviewRuntime {
  private readonly _sessions = new Set<Session>();
  private readonly _events: BufferedEvent[] = [];
  private _nextEventId = 1;
  private _lastRunning: boolean;
  private readonly _statusTimer: NodeJS.Timeout;
  private _ready = false;
  private readonly _readyPromise: Promise<void>;
  private _resolveReady!: () => void;

  constructor(private readonly _spec: {
    state: EditServerState;
    replica: EditReplicaServer;
    debugger: DebuggerServer;
  }) {
    this._lastRunning = this._running;
    this._readyPromise = new Promise<void>((resolve) => {
      this._resolveReady = resolve;
    });
    this._spec.debugger.onCreatorConsoleEvent.sub(this._publishConsole);
    this._statusTimer = setInterval(this._observeStatus, 1_000);
    this._statusTimer.unref();
  }

  private get _running() {
    return this._spec.state.game.state.replica.running;
  }

  public status() {
    const running = this._running;
    return {
      phase: running ? 'ready' as const : 'idle' as const,
      running,
      message: running ? '预览运行中' : '预览已停止',
      updatedAt: new Date().toISOString(),
    };
  }

  /** Called after the editor's own initial `play: false` synchronization. */
  public markReady() {
    if (this._ready) return;
    this._ready = true;
    this._resolveReady();
  }

  public async start() {
    await this._readyPromise;
    if (!this._running) await this._spec.replica.startProject();
    this._publishStatus();
    return this.status();
  }

  public async stop() {
    await this._readyPromise;
    if (this._running) await this._spec.replica.stopProject();
    this._publishStatus();
    return this.status();
  }

  public async subscribe(req: IncomingMessage, res: ServerResponse) {
    const session = await createSession(req, res, {
      keepAlive: 15_000,
      retry: 1_000,
      headers: { 'Cache-Control': 'no-cache, no-transform' },
    });
    this._sessions.add(session);
    session.on('disconnected', () => this._sessions.delete(session));

    const sendInitialEvents = () => {
      const lastId = Number.parseInt(String(req.headers['last-event-id'] || ''), 10);
      if (Number.isSafeInteger(lastId) && lastId > 0) {
        for (const event of this._events) {
          if (event.id > lastId) this._push(session, event);
        }
        return;
      }
      this._push(session, { id: 0, type: 'status', ...this.status(), at: new Date().toISOString() });
    };
    if (session.isConnected) sendInitialEvents();
    else session.once('connected', sendInitialEvents);
  }

  private _observeStatus = () => {
    if (this._running !== this._lastRunning) this._publishStatus();
  };

  private _publishStatus() {
    const running = this._running;
    this._lastRunning = running;
    this._publish({ type: 'status', ...this.status(), at: new Date().toISOString() });
  }

  private _publishConsole = (event: CreatorConsoleEvent) => {
    if (event.type === 'log') {
      event = { ...event, message: event.message.slice(0, MAX_MESSAGE_LENGTH) };
    }
    this._publish(event);
  };

  private _publish(event: RuntimeEvent) {
    const item: BufferedEvent = { ...event, id: this._nextEventId++ };
    this._events.push(item);
    if (this._events.length > MAX_EVENTS) this._events.shift();
    for (const session of this._sessions) this._push(session, item);
  }

  private _push(session: Session, event: BufferedEvent) {
    if (!session.isConnected) return;
    try {
      session.push(event, event.type, String(event.id));
    } catch {
      this._sessions.delete(session);
    }
  }
}
