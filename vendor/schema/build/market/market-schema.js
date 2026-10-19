"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenMarketplaceSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.OpenMarketplaceSchema = new schema_1.MuStruct({
    productIds: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity),
});
//# sourceMappingURL=market-schema.js.map