"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const trace_1 = require("../trace");
const __1 = require("../");
const stream_1 = require("../../stream");
function diffPatch(schema, x, y) {
    const out = new stream_1.MuWriteStream(1);
    schema.diff(x, y, out);
    schema.diff(y, x, out);
    const inp = new stream_1.MuReadStream(out.bytes());
    schema.patch(x, inp);
    schema.patch(y, inp);
}
test('array - alloc & free', (t) => {
    const characterSchema = new trace_1.MuSchemaTrace(new __1.MuStruct({
        hp: new __1.MuUint8(100),
    }));
    const groupSchema = new __1.MuArray(characterSchema, Infinity);
    function createCharacter() {
        const result = characterSchema.alloc();
        result.hp = Math.random() * 100 | 0;
        return result;
    }
    function createGroup() {
        const result = groupSchema.alloc();
        result.length = Math.ceil(Math.random() * 100);
        for (let i = 0; i < result.length; ++i) {
            result[i] = createCharacter();
        }
        return result;
    }
    const logger = characterSchema.createLog('slave');
    logger.begin();
    const slaves = createGroup();
    const gladiators = groupSchema.clone(slaves);
    const numCharacters = slaves.length;
    groupSchema.free(slaves);
    groupSchema.free(gladiators);
    logger.end();
    t.equals(logger.allocCount, numCharacters * 2);
    t.equals(logger.freeCount, logger.allocCount);
    const evilGeniuses = createGroup();
    const superHeroes = createGroup();
    let characterAlloc = characterSchema.allocCount;
    diffPatch(groupSchema, evilGeniuses, superHeroes);
    const allocIncr = characterSchema.allocCount - characterAlloc;
    characterAlloc = characterSchema.allocCount;
    const iterations = Math.ceil(Math.random() * 100);
    for (let i = 0; i < iterations; ++i) {
        diffPatch(groupSchema, evilGeniuses, superHeroes);
    }
    t.equals(characterSchema.allocCount - characterAlloc, iterations * allocIncr);
    t.end();
});
test('dictionary - alloc & free', (t) => {
    const contactSchema = new trace_1.MuSchemaTrace(new __1.MuStruct({
        email: new __1.MuUTF8(),
    }));
    const contactsSchema = new __1.MuDictionary(contactSchema, Infinity);
    function randomName() {
        const result = new Array(10);
        for (let i = 0; i < 10; ++i) {
            result[i] = String.fromCharCode((Math.random() * 26 | 0) + 97);
        }
        return result.join('');
    }
    function randomContacts() {
        const result = contactsSchema.alloc();
        for (let i = 0; i < (Math.random() * 100 | 0); ++i) {
            const name = randomName();
            result[name] = contactSchema.alloc();
            result[name].email = `${name}@stardust.wizard`;
        }
        return result;
    }
    const logger = contactSchema.createLog('phone book');
    logger.begin();
    const alumni = randomContacts();
    const alumniCopy = contactsSchema.clone(alumni);
    const numContacts = Object.keys(alumni).length;
    contactsSchema.free(alumni);
    contactsSchema.free(alumniCopy);
    logger.end();
    t.equals(logger.allocCount, numContacts * 2);
    t.equals(logger.freeCount, logger.allocCount);
    const colleagues = randomContacts();
    const coworkers = randomContacts();
    let contactAlloc = contactSchema.allocCount;
    diffPatch(contactsSchema, colleagues, coworkers);
    const allocIncr = contactSchema.allocCount - contactAlloc;
    contactAlloc = contactSchema.allocCount;
    const iterations = Math.ceil(Math.random() * 100);
    for (let i = 0; i < iterations; ++i) {
        diffPatch(contactsSchema, colleagues, coworkers);
    }
    t.equals(contactSchema.allocCount - contactAlloc, iterations * allocIncr);
    t.end();
});
test('sorted array - alloc & free', (t) => {
    const characterSchema = new trace_1.MuSchemaTrace(new __1.MuStruct({
        hp: new __1.MuUint8(100),
    }));
    function compare(a, b) {
        if (a.hp < b.hp) {
            return -1;
        }
        else if (a.hp > b.hp) {
            return 1;
        }
        else {
            return 0;
        }
    }
    const groupSchema = new __1.MuSortedArray(characterSchema, Infinity, compare);
    function createCharacter() {
        const result = characterSchema.alloc();
        result.hp = Math.random() * 100 | 0;
        return result;
    }
    function createGroup() {
        const result = groupSchema.alloc();
        result.length = Math.ceil(Math.random() * 100);
        for (let i = 0; i < result.length; ++i) {
            result[i] = createCharacter();
        }
        return result.sort(compare);
    }
    const logger = characterSchema.createLog('slave');
    logger.begin();
    const slaves = createGroup();
    const gladiators = groupSchema.clone(slaves);
    const numCharacters = slaves.length;
    groupSchema.free(slaves);
    groupSchema.free(gladiators);
    logger.end();
    t.equals(logger.allocCount, numCharacters * 2);
    t.equals(logger.freeCount, logger.allocCount);
    const horde = createGroup();
    const alliance = createGroup();
    let characterAlloc = characterSchema.allocCount;
    diffPatch(groupSchema, horde, alliance);
    const allocIncr = characterSchema.allocCount - characterAlloc;
    characterAlloc = characterSchema.allocCount;
    const iterations = Math.ceil(Math.random() * 100);
    for (let i = 0; i < iterations; ++i) {
        diffPatch(groupSchema, horde, alliance);
    }
    t.equals(characterSchema.allocCount - characterAlloc, iterations * allocIncr);
    t.end();
});
test('struct - alloc & free', (t) => {
    const coordSchema = new trace_1.MuSchemaTrace(new __1.MuStruct({
        x: new __1.MuFloat32(),
        y: new __1.MuFloat32(),
    }));
    const characterSchema = new trace_1.MuSchemaTrace(new __1.MuStruct({
        hp: new __1.MuUint8(100),
        coordinates: coordSchema,
    }));
    const coordLogger = coordSchema.createLog('coordinates');
    coordLogger.begin();
    let iterations = Math.ceil(Math.random() * 100);
    for (let i = 0; i < iterations; ++i) {
        const Megatron = characterSchema.alloc();
        const OptimusPrime = characterSchema.clone(Megatron);
        characterSchema.free(Megatron);
        characterSchema.free(OptimusPrime);
    }
    coordLogger.end();
    t.equals(coordLogger.allocCount, iterations * 2);
    t.equals(coordLogger.freeCount, coordLogger.allocCount);
    const boy = characterSchema.alloc();
    const girl = characterSchema.alloc();
    let coordAlloc = coordSchema.allocCount;
    diffPatch(characterSchema, boy, girl);
    const allocIncr = coordSchema.allocCount - coordAlloc;
    coordAlloc = coordSchema.allocCount;
    iterations = Math.ceil(Math.random() * 100);
    for (let i = 0; i < iterations; ++i) {
        diffPatch(characterSchema, boy, girl);
    }
    t.equals(coordSchema.allocCount - coordAlloc, iterations * allocIncr);
    t.end();
});
//# sourceMappingURL=memory.js.map