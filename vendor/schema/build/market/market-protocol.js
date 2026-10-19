"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketProtocol = void 0;
const market_schema_1 = require("./market-schema");
exports.MarketProtocol = {
    name: 'market',
    client: {
        openMarketplace: market_schema_1.OpenMarketplaceSchema,
    },
    server: {},
};
//# sourceMappingURL=market-protocol.js.map