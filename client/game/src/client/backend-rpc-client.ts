import { UserRPCSchema, UserAPI } from '@box/schema/backend/rpc/user-protocol';
import { AuthRPCSchema, AuthAPI } from '@box/schema/backend/rpc/auth-protocol';
import {
  ContentAPI,
  ContentRPCSchema,
} from '@box/schema/backend/rpc/content-protocol';
import { MuRPCClient } from '@box/mudb/rpc/client';
import { MuRPCHttpClientTransport } from '@box/mudb/rpc/http/client-browser';
import { BackendRPC } from '@box/schema/backend/rpc-interface';
import { Logger } from '@box/utils/logger';

export class BackendClientRPC implements BackendRPC {
  public user: UserAPI;
  public auth: AuthAPI;
  public content: ContentAPI;

  public headers = {};

  constructor(backendURL: string, logger: Logger) {
    const transport = new MuRPCHttpClientTransport({
      url: backendURL + '/api',
      timeout: Infinity,
      headers: this.headers,
    });
    this.user = new MuRPCClient(UserRPCSchema, transport);
    this.auth = new MuRPCClient(AuthRPCSchema, transport);
    this.content = new MuRPCClient(ContentRPCSchema, transport);
  }

  public setHeaders(headers: any) {
    Object.assign(this.headers, headers);
    return this;
  }
}
