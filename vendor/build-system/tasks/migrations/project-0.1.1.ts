import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.0';
export const toVersion = '0.1.1';

// adds particles
export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.1';
  project.prevHash = hash;
  project.timestamp = new Date();

  // initialize particle state
  const entities = project.entities;
  Object.keys(entities).forEach((id) => {
    const entity = entities[id];
    entity.particle = {
      // emit rate
      rate: 0,
      rateSpread: 0,
      limit: 0,
      lifetime: 10,
      lifetimeSpread: 0,

      // color
      color0: { r: 1, g: 1, b: 1 },
      color1: { r: 1, g: 1, b: 1 },
      color2: { r: 1, g: 1, b: 1 },
      color3: { r: 1, g: 1, b: 1 },
      color4: { r: 1, g: 1, b: 1 },

      // size
      size0: 1,
      size1: 1,
      size2: 1,
      size3: 1,
      size4: 1,
      sizeSpread: 0,

      // motion parameters
      velocity: { x: 0, y: 0, z: 0 },
      velocitySpread: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      damping: 0,
      noiseAmpl: 0,
      noiseFreq: 0,
    };
  });

  return bs.storeJSON(project);
}
