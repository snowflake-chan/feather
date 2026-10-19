import * as pq from './pairing-heap';
import { ScriptPerfCounter } from './scheduler-schema';

const MIN_TIMESTEP_MS = 0.7;

export function createScriptScheduler(raiseError: (e) => void) {
  let currentMS = 0;
  let lastTaskId = 1;
  let priorityQueue: pq.Node = pq.NIL;
  const waitingTimeouts = new Map<number, pq.Node>();
  let selfCancelledTimeout = false;

  let freeCount = 0;
  let allocCount = 0;
  let scheduleCount = 0;
  let dispatchCount = 0;

  function schedule(event: () => void) {
    allocCount++;
    const node = pq.create(currentMS, lastTaskId++);
    const id = node.taskId;
    node.lambda = () => {
      event();
      return true;
    };
    scheduleCount++;
    priorityQueue = pq.merge(priorityQueue, node);
    return id;
  }

  function scheduleAt(x: () => boolean, t: number) {
    allocCount++;
    const node = pq.create(t, lastTaskId++);
    const id = node.taskId;
    node.lambda = x;
    scheduleCount++;
    priorityQueue = pq.merge(priorityQueue, node);
    return id;
  }

  const _setTimeout = (fn: Function, t: number, ...args: any[]) => {
    const triggerAtMS = Math.max(currentMS + t, currentMS + MIN_TIMESTEP_MS);
    // We ensure that users can't crash server with infinite loop
    // if they do a recursive setTimeout(x, 0)
    // TODO remove this when we deal with infinite time consumtion better
    allocCount++;
    const node = pq.create(triggerAtMS, lastTaskId++);
    const id = node.taskId;
    waitingTimeouts.set(id, node);
    node.lambda = () => {
      waitingTimeouts.delete(id);
      try {
        fn.apply(undefined, args);
      } catch (e) {
        raiseError(e);
      }
      return true;
    };
    scheduleCount++;
    priorityQueue = pq.merge(priorityQueue, node);
    return id;
  };

  const __setInterval = (
    fn: Function,
    t: number,
    args: any[],
    taskId?: number,
  ) => {
    // We ensure that users can't crash server with infinite loop
    // if they do a recursive setTimeout(x, 0)
    const triggerAtMS = Math.max(currentMS + t, currentMS + MIN_TIMESTEP_MS);
    const id = taskId !== undefined ? taskId : lastTaskId++;
    allocCount++;
    const node = pq.create(triggerAtMS, id);
    waitingTimeouts.set(id, node);
    node.lambda = () => {
      waitingTimeouts.delete(id);
      // need to track this in case intervals cancel themselves
      selfCancelledTimeout = false;
      try {
        fn.apply(undefined, args);
      } catch (e) {
        raiseError(e.message + '\n' + e.stack);
      }
      if (!selfCancelledTimeout) {
        __setInterval(fn, t, args, id);
      }
      return true;
    };
    scheduleCount++;
    priorityQueue = pq.merge(priorityQueue, node);
    return id;
  };

  const _setInterval = (fn: Function, t: number, ...args: any[]) => {
    return __setInterval(fn, t, args);
  };

  const _clearTimeout = (id: number) => {
    if (id < 0) {
      return;
    }
    if (priorityQueue.taskId === id) {
      selfCancelledTimeout = true;
      return;
    }
    const node = waitingTimeouts.get(id);
    if (node === undefined) {
      return; // must not throw here by standards
    }
    node.lambda = pq.NIL_LAMBDA;
    node.weight = -100;
    priorityQueue = pq.decreaseKey(priorityQueue, node);
    dispatchCount++;
    priorityQueue = pq.takeMin(priorityQueue);
    freeCount++;
    pq.free(node);
    waitingTimeouts.delete(id);
  };

  function setTime(t: number) {
    currentMS = Math.max(currentMS, t);
  }

  function poll(stopTick: number) {
    while (priorityQueue !== pq.NIL && priorityQueue.weight < stopTick) {
      const next = priorityQueue;
      setTime(next.weight);
      let v = false;
      try {
        v = next.lambda();
      } catch (e) {
        v = true;
        console.error(e);
      }
      dispatchCount++;
      priorityQueue = pq.takeMin(priorityQueue);
      freeCount++;
      pq.free(next);
      if (v) {
        return true;
      }
    }
    return false;
  }

  return {
    scheduler: {
      setTimeout: _setTimeout,
      setInterval: _setInterval,
      clearTimeout: _clearTimeout,
      clearInterval: _clearTimeout,
    },
    scheduleAt,
    schedule,
    setTime,
    poll,
    currentMS: () => currentMS,
    stats: (perf: ScriptPerfCounter) => {
      perf.pqAllocCount = allocCount;
      perf.pqFreeCount = freeCount;
      perf.pqScheduled = scheduleCount - dispatchCount;
      perf.pqTimeouts = waitingTimeouts.size;
    },
  };
}

export type ScriptScheduler = ReturnType<typeof createScriptScheduler>;
