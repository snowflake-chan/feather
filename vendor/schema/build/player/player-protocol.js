"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerProtocolSchema = void 0;
const player_event_schema_1 = require("../events/player-event-schema");
const schema_1 = require("@box/mudb/schema");
exports.PlayerProtocolSchema = {
    name: 'player-protocol',
    client: {
        playerJoin: player_event_schema_1.PlayerEventSchema,
        playerLeave: player_event_schema_1.PlayerEventSchema,
        openUserProfileDialog: new schema_1.MuStruct({
            userId: new schema_1.MuUTF8(),
        }),
    },
    server: {
        updateAvatarSkin: new schema_1.MuVoid(),
        selectBuiltInAvatarSkin: new schema_1.MuUTF8(),
    },
};
//# sourceMappingURL=player-protocol.js.map