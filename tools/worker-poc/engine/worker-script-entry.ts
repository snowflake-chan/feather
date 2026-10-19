import { parentPort, workerData } from 'worker_threads';
import { randomUUID } from 'crypto';
import { NodeWorkerSocket } from './mu-worker-socket';
import { ScriptShell } from '../../script/script-shell';

if (!parentPort) {
  throw new Error('worker-script-entry must run inside a worker_threads Worker');
}

const socket = new NodeWorkerSocket(randomUUID(), parentPort);

const sysLog = (level: string, object: unknown, message?: unknown, ...args: unknown[]) => {
  const parts: string[] = [];
  if (object !== undefined) {
    parts.push(object instanceof Error ? object.stack || object.message : String(object));
  }
  if (message !== undefined) parts.push(String(message));
  for (const arg of args) parts.push(String(arg));
  console.error(`[script-shell:${level}] ${parts.join(' ')}`);
};

const unsafeExec = !!(workerData && (workerData as { unsafeExec?: boolean }).unsafeExec);

// 与 ivm2-script-entry.ts 对齐：shell 只拿到 socket + unsafe + sysLog
new ScriptShell(socket, unsafeExec, sysLog);
