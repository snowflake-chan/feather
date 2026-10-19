import { MuRDA, MuRDAStore, MuRDATypes } from '@box/mudb/rda';
import { allocIds, compareId, ID_MAX, ID_MIN } from '@box/mudb/rda/_id';
import { MuRDAActionMeta, MuRDABindableActionMeta } from '@box/mudb/rda/rda';
import {
  MuArray,
  MuASCII,
  MuBoolean,
  MuDictionary,
  MuOption,
  MuSchema,
  MuSortedArray,
  MuStruct,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';
import defineDebug from 'debug';

const debug = defineDebug('box:schema:project:murda-tree');

// 真正操作的时候存储数据的东西
// 已删除的数据也要存
// 以便处理”操作已删除的数据“的冲突
class MuRDATreeStore<ValueRDA extends MuRDA<any, any, any, any>>
  implements MuRDAStore<MuRDATree<ValueRDA>>
{
  // 总的store数据
  public keyIndex: {
    [key: string]: MuRDATreeStoreElement<MuRDATree<ValueRDA>>;
  } = {};

  constructor(elements: MuRDATreeStoreElement<MuRDATree<ValueRDA>>[]) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      this.keyIndex[element.id] = element;
    }
  }

  // 从存储的store数据解析出显示的state
  public state(
    rda: MuRDATree<ValueRDA>,
    out: MuRDATypes<MuRDATree<ValueRDA>>['state'],
  ) {
    const keyIndex = this.keyIndex;
    const outKeys = Object.keys(out);
    for (let i = 0; i < outKeys.length; i++) {
      const key = outKeys[i];
      const cur = keyIndex[key];
      if (!cur || this.isDeleted(cur)) {
        rda.valueStateSchema.free(out[key].value);
        delete out[key];
      }
    }

    const keys = Object.keys(keyIndex);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const final = keyIndex[key];
      if (!this.isDeleted(final)) {
        const node = rda.nodeSchema.alloc();
        node.id = final.id;
        node.name = final.name;
        node.type = final.type;
        node.parentId = final.parentId;
        node.childrenIds = [];

        final.children.sort(rda.childrenElementSchema.compare);
        for (let i = 0; i < final.children.length; i++) {
          const childEle = final.children[i];
          const child = keyIndex[childEle.value];
          if (child && !child.deleted) {
            node.childrenIds.push(childEle.value);
          }
        }
        if (final.value) {
          node.value =
            final.value.state(rda.valueRDA, node.value) ||
            rda.valueStateSchema.alloc();
        } else {
          node.value = undefined;
        }
        out[key] = rda.nodeSchema.clone(node);
      }
    }

    return out;
  }

  private isDeleted(element: MuRDATreeStoreElement<MuRDATree<ValueRDA>>) {
    if (element.deleted) {
      return true;
    }
    let parentId = element.parentId;
    while (this.keyIndex[parentId]) {
      if (this.keyIndex[parentId].deleted) {
        return true;
      }
      parentId = this.keyIndex[parentId].parentId;
    }

    return false;
  }

  // 从action解析出store要存储的数据
  public apply(
    rda: MuRDATree<ValueRDA>,
    action: MuRDATypes<MuRDATree<ValueRDA>>['action'],
  ): boolean {
    const { add, insert, rename, deleteIds, undeleteIds, updateNodes } = action;

    for (let i = 0; i < add.length; i++) {
      const newNode = add[i];
      this.keyIndex[newNode.id] = {
        id: newNode.id,
        name: newNode.name,
        type: newNode.type,
        parentId: newNode.parentId,
        children: rda.childrenElementSchema.clone(newNode.children),
        deleted: newNode.deleted,
        value: newNode.value ? rda.valueRDA.parse(newNode.value) : undefined,
      };
    }

    for (let i = 0; i < insert.length; i++) {
      const insertChild = insert[i];
      const { element, parentId } = insertChild;
      const storeEle = this.keyIndex[element.value];
      const newParent = this.keyIndex[parentId];
      if (!storeEle || !newParent) {
        continue;
      }

      this.disconnect(rda, storeEle);
      this.connect(rda, newParent, rda.childElementSchema.clone(element));
      storeEle.parentId = parentId;
    }

    for (let i = 0; i < rename.length; i++) {
      const element = this.keyIndex[rename[i].id];
      if (!element) {
        continue;
      }
      element.name = rename[i].newName;
    }

    if (deleteIds.length > 0) {
      debug('apply with deleting action: %o', action);
      for (let i = 0; i < deleteIds.length; i++) {
        const del = this.keyIndex[deleteIds[i]];
        if (!del) {
          continue;
        }
        this.disconnect(rda, del);
        del.deleted = true;
      }
    }

    for (let i = 0; i < undeleteIds.length; i++) {
      const storeEle = this.keyIndex[undeleteIds[i]];
      if (!storeEle) {
        continue;
      }
      storeEle.deleted = false;
    }

    for (let i = 0; i < updateNodes.length; i++) {
      const update = updateNodes[i];
      const prev = this.keyIndex[update.id];
      if (prev && prev.value) {
        prev.value.apply(rda.valueRDA, update.action);
      }
    }

    return true;
  }

  private disconnect(
    rda: MuRDATree<ValueRDA>,
    element: StoreTypes<ValueRDA>['storeElementSchema']['identity'],
  ) {
    const parent = this.keyIndex[element.parentId];
    if (!parent) {
      return;
    }

    const childEle = rda.findChildElement(parent, element.id);
    if (childEle) {
      parent.children.splice(childEle.index, 1);
    }
  }

  private connect(
    rda: MuRDATree<ValueRDA>,
    parent: MuRDATree<ValueRDA>['storeElementSchema']['identity'],
    newChildEle: MuRDATree<ValueRDA>['childElementSchema']['identity'],
  ) {
    const oldChild = rda.findChildElement(parent, newChildEle.value);
    if (oldChild) {
      debug(
        'connect: child %o already exists on %o',
        newChildEle.value,
        parent.name,
      );
      return;
    }

    const storeEle = this.keyIndex[newChildEle.value];
    if (!storeEle) {
      debug('connect: child %o not found', newChildEle.value);
      return;
    }
    parent.children.push(newChildEle);
  }
  // 从action解析出当前操作撤销时需要进行的反向操作
  // 用于撤销
  public inverse(
    rda: MuRDATree<ValueRDA>,
    action: MuRDATypes<MuRDATree<ValueRDA>>['action'],
  ): MuRDATypes<MuRDATree<ValueRDA>>['action'] {
    const { add, insert, rename, deleteIds, updateNodes } = action;
    const result = rda.getEmptyAction();

    for (let i = 0; i < add.length; i++) {
      result.deleteIds.push(add[i].id);
    }

    if (insert.length > 0) {
      debug('create inverse action with removing %o', result.deleteIds);
      for (let i = 0; i < insert.length; i++) {
        const insertChild = this.generateInsertChild(
          rda,
          insert[i].element.value,
        );
        insertChild && result.insert.push(insertChild);
      }
    }

    for (let i = 0; i < rename.length; i++) {
      const element = this.keyIndex[rename[i].id];
      if (!element) {
        continue;
      }
      const renameEle = rda.renameElement.alloc();
      renameEle.id = element.id;
      renameEle.newName = element.name;
      result.rename.push(renameEle);
    }

    for (let i = 0; i < deleteIds.length; i++) {
      const deleteId = deleteIds[i];
      const insertChild = this.generateInsertChild(rda, deleteId);
      if (!insertChild) {
        continue;
      }
      result.insert.push(insertChild);
      result.undeleteIds.push(deleteIds[i]);
    }

    for (let i = 0; i < updateNodes.length; i++) {
      const update = updateNodes[i];
      const prev = this.keyIndex[update.id];
      if (prev && prev.value) {
        const inverse = rda.updateSchema.alloc();
        inverse.id = update.id;
        rda.valueRDA.actionSchema.free(inverse.action);
        inverse.action = prev.value.inverse(rda.valueRDA, update.action);
        result.updateNodes.push(inverse);
      }
    }

    return result;
  }

  private generateInsertChild(rda: MuRDATree<ValueRDA>, childId: string) {
    const storeEle = this.keyIndex[childId];
    if (!storeEle) {
      return;
    }
    const currParent = this.keyIndex[storeEle.parentId];
    if (!currParent) {
      return;
    }
    const childEle = rda.findChildElement(currParent, childId);
    // 在parent中查不到child说明该元素已经被其他操作移走
    // 不需要对其进行还原
    if (!childEle) {
      return;
    }

    const insertChild = rda.insertChild.alloc();
    insertChild.parentId = currParent.id;

    insertChild.element.sequence = childEle.data.sequence;
    insertChild.element.value = childEle.data.value;
    return insertChild;
  }

  public serialize(
    rda: MuRDATree<ValueRDA>,
    out: MuRDATypes<MuRDATree<ValueRDA>>['serializedStore'],
  ): MuRDATypes<MuRDATree<ValueRDA>>['serializedStore'] {
    const keyIndex = this.keyIndex;
    const keys = Object.keys(keyIndex);
    while (out.length > keys.length) {
      const element = out.pop();
      if (element) {
        rda.storeElementSchema.free(element);
      }
    }
    while (out.length < keys.length) {
      out.push(rda.storeElementSchema.alloc());
    }

    for (let i = 0; i < keys.length; i++) {
      const element = keyIndex[keys[i]];
      const store = out[i];

      store.id = element.id;
      store.name = element.name;
      store.type = element.type;
      store.parentId = element.parentId;
      store.children = rda.childrenElementSchema.clone(element.children);
      store.deleted = element.deleted;

      if (store.value === undefined && element.value) {
        store.value = rda.valueRDA.storeSchema.alloc();
      }

      store.value = element.value
        ? element.value.serialize(rda.valueRDA, store.value)
        : undefined;
    }

    return out;
  }

  public free(rda: MuRDATree<ValueRDA>) {
    const keyIndex = this.keyIndex;
    const keys = Object.keys(keyIndex);
    for (let i = 0; i < keys.length; i++) {
      const element = keyIndex[keys[i]];
      element.value && element.value.free(rda.valueRDA);
    }
    this.keyIndex = {};
  }
}

