"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAText = exports.MuRDATextStore = exports.TextSelection = exports.TextIterator = exports.MuRDATextStoreSchema = exports.MuRDATextStoreEntrySchema = exports.MuRDATextActionSchema = exports.MuRDATextStateSchema = void 0;
exports.findMatchingIdsInSortedArrays = findMatchingIdsInSortedArrays;
const schema_1 = require("@box/mudb/schema");
const _id_1 = require("@box/mudb/rda/_id");
const murda_id_1 = require("./murda-id");
exports.MuRDATextStateSchema = new schema_1.MuUTF8();
/**
 * Finds matching IDs between two sorted Id arrays using a two-pointer approach.
 *
 * @param listA The first sorted array of Ids.
 * @param listB The second sorted array of Ids.
 * @returns An array of MatchedIdInfo objects for each common Id.
 */
function findMatchingIdsInSortedArrays(listA, listB) {
    const matches = [];
    let ptrA = 0;
    let ptrB = 0;
    while (ptrA < listA.length && ptrB < listB.length) {
        const idA = listA[ptrA];
        const idB = listB[ptrB];
        const comparison = (0, _id_1.compareId)(idA, idB);
        if (comparison < 0) {
            // idA < idB
            ptrA++;
        }
        else if (comparison > 0) {
            // idA > idB
            ptrB++;
        }
        else {
            // IDs match: idA === idB
            matches.push({
                id: idA, // or idB, they are the same
                indexInListA: ptrA,
                indexInListB: ptrB,
            });
            ptrA++;
            ptrB++;
        }
    }
    return matches;
}
const IdsSchema = new schema_1.MuSortedArray(_id_1.IdSchema, Infinity, _id_1.compareId);
const InsertCharacterActionSchema = new schema_1.MuStruct({
    id: _id_1.IdSchema,
    character: new schema_1.MuUTF8(),
});
const InserStringWithIdsActionSchema = new schema_1.MuStruct({
    ids: IdsSchema,
    string: new schema_1.MuUTF8(),
});
const InsertStringActionSchema = new schema_1.MuStruct({
    beginId: _id_1.IdSchema,
    step: new schema_1.MuVarint(),
    string: new schema_1.MuUTF8(),
});
const RemoveActionSchema = IdsSchema;
exports.MuRDATextActionSchema = new schema_1.MuUnion({
    insertCharacter: InsertCharacterActionSchema,
    insertString: InsertStringActionSchema,
    insertCharacterOnTombstone: InsertCharacterActionSchema,
    insertStringOnTombstone: InsertStringActionSchema,
    insertStringOnTombstoneWithIds: InserStringWithIdsActionSchema,
    remove: RemoveActionSchema,
    removeWithoutTombstone: RemoveActionSchema,
    noop: new schema_1.MuVoid(),
});
exports.MuRDATextStoreEntrySchema = new schema_1.MuStruct({
    id: _id_1.IdSchema,
    character: exports.MuRDATextStateSchema,
});
exports.MuRDATextStoreSchema = new schema_1.MuSortedArray(exports.MuRDATextStoreEntrySchema, Infinity, _id_1.compareTaggedId);
class TextIterator {
    constructor(store, index = 0) {
        this.store = store;
        this.moveTo(index);
    }
    moveTo(index) {
        if (this.store.ids.length === 0) {
            this.id = _id_1.ID_MAX;
            return;
        }
        const idIdx = Math.max(0, this.store.getIdsIndex(index));
        if (idIdx >= this.store.ids.length) {
            this.id = _id_1.ID_MAX;
        }
        else {
            this.id = this.store.ids[idIdx];
        }
    }
    getIndex(targetId) {
        const id = (0, _id_1.searchId)(this.store.ids, targetId !== undefined ? targetId : this.id);
        const idx = this.store.getStateIndex(id);
        return idx;
    }
    moveNext() {
        this.moveTo(this.getIndex() + 1);
    }
    movePrev() {
        this.moveTo(Math.max(0, this.getIndex() - 1));
    }
    setStore(store) {
        this.store = store;
    }
}
exports.TextIterator = TextIterator;
class TextSelection {
    constructor(store, begin, end) {
        this.store = store;
        this.begin = new TextIterator(store, begin);
        this.end = new TextIterator(store, end);
    }
    getRange() {
        return {
            begin: this.begin.getIndex(),
            end: this.end.getIndex(),
        };
    }
    getText() {
        const beginIdx = (0, _id_1.searchId)(this.store.ids, this.begin.id);
        const endIdx = (0, _id_1.searchId)(this.store.ids, this.end.id);
        return this.store.characters.slice(beginIdx, endIdx).join('');
    }
    setRange(begin, end) {
        this.begin.moveTo(begin);
        this.end.moveTo(end);
    }
}
exports.TextSelection = TextSelection;
class MuRDATextStore {
    constructor(ids, characters) {
        this.fenwickTree = [];
        this.ids = ids;
        this.characters = characters;
        this.rebuildFenwickTree();
    }
    state() {
        return this.characters.join('');
    }
    rebuildFenwickTree() {
        const tree = this.fenwickTree;
        const chars = this.characters;
        const len = (tree.length = chars.length + 2);
        for (let i = 0; i < tree.length; i++) {
            tree[i] = 0;
        }
        for (let i = 1; i < len; i++) {
            if (i <= chars.length && chars[i - 1].length === 0) {
                tree[i]++;
            }
            const idx = i + (i & -i);
            if (idx < len) {
                tree[idx] += tree[i];
            }
        }
    }
    updateFenwickTree(index, value) {
        const tree = this.fenwickTree;
        for (let i = index + 1; i < tree.length; i += i & -i) {
            tree[i] += value;
        }
    }
    getStateIndex(index) {
        if (index <= 0) {
            return 0;
        }
        const tree = this.fenwickTree;
        let sum = 0;
        for (let i = index + 1; i > 0; i -= i & -i) {
            sum += tree[i];
        }
        const chars = this.characters;
        return index + (index < chars.length ? 1 - chars[index].length : 0) - sum;
    }
    getIdsIndex(index) {
        if (index < 0) {
            return -1;
        }
        let l = 0;
        let r = this.ids.length;
        while (l < r) {
            const m = (l + r) >> 1;
            const v = this.getStateIndex(m);
            if (v <= index) {
                l = m + 1;
            }
            else {
                r = m;
            }
        }
        return this.getStateIndex(l - 1) === index ? l - 1 : l;
    }
    _insert(id, str, onTombStone) {
        if (str.length !== 1) {
            return false;
        }
        const index = (0, _id_1.searchId)(this.ids, id);
        if (index < 0 || index >= this.ids.length || this.ids[index] !== id) {
            this.ids.splice(index, 0, id);
            this.characters.splice(index, 0, str);
            return true;
        }
        else if (onTombStone || this.characters[index].length > 0) {
            if (this.characters[index].length === 0) {
                this.updateFenwickTree(index, -1);
            }
            this.characters[index] = str;
        }
        return false;
    }
    /**
     *
     * @param itemsToInsert
     * @param onTombStone
     * @returns true if a full rebuild of Fenwick tree is needed
     */
    _insertMultiple(itemsToInsert, onTombStone) {
        // Returns true if a full rebuild of Fenwick tree is needed
        if (!itemsToInsert || itemsToInsert.length === 0) {
            return false;
        }
        const newIds = [];
        const newCharacters = [];
        let insertPtr = 0;
        let storePtr = 0;
        // To determine if a rebuild is needed, we can compare the final state.
        // A simpler approach for now: if any item is added or an existing item is meaningfully changed.
        let effectiveChangeMade = false;
        while (insertPtr < itemsToInsert.length || storePtr < this.ids.length) {
            const itemToInsert = insertPtr < itemsToInsert.length ? itemsToInsert[insertPtr] : null;
            const currentStoreId = storePtr < this.ids.length ? this.ids[storePtr] : null;
            const currentStoreChar = storePtr < this.ids.length ? this.characters[storePtr] : null; // Can be null if storePtr is out of bounds initially
            if (itemToInsert && itemToInsert.char.length !== 1) {
                // Skip invalid items from the input list
                insertPtr++;
                continue;
            }
            if (itemToInsert &&
                (!currentStoreId || (0, _id_1.compareId)(itemToInsert.id, currentStoreId) < 0)) {
                // Case 1: Insert item from itemsToInsert (it's smaller or current store is exhausted)
                newIds.push(itemToInsert.id);
                newCharacters.push(itemToInsert.char);
                effectiveChangeMade = true;
                insertPtr++;
            }
            else if (currentStoreId &&
                (!itemToInsert || (0, _id_1.compareId)(itemToInsert.id, currentStoreId) > 0)) {
                // Case 2: Keep item from current store (it's smaller or itemsToInsert is exhausted)
                newIds.push(currentStoreId);
                newCharacters.push(currentStoreChar); // currentStoreChar must be non-null here
                storePtr++;
            }
            else if (itemToInsert &&
                currentStoreId &&
                (0, _id_1.compareId)(itemToInsert.id, currentStoreId) === 0) {
                // Case 3: IDs match - potential update
                const existingCharIsTombstone = currentStoreChar.length === 0;
                // Determine if we are allowed to overwrite
                let allowOverwrite = false;
                if (onTombStone) {
                    // If onTombStone is true, we can always overwrite (tombstone or actual char)
                    allowOverwrite = true;
                }
                else {
                    // onTombStone is false (strict insert)
                    if (!existingCharIsTombstone) {
                        // Can only overwrite if existing is NOT a tombstone
                        allowOverwrite = true;
                    }
                }
                if (allowOverwrite) {
                    newIds.push(itemToInsert.id); // or currentStoreId
                    newCharacters.push(itemToInsert.char);
                    if (itemToInsert.char !== currentStoreChar) {
                        effectiveChangeMade = true;
                    }
                }
                else {
                    // Not allowed to overwrite (e.g., trying to overwrite a tombstone with onTombStone=false)
                    // Keep the original store item
                    newIds.push(currentStoreId);
                    newCharacters.push(currentStoreChar);
                }
                insertPtr++;
                storePtr++;
            }
            else {
                // Both itemToInsert and currentStoreId are null, meaning both lists are exhausted.
                break;
            }
        }
        // If any effective change occurred that might alter the structure or Fenwick-relevant content
        if (effectiveChangeMade) {
            // More precise check: did the arrays actually change?
            if (newIds.length !== this.ids.length ||
                newCharacters.length !== this.characters.length || // Length check first
                !newIds.every((id, i) => (0, _id_1.compareId)(id, this.ids[i]) === 0) || // Then content if lengths are same
                !newCharacters.every((char, i) => char === this.characters[i])) {
                this.ids = newIds;
                this.characters = newCharacters;
                return true; // Signal that a rebuild is needed
            }
        }
        return false; // No change or no effective change that warrants a rebuild
    }
    _remove(idsToRemove, withoutTombstone) {
        let rebuildRequired = false; // Renamed flag for clarity
        if (withoutTombstone) {
            const newIds = [];
            const newCharacters = [];
            let storePtr = 0;
            let removePtr = 0;
            let itemsActuallyRemoved = 0;
            while (storePtr < this.ids.length) {
                const currentStoreId = this.ids[storePtr];
                const currentStoreChar = this.characters[storePtr];
                let shouldRemoveThisStoreItem = false;
                if (removePtr < idsToRemove.length) {
                    const currentRemoveId = idsToRemove[removePtr];
                    const comparison = (0, _id_1.compareId)(currentStoreId, currentRemoveId);
                    if (comparison < 0) {
                        // currentStoreId < currentRemoveId
                        // This store item is not in the remove list (yet), keep it
                    }
                    else if (comparison > 0) {
                        // currentStoreId > currentRemoveId
                        // The ID to remove was smaller, it's not in the store or we passed it.
                        // Advance removePtr to find the next ID to potentially remove.
                        // This case implies idsToRemove might contain IDs not in this.ids,
                        // or idsToRemove is not perfectly aligned with this.ids.
                        // We need to advance removePtr until currentRemoveId >= currentStoreId or removePtr is out of bounds.
                        while (removePtr < idsToRemove.length &&
                            (0, _id_1.compareId)(currentStoreId, idsToRemove[removePtr]) > 0) {
                            removePtr++;
                        }
                        // Re-check if removePtr is still valid and if there's a match now
                        if (removePtr < idsToRemove.length &&
                            (0, _id_1.compareId)(currentStoreId, idsToRemove[removePtr]) === 0) {
                            if (currentStoreChar.length > 0) {
                                // Only act on non-tombstones
                                shouldRemoveThisStoreItem = true;
                                itemsActuallyRemoved++;
                            }
                            removePtr++; // Consume the matched ID from idsToRemove
                        }
                    }
                    else {
                        // IDs match: currentStoreId === currentRemoveId
                        if (currentStoreChar.length > 0) {
                            // Only act on non-tombstones
                            shouldRemoveThisStoreItem = true;
                            itemsActuallyRemoved++;
                        }
                        removePtr++; // Consume the matched ID from idsToRemove
                    }
                }
                if (!shouldRemoveThisStoreItem) {
                    newIds.push(currentStoreId);
                    newCharacters.push(currentStoreChar);
                }
                storePtr++;
            }
            if (itemsActuallyRemoved > 0) {
                this.ids = newIds;
                this.characters = newCharacters;
                rebuildRequired = true;
            }
        }
        else {
            // withoutTombstone is false (mark as tombstone)
            let storePtr = 0;
            let removePtr = 0;
            while (removePtr < idsToRemove.length && storePtr < this.ids.length) {
                const currentRemoveId = idsToRemove[removePtr];
                const currentStoreId = this.ids[storePtr];
                const comparison = (0, _id_1.compareId)(currentStoreId, currentRemoveId);
                if (comparison < 0) {
                    // currentStoreId < currentRemoveId
                    storePtr++;
                }
                else if (comparison > 0) {
                    // currentStoreId > currentRemoveId
                    removePtr++;
                }
                else {
                    // IDs match
                    if (this.characters[storePtr].length > 0) {
                        this.characters[storePtr] = '';
                        this.updateFenwickTree(storePtr, 1);
                        // No rebuildRequired = true here, as updateFenwickTree handles it incrementally
                    }
                    storePtr++;
                    removePtr++;
                }
            }
        }
        if (rebuildRequired) {
            this.rebuildFenwickTree();
        }
        return true; // Original method always returns true
    }
    apply(rda, action) {
        if (this.startsWith(action.type, 'insertCharacter')) {
            const data = action.data;
            if (this._insert(data.id, data.character, action.type !== 'insertCharacter')) {
                this.rebuildFenwickTree();
            }
            return true;
        }
        else if (this.startsWith(action.type, 'insertString')) {
            const data = action.data; // Base type for string and beginId
            const actionIds = action.type === 'insertStringOnTombstoneWithIds'
                ? action.data.ids
                : (0, murda_id_1.allocIdsEx)(data, data.string.length);
            const itemsToInsert = [];
            const len = Math.min(actionIds.length, data.string.length);
            for (let i = 0; i < len; i++) {
                // Ensure only single, valid characters are processed
                if (typeof data.string[i] === 'string' && data.string[i].length === 1) {
                    itemsToInsert.push({ id: actionIds[i], char: data.string[i] });
                }
            }
            // Assuming actionIds from allocIdsEx and InserStringWithIdsActionSchema.ids are already sorted correctly.
            // If not, itemsToInsert would need sorting here:
            // itemsToInsert.sort((a, b) => compareId(a.id, b.id));
            const allowInsertOnTombstone = action.type !== 'insertString';
            if (this._insertMultiple(itemsToInsert, allowInsertOnTombstone)) {
                this.rebuildFenwickTree();
            }
            return true;
        }
        else if (this.startsWith(action.type, 'remove')) {
            this._remove(action.data, action.type !== 'remove');
            return true;
        }
        else if (action.type === 'noop') {
            return true;
        }
        return false;
    }
    inverse(rda, action) {
        if (this.startsWith(action.type, 'insertCharacter')) {
            const remove = exports.MuRDATextActionSchema.alloc();
            remove.type =
                action.type === 'insertCharacter' ? 'removeWithoutTombstone' : 'remove';
            const result = (remove.data = RemoveActionSchema.alloc());
            result.push(action.data.id);
            return remove;
        }
        else if (this.startsWith(action.type, 'insertString')) {
            const remove = exports.MuRDATextActionSchema.alloc();
            remove.type =
                action.type === 'insertString' ? 'removeWithoutTombstone' : 'remove';
            const data = action.data;
            const ids = (0, murda_id_1.allocIdsEx)(data, data.string.length);
            const result = (remove.data = RemoveActionSchema.alloc());
            for (let i = 0; i < ids.length; i++) {
                result.push(ids[i]);
            }
            return remove;
        }
        else if (action.type === 'remove') {
            const ids = action.data;
            const matchedInfos = findMatchingIdsInSortedArrays(ids, this.ids);
            const characters = [];
            const indices = [];
            for (let i = 0; i < matchedInfos.length; i++) {
                characters.push(this.characters[matchedInfos[i].indexInListB]);
                indices.push(matchedInfos[i].indexInListB);
            }
            if (characters.length === 1) {
                const insert = exports.MuRDATextActionSchema.alloc();
                insert.type = 'insertCharacterOnTombstone';
                const result = (insert.data = InsertCharacterActionSchema.alloc());
                result.character = characters[0];
                result.id = this.ids[indices[0]];
                return insert;
            }
            else if (characters.length > 1) {
                const insert = exports.MuRDATextActionSchema.alloc();
                insert.type = 'insertStringOnTombstoneWithIds';
                const result = (insert.data = InserStringWithIdsActionSchema.alloc());
                result.string = characters.join('');
                result.ids = ids;
                return insert;
            }
        }
        const noop = exports.MuRDATextActionSchema.alloc();
        noop.type = 'noop';
        noop.data = void 0;
        return noop;
    }
    serialize(rda, out) {
        while (out.length > 0) {
            rda.storeSchema.free(out.pop());
        }
        for (let i = 0; i < this.ids.length; ++i) {
            const entry = exports.MuRDATextStoreEntrySchema.alloc();
            entry.id = this.ids[i];
            entry.character = this.characters[i];
            out.push(entry);
        }
        return out;
    }
    free() {
        this.ids.length = 0;
        this.characters.length = 0;
        this.fenwickTree.length = 0;
    }
    createSelection(begin, end) {
        return new TextSelection(this, begin, end);
    }
    startsWith(str, substr) {
        return str.substring(0, substr.length) === substr;
    }
}
exports.MuRDATextStore = MuRDATextStore;
exports.MuRDAText = {
    stateSchema: exports.MuRDATextStateSchema,
    actionSchema: exports.MuRDATextActionSchema,
    storeSchema: exports.MuRDATextStoreSchema,
    emptyStore: new MuRDATextStore([], []),
    actionMeta: {
        type: 'partial',
        action: {
            type: 'table',
            table: {
                insert: { type: 'unit' },
                remove: { type: 'unit' },
            },
        },
    },
    action: (store) => {
        return {
            insert: (index, str) => {
                const idIdx = store.getIdsIndex(index);
                const pred = idIdx <= 0
                    ? _id_1.ID_MIN
                    : store.ids[Math.min(store.ids.length - 1, idIdx - 1)] || _id_1.ID_MIN;
                const succ = idIdx >= store.ids.length
                    ? _id_1.ID_MAX
                    : store.ids[Math.max(0, idIdx)] || _id_1.ID_MAX;
                const action = exports.MuRDATextActionSchema.alloc();
                if (str.length === 1) {
                    action.type = 'insertCharacter';
                    const data = (action.data = InsertCharacterActionSchema.alloc());
                    data.id = (0, murda_id_1.allocId)(pred, succ);
                    data.character = str;
                }
                else {
                    action.type = 'insertString';
                    const data = (action.data = InsertStringActionSchema.alloc());
                    data.string = str;
                    (0, murda_id_1.preAllocIds)(pred, succ, str.length, data);
                }
                return action;
            },
            remove: (index, count = 1) => {
                const idIdx = store.getIdsIndex(index);
                if (idIdx < 0 || idIdx >= store.ids.length) {
                    const noop = exports.MuRDATextActionSchema.alloc();
                    noop.type = 'noop';
                    noop.data = void 0;
                    return noop;
                }
                const action = exports.MuRDATextActionSchema.alloc();
                action.type = 'remove';
                const ids = (action.data = RemoveActionSchema.alloc());
                const begin = idIdx;
                for (let i = begin, j = 0; j < count && i < store.ids.length; i++) {
                    if (store.characters[i].length > 0) {
                        ids.push(store.ids[i]);
                        j++;
                    }
                }
                return action;
            },
        };
    },
    createStore: (state) => {
        const ids = (0, murda_id_1.allocIds)(_id_1.ID_MIN, _id_1.ID_MAX, state.length);
        const characters = state.split('');
        return new MuRDATextStore(ids, characters);
    },
    parse: (store) => {
        const ids = Array(store.length);
        const characters = Array(store.length);
        for (let i = 0; i < store.length; i++) {
            ids[i] = store[i].id;
            characters[i] = store[i].character;
        }
        return new MuRDATextStore(ids, characters);
    },
};
//# sourceMappingURL=murda-text.js.map