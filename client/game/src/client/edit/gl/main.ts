import { ClientStateType } from '../edit-schema';
import { REGLLoader, REGL } from 'src/engine/gl/regl';
import { GameClientState } from 'src/engine/game-client-schema';
import glHacking from './hacking';

export default function (regl: REGL, loader: REGLLoader) {
  const hacking = loader.require(glHacking);

  function editorRestore(state: ClientStateType) {
    hacking.restore(state);
  }

  function editorInit(state: ClientStateType) {
    regl.on('restore', () => {
      editorRestore(state);
    });
  }

  function editorForward(state: ClientStateType, gameState: GameClientState) {
    hacking.setup(state, gameState);
    hacking.forward(state);
  }

  function editorAlphaPre(state: ClientStateType) {
    hacking.alphaPre(state);
  }

  function editorAlphaPost(gameState: GameClientState) {
    hacking.alpha(gameState);
  }

  function editorShadow(state: ClientStateType) {}

  return {
    init: editorInit,
    forward: editorForward,
    alphaPre: editorAlphaPre,
    alphaPost: editorAlphaPost,
    shadow: editorShadow,
  };
}
