import {
  MuASCII,
  MuBoolean,
  MuDictionary,
  MuSchema,
  MuStruct,
} from '@box/mudb/schema';
import { PostMessageSchema } from '@box/schema/navigator/navigator-schema';
import { GLTextureSchema } from 'src/engine/gl/schema/gl-texture';
import { HyperLinkSchema } from 'src/engine/href/href-client-state';
import { SoundResourceSchema } from 'src/engine/sound/client-sound-state';
import { CodeEditorClientStateSchema } from './code-editor/code-editor-client-state';
import { DebuggerClientStateSchema } from './debugger/debugger-client-state';
import { PublishClientStateSchema } from './publish/publish-client-schema';
import { ReplicaClientStateSchema } from './replica/replica-client-schema';

// 需要监听的engine内的数据（由于依赖的数据不是全部数据，后续可以拆一下）
export const SoundSchema = new MuStruct({
  sampleCache: new MuDictionary(SoundResourceSchema, Infinity),
});

export const frameStateSchemasMap = {
  // 传送门（需要更新）
  hyperLink: HyperLinkSchema,
  sound: SoundSchema,

  replica: ReplicaClientStateSchema,
  codeEditor: CodeEditorClientStateSchema,
  debugger: DebuggerClientStateSchema,
  rotationTutorial: <MuSchema<'left' | 'right' | ''>>new MuASCII(''),
  iframeMessage: PostMessageSchema,
};

export type FrameStateSchemasMapType = typeof frameStateSchemasMap;

export const FrameClientStateSchema = new MuStruct(frameStateSchemasMap);
export type FrameClientStateType = typeof FrameClientStateSchema.identity;

// state
export const ClientStateSchema = new MuStruct({
  ...frameStateSchemasMap,
  isAdmin: new MuBoolean(false),
  // 和react无关models，内部处理，组件没有用到的地方
  hackingTexture: GLTextureSchema,
  // settingPanels的bugReport有用到其中的gameId，不用刷
  publish: PublishClientStateSchema,
});
export type ClientStateType = typeof ClientStateSchema.identity;
