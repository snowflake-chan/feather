import { expect, test } from '@jest/globals';
import {
  MuRDAText,
  TextIterator,
  MuRDATextStoreSchema,
} from '@box/schema/code-editor/murda-text';
import {
  preAllocIds,
  allocIdsEx,
  AllocIdsData,
  allocId,
} from '@box/schema/code-editor/murda-id';

test('MuRDAText - store', function () {
  const strs = ['', 'abc123~!@'];
  strs.forEach((str) => {
    const store = MuRDAText.createStore(str);
    expect(store.state()).toBe(str);
    const serialized = store.serialize(MuRDAText, MuRDATextStoreSchema.alloc());
    const storeReplica = MuRDAText.parse(serialized);
    expect(storeReplica.state()).toBe(str);
    storeReplica.free();
    store.free();
  });
});

test('MuRDAText - apply', () => {
  const store = MuRDAText.createStore('');
  const dispatchers = MuRDAText.action(store);

  store.apply(MuRDAText, dispatchers.insert(0, 'a'));
  expect(store.state()).toBe('a');
  store.apply(MuRDAText, dispatchers.insert(0, 'bb'));
  expect(store.state()).toBe('bba');
  store.apply(MuRDAText, dispatchers.insert(2, 'ccc'));
  expect(store.state()).toBe('bbccca');
  store.apply(MuRDAText, dispatchers.insert(5, 'ddddd'));
  expect(store.state()).toBe('bbcccddddda');
  store.apply(MuRDAText, dispatchers.remove(0));
  expect(store.state()).toBe('bcccddddda');
  store.apply(MuRDAText, dispatchers.remove(0));
  expect(store.state()).toBe('cccddddda');
  store.apply(MuRDAText, dispatchers.insert(0, 'eeeeee'));
  expect(store.state()).toBe('eeeeeecccddddda');
  store.apply(MuRDAText, dispatchers.remove(6, 4));
  expect(store.state()).toBe('eeeeeedddda');
  store.apply(MuRDAText, dispatchers.insert(11, 'fffffff'));
  expect(store.state()).toBe('eeeeeeddddafffffff');
  store.apply(MuRDAText, dispatchers.remove(1, 100));
  expect(store.state()).toBe('e');
});

test('MuRDAText - inverse', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const dispatchers = MuRDAText.action(store);
  const actions: { action: any; msg: string }[] = [];
  const addAction = (action: any, msg: string) => actions.push({ action, msg });

  addAction(dispatchers.insert(0, 'a'), 'insert before begin');
  addAction(dispatchers.insert(5, 'bb'), 'normal insert');
  addAction(dispatchers.insert(10, 'cccc'), 'insert after end');
  addAction(dispatchers.remove(0, 3), 'remove first');
  addAction(dispatchers.remove(5, 2), 'normal remove');
  addAction(dispatchers.remove(9, 1), 'remove last');

  const inversedActions = actions.map(({ action }) =>
    store.inverse(MuRDAText, action),
  );
  for (let i = 0; i < actions.length; i++) {
    const origin = store.state();
    store.apply(MuRDAText, actions[i].action);
    store.apply(MuRDAText, inversedActions[i]);
    expect(store.state()).toBe(origin);
  }

  for (let i = 0; i < actions.length; i++) {
    store.apply(MuRDAText, actions[i].action);
  }
  for (let i = 0; i < actions.length; i++) {
    store.apply(MuRDAText, inversedActions[i]);
  }
  expect(store.state()).toBe(str);
});

test('MuRDAText - insert-undo-redo', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const dispatchers = MuRDAText.action(store);
  const insertPos = 3;
  for (const s of ['a', 'abc123', '2333', 'x']) {
    const action = dispatchers.insert(insertPos, s);
    const actions = [action, store.inverse(MuRDAText, action)];
    const states = [str.substr(0, insertPos) + s + str.substr(insertPos), str];
    for (let i = 0; i < 100; i++) {
      store.apply(MuRDAText, actions[i % 2]);
      expect(store.state()).toBe(states[i % 2]);
    }
  }
});

test('MuRDAText - remove-undo-redo', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const dispatchers = MuRDAText.action(store);
  const removePos = 3;
  for (const count of [1, 3, 3, 1]) {
    const action = dispatchers.remove(removePos, count);
    const actions = [action, store.inverse(MuRDAText, action)];
    const states = [
      str.substr(0, removePos) + str.substr(removePos + count),
      str,
    ];
    for (let i = 0; i < 100; i++) {
      store.apply(MuRDAText, actions[i % 2]);
      expect(store.state()).toBe(states[i % 2]);
    }
  }
});

test('MuRDAText - remove-undo-redo-remove-undo-redo', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const dispatchers = MuRDAText.action(store);
  const action = dispatchers.remove(3, 3);
  const redo = action;
  const undo = store.inverse(MuRDAText, action);

  store.apply(MuRDAText, action);
  expect(store.state()).toBe('0126789');
  store.apply(MuRDAText, undo);
  expect(store.state()).toBe('0123456789');
  store.apply(MuRDAText, redo);
  expect(store.state()).toBe('0126789');

  const action2 = dispatchers.remove(2, 3);
  const redo2 = action2;
  const undo2 = store.inverse(MuRDAText, action2);
  store.apply(MuRDAText, action2);
  expect(store.state()).toBe('0189');
  store.apply(MuRDAText, undo2);
  expect(store.state()).toBe('0126789');
  store.apply(MuRDAText, redo2);
  expect(store.state()).toBe('0189');
});

