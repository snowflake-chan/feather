import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.8';
export const toVersion = '0.0.9';

function defaultDamage() {
  return {
    enabled: false,
    showHealth: true,
    hp: 100,
    maxHp: 100,
  };
}

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.9';
  project.prevHash = hash;

  project.player.damage = defaultDamage();
  const seeds = project.seeds;
  const seedIds = Object.keys(seeds);
  for (let i = 0; i < seedIds.length; ++i) {
    const s = seeds[seedIds[i]];
    s.props.damage = defaultDamage;
  }

  return bs.storeJSON(project);
}
