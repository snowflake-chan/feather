import { MuStruct, MuArray, MuUTF8, MuVarint } from '@box/mudb/schema';

const REMOTE_EVENT_SPEC = {
  tick: new MuVarint(),
  args: new MuUTF8(),
};

export const RemoteChannelEventSchema = new MuStruct({
  id: new MuVarint(),
  ...REMOTE_EVENT_SPEC,
});

export const RemoteChannelEventsSchema = new MuArray(
  RemoteChannelEventSchema,
  Infinity,
);

export const RemoteClientEventSchema = new MuStruct(REMOTE_EVENT_SPEC);

export const RemoteClientEventsSchema = new MuArray(
  RemoteClientEventSchema,
  Infinity,
);
