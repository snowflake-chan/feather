import { AuthAPI } from './rpc/auth-protocol';
import { ContentAPI } from './rpc/content-protocol';
import { UserAPI } from './rpc/user-protocol';

export interface BackendRPC {
  user: UserAPI;
  auth: AuthAPI;
  content: ContentAPI;
}
