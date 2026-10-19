// heavy, non-reentrant build tasks should lock this to reduce concurrency.
//  too many build processes running at once slows down execution, this is a way to optimize build perf by forcing some tasks in the same process
//  to run sequentially.

import { Semaphore } from '@box/utils/semaphore';

// another dumb hack.  used to force serial execution for heavy tasks to avoid too many concurrent allocations.
export const BUILD_HEAVY_LOCK = new Semaphore(1);
