"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContactEvents = generateContactEvents;
const physics_schema_1 = require("./physics-schema");
const physics_event_schema_1 = require("../events/physics-event-schema");
function computeContactEvents(eventSchema, schema, tick, id, compare, contactEvents, separateEvents, prev, next) {
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
        }
        else if (0 < d) {
            const event = eventSchema.alloc();
            schema.assign(event, b);
            event.id = id;
            event.tick = tick;
            contactEvents.push(event);
            ++nptr;
        }
        else {
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
function emitFluidEvent(events, tick, id, voxel, volume) {
    const ev = physics_event_schema_1.FluidContactEventSchema.alloc();
    ev.id = id;
    ev.tick = tick;
    ev.b = voxel;
    ev.volumeFraction = volume;
    events.push(ev);
}
function computeFluidEvents(tick, id, contact, separate, prevBlocks, nextBlocks, volume) {
    let prevPtr = 0;
    let nextPtr = 0;
    while (prevPtr < prevBlocks.length && nextPtr < nextBlocks.length) {
        const p = prevBlocks[prevPtr];
        const n = nextBlocks[nextPtr];
        if (p < n) {
            // emit leave fluid event
            emitFluidEvent(separate, tick, id, p, 0);
            prevPtr++;
        }
        else if (n < p) {
            // emit enter fluid event
            emitFluidEvent(contact, tick, id, n, volume[nextPtr]);
            nextPtr++;
        }
        else {
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
function computePhysicsEvents(tick, events, prev, next) {
    const id = next.id;
    computeContactEvents(physics_event_schema_1.BodyContactEventSchema, physics_schema_1.BodyContactSchema, tick, id, physics_schema_1.compareBodyContact, events.bodyContact, events.bodySeparate, prev.body, next.body);
    computeContactEvents(physics_event_schema_1.VoxelContactEventSchema, physics_schema_1.VoxelContactSchema, tick, id, physics_schema_1.compareVoxelContact, events.voxelContact, events.voxelSeparate, prev.voxel, next.voxel);
    computeFluidEvents(tick, id, events.fluidContact, events.fluidSeparate, prev.fluidVoxels, next.fluidVoxels, next.fluidVolumeFraction);
}
function addContact(tick, events, record) {
    const { body, voxel, fluidVoxels, fluidVolumeFraction } = record;
    for (let i = 0; i < body.length; ++i) {
        const b = body[i];
        if (record.id < b.otherId) {
            const bodyEvent = physics_event_schema_1.BodyContactEventSchema.alloc();
            bodyEvent.id = record.id;
            bodyEvent.tick = tick;
            physics_schema_1.BodyContactSchema.assign(bodyEvent, b);
            events.bodyContact.push(bodyEvent);
        }
    }
    for (let i = 0; i < fluidVoxels.length; ++i) {
        const fluidEvent = physics_event_schema_1.FluidContactEventSchema.alloc();
        fluidEvent.id = record.id;
        fluidEvent.tick = tick;
        fluidEvent.b = fluidVoxels[i];
        fluidEvent.volumeFraction = fluidVolumeFraction[i];
        events.fluidContact.push(fluidEvent);
    }
    for (let i = 0; i < voxel.length; ++i) {
        const voxelEvent = physics_event_schema_1.VoxelContactEventSchema.alloc();
        voxelEvent.id = record.id;
        voxelEvent.tick = tick;
        physics_schema_1.VoxelContactSchema.assign(voxelEvent, voxel[i]);
        events.voxelContact.push(voxelEvent);
    }
}
function generateContactEvents(tick, events, prevContacts, nextContacts) {
    let pptr = 0;
    let nptr = 0;
    while (pptr < prevContacts.length && nptr < nextContacts.length) {
        const prev = prevContacts[pptr];
        const next = nextContacts[nptr];
        if (prev.id < next.id) {
            pptr++;
        }
        else if (next.id < prev.id) {
            addContact(tick, events, next);
            nptr++;
        }
        else {
            computePhysicsEvents(tick, events, prev, next);
            pptr++;
            nptr++;
        }
    }
    while (nptr < nextContacts.length) {
        addContact(tick, events, nextContacts[nptr++]);
    }
}
//# sourceMappingURL=contact-events.js.map