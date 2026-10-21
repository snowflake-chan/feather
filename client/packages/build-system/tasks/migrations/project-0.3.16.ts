import { EnvironmentParams } from '@box/schema/environment/environment-schema';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.15';
export const toVersion = '0.3.16';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.16';
  project.prevHash = hash;

  const env: EnvironmentParams = await bs.retrieveJSON(project.environment);
  env.drawDistance = 512;
  env.sky.gamma = 1.3;

  project.environment = await bs.storeJSON(env);

  return bs.storeJSON(project);
}