export class MuRDATreeStoreElement<MapRDA extends MuRDATree<any>> {
  constructor(
    public deleted: boolean,
    public id: string,
    public type: TreeNodeType,
    public name: string,
    public parentId: string,
    public children: StoreTypes<
      MapRDA['valueRDA']
    >['childrenElementSchema']['identity'],
    public value: MuRDATypes<MapRDA['valueRDA']>['store'] | undefined,
  ) {}
}

type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
  type: 'store';
  action: MuRDAActionMeta;
}
  ? Meta['action']
  : Meta extends MuRDAActionMeta
  ? Meta
  : never;
type WrapAction<Meta, Dispatch> = Meta extends { type: 'unit' }
  ? Dispatch extends (...args: infer ArgType) => infer RetType
    ? (...args: ArgType) => {
        add: MuArray<StoreTypes<any>['storeElementSchema']>['identity'];
        rename: {
          id: string;
          newName: string;
        }[];
        insert: {
          parentId: string;
          element: {
            sequence: string;
            value: string;
          };
        }[];
        deleteIds: string[];
        undeleteIds: string[];
        updateNodes: {
          id: string;
          action: RetType;
        }[];
      }
    : never
  : Meta extends { action: MuRDAActionMeta }
  ? Dispatch extends (...args: infer ArgType) => infer RetType
    ? (...args: ArgType) => WrapAction<Meta['action'], RetType>
    : never
  : Meta extends { table: { [id in keyof Dispatch]: MuRDAActionMeta } }
  ? Dispatch extends { [id in keyof Meta['table']]: any }
    ? {
        [id in keyof Meta['table']]: WrapAction<
          Meta['table'][id],
          Dispatch[id]
        >;
      }
    : never
  : never;

