"use strict";
// heavy, non-reentrant build tasks should lock this to reduce concurrency.
//  too many build processes running at once slows down execution, this is a way to optimize build perf by forcing some tasks in the same process
//  to run sequentially.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILD_HEAVY_LOCK = void 0;
const semaphore_1 = require("@box/utils/semaphore");
// another dumb hack.  used to force serial execution for heavy tasks to avoid too many concurrent allocations.
exports.BUILD_HEAVY_LOCK = new semaphore_1.Semaphore(1);
//# sourceMappingURL=heavy_mutex.js.map