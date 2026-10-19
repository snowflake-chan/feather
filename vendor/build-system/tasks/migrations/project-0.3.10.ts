import { EnvironmentParams } from '@box/schema/environment/environment-schema';
import { ZoneSet } from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.9';
export const toVersion = '0.3.10';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.10';
  project.prevHash = hash;

  // add global light in environment sky
  const env: EnvironmentParams = await bs.retrieveJSON(project.environment);
  env.sky.globalLight = 0.0;

  // add global light in zones sky
  const zones: ZoneSet = await bs.retrieveJSON(project.zones);
  zones.forEach((zone) => {
    zone.sky.globalLight = 0.0;
  });

  project.environment = await bs.storeJSON(env);
  project.zones = await bs.storeJSON(zones);

  return bs.storeJSON(project);
}
