"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScriptScheduler = createScriptScheduler;
const pq = __importStar(require("./pairing-heap"));
const MIN_TIMESTEP_MS = 0.7;
function createScriptScheduler(raiseError) {
    let currentMS = 0;
    let lastTaskId = 1;
    let priorityQueue = pq.NIL;
    const waitingTimeouts = new Map();
    let selfCancelledTimeout = false;
    let freeCount = 0;
    let allocCount = 0;
    let scheduleCount = 0;
    let dispatchCount = 0;
    function schedule(event) {
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
    function scheduleAt(x, t) {
        allocCount++;
        const node = pq.create(t, lastTaskId++);
        const id = node.taskId;
        node.lambda = x;
        scheduleCount++;
        priorityQueue = pq.merge(priorityQueue, node);
        return id;
    }
    const _setTimeout = (fn, t, ...args) => {
        const triggerAtMS = Math.max(currentMS + t, currentMS + MIN_TIMESTEP_MS);
        allocCount++;
        const node = pq.create(triggerAtMS, lastTaskId++);
        const id = node.taskId;
        waitingTimeouts.set(id, node);
        node.lambda = () => {
            waitingTimeouts.delete(id);
            try {
                fn.apply(undefined, args);
            }
            catch (e) {
                raiseError(e);
            }
            return true;
        };
        scheduleCount++;
        priorityQueue = pq.merge(priorityQueue, node);
        return id;
    };
    const __setInterval = (fn, t, args, taskId) => {
        const triggerAtMS = Math.max(currentMS + t, currentMS + MIN_TIMESTEP_MS);
        const id = taskId !== undefined ? taskId : lastTaskId++;
        allocCount++;
        const node = pq.create(triggerAtMS, id);
        waitingTimeouts.set(id, node);
        node.lambda = () => {
            waitingTimeouts.delete(id);
            selfCancelledTimeout = false;
            try {
                fn.apply(undefined, args);
            }
            catch (e) {
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
    const _setInterval = (fn, t, ...args) => {
        return __setInterval(fn, t, args);
    };
    const _clearTimeout = (id) => {
        if (id < 0) {
            return;
        }
        if (priorityQueue.taskId === id) {
            selfCancelledTimeout = true;
            return;
        }
        const node = waitingTimeouts.get(id);
        if (node === undefined) {
            return;
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
    function setTime(t) {
        currentMS = Math.max(currentMS, t);
    }
    function poll(stopTick) {
        while (priorityQueue !== pq.NIL && priorityQueue.weight < stopTick) {
            const next = priorityQueue;
            setTime(next.weight);
            let v = false;
            try {
                v = next.lambda();
            }
            catch (e) {
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
        stats: (perf) => {
            perf.pqAllocCount = allocCount;
            perf.pqFreeCount = freeCount;
            perf.pqScheduled = scheduleCount - dispatchCount;
            perf.pqTimeouts = waitingTimeouts.size;
        },
    };
}
