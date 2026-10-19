import { sortedArrayDelete } from '@box/utils/sorted-array-remove';
import { GameServerState } from '../../game-server-schema';
import { PhysicsZoneSchema } from '@box/schema/zone/zone-schema';
import { ServerEnvironmentZoneSchema } from '../../zone/zone-server-state';
import { synchronizeComponent } from './entity-update';
import { EnvironmentZoneBinding, PhysicsZoneBinding } from './zone-bindings';
import { ScriptZoneUpdate } from './zone-synchronizer';

export function applyScriptZoneUpdates(
  updates: ScriptZoneUpdate,
  state: GameServerState,
) {
  // update physics zones
  sortedArrayDelete(
    PhysicsZoneSchema,
    state.physicsZones,
    updates.deletedPhysicsZones,
  );
  synchronizeComponent(
    PhysicsZoneBinding,
    state.physicsZones,
    updates.physicsZones,
    {},
  );
  if (
    updates.physicsZones.length > 0 ||
    updates.deletedPhysicsZones.length > 0
  ) {
    state.physicsZonesChanged = true;
  }

  // synchronize environment zones
  sortedArrayDelete(
    ServerEnvironmentZoneSchema,
    state.environmentZones,
    updates.deletedEnvironmentZones,
  );
  synchronizeComponent(
    EnvironmentZoneBinding,
    state.environmentZones,
    updates.environmentZones,
    {},
  );

  // swap selectors (unsafe mutation)
  if (updates.selectorsChanged) {
    const tmp = state.zoneSelectors;
    state.zoneSelectors = updates.zoneSelectors;
    updates.zoneSelectors = tmp;

    // notify physics zone changes
    state.physicsZonesChanged = true;
  }
}
