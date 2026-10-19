"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockProtocol = exports.TICK_RATE = exports.FRAMESKIP = exports.MS_PER_TICK = void 0;
const struct_1 = require("@box/mudb/schema/struct");
const float64_1 = require("@box/mudb/schema/float64");
const varint_1 = require("@box/mudb/schema/varint");
exports.MS_PER_TICK = 64;
exports.FRAMESKIP = Infinity;
exports.TICK_RATE = 1 / exports.MS_PER_TICK;
exports.ClockProtocol = {
    name: 'game-clock',
    client: {
        pong: new struct_1.MuStruct({
            clientClock: new float64_1.MuFloat64(),
            serverClock: new float64_1.MuFloat64(),
            frameSkip: new varint_1.MuVarint(),
        }),
        frameSkip: new varint_1.MuVarint(),
    },
    server: {
        ping: new float64_1.MuFloat64(),
    },
};
