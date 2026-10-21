"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const cwd = __dirname;
(0, child_process_1.spawn)('browserify _/client.ts -p [ tsify ] | tape-run', [], {
    cwd,
    shell: true,
    stdio: 'inherit',
});
//# sourceMappingURL=client.js.map