type StripBindAndWrap<ValueRDA extends MuRDA<any, any, any, any>> =
  ValueRDA['actionMeta'] extends { type: 'store'; action: MuRDAActionMeta }
    ? ValueRDA['action'] extends (store) => infer RetAction
      ? WrapAction<ValueRDA['actionMeta']['action'], RetAction>
      : never
    : WrapAction<ValueRDA['actionMeta'], ValueRDA['action']>;

type MuRDATreeMeta<ValueRDA extends MuRDA<any, any, any, any>> = {
  type: 'store';
  action: {
    type: 'table';
    table: {
      add: { type: 'unit' };
      release: { type: 'unit' };
      remove: { type: 'unit' };
      copy: { type: 'unit' };
      move: { type: 'unit' };
      rename: { type: 'unit' };
      update: {
        type: 'partial';
        action: StripBindMeta<ValueRDA['actionMeta']>;
      };
    };
  };
};

export enum TreeNodeType {
  root,
  leaf,
  node,
}

export interface TreeStructTypes<ValueRDA extends MuRDA<any, any, any, any>> {
  node: MuStruct<{
    id: MuASCII;
    type: MuSchema<TreeNodeType>;
    name: MuUTF8;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    value: MuOption<ValueRDA['stateSchema']>;
  }>;

