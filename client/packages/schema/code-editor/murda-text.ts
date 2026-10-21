import { MuRDA, MuRDAStore } from '@box/mudb/rda';
import {
  MuUTF8,
  MuStruct,
  MuUnion,
  MuVoid,
  MuVarint,
  MuSortedArray,
} from '@box/mudb/schema';
import {
  Id,
  ID_MIN,
  ID_MAX,
  searchId,
  IdSchema,
  compareTaggedId,
  compareId,
} from '@box/mudb/rda/_id';
import { preAllocIds, allocIdsEx, allocIds, allocId, subII } from './murda-id';

export const MuRDATextStateSchema = new MuUTF8();

export interface MatchedIdInfo {
  id: Id;
  indexInListA: number;
  indexInListB: number;
  // You can add more info if needed, e.g., character if listA is associated with characters
}

/**
 * Finds matching IDs between two sorted Id arrays using a two-pointer approach.
 *
 * @param listA The first sorted array of Ids.
 * @param listB The second sorted array of Ids.
 * @returns An array of MatchedIdInfo objects for each common Id.
 */
export function findMatchingIdsInSortedArrays(
  listA: ReadonlyArray<Id>,
  listB: ReadonlyArray<Id>,
): MatchedIdInfo[] {
  const matches: MatchedIdInfo[] = [];
  let ptrA = 0;
  let ptrB = 0;

  while (ptrA < listA.length && ptrB < listB.length) {
    const idA = listA[ptrA];
    const idB = listB[ptrB];

    const comparison = compareId(idA, idB);

    if (comparison < 0) {
      // idA < idB
      ptrA++;
    } else if (comparison > 0) {
      // idA > idB
      ptrB++;
    } else {
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

const IdsSchema = new MuSortedArray(IdSchema, Infinity, compareId);
const InsertCharacterActionSchema = new MuStruct({
  id: IdSchema,
  character: new MuUTF8(),
});
const InserStringWithIdsActionSchema = new MuStruct({
  ids: IdsSchema,
  string: new MuUTF8(),
});
const InsertStringActionSchema = new MuStruct({
  beginId: IdSchema,
  step: new MuVarint(),
  string: new MuUTF8(),
});
const RemoveActionSchema = IdsSchema;
export const MuRDATextActionSchema = new MuUnion({
  insertCharacter: InsertCharacterActionSchema,
  insertString: InsertStringActionSchema,
  insertCharacterOnTombstone: InsertCharacterActionSchema,
  insertStringOnTombstone: InsertStringActionSchema,
  insertStringOnTombstoneWithIds: InserStringWithIdsActionSchema,
  remove: RemoveActionSchema,
  removeWithoutTombstone: RemoveActionSchema,
  noop: new MuVoid(),
});

type MuRDATextAction = typeof MuRDATextActionSchema.identity;

export const MuRDATextStoreEntrySchema = new MuStruct({
  id: IdSchema,
  character: MuRDATextStateSchema,
});

export const MuRDATextStoreSchema = new MuSortedArray(
  MuRDATextStoreEntrySchema,
  Infinity,
  compareTaggedId,
);

type MuRDATextActionMeta = {
  type: 'partial';
  action: {
    type: 'table';
    table: {
      insert: { type: 'unit' };
      remove: { type: 'unit' };
    };
  };
};

type RDAType = MuRDA<
  typeof MuRDATextStateSchema,
  typeof MuRDATextActionSchema,
  typeof MuRDATextStoreSchema,
  MuRDATextActionMeta
>;

export class TextIterator {
  public id!: Id;
  constructor(private store: MuRDATextStore, index: number = 0) {
    this.moveTo(index);
  }

  public moveTo(index: number) {
    if (this.store.ids.length === 0) {
      this.id = ID_MAX;
      return;
    }
    const idIdx = Math.max(0, this.store.getIdsIndex(index));
    if (idIdx >= this.store.ids.length) {
      this.id = ID_MAX;
    } else {
      this.id = this.store.ids[idIdx];
    }
  }

  public getIndex(targetId?: string) {
    const id = searchId(
      this.store.ids,
      targetId !== undefined ? targetId : this.id,
    );
    const idx = this.store.getStateIndex(id);
    return idx;
  }

  public moveNext() {
    this.moveTo(this.getIndex() + 1);
  }

  public movePrev() {
    this.moveTo(Math.max(0, this.getIndex() - 1));
  }

  public setStore(store: MuRDATextStore) {
    this.store = store;
  }
}

export class TextSelection {
  public begin: TextIterator;
  public end: TextIterator;

  constructor(private store: MuRDATextStore, begin: number, end: number) {
    this.begin = new TextIterator(store, begin);
    this.end = new TextIterator(store, end);
  }

  public getRange() {
    return {
      begin: this.begin.getIndex(),
      end: this.end.getIndex(),
    };
  }

  public getText() {
    const beginIdx = searchId(this.store.ids, this.begin.id);
    const endIdx = searchId(this.store.ids, this.end.id);
    return this.store.characters.slice(beginIdx, endIdx).join('');
  }

  public setRange(begin: number, end: number) {
    this.begin.moveTo(begin);
    this.end.moveTo(end);
  }
}

export class MuRDATextStore implements MuRDAStore<RDAType> {
  public ids: Id[];
  public characters: string[];
  private fenwickTree: number[] = [];

  constructor(ids: Id[], characters: string[]) {
    this.ids = ids;
    this.characters = characters;
    this.rebuildFenwickTree();
  }

  public state() {
    return this.characters.join('');
  }

  public rebuildFenwickTree() {
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

  private updateFenwickTree(index: number, value: number) {
    const tree = this.fenwickTree;
    for (let i = index + 1; i < tree.length; i += i & -i) {
      tree[i] += value;
    }
  }

  public getStateIndex(index: number) {
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

  public getIdsIndex(index: number) {
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
      } else {
        r = m;
      }
    }
    return this.getStateIndex(l - 1) === index ? l - 1 : l;
  }

  private _insert(id: Id, str: string, onTombStone: boolean) {
    if (str.length !== 1) {
      return false;
    }

    const index = searchId(this.ids, id);
    if (index < 0 || index >= this.ids.length || this.ids[index] !== id) {
      this.ids.splice(index, 0, id);
      this.characters.splice(index, 0, str);
      return true;
    } else if (onTombStone || this.characters[index].length > 0) {
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
  private _insertMultiple(
    itemsToInsert: ReadonlyArray<{ id: Id; char: string }>,
    onTombStone: boolean,
  ): boolean {
    // Returns true if a full rebuild of Fenwick tree is needed
    if (!itemsToInsert || itemsToInsert.length === 0) {
      return false;
    }

    const newIds: Id[] = [];
    const newCharacters: string[] = [];
    let insertPtr = 0;
    let storePtr = 0;

    // To determine if a rebuild is needed, we can compare the final state.
    // A simpler approach for now: if any item is added or an existing item is meaningfully changed.
    let effectiveChangeMade = false;

    while (insertPtr < itemsToInsert.length || storePtr < this.ids.length) {
      const itemToInsert =
        insertPtr < itemsToInsert.length ? itemsToInsert[insertPtr] : null;
      const currentStoreId =
        storePtr < this.ids.length ? this.ids[storePtr] : null;
      const currentStoreChar =
        storePtr < this.ids.length ? this.characters[storePtr] : null; // Can be null if storePtr is out of bounds initially

      if (itemToInsert && itemToInsert.char.length !== 1) {
        // Skip invalid items from the input list
        insertPtr++;
        continue;
      }

      if (
        itemToInsert &&
        (!currentStoreId || compareId(itemToInsert.id, currentStoreId) < 0)
      ) {
        // Case 1: Insert item from itemsToInsert (it's smaller or current store is exhausted)
        newIds.push(itemToInsert.id);
        newCharacters.push(itemToInsert.char);
        effectiveChangeMade = true;
        insertPtr++;
      } else if (
        currentStoreId &&
        (!itemToInsert || compareId(itemToInsert.id, currentStoreId) > 0)
      ) {
        // Case 2: Keep item from current store (it's smaller or itemsToInsert is exhausted)
        newIds.push(currentStoreId);
        newCharacters.push(currentStoreChar!); // currentStoreChar must be non-null here
        storePtr++;
      } else if (
        itemToInsert &&
        currentStoreId &&
        compareId(itemToInsert.id, currentStoreId) === 0
      ) {
        // Case 3: IDs match - potential update
        const existingCharIsTombstone = currentStoreChar!.length === 0;

        // Determine if we are allowed to overwrite
        let allowOverwrite = false;
        if (onTombStone) {
          // If onTombStone is true, we can always overwrite (tombstone or actual char)
          allowOverwrite = true;
        } else {
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
        } else {
          // Not allowed to overwrite (e.g., trying to overwrite a tombstone with onTombStone=false)
          // Keep the original store item
          newIds.push(currentStoreId);
          newCharacters.push(currentStoreChar!);
        }
        insertPtr++;
        storePtr++;
      } else {
        // Both itemToInsert and currentStoreId are null, meaning both lists are exhausted.
        break;
      }
    }

    // If any effective change occurred that might alter the structure or Fenwick-relevant content
    if (effectiveChangeMade) {
      // More precise check: did the arrays actually change?
      if (
        newIds.length !== this.ids.length ||
        newCharacters.length !== this.characters.length || // Length check first
        !newIds.every((id, i) => compareId(id, this.ids[i]) === 0) || // Then content if lengths are same
        !newCharacters.every((char, i) => char === this.characters[i])
      ) {
        this.ids = newIds;
        this.characters = newCharacters;
        return true; // Signal that a rebuild is needed
      }
    }

    return false; // No change or no effective change that warrants a rebuild
  }

  private _remove(idsToRemove: ReadonlyArray<Id>, withoutTombstone: boolean) {
    let rebuildRequired = false; // Renamed flag for clarity

    if (withoutTombstone) {
      const newIds: Id[] = [];
      const newCharacters: string[] = [];
      let storePtr = 0;
      let removePtr = 0;
      let itemsActuallyRemoved = 0;

      while (storePtr < this.ids.length) {
        const currentStoreId = this.ids[storePtr];
        const currentStoreChar = this.characters[storePtr];

        let shouldRemoveThisStoreItem = false;
        if (removePtr < idsToRemove.length) {
          const currentRemoveId = idsToRemove[removePtr];
          const comparison = compareId(currentStoreId, currentRemoveId);

          if (comparison < 0) {
            // currentStoreId < currentRemoveId
            // This store item is not in the remove list (yet), keep it
          } else if (comparison > 0) {
            // currentStoreId > currentRemoveId
            // The ID to remove was smaller, it's not in the store or we passed it.
            // Advance removePtr to find the next ID to potentially remove.
            // This case implies idsToRemove might contain IDs not in this.ids,
            // or idsToRemove is not perfectly aligned with this.ids.
            // We need to advance removePtr until currentRemoveId >= currentStoreId or removePtr is out of bounds.
            while (
              removePtr < idsToRemove.length &&
              compareId(currentStoreId, idsToRemove[removePtr]) > 0
            ) {
              removePtr++;
            }
            // Re-check if removePtr is still valid and if there's a match now
            if (
              removePtr < idsToRemove.length &&
              compareId(currentStoreId, idsToRemove[removePtr]) === 0
            ) {
              if (currentStoreChar.length > 0) {
                // Only act on non-tombstones
                shouldRemoveThisStoreItem = true;
                itemsActuallyRemoved++;
              }
              removePtr++; // Consume the matched ID from idsToRemove
            }
          } else {
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
    } else {
      // withoutTombstone is false (mark as tombstone)
      let storePtr = 0;
      let removePtr = 0;
      while (removePtr < idsToRemove.length && storePtr < this.ids.length) {
        const currentRemoveId = idsToRemove[removePtr];
        const currentStoreId = this.ids[storePtr];
        const comparison = compareId(currentStoreId, currentRemoveId);

        if (comparison < 0) {
          // currentStoreId < currentRemoveId
          storePtr++;
        } else if (comparison > 0) {
          // currentStoreId > currentRemoveId
          removePtr++;
        } else {
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

  public apply(rda: RDAType, action: MuRDATextAction) {
    if (this.startsWith(action.type, 'insertCharacter')) {
      const data = <typeof InsertCharacterActionSchema.identity>action.data;
      if (
        this._insert(data.id, data.character, action.type !== 'insertCharacter')
      ) {
        this.rebuildFenwickTree();
      }
      return true;
    } else if (this.startsWith(action.type, 'insertString')) {
      const data = <typeof InsertStringActionSchema.identity>action.data; // Base type for string and beginId
      const actionIds =
        action.type === 'insertStringOnTombstoneWithIds'
          ? (<typeof InserStringWithIdsActionSchema.identity>action.data).ids
          : allocIdsEx(data, data.string.length);

      const itemsToInsert: { id: Id; char: string }[] = [];
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
    } else if (this.startsWith(action.type, 'remove')) {
      this._remove(<Id[]>action.data, action.type !== 'remove');
      return true;
    } else if (action.type === 'noop') {
      return true;
    }
    return false;
  }

  public inverse(rda: RDAType, action: MuRDATextAction) {
    if (this.startsWith(action.type, 'insertCharacter')) {
      const remove = MuRDATextActionSchema.alloc();
      remove.type =
        action.type === 'insertCharacter' ? 'removeWithoutTombstone' : 'remove';
      const result = (remove.data = RemoveActionSchema.alloc());
      result.push(
        (action.data as typeof InsertCharacterActionSchema.identity).id,
      );
      return remove;
    } else if (this.startsWith(action.type, 'insertString')) {
      const remove = MuRDATextActionSchema.alloc();
      remove.type =
        action.type === 'insertString' ? 'removeWithoutTombstone' : 'remove';
      const data = <typeof InsertStringActionSchema.identity>action.data;
      const ids = allocIdsEx(data, data.string.length);
      const result = (remove.data = RemoveActionSchema.alloc());
      for (let i = 0; i < ids.length; i++) {
        result.push(ids[i]);
      }
      return remove;
    } else if (action.type === 'remove') {
      const ids = <typeof RemoveActionSchema.identity>action.data;
      const matchedInfos = findMatchingIdsInSortedArrays(ids, this.ids);
      const characters: string[] = [];
      const indices: number[] = [];
      for (let i = 0; i < matchedInfos.length; i++) {
        characters.push(this.characters[matchedInfos[i].indexInListB]);
        indices.push(matchedInfos[i].indexInListB);
      }
      if (characters.length === 1) {
        const insert = MuRDATextActionSchema.alloc();
        insert.type = 'insertCharacterOnTombstone';
        const result = (insert.data = InsertCharacterActionSchema.alloc());
        result.character = characters[0];
        result.id = this.ids[indices[0]];
        return insert;
      } else if (characters.length > 1) {
        const insert = MuRDATextActionSchema.alloc();
        insert.type = 'insertStringOnTombstoneWithIds';
        const result = (insert.data = InserStringWithIdsActionSchema.alloc());
        result.string = characters.join('');
        result.ids = ids;
        return insert;
      }
    }
    const noop = MuRDATextActionSchema.alloc();
    noop.type = 'noop';
    noop.data = void 0;
    return noop;
  }

  public serialize(rda: RDAType, out: typeof MuRDATextStoreSchema.identity) {
    while (out.length > 0) {
      rda.storeSchema.free(<any>out.pop());
    }
    for (let i = 0; i < this.ids.length; ++i) {
      const entry = MuRDATextStoreEntrySchema.alloc();
      entry.id = this.ids[i];
      entry.character = this.characters[i];
      out.push(entry);
    }
    return out;
  }

  public free() {
    this.ids.length = 0;
    this.characters.length = 0;
    this.fenwickTree.length = 0;
  }

  public createSelection(begin: number, end: number) {
    return new TextSelection(this, begin, end);
  }

  private startsWith(str: string, substr: string) {
    return str.substring(0, substr.length) === substr;
  }
}

export const MuRDAText = {
  stateSchema: MuRDATextStateSchema,
  actionSchema: MuRDATextActionSchema,
  storeSchema: MuRDATextStoreSchema,

  emptyStore: new MuRDATextStore([], []),

  actionMeta: <MuRDATextActionMeta>{
    type: 'partial',
    action: {
      type: 'table',
      table: {
        insert: { type: 'unit' },
        remove: { type: 'unit' },
      },
    },
  },

  action: (store: MuRDATextStore) => {
    return {
      insert: (index: number, str: string) => {
        const idIdx = store.getIdsIndex(index);
        const pred =
          idIdx <= 0
            ? ID_MIN
            : store.ids[Math.min(store.ids.length - 1, idIdx - 1)] || ID_MIN;
        const succ =
          idIdx >= store.ids.length
            ? ID_MAX
            : store.ids[Math.max(0, idIdx)] || ID_MAX;
        const action = MuRDATextActionSchema.alloc();
        if (str.length === 1) {
          action.type = 'insertCharacter';
          const data = (action.data = InsertCharacterActionSchema.alloc());
          data.id = allocId(pred, succ);
          data.character = str;
        } else {
          action.type = 'insertString';
          const data = (action.data = InsertStringActionSchema.alloc());
          data.string = str;
          preAllocIds(pred, succ, str.length, data);
        }
        return action;
      },
      remove: (index: number, count: number = 1) => {
        const idIdx = store.getIdsIndex(index);
        if (idIdx < 0 || idIdx >= store.ids.length) {
          const noop = MuRDATextActionSchema.alloc();
          noop.type = 'noop';
          noop.data = void 0;
          return noop;
        }
        const action = MuRDATextActionSchema.alloc();
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

  createStore: (state: string) => {
    const ids = allocIds(ID_MIN, ID_MAX, state.length);
    const characters = state.split('');
    return new MuRDATextStore(ids, characters);
  },

  parse: (store: typeof MuRDATextStoreSchema.identity) => {
    const ids = Array(store.length);
    const characters = Array(store.length);
    for (let i = 0; i < store.length; i++) {
      ids[i] = store[i].id;
      characters[i] = store[i].character;
    }
    return new MuRDATextStore(ids, characters);
  },
};
