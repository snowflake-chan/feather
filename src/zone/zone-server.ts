import { getById } from '@box/utils/id';
import { GameServerState } from '../game-server-schema';
import { RigidBodyFlags } from '@box/schema/physics/physics-schema';
import {
  EnvironmentZone,
  EnvironmentZoneSchema,
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import { ServerEnvironmentZoneSetSchema } from './zone-server-state';

export function getPlayerEnvironmentZones(
  state: GameServerState,
  zones: EnvironmentZone[],
  id: number,
) {
  zones.length = 0;

  const body = getById(state.bodies, id);
  if (!body || !(body.flags & RigidBodyFlags.COLLIDES)) {
    return;
  }

  const group = body.group;
  const groupBin = group >> 5;
  const groupBit = 1 << (group & 31);

  const zoneSelectors = state.zoneSelectors;
  const environmentZones = state.environmentZones;
  for (let i = 0; i < environmentZones.length; ++i) {
    const ez = environmentZones[i];
    const selector = getById(zoneSelectors, ez.selectorGroup);
    if (
      !selector ||
      selector.groupBits.length <= groupBin ||
      !(selector.groupBits[groupBin] & groupBit)
    ) {
      continue;
    }
    zones.push(EnvironmentZoneSchema.clone(ez));
  }
}

export function clearServerZones(state: GameServerState) {
  state.zoneSelectors = ZoneSelectorGroupSetSchema.assign(
    state.zoneSelectors,
    [],
  );
  state.environmentZones = ServerEnvironmentZoneSetSchema.assign(
    state.environmentZones,
    [],
  );
  state.physicsZones = PhysicsZoneSetSchema.assign(state.physicsZones, []);
  state.physicsZonesChanged = true;
}
