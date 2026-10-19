import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.5';
export const toVersion = '0.0.6';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.6';
  project.prevHash = hash;
  Object.keys(project.seeds).forEach((seedId) => {
    const seed = project.seeds[seedId];
    seed.props.emissive = 0;
    seed.props.metalness = 0;
    seed.props.shininess = 0;
  });
  return bs.storeJSON(project);
}
