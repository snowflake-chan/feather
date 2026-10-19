import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.1';
export const toVersion = '0.3.2';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.2';
  project.prevHash = hash;

  // turn on trigger API for legacy scripts, projects created after version 0.3.2 do not get access to triggers
  project.features = {
    enableTriggerAPI: true,
  };

  // set up collision filter
  project.collisionFilter = [];

  // store zones
  project.zones = await bs.storeJSON([]);

  // update fog for environment
  const env = await bs.retrieveJSON(project.environment);
  env.fog = {
    fogColor: env.sky.fogColor,
    fogStartDistance: env.sky.fogStartDistance,
    fogHeightOffset: env.sky.fogHeightOffset,
    fogHeightFalloff: env.sky.fogHeightFalloff,
    fogDensity: env.sky.fogDensity,
    maxFog: env.sky.maxFog,
  };
  project.environment = await bs.storeJSON(env);

  return bs.storeJSON(project);
}
