import {
  MuUnion,
  MuBoolean,
  MuVarint,
  MuStruct,
  MuASCII,
  MuUTF8,
  MuVoid,
  MuArray,
} from '@box/mudb/schema';
import { UserIdSchema } from '../permissions/permission-rda';

export const AdminCommandSchema = new MuUnion({
  // stat sync
  pollUsers: new MuVoid(),

  // chat policing
  ghost: new MuBoolean(false),
  kick: new MuVarint(),
  ban: new MuVarint(),
  banIp: new MuASCII(),
  redirect: new MuStruct({
    userId: new MuVarint(),
    href: new MuUTF8(),
  }),
  alert: new MuStruct({
    userId: new MuVarint(),
    message: new MuUTF8(),
  }),

  // user content and scripts
  scriptEval: new MuUTF8(),
  serverEval: new MuUTF8(),
  stopScripts: new MuVoid(),
  reloadProject: new MuVoid(),

  // really dangerous admin function
  exitProcess: new MuVoid(),
  restartContainer: new MuVoid(),
  updateHash: new MuASCII(),
});

export type AdminCommand = typeof AdminCommandSchema.identity;

export const AdminUserSchema = new MuStruct({
  name: new MuUTF8(),
  entityId: new MuVarint(),
  userId: UserIdSchema,
  ipAddress: new MuASCII(),
});

export type AdminUser = typeof AdminUserSchema.identity;

export const AdminUserSetSchema = new MuArray(AdminUserSchema, Infinity);

export const AdminEventSchema = new MuUnion({
  users: AdminUserSetSchema,
  log: new MuUTF8(),
});

export type AdminEvent = typeof AdminEventSchema.identity;
