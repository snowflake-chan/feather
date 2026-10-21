import { DropType } from '@box/box-design';
import { ROOT_ID, TreeNodeType } from '@box/schema/project/murda-tree';
import {
  EntitiesTreeRDA,
  EntitySeed,
  EntitySoundEnum,
  TreeNode,
} from '@box/schema/project/project-rda';
import type { Logger } from 'pino';
import { sort } from 'ramda';
import { reduxDispatch } from 'src/redux/edit';
import { setRenamingNodeId } from 'src/redux/edit/seeds';
import { searchFirstNode } from 'src/views/edit/components/tree/util';
import { ClientStateType } from '../edit-schema';
import { EditReplicaClient } from '../replica/replica-client';
import { ClientProjectTransaction } from '../replica/transaction/client-project-transaction';

export class SeedController {
  private _tx: ClientProjectTransaction;

  constructor(
    private _state: ClientStateType,
    private _replica: EditReplicaClient,
    private logger: Logger,
  ) {
    this._tx = this._replica.projectTransaction();
  }

  public getTreeNode = (id: string): TreeNode | undefined => {
    return this._state.replica.project.entitiesTree[id];
  };

  public addSeed = (seedId: string, seed: EntitySeed, parentId?: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.add({
          id: seedId,
          type: TreeNodeType.leaf,
          name: seed.name,
          parentId: parentId || ROOT_ID,
          childrenIds: [],
          value: seed,
        }),
      )
      .commit();
  };

  public addTreeNode = (node: Omit<TreeNode, 'type'>) => {
    const { id, name, parentId, childrenIds } = node;
    const { entitiesTree } = this._state.replica.project;

    this._tx.push((action) =>
      action.entitiesTree.add({
        id,
        name,
        type: TreeNodeType.node,
        parentId,
        childrenIds: [],
        value: undefined,
      }),
    );

    // 重新计算插入的位置
    const insertId = searchFirstNode(entitiesTree, childrenIds);
    if (insertId) {
      this._tx.push((action) =>
        action.entitiesTree.move({
          moveIds: [id],
          insertParentId: entitiesTree[insertId].parentId,
          insert: {
            id: insertId,
            type: 'before',
          },
        }),
      );
    }

    // 放孩子
    this._tx.push((action) =>
      action.entitiesTree.move({
        moveIds: this.sortTreeNodes(childrenIds),
        insertParentId: id,
      }),
    );

    reduxDispatch(setRenamingNodeId(id));
    this._tx.commit();
    return;
  };

  public moveTreeNodes = (
    moveTargets: string[],
    dropTarget: string,
    dropType: DropType,
  ) => {
    for (let i = 0; i < moveTargets.length; i++) {
      if (
        moveTargets[i] === dropTarget ||
        this.isChildren(moveTargets[i], dropTarget)
      ) {
        return false;
      }
    }

    const insertParentId =
      dropType === 'box' ? dropTarget : this.getParentId(dropTarget);
    if (!insertParentId) {
      return false;
    }

    this._tx
      .push((action) =>
        action.entitiesTree.move({
          moveIds: this.sortTreeNodes(moveTargets),
          insertParentId,
          insert:
            dropType === 'box'
              ? undefined
              : {
                  id: dropTarget,
                  type: dropType === 'top' ? 'before' : 'after',
                },
        }),
      )
      .commit();

    return true;
  };

  public removeTreeNodes = (nodes: string[]) => {
    this._tx.push((action) => action.entitiesTree.remove(nodes)).commit();
    this.logger.debug('remove entity nodes: %o', nodes);
    return;
  };

  private copyNode = (id: string, newIds: string[], parentId?: string) => {
    const node = this.getTreeNode(id);
    if (!node) {
      return;
    }

    const newNode = EntitiesTreeRDA.nodeSchema.clone(node);
    newNode.id = this.genNodeId(newIds);
    newIds.push(newNode.id);

    if (parentId) {
      newNode.parentId = parentId;
    }

    const nodesInfo: {
      newNode: TreeNode;
      newChildrenNodes: TreeNode[];
    } = {
      newNode,
      newChildrenNodes: [],
    };

    if (!node.childrenIds.length) {
      return nodesInfo;
    }

    newNode.childrenIds.length = 0;
    node.childrenIds.forEach((childId) => {
      const childNodesInfo = this.copyNode(childId, newIds, newNode.id);
      if (!childNodesInfo) {
        return;
      }

      nodesInfo.newNode.childrenIds.push(childNodesInfo.newNode.id);
      nodesInfo.newChildrenNodes.push(childNodesInfo.newNode);
      nodesInfo.newChildrenNodes.push(...childNodesInfo.newChildrenNodes);
    });

    return nodesInfo;
  };

  public copyTreeNodes = (nodes: string[]) => {
    const copyNodes: {
      sourceNodeId: string;
      newNode: TreeNode;
      newChildrenNodes: TreeNode[];
    }[] = [];

    const newIds: string[] = [];
    const newSelectedIds: string[] = [];

    nodes.forEach((nodeId) => {
      const newInfo = this.copyNode(nodeId, newIds);
      if (!newInfo) {
        return;
      }

      copyNodes.push({
        sourceNodeId: nodeId,
        newNode: newInfo.newNode,
        newChildrenNodes: newInfo.newChildrenNodes,
      });

      newSelectedIds.push(newInfo.newNode.id);
    });

    this._tx.push((action) => action.entitiesTree.copy(copyNodes));
    this._tx.commit();
    return newSelectedIds;
  };

  public releaseTreeNode = (treeNodeId: string) => {
    this._tx.push((action) => action.entitiesTree.release(treeNodeId)).commit();
    this.logger.debug('release entity node: %s', treeNodeId);
    return;
  };

  public getBreadcrumbs(node: string) {
    const breadcrumbs: string[] = [];
    let parentId = this.getParentId(node);

    while (parentId && parentId !== ROOT_ID) {
      breadcrumbs.push(parentId);
      parentId = this.getParentId(parentId);
    }
    return breadcrumbs;
  }

  public getRootTreeNodeId(node: string, parentIds?: string[]) {
    const isAtRoot = (id: string | undefined) =>
      !id || id === ROOT_ID || parentIds?.includes(id);

    let parentId: string | undefined = node;
    while (parentId && !isAtRoot(this.getParentId(parentId))) {
      parentId = this.getParentId(parentId);
    }

    return parentId;
  }

  public findIndex = (targetId: string) => {
    const targetTreeNodes = this.getParentChildren(targetId);
    if (!targetTreeNodes) {
      return -1;
    }

    for (let i = 0; i < targetTreeNodes.length; i++) {
      if (targetId === targetTreeNodes[i]) {
        return i;
      }
    }
    return -1;
  };

  public getParentId = (node: string) => {
    return this.getTreeNode(node)?.parentId;
  };

  public getLastChild = (treeNodeId: string) => {
    const node = this.getTreeNode(treeNodeId);
    if (!node || !node.childrenIds.length) {
      return;
    }
    return node.childrenIds[node.childrenIds.length - 1];
  };

  public getParentChildren = (node: string) => {
    const parentId = this.getParentId(node);
    if (!parentId) {
      return;
    }

    return this.getTreeNode(parentId)?.childrenIds.slice();
  };

  private sortTreeNodes = (nodes: string[]) => {
    return sort((a, b) => {
      const breadcrumbsA = this.getBreadcrumbs(a);
      const breadcrumbsB = this.getBreadcrumbs(b);
      let treeNodeIdA = breadcrumbsA.pop();
      let treeNodeIdB = breadcrumbsB.pop();
      while (
        treeNodeIdA === treeNodeIdB &&
        treeNodeIdA !== undefined &&
        treeNodeIdB !== undefined
      ) {
        treeNodeIdA = breadcrumbsA.pop();
        treeNodeIdB = breadcrumbsB.pop();
      }
      const aIndex = this.findIndex(treeNodeIdA || a);
      const bIndex = this.findIndex(treeNodeIdB || b);
      return aIndex - bIndex;
    }, nodes);
  };

  private isChildren = (nodeId: string, dropTarget: string) => {
    const nodeNode = this.getTreeNode(nodeId);
    if (!nodeNode || nodeNode.type === TreeNodeType.leaf) {
      return;
    }
    let parentId = this.getParentId(dropTarget);
    while (parentId && parentId !== ROOT_ID) {
      if (parentId === nodeNode.id) {
        return true;
      }
      parentId = this.getParentId(parentId);
    }
    return false;
  };

  public genNodeId(newIds?: string[]) {
    let shift = 0;
    const checkIds = Object.keys(this._state.replica.project.entitiesTree);
    newIds && checkIds.push(...newIds);
    while (true) {
      shift = Math.max(30, shift + 7);
      const id = (Math.random() * (1 << shift)) >>> 0;
      const idStr = id.toString();
      if (!checkIds.includes(idStr)) {
        return idStr;
      }
    }
  }

  public genNewName(prefix: string) {
    for (let i = 1; true; i++) {
      const newName = `${prefix}-${i}`;
      let exist = false;
      for (const j in this._state.replica.project.entitiesTree) {
        const treeNode = this._state.replica.project.entitiesTree[j];
        if (treeNode.name === newName) {
          exist = true;
        }
        if (exist) {
          break;
        }
      }
      if (!exist) {
        return newName;
      }
    }
  }

  public setName = (nodeId: string, name: string) => {
    const node = this.getTreeNode(nodeId);
    if (!node) {
      return;
    }

    this._tx.push((action) =>
      action.entitiesTree.rename([
        {
          nodeId,
          newName: name,
        },
      ]),
    );

    if (node.value) {
      this._tx.push((action) => action.entitiesTree.update(nodeId).name(name));
    }

    this._tx.commit();
  };

  public setTag = (seedId: string, tagIdx: number, tagName: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).tags.update(tagIdx)(tagName),
      )
      .commit();
  };

  public removeTag = (seedId: string, index: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).tags.splice(index, 1),
      )
      .commit();
  };

  public createTag = (seedId: string, tag: string) => {
    this._tx
      .push((action) => action.entitiesTree.update(seedId).tags.push(tag))
      .commit();
  };

  public setDefaultMotionId = (seedId: string, defaultId?: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).defaultMotionId(defaultId || ''),
      )
      .commit();
  };

  public setRigidBody = (seedId: string, enable: boolean) => {
    this._tx
      .push((action) => action.entitiesTree.update(seedId).fixed(!enable))
      .commit();
  };

  public setCollides = (seedId: string, enable: boolean) => {
    this._tx
      .push((action) => action.entitiesTree.update(seedId).collision(enable))
      .commit();
  };

  public setGravity = (seedId: string, enable: boolean) => {
    this._tx
      .push((action) => action.entitiesTree.update(seedId).gravity(enable))
      .commit();
  };

  public setParticleRate = (seedId: string, rate: number) => {
    this._tx
      .push((action) => action.entitiesTree.update(seedId).particle.rate(rate))
      .commit();
  };

  public setParticleLimit = (seedId: string, limit: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.limit(limit),
      )
      .commit();
  };

  public setParticleLifetime = (seedId: string, lifetime: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.lifetime(lifetime),
      )
      .commit();
  };

  public setParticleLifetimeSpread = (
    seedId: string,
    lifetimeSpread: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree
          .update(seedId)
          .particle.lifetimeSpread(lifetimeSpread),
      )
      .commit();
  };

  public setParticleColor0 = (
    seedId: string,
    color0: { r: number; g: number; b: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.color0(color0),
      )
      .commit();
  };

  public setParticleColor1 = (
    seedId: string,
    color1: { r: number; g: number; b: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.color1(color1),
      )
      .commit();
  };

  public setParticleColor2 = (
    seedId: string,
    color2: { r: number; g: number; b: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.color2(color2),
      )
      .commit();
  };

  public setParticleColor3 = (
    seedId: string,
    color3: { r: number; g: number; b: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.color3(color3),
      )
      .commit();
  };

  public setParticleColor4 = (
    seedId: string,
    color4: { r: number; g: number; b: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.color4(color4),
      )
      .commit();
  };

  public setParticleSize0 = (seedId: string, size0: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.size0(size0),
      )
      .commit();
  };

  public setParticleSize1 = (seedId: string, size1: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.size1(size1),
      )
      .commit();
  };

  public setParticleSize2 = (seedId: string, size2: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.size2(size2),
      )
      .commit();
  };

  public setParticleSize3 = (seedId: string, size3: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.size3(size3),
      )
      .commit();
  };

  public setParticleSize4 = (seedId: string, size4: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.size4(size4),
      )
      .commit();
  };

  public setSizeSpread = (seedId: string, sizeSpread: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.sizeSpread(sizeSpread),
      )
      .commit();
  };

  public setParticleVelocity = (
    seedId: string,
    velocity: { x: number; y: number; z: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.velocity(velocity),
      )
      .commit();
  };

  public setParticleSpeedSpread = (
    seedId: string,
    speedSpread: { x: number; y: number; z: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.velocitySpread(speedSpread),
      )
      .commit();
  };

  public setParticleAcceleration = (
    seedId: string,
    acceleration: { x: number; y: number; z: number },
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.acceleration(acceleration),
      )
      .commit();
  };

  public setParticleDamping = (seedId: string, damping: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.damping(damping),
      )
      .commit();
  };

  public setParticleNoise = (seedId: string, noise: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.noiseAmpl(noise),
      )
      .commit();
  };

  public setParticleNoiseFreq = (seedId: string, noiseFreq: number) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).particle.noiseFreq(noiseFreq),
      )
      .commit();
  };

  public setSoundHurt = (seedId: string, name: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound.hurt.sample(name),
      )
      .commit();
  };

  public setSoundChat = (seedId: string, name: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound.chat.sample(name),
      )
      .commit();
  };

  public setSoundDie = (seedId: string, name: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound.die.sample(name),
      )
      .commit();
  };

  public setSoundInteract = (seedId: string, name: string) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound.interact.sample(name),
      )
      .commit();
  };

  public setSoundGain = (
    seedId: string,
    type: EntitySoundEnum,
    num: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound[type].gain(num),
      )
      .commit();
  };

  public setSoundGainRange = (
    seedId: string,
    type: EntitySoundEnum,
    num: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound[type].gainRange(num),
      )
      .commit();
  };

  public setSoundPitch = (
    seedId: string,
    type: EntitySoundEnum,
    num: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound[type].pitch(num),
      )
      .commit();
  };

  public setSoundPitchRange = (
    seedId: string,
    type: EntitySoundEnum,
    num: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound[type].pitchRange(num),
      )
      .commit();
  };

  public setSoundRadius = (
    seedId: string,
    type: EntitySoundEnum,
    num: number,
  ) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).sound[type].radius(num),
      )
      .commit();
  };

  public setEditLock = (seedIds: string[], isLock: boolean) => {
    seedIds.map((id) => {
      this._tx.push((action) =>
        action.entitiesTree.update(id).editLock(isLock),
      );
    });
    this._tx.commit();
  };

  public setStaticShadow = (seedId: string, isStatic: boolean) => {
    this._tx
      .push((action) =>
        action.entitiesTree.update(seedId).staticShadow(isStatic),
      )
      .commit();
  };

  public staticShadowHasChanged = (value: {
    [nodeId: string]: boolean | number;
  }) => {
    const { entitiesTree } = this._state.replica.project;
    for (const id in value) {
      const node = entitiesTree[id];
      if (!node || !node.value) {
        continue;
      }

      if (!!value[id] !== node.value.staticShadow) {
        return true;
      }
    }
    return false;
  };

  public setEntitiesStaticShadow = (value: {
    [nodeId: string]: boolean | number;
  }) => {
    const { entitiesTree } = this._state.replica.project;
    Object.keys(value).forEach((id) => {
      const node = entitiesTree[id];
      if (!node || !node.value) {
        return;
      }
      this._tx.push((action) =>
        action.entitiesTree.update(id).staticShadow(!!value[id]),
      );
    });
    this._tx.commit();
  };
}
