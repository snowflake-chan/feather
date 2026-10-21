import { OpenMarketplaceSchema } from './market-schema';

export const MarketProtocol = {
  name: 'market',
  client: {
    openMarketplace: OpenMarketplaceSchema,
  },
  server: {},
};