  treeNodes: MuDictionary<TreeStructTypes<ValueRDA>['node']>;
}

export interface InsertType {
  id: string;
  type: 'before' | 'after';
}

interface ActionTypes<ValueRDA extends MuRDA<any, any, any, any>> {
  renameElement: MuStruct<{
    id: MuASCII;
    newName: MuUTF8;
  }>;
  insertChild: MuStruct<{
    parentId: MuASCII;
    element: StoreTypes<ValueRDA>['childElementSchema'];
  }>;
  insertChildren: MuArray<ActionTypes<ValueRDA>['insertChild']>;
  ids: MuArray<MuASCII>;
  updateSchema: MuStruct<{
    id: MuASCII;
    action: ValueRDA['actionSchema'];
  }>;

  actionSchema: MuStruct<{
    add: MuArray<StoreTypes<ValueRDA>['storeElementSchema']>;
    rename: MuArray<ActionTypes<ValueRDA>['renameElement']>;
    insert: ActionTypes<ValueRDA>['insertChildren'];
    deleteIds: ActionTypes<ValueRDA>['ids'];
    undeleteIds: ActionTypes<ValueRDA>['ids'];
    updateNodes: MuArray<ActionTypes<ValueRDA>['updateSchema']>;
  }>;
}

interface StoreTypes<ValueRDA extends MuRDA<any, any, any, any>> {
  childElementSchema: MuStruct<{
    sequence: MuASCII;
    value: MuASCII;
  }>;
  childrenElementSchema: MuSortedArray<
    StoreTypes<ValueRDA>['childElementSchema']
  >;
  storeElementSchema: MuStruct<{
    deleted: MuBoolean;
    id: MuASCII;
    type: MuSchema<TreeNodeType>;
    name: MuUTF8;
    parentId: MuASCII;
    children: StoreTypes<ValueRDA>['childrenElementSchema'];
    value: MuOption<ValueRDA['storeSchema']>;
  }>;

  storeSchema: MuArray<StoreTypes<ValueRDA>['storeElementSchema']>;
}

export const ROOT_ID = 'ROOT_ID';
export const ROOT_NAME = 'Root';

