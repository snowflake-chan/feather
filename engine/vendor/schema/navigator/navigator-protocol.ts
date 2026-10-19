import { MessageEventSchema, PostMessageSchema } from './navigator-schema';

export const NavigatorProtocol = {
  name: 'navigator',
  client: {
    postMessage: PostMessageSchema,
  },
  server: {
    messageEvent: MessageEventSchema,
  },
};
