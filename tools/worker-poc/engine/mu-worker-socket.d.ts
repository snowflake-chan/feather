import type {
  MuData,
  MuSocket,
  MuSocketServer,
  MuSocketServerState,
  MuSocketServerSpec,
  MuSocketSpec,
  MuSocketState,
} from '@box/mudb/socket/socket';
import type { MessagePort, Worker } from 'worker_threads';

export declare class NodeWorkerSocketServer implements MuSocketServer {
  clients: MuSocket[];
  constructor();
  state(): MuSocketServerState;
  start(spec: MuSocketServerSpec): void;
  attach(worker: Worker): void;
  close(): void;
}

export declare class NodeWorkerSocket implements MuSocket {
  readonly sessionId: string;
  constructor(sessionId: string, port: MessagePort);
  state(): MuSocketState;
  open(spec: MuSocketSpec): void;
  send(data: MuData, unreliable?: boolean): void;
  close(): void;
  reliableBufferedAmount(): number;
  unreliableBufferedAmount(): number;
}
