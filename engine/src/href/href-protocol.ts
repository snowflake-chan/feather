import { HyperLinkSchema } from './href-client-state';

export const HyperlinkProtocol = {
  name: 'ref',
  client: {
    openLink: HyperLinkSchema,
  },
  server: {},
};
