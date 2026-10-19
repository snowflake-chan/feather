import { MuRDA } from '@box/mudb/rda';

export function rdaProtocol<RDA extends MuRDA<any, any, any, any>>(
  rda: RDA,
  name: string,
) {
  return {
    name: 'replica-' + name,
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

export type RDAProtocol<RDA extends MuRDA<any, any, any, any>> = {
  name: string;
  client: {
    init: RDA['storeSchema'];
    squash: RDA['stateSchema'];
    apply: RDA['actionSchema'];
  };
  server: {
    apply: RDA['actionSchema'];
  };
};
