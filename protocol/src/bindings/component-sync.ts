import { ScriptSynchronizer, ScriptSyncPatch } from './synchronizer';
import { MuSchema } from '@box/mudb/schema';
import { TaggedId, compareId } from '@box/utils/id';

function createComponent<Synchronizer extends ScriptSynchronizer<any, any>>(
  synchronizer: Synchronizer,
  patch: ScriptSyncPatch,
) {
  const result = synchronizer.engineSchema.clone(
    synchronizer.engineSchema.identity,
  );
  synchronizer.synchronize(result, patch);
  result.id = patch.id;
  return result;
}

export function synchronizeComponent<
  Component extends TaggedId,
  Schema extends MuSchema<Component>,
>(
  synchronizer: ScriptSynchronizer<any, Schema>,
  component: Component[],
  patch: ScriptSyncPatch[],
  deleted: { [id: number]: boolean },
) {
  let cptr = 0;
  let pptr = 0;
  const numComponent = component.length;
  while (cptr < numComponent && pptr < patch.length) {
    const c = component[cptr];
    const p = patch[pptr];
    if (c.id < p.id) {
      cptr++;
    } else if (p.id < c.id) {
      if (!deleted[p.id]) {
        component.push(createComponent(synchronizer, p));
      }
      pptr++;
    } else {
      synchronizer.synchronize(c, p);
      cptr++;
      pptr++;
    }
  }
  while (pptr < patch.length) {
    const x = patch[pptr++];
    if (!deleted[x.id]) {
      component.push(createComponent(synchronizer, x));
    }
  }
  if (component.length !== numComponent) {
    component.sort(compareId);
  }
}
