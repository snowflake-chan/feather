import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.23';
export const toVersion = '0.3.24';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.24';
  project.prevHash = hash;

  const gamepad = {
    joystick: {
      background: '',
      controller: '',
    },
    fly: {
      button: '',
      flyingController: '',
      flyingBackground: '',
    },
    buttons: {
      jump: '',
      crouch: '',
      actionA: '',
      actionB: '',
    },
  };

  project.gamepad = await bs.storeJSON(gamepad);

  return bs.storeJSON(project);
}
