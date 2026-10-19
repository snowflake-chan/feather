import {
  ContactIndex,
  ContactRecord,
  BodyContactSchema,
  VoxelContactSchema,
  compareBodyContact,
  compareVoxelContact,
} from './physics-schema';
import {
  PhysicsEvent,
  BodyContactEventSchema,
  FluidContactEventSchema,
  VoxelContactEventSchema,
} from '../events/physics-event-schema';
import { MuSchema } from '@box/mudb/schema';

function computeContactEvents<
  T,
  Schema extends MuSchema<T>,
  Event extends { id: number; tick: number } & T,
  EventSchema extends MuSchema<Event>,
>(
  eventSchema: EventSchema,
  schema: Schema,
  tick: number,
  id: number,
  compare: (a: T, b: T) => number,
  contactEvents: Event[],
  separateEvents: Event[],
  prev: T[],
  next: T[],
) {
  let pptr = 0;
  let nptr = 0;
  while (pptr < prev.length && nptr < next.length) {
    const a = prev[pptr];
    const b = next[nptr];
    const d = compare(a, b);
    if (d < 0) {
      const event = eventSchema.alloc();
      schema.assign(event, a);
      event.id = id;
      event.tick = tick;
      separateEvents.push(event);
      ++pptr;
    } else if (0 < d) {
      const event = eventSchema.alloc();
      schema.assign(event, b);
      event.id = id;
      event.tick = tick;
      contactEvents.push(event);
      ++nptr;
    } else {
      ++pptr;
      ++nptr;
    }
  }
  while (pptr < prev.length) {
    const event = eventSchema.alloc();
    schema.assign(event, prev[pptr++]);
    event.id = id;
    event.tick = tick;
    separateEvents.push(event);
  }
  while (nptr < next.length) {
    const event = eventSchema.alloc();
    schema.assign(event, next[nptr++]);
    event.id = id;
    event.tick = tick;
    contactEvents.push(event);
  }
}

function emitFluidEvent(
  events: typeof FluidContactEventSchema.identity[],
  tick: number,
  id: number,
  voxel: number,
  volume: number,
) {
  const ev = FluidContactEventSchema.alloc();
  ev.id = id;
  ev.tick = tick;
  ev.b = voxel;
  ev.volumeFraction = volume;
  events.push(ev);
}

function computeFluidEvents(
  tick: number,
  id: number,
  contact: typeof FluidContactEventSchema.identity[],
  separate: typeof FluidContactEventSchema.identity[],
  prevBlocks: number[],
  nextBlocks: number[],
  volume: number[],
) {
  let prevPtr = 0;
  let nextPtr = 0;
  while (prevPtr < prevBlocks.length && nextPtr < nextBlocks.length) {
    const p = prevBlocks[prevPtr];
    const n = nextBlocks[nextPtr];
    if (p < n) {
      // emit leave fluid event
      emitFluidEvent(separate, tick, id, p, 0);
      prevPtr++;
    } else if (n < p) {
      // emit enter fluid event
      emitFluidEvent(contact, tick, id, n, volume[nextPtr]);
      nextPtr++;
    } else {
      prevPtr++;
      nextPtr++;
    }
  }
  for (let i = prevPtr; i < prevBlocks.length; ++i) {
    emitFluidEvent(separate, tick, id, prevBlocks[i], 0);
  }
  for (let i = nextPtr; i < nextBlocks.length; ++i) {
    emitFluidEvent(contact, tick, id, nextBlocks[i], volume[i]);
  }
}

function computePhysicsEvents(
  tick: number,
  events: PhysicsEvent,
  prev: ContactRecord,
  next: ContactRecord,
) {
  const id = next.id;
  computeContactEvents(
    BodyContactEventSchema,
    BodyContactSchema,
    tick,
    id,
    compareBodyContact,
    events.bodyContact,
    events.bodySeparate,
    prev.body,
    next.body,
  );
  computeContactEvents(
    VoxelContactEventSchema,
    VoxelContactSchema,
    tick,
    id,
    compareVoxelContact,
    events.voxelContact,
    events.voxelSeparate,
    prev.voxel,
    next.voxel,
  );
  computeFluidEvents(
    tick,
    id,
    events.fluidContact,
    events.fluidSeparate,
    prev.fluidVoxels,
    next.fluidVoxels,
    next.fluidVolumeFraction,
  );
}

function addContact(tick: number, events: PhysicsEvent, record: ContactRecord) {
  const { body, voxel, fluidVoxels, fluidVolumeFraction } = record;
  for (let i = 0; i < body.length; ++i) {
    const b = body[i];
    if (record.id < b.otherId) {
      const bodyEvent = BodyContactEventSchema.alloc();
      bodyEvent.id = record.id;
      bodyEvent.tick = tick;
      BodyContactSchema.assign(bodyEvent, b);
      events.bodyContact.push(bodyEvent);
    }
  }
  for (let i = 0; i < fluidVoxels.length; ++i) {
    const fluidEvent = FluidContactEventSchema.alloc();
    fluidEvent.id = record.id;
    fluidEvent.tick = tick;
    fluidEvent.b = fluidVoxels[i];
    fluidEvent.volumeFraction = fluidVolumeFraction[i];
    events.fluidContact.push(fluidEvent);
  }
  for (let i = 0; i < voxel.length; ++i) {
    const voxelEvent = VoxelContactEventSchema.alloc();
    voxelEvent.id = record.id;
    voxelEvent.tick = tick;
    VoxelContactSchema.assign(voxelEvent, voxel[i]);
    events.voxelContact.push(voxelEvent);
  }
}

export function generateContactEvents(
  tick: number,
  events: PhysicsEvent,
  prevContacts: ContactIndex,
  nextContacts: ContactIndex,
) {
  let pptr = 0;
  let nptr = 0;
  while (pptr < prevContacts.length && nptr < nextContacts.length) {
    const prev = prevContacts[pptr];
    const next = nextContacts[nptr];

    if (prev.id < next.id) {
      pptr++;
    } else if (next.id < prev.id) {
      addContact(tick, events, next);
      nptr++;
    } else {
      computePhysicsEvents(tick, events, prev, next);
      pptr++;
      nptr++;
    }
  }
  while (nptr < nextContacts.length) {
    addContact(tick, events, nextContacts[nptr++]);
  }
}
