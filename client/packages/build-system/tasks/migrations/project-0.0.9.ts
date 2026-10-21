import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.9';
export const toVersion = '0.0.10';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.10';
  project.prevHash = hash;

  // update spawn point and initial position
  const shape = project.voxels.shape;
  project.player.movementBounds = {
    lo: {
      x: -50,
      y: -50,
      z: -50,
    },
    hi: {
      x: shape.x + 50,
      y: shape.y + 50,
      z: shape.z + 50,
    },
  };
  project.player.initialPosition = {
    x: 0.5 * shape.x,
    y: shape.y + 25,
    z: 0.5 * shape.z,
  };

  return bs.storeJSON(project);
}