test('MuRDAText - cursor', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const cursor = new TextIterator(store, 0);
  const dispatchers = MuRDAText.action(store);

  // test create
  expect(new TextIterator(store, 0).getIndex()).toBe(0);
  expect(new TextIterator(store, 5).getIndex()).toBe(5);
  expect(new TextIterator(store, 9).getIndex()).toBe(9);
  expect(new TextIterator(store, -1).getIndex()).toBe(0);
  expect(new TextIterator(store, 1000).getIndex()).toBe(str.length);

  // test moveNext
  for (let i = 0; i <= str.length; i++) {
    expect(cursor.getIndex()).toBe(i);
    cursor.moveNext();
  }
  expect(cursor.getIndex()).toBe(str.length);

  // test movePrev
  for (let i = str.length; ~i; i--) {
    expect(cursor.getIndex()).toBe(i);
    cursor.movePrev();
  }
  expect(cursor.getIndex()).toBe(0);

  // test moveTo
  cursor.moveTo(-1);
  expect(cursor.getIndex()).toBe(0);
  cursor.moveTo(0);
  expect(cursor.getIndex()).toBe(0);
  cursor.moveTo(5);
  expect(cursor.getIndex()).toBe(5);
  cursor.moveTo(9);
  expect(cursor.getIndex()).toBe(9);
  cursor.moveTo(str.length);
  expect(cursor.getIndex()).toBe(str.length);
  cursor.moveTo(str.length + 1);
  expect(cursor.getIndex()).toBe(str.length);

  // test with store changed
  cursor.moveTo(5);
  // insert
  store.apply(MuRDAText, dispatchers.insert(cursor.getIndex() - 1, 'a'));
  expect(cursor.getIndex()).toBe(6);
  store.apply(MuRDAText, dispatchers.insert(cursor.getIndex(), 'foo'));
  expect(cursor.getIndex()).toBe(9);
  store.apply(MuRDAText, dispatchers.insert(cursor.getIndex() + 1, 'bar'));
  expect(cursor.getIndex()).toBe(9);
  // delete
  store.apply(MuRDAText, dispatchers.remove(cursor.getIndex() - 1));
  expect(cursor.getIndex()).toBe(8);
  store.apply(MuRDAText, dispatchers.remove(cursor.getIndex()));
  expect(cursor.getIndex()).toBe(8);
  store.apply(MuRDAText, dispatchers.remove(cursor.getIndex() + 1));
  expect(cursor.getIndex()).toBe(8);
});

test('MuRDAText - selection', () => {
  const str = '0123456789';
  const store = MuRDAText.createStore(str);
  const dispatchers = MuRDAText.action(store);
  const selection = store.createSelection(1, 5);

  expect(selection.getText()).toBe('1234');
  expect(selection.getRange()).toEqual({
    begin: selection.begin.getIndex(),
    end: selection.end.getIndex(),
  });
  expect(selection.getRange()).toEqual({
    begin: 1,
    end: 5,
  });

  // insert
  store.apply(
    MuRDAText,
    dispatchers.insert(selection.begin.getIndex() - 1, 'abc'),
  );
  expect(selection.getText()).toBe('1234');
  store.apply(MuRDAText, dispatchers.insert(selection.begin.getIndex(), 'foo'));
  expect(selection.getText()).toBe('1234');
  store.apply(
    MuRDAText,
    dispatchers.insert(selection.begin.getIndex() + 1, 'bar'),
  );
  expect(selection.getText()).toBe('1bar234');
  store.apply(MuRDAText, dispatchers.insert(selection.end.getIndex(), 'hello'));
  expect(selection.getText()).toBe('1bar234hello');

  // remove
  store.apply(MuRDAText, dispatchers.remove(selection.begin.getIndex() - 1));
  expect(selection.getText()).toBe('1bar234hello');
  store.apply(MuRDAText, dispatchers.remove(selection.begin.getIndex()));
  expect(selection.getText()).toBe('bar234hello');
  store.apply(MuRDAText, dispatchers.remove(selection.begin.getIndex() + 1));
  expect(selection.getText()).toBe('br234hello');
  store.apply(MuRDAText, dispatchers.remove(selection.end.getIndex()));
  expect(selection.getText()).toBe('br234hello');

  // move
  selection.end.moveNext();
  expect(selection.getText()).toBe('br234hello6');
  selection.begin.movePrev();
  expect(selection.getText()).toBe('obr234hello6');
  selection.begin.moveTo(selection.end.getIndex() - 1);
  expect(selection.getText()).toBe('6');
});

test('MuRDAText - allocIdsEx', function () {
  const begin = 'A';
  const end = 'B';
  const count = 100;
  const data = {} as AllocIdsData;
  preAllocIds(begin, end, count, data);
  expect(allocIdsEx(data, count)).toEqual(allocIdsEx(data, count));
});

test('MuRDAText - allocId', function () {
  const a =
    '\u0053\u007c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u0005\u0074\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007b\u001c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007c\u0045\u004d\u007f';
  const b =
    '\u0053\u007c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u0005\u0074\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007b\u001c\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007c\u0045\u004e';
  const x =
    '\u0070\u0002\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007b\u007f\u007f\u0078\u005d\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007a\u0020\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f';
  const y =
    '\u0070\u0002\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007b\u007f\u007f\u0078\u005d\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007f\u007a\u0021';
  const c = allocId(a, b);
  expect(a < c).toBeTruthy();
  expect(c < b).toBeTruthy();
  const z = allocId(x, y);
  expect(x < z).toBeTruthy();
  expect(z < y).toBeTruthy();
});
