"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuDefaultLogger = void 0;
exports.MuDefaultLogger = {
    log: () => { },
    error: (x) => {
        console.log(`mudb error: ${x}`);
    },
    exception: console.error,
};
//# sourceMappingURL=logger.js.map