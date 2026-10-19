"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameUIProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
const hot_schema_1 = require("../project/hot-schema");
const defs_1 = require("../project/ui-rda/defs");
const ResetSchema = new schema_1.MuStruct({
    running: new schema_1.MuBoolean(),
    uiTree: defs_1.UITreeRDA.stateSchema,
    pictureAssets: hot_schema_1.PictureAssetSetSchema,
    defaultScreenId: new schema_1.MuUTF8(''),
});
exports.GameUIProtocol = {
    name: 'gameUI',
    client: {
        reset: ResetSchema,
    },
    server: {},
};
//# sourceMappingURL=game-ui-protocol.js.map