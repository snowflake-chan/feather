"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteClientEventsSchema = exports.RemoteClientEventSchema = exports.RemoteChannelEventsSchema = exports.RemoteChannelEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const REMOTE_EVENT_SPEC = {
    tick: new schema_1.MuVarint(),
    args: new schema_1.MuUTF8(),
};
exports.RemoteChannelEventSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint() }, REMOTE_EVENT_SPEC));
exports.RemoteChannelEventsSchema = new schema_1.MuArray(exports.RemoteChannelEventSchema, Infinity);
exports.RemoteClientEventSchema = new schema_1.MuStruct(REMOTE_EVENT_SPEC);
exports.RemoteClientEventsSchema = new schema_1.MuArray(exports.RemoteClientEventSchema, Infinity);
//# sourceMappingURL=remote-channel-event-schema.js.map