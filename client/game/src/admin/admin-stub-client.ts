import { MuClient } from '@box/mudb/client';
import { AdminProtocol } from '@box/schema/admin/admin-gateway-protocol';
import { resolvePublicUrl } from 'src/utils/public-url';

export function installStubAdminClient(client: MuClient) {
  client.protocol(AdminProtocol).configure({
    message: {
      redirect: (href) => {
        window.location.href = resolvePublicUrl(String(href));
      },
      alert: (message) => {
        alert(message);
      },
    },
  });
}
