import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.1';
export const toVersion = '0.0.2';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.2';
  project.prevHash = hash;
  project.scriptIndex = [];
  project.player = {
    initialYaw: 0,
    allowFlight: false,
    allowMove: true,
    noClip: false,
    walkSpeed: 0.22,
    walkAcceleration: 0.19,
    runSpeed: 0.4,
    runAcceleration: 0.35,
    crouchSpeed: 0.1,
    crouchAcceleration: 0.09,
    swimSpeed: 0.4,
    swimAcceleration: 0.1,
    flySpeed: 2,
    flyAcceleration: 2,
    fallSpeed: 3.4e38,
    fallAcceleration: 0.05,
    jumpSpeedFactor: 0.85,
    jumpAccelerationFactor: 0.55,
    jumpPower: 0.96,
    doubleJumpPower: 0.9,
    mass: 1,
    friction: 0,
    restitution: 0,
    color: [1, 1, 1],
    emissive: 0,
    shininess: 0,
    metalness: 0,
  };
  return bs.storeJSON(project);
}
