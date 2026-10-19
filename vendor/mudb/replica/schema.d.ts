import { MuRDA } from '../rda/rda';
export declare function rdaProtocol<RDA extends MuRDA<any, any, any, any>>(rda: RDA): {
    client: {
        init: any;
        squash: any;
        apply: any;
    };
    server: {
        apply: any;
    };
};
export type RDAProtocol<RDA extends MuRDA<any, any, any, any>> = {
    client: {
        init: RDA['storeSchema'];
        squash: RDA['stateSchema'];
        apply: RDA['actionSchema'];
    };
    server: {
        apply: RDA['actionSchema'];
    };
};
//# sourceMappingURL=schema.d.ts.map