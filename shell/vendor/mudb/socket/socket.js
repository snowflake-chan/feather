"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSocketServerState = exports.MuSocketState = void 0;
var MuSocketState;
(function (MuSocketState) {
    MuSocketState[MuSocketState["INIT"] = 0] = "INIT";
    MuSocketState[MuSocketState["OPEN"] = 1] = "OPEN";
    MuSocketState[MuSocketState["CLOSED"] = 2] = "CLOSED";
})(MuSocketState || (exports.MuSocketState = MuSocketState = {}));
var MuSocketServerState;
(function (MuSocketServerState) {
    MuSocketServerState[MuSocketServerState["INIT"] = 0] = "INIT";
    MuSocketServerState[MuSocketServerState["RUNNING"] = 1] = "RUNNING";
    MuSocketServerState[MuSocketServerState["SHUTDOWN"] = 2] = "SHUTDOWN";
})(MuSocketServerState || (exports.MuSocketServerState = MuSocketServerState = {}));
//# sourceMappingURL=socket.js.map