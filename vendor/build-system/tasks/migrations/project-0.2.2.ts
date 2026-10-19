import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.2.1';
export const toVersion = '0.2.2';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.2.2';
  project.prevHash = hash;
  project.timestamp = new Date();

  // add music field
  project.player.playerSounds.music = {
    sample: '',
    radius: 0,
    pitch: 1,
    pitchRange: 0,
    gain: 1,
    gainRange: 0,
  };

  return bs.storeJSON(project);
}
