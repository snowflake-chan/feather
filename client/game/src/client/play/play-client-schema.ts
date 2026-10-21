import { MuStruct } from '@box/mudb/schema';
import { SettingsSchema } from 'src/engine/settings/settings-schema';
import { HyperLinkSchema } from 'src/engine/href/href-client-state';
import { PostMessageSchema } from '@box/schema/navigator/navigator-schema';
import { ChatSchema } from '@box/schema/chat/chat-schema';

export enum GameClientPlayState {
  LOADING,
  SELECT_SKIN,
  CONNECTING,
  GAME,
  ERROR,
  REFRESHING,
}

// schema map 用于state的diff和赋值
export const stateSchemasMap = {
  // 传送门（需要更新）
  hyperLink: HyperLinkSchema,
  settings: SettingsSchema,
  iframeMessage: PostMessageSchema,
};
export type StateSchemasMapType = typeof stateSchemasMap;

// client state的schema
export const ClientStateSchema = new MuStruct(stateSchemasMap);
export type ClientStateType = typeof ClientStateSchema;