export class MuRDATree<ValueRDA extends MuRDA<any, any, any, any>>
  implements
    MuRDA<
      TreeStructTypes<ValueRDA>['treeNodes'],
      ActionTypes<ValueRDA>['actionSchema'],
      StoreTypes<ValueRDA>['storeSchema'],
      MuRDATreeMeta<ValueRDA>
    >
{
  public readonly valueStateSchema: MuOption<ValueRDA['stateSchema']>;
  public readonly nodeSchema: TreeStructTypes<ValueRDA>['node'];
  public readonly valueRDA: ValueRDA;
  public readonly childElementSchema: StoreTypes<ValueRDA>['childElementSchema'];
  public readonly childrenElementSchema: StoreTypes<ValueRDA>['childrenElementSchema'];
  public readonly storeElementSchema: StoreTypes<ValueRDA>['storeElementSchema'];
  private _savedStore: MuRDATreeStore<ValueRDA>;
  private _savedElement: MuRDATypes<ValueRDA>['store'] | null = null;
  private _savedAction: ActionTypes<ValueRDA>['actionSchema']['identity'];
  private _savedUpdate: ActionTypes<ValueRDA>['updateSchema']['identity'];
  private _updateDispatcher: StripBindAndWrap<ValueRDA>;

  public readonly renameElement: ActionTypes<ValueRDA>['renameElement'];
  public readonly insertChild: ActionTypes<ValueRDA>['insertChild'];
  public readonly insertChildren: ActionTypes<ValueRDA>['insertChildren'];
  public readonly ids: ActionTypes<ValueRDA>['ids'];
  public readonly updateSchema: ActionTypes<ValueRDA>['updateSchema'];

  constructor(
    valueRDA: ValueRDA,
    identity?: TreeStructTypes<ValueRDA>['treeNodes']['identity'],
  ) {
    this.valueStateSchema = new MuOption(valueRDA.stateSchema, undefined, true);
    this.nodeSchema = new MuStruct({
      id: new MuASCII(),
      type: new MuVarint(TreeNodeType.root),
      name: new MuUTF8(),
      parentId: new MuASCII(),
      childrenIds: new MuArray(new MuASCII(), Infinity),
      value: this.valueStateSchema,
    });
    this.valueRDA = valueRDA;

    this.stateSchema = new MuDictionary(
      this.nodeSchema,
      Infinity,
      identity || {
        [ROOT_ID]: {
          id: ROOT_ID,
          type: TreeNodeType.root,
          name: ROOT_NAME,
          parentId: '',
          childrenIds: [],
          value: this.valueStateSchema.clone(this.valueStateSchema.identity),
        },
      },
    );

    this.childElementSchema = new MuStruct({
      sequence: new MuASCII(ID_MIN),
      value: new MuASCII(),
    });
    this.childrenElementSchema = new MuSortedArray(
      this.childElementSchema,
      Infinity,
      (a, b) => compareId(a.sequence, b.sequence),
    );

    this.storeElementSchema = new MuStruct({
      deleted: new MuBoolean(false),
      id: new MuASCII(),
      type: new MuVarint(TreeNodeType.root),
      name: new MuUTF8(),
      parentId: new MuASCII(),
      children: this.childrenElementSchema,
      value: new MuOption(valueRDA.storeSchema),
    });

    this.storeSchema = new MuArray(this.storeElementSchema, Infinity);
    this.emptyStore = new MuRDATreeStore([]);
    this._savedStore = new MuRDATreeStore([]);
    this.renameElement = new MuStruct({
      id: new MuASCII(),
      newName: new MuUTF8(),
    });
    this.insertChild = new MuStruct({
      parentId: new MuASCII(),
      element: this.childElementSchema,
    });
    this.insertChildren = new MuArray(this.insertChild, Infinity);
    this.ids = new MuArray(new MuASCII(), Infinity);
    this.updateSchema = new MuStruct({
      id: new MuASCII(),
      action: valueRDA.actionSchema,
    });
    this.actionSchema = new MuStruct({
      add: this.storeSchema,
      insert: this.insertChildren,
      rename: new MuArray(this.renameElement, Infinity),
      deleteIds: this.ids,
      undeleteIds: this.ids,
      updateNodes: new MuArray(this.updateSchema, Infinity),
    });
    this._savedAction = this.actionSchema.clone(this.actionSchema.identity);
    this._savedUpdate = this.updateSchema.clone(this.updateSchema.identity);

    this.actionMeta = {
      type: 'store',
      action: {
        type: 'table',
        table: {
          add: {
            type: 'unit',
          },
          release: {
            type: 'unit',
          },
          remove: {
            type: 'unit',
          },
          copy: {
            type: 'unit',
          },
          move: {
            type: 'unit',
          },
          rename: {
            type: 'unit',
          },
          update: {
            type: 'partial',
            action:
              this.valueRDA.actionMeta.type === 'store'
                ? valueRDA.actionMeta.action
                : valueRDA.actionMeta,
          },
        },
      },
    };

    this._updateDispatcher = this._constructUpdateDispatcher();
  }
  // 真正的schema
  public readonly stateSchema: TreeStructTypes<ValueRDA>['treeNodes'];

  // action的schema
  public readonly actionSchema: ActionTypes<ValueRDA>['actionSchema'];

  // 存储数据，可以通过这个数据初始化MuRDATreeStore
  public readonly storeSchema: StoreTypes<ValueRDA>['storeSchema'];

  // action定义
  public readonly actionMeta: MuRDATreeMeta<ValueRDA>;

  // action实例
  public readonly action = (store: MuRDATreeStore<ValueRDA>) => {
    this._savedStore = store;
    return {
      add: (node: TreeStructTypes<ValueRDA>['node']['identity']) => {
        const result = this.getEmptyAction();
        const storeEle = this.parseNodeToSerializeStoreEle(node);
        const parent = this._savedStore.keyIndex[storeEle.parentId];
        if (!parent) {
          return result;
        }

        const sequence = this.generateSequences(parent, 1);
        if (!sequence) {
          return result;
        }
        const insertSelf = this.insertChild.alloc();
        insertSelf.parentId = storeEle.parentId;
        insertSelf.element.sequence = sequence[0];
        insertSelf.element.value = storeEle.id;

        result.insert.push(insertSelf);
        result.add.push(storeEle);

        for (let i = 0; i < storeEle.children.length; i++) {
          const child = storeEle.children[i];
          const insertChild = this.insertChild.alloc();
          insertChild.parentId = storeEle.id;
          insertChild.element.sequence = child.sequence;
          insertChild.element.value = child.value;
          result.insert.push(insertChild);
        }

        return result;
      },
      release: (nodeId: string) => {
        const result = this.getEmptyAction();
        const { keyIndex } = this._savedStore;
        const storeEle = keyIndex[nodeId];
        if (!storeEle) {
          return result;
        }
        const parent = keyIndex[storeEle.parentId];
        if (!parent) {
          return result;
        }

        const sequence = this.generateSequences(
          parent,
          storeEle.children.length,
          {
            id: nodeId,
            type: 'before',
          },
        );

        if (!sequence) {
          return result;
        }

        for (let i = 0; i < storeEle.children.length; i++) {
          const child = storeEle.children[i];
          const insertChild = this.insertChild.alloc();

          insertChild.parentId = parent.id;
          insertChild.element.sequence = sequence[i];
          insertChild.element.value = child.value;
          result.insert.push(insertChild);
        }

        result.deleteIds.push(nodeId);
        return result;
      },
      remove: (nodeIds: string[]) => {
        const result = this.getEmptyAction();
        result.deleteIds = this.ids.clone(nodeIds);
        return result;
      },
      copy: (
        data: {
          sourceNodeId: string;
          newNode: TreeStructTypes<ValueRDA>['node']['identity'];
          newChildrenNodes: TreeStructTypes<ValueRDA>['node']['identity'][];
        }[],
      ) => {
        const result = this.getEmptyAction();

        for (let i = 0; i < data.length; i++) {
          const { keyIndex } = this._savedStore;
          const { sourceNodeId, newNode, newChildrenNodes } = data[i];
          const source = keyIndex[sourceNodeId];
          if (!source) {
            continue;
          }
          const parent = keyIndex[source.parentId];
          if (!parent) {
            continue;
          }
          const sequence = this.generateSequences(parent, 1, {
            id: sourceNodeId,
            type: 'before',
          });
          if (!sequence) {
            continue;
          }

          const insertSelf = this.insertChild.alloc();
          insertSelf.parentId = source.parentId;
          insertSelf.element.sequence = sequence[0];
          insertSelf.element.value = newNode.id;

          result.insert.push(insertSelf);

          const storeEle = this.parseNodeToSerializeStoreEle(newNode);
          storeEle.parentId = source.parentId;

          result.add.push(storeEle);

          newChildrenNodes.forEach((childNode) => {
            result.add.push(this.parseNodeToSerializeStoreEle(childNode));
          });
        }

        return result;
      },
      move: (data: {
        moveIds: string[];
        insertParentId: string;
        insert?: InsertType;
      }) => {
        const result = this.getEmptyAction();

        const parent = this._savedStore.keyIndex[data.insertParentId];
        if (!parent) {
          return result;
        }
        const sequence = this.generateSequences(
          parent,
          data.moveIds.length,
          data.insert,
        );
        if (!sequence) {
          return result;
        }

        for (let i = 0; i < data.moveIds.length; i++) {
          const insertChild = this.insertChild.alloc();
          insertChild.parentId = parent.id;
          insertChild.element.sequence = sequence[i];
          insertChild.element.value = data.moveIds[i];
          result.insert.push(insertChild);
        }
        return result;
      },
      rename: (
        data: {
          nodeId: string;
          newName: string;
        }[],
      ) => {
        const result = this.getEmptyAction();

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          const renameEle = this.renameElement.alloc();
          renameEle.id = value.nodeId;
          renameEle.newName = value.newName;

          result.rename.push(renameEle);
        }

        return result;
      },
      update: (nodeId: string) => {
        const result = this.getEmptyAction();

        const prev = this._savedStore.keyIndex[nodeId];
        if (!prev || !prev.value) {
          return result;
        }
        this._savedElement = prev.value;
        const action = (this._savedAction = this.getEmptyAction());
        const update = (this._savedUpdate = this.updateSchema.alloc());
        update.id = prev.id;
        this.valueRDA.actionSchema.free(update.action);
        action.updateNodes.push(update);
        return this._updateDispatcher;
      },
    };
  };

  // 这就是为了搞类型
  public readonly emptyStore: MuRDATreeStore<ValueRDA>;

  public getEmptyAction() {
    const action = this.actionSchema.alloc();
    action.add.length = 0;
    action.insert.length = 0;
    action.deleteIds.length = 0;
    action.undeleteIds.length = 0;
    action.updateNodes.length = 0;
    return action;
  }

  private parseNodeToSerializeStoreEle(
    node: TreeStructTypes<ValueRDA>['node']['identity'],
  ) {
    const storeElement = this.storeElementSchema.alloc();
    storeElement.deleted = false;
    storeElement.id = node.id;
    storeElement.name = node.name;
    storeElement.type = node.type;
    storeElement.parentId = node.parentId;
    storeElement.children = this.parseNodeChildrenIdsToEle(node.childrenIds);
    if (node.value) {
      const tempStore = this.valueRDA.createStore(node.value);
      storeElement.value = tempStore.serialize(
        this.valueRDA,
        storeElement.value,
      );
      tempStore.free(this.valueRDA);
    } else {
      storeElement.value = undefined;
    }
    return storeElement;
  }

  private parseNodeChildrenIdsToEle(childrenIds: string[]) {
    const sequences = allocIds(ID_MIN, ID_MAX, childrenIds.length);
    const children = this.childrenElementSchema.alloc();
    children.length = 0;
    for (let i = 0; i < childrenIds.length; i++) {
      const child = this.childElementSchema.alloc();
      child.sequence = sequences[i];
      child.value = childrenIds[i];
      children.push(child);
    }
    return children;
  }

  private _constructUpdateDispatcher() {
    const self = this;

    function wrapPartial(root, dispatcher) {
      const savedPartial = { data: <any>null };
      function wrapPartialRec(meta, index: string) {
        if (meta.type === 'unit') {
          return new Function(
            'rda',
            'saved',
            `return function () { rda._savedUpdate.action = saved.data${index}.apply(null, arguments); return rda._savedAction; }`,
          )(self, savedPartial);
        } else if (meta.type === 'table') {
          const result = {};
          const keys = Object.keys(meta.table);
          for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            result[key] = wrapPartialRec(meta.table[key], `${index}["${key}"]`);
          }
          return result;
        } else if (meta.type === 'partial') {
          return wrapPartial(
            meta.action,
            new Function(
              'saved',
              `return function () { return saved.data${index}.apply(null, arguments); }`,
            )(savedPartial),
          );
        }
        return {};
      }
      return new Function(
        'savedPartial',
        'dispatch',
        'wrapped',
        `return function () { savedPartial.data = dispatch.apply(null, arguments); return wrapped; }`,
      )(savedPartial, dispatcher, wrapPartialRec(root, ''));
    }

    function wrapStore(meta, dispatcher, index) {
      if (meta.type === 'unit') {
        return new Function(
          'rda',
          'dispatch',
          `return function () { rda._savedUpdate.action = dispatch(rda._savedElement)${index}.apply(null, arguments); return rda._savedAction; }`,
        )(self, dispatcher);
      } else if (meta.type === 'table') {
        const result: any = {};
        const keys = Object.keys(meta.table);
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          result[key] = wrapStore(
            meta.table[key],
            dispatcher,
            `${index}["${key}"]`,
          );
        }
        return result;
      } else if (meta.type === 'partial') {
        return wrapPartial(
          meta.action,
          new Function(
            'rda',
            'dispatch',
            `return function () { return dispatch(rda._savedElement)${index}.apply(null, arguments); }`,
          )(self, dispatcher),
        );
      }
      return {};
    }

    function wrapAction(meta, dispatcher) {
      if (meta.type === 'unit') {
        return function (...args) {
          self._savedUpdate.action = dispatcher.apply(null, args);
          return self._savedAction;
        };
      } else if (meta.type === 'table') {
        const result: any = {};
        const keys = Object.keys(meta.table);
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          result[key] = wrapAction(meta.table[key], dispatcher[key]);
        }
        return result;
      } else if (meta.type === 'partial') {
        return wrapPartial(meta.action, dispatcher);
      }
      return {};
    }

    if (this.valueRDA.actionMeta.type === 'store') {
      return wrapStore(
        this.valueRDA.actionMeta.action,
        this.valueRDA.action,
        '',
      );
    } else {
      return wrapAction(this.valueRDA.actionMeta, this.valueRDA.action);
    }
  }

  public findChildElement(
    parent: StoreTypes<ValueRDA>['storeElementSchema']['identity'],
    childId: string,
  ) {
    for (let i = 0; i < parent.children.length; i++) {
      const childEle = parent.children[i];
      if (childEle.value === childId) {
        return {
          index: i,
          data: childEle,
        };
      }
    }
    return;
  }

  public generateSequences(
    parent: MuRDATree<ValueRDA>['storeElementSchema']['identity'],
    count: number,
    insert?: InsertType,
  ) {
    // 先排序，然后根据索引值获取需要插入的children的sequence值
    parent.children.sort(this.childrenElementSchema.compare);

    /**
     * 插入开始的索引值
     */
    let startIndex: number;

    if (!insert) {
      // 如果不输入插入地点，默认插入最上方
      startIndex = -1;
    } else {
      const childEle = this.findChildElement(parent, insert.id);
      // 如找不到插入的位置，直接返回
      if (!childEle) {
        return;
      }

      startIndex =
        insert.type === 'after' ? childEle.index : childEle.index - 1;
    }

    const endIndex = startIndex + 1;

    // 根据插入前后的索引值查找排序值
    // 计算出两个两个元素之间的顺序
    const minSequence =
      startIndex >= 0 ? parent.children[startIndex].sequence : ID_MIN;
    const maxSequence =
      endIndex < parent.children.length
        ? parent.children[endIndex].sequence
        : ID_MAX;
    return allocIds(minSequence, maxSequence, count);
  }

  public createStore(
    initialState: MuRDATree<ValueRDA>['stateSchema']['identity'],
  ): MuRDATreeStore<ValueRDA> {
    const storeElements: MuRDATreeStoreElement<MuRDATree<ValueRDA>>[] = [];
    Object.keys(initialState).forEach((key) => {
      const node = initialState[key];
      storeElements.push(
        new MuRDATreeStoreElement<MuRDATree<ValueRDA>>(
          false,
          node.id,
          node.type,
          node.name,
          node.parentId,
          this.childrenElementSchema.toJSON(
            this.parseNodeChildrenIdsToEle(node.childrenIds),
          ),
          node.value ? this.valueRDA.createStore(node.value) : undefined,
        ),
      );
    });
    return new MuRDATreeStore(storeElements);
  }

  public parse(
    store: MuRDATree<ValueRDA>['storeSchema']['identity'],
  ): MuRDATreeStore<ValueRDA> {
    const storeElements: MuRDATreeStoreElement<MuRDATree<ValueRDA>>[] =
      new Array(store.length);
    for (let i = 0; i < store.length; i++) {
      const element = store[i];
      storeElements[i] = new MuRDATreeStoreElement<MuRDATree<ValueRDA>>(
        element.deleted,
        element.id,
        element.type,
        element.name,
        element.parentId,
        this.childrenElementSchema.toJSON(element.children),
        element.value ? this.valueRDA.parse(element.value) : undefined,
      );
    }
    return new MuRDATreeStore(storeElements);
  }
}
