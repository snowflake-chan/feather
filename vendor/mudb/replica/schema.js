"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rdaProtocol = rdaProtocol;
function rdaProtocol(rda) {
    return {
        client: {
            init: rda.storeSchema,
            squash: rda.stateSchema,
            apply: rda.actionSchema,
        },
        server: {
            apply: rda.actionSchema,
        },
    };
}
//# sourceMappingURL=schema.js.map