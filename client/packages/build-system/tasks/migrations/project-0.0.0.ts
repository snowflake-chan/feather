import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.0';
export const toVersion = '0.0.1';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.1';
  project.jsScript = '';
  project.prevHash = hash;
  project.physics = {
    gravity: -0.1,
    velocityDamping: 0.02,
  };
  project.environment = project.environment || {
    fog: {
      extinction: {
        r: 0.001,
        g: 0.0012,
        b: 0.0014,
      },
      scattering: {
        r: 0.001,
        g: 0.0012,
        b: 0.0014,
      },
    },
    sky: {
      sunPhase: 0,
      sunFrequency: 0.1,
      lunarPhase: 0.5,
    },
    snow: {
      density: 0.11,
      size: {
        w: 1,
        h: 1,
      },
      texture: '',
      fallSpeed: 1,
      spinSpeed: 0,
      color: {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
      },
    },
    rain: {
      density: 0,
      phi: 0,
      theta: Math.PI / 2 + 0.3,
      speed: 1,
      size: {
        w: 0,
        h: 0,
      },
      interference: 0.04,
      color: {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
      },
    },
  };
  project.seeds = project.seeds || {};
  project.assets = project.assets || {};
  return bs.storeJSON(project);
}
