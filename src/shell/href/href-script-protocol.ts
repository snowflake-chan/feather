import { MuStruct, MuUTF8, MuVarint, MuBoolean } from '@box/mudb/schema';

export const HyperlinkScriptProtocol = {
  name: 'hyperlink-script',
  client: {},
  server: {
    openLink: new MuStruct({
      clientId: new MuVarint(),
      href: new MuUTF8(),
      isConfirm: new MuBoolean(true),
      isNewTab: new MuBoolean(true),
    }),
  },
};
