import type { GameUIClient } from 'src/engine/game-ui';
import type { SoundClient } from 'src/engine/sound/client-sound-controller';
import type { ScriptClientConsole } from '../console';
import {
  createComponent,
  createRenderable,
  createScreen,
  getAllScreen,
} from '../gui';
import { ClientScriptContext } from './const';

export function initClientScriptContext(spec: {
  guiClient: GameUIClient;
  scriptClientConsole: ScriptClientConsole;
  soundClient: SoundClient;
}) {
  const { guiClient, scriptClientConsole, soundClient } = spec;

  ClientScriptContext.scriptConsole = scriptClientConsole;
  ClientScriptContext.inputManager = guiClient.inputManager;
  ClientScriptContext.soundClient = soundClient;

  ClientScriptContext.createRenderable = createRenderable(guiClient);
  ClientScriptContext.createComponent = createComponent(guiClient);
  ClientScriptContext.createScreen = createScreen(guiClient);
  ClientScriptContext.getAllScreen = getAllScreen(guiClient);
}

function throwNotImplemented(): never {
  throw new Error('Not implemented');
}

export function clearClientScriptContext() {
  ClientScriptContext.scriptConsole = undefined;
  ClientScriptContext.inputManager = undefined;
  ClientScriptContext.soundClient = undefined;

  ClientScriptContext.createRenderable = throwNotImplemented;
  ClientScriptContext.createComponent = throwNotImplemented;
  ClientScriptContext.createScreen = throwNotImplemented;
  ClientScriptContext.getAllScreen = throwNotImplemented;
}
