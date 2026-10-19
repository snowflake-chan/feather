import type { UILayoutType, UITree } from '@box/schema/project/ui-rda/defs';
import type { BuildSystem } from '../../../build-system';
import {
  isUIElement,
  isUIScreen,
  isUITextElement,
  pickAutoLayoutProp,
} from '@box/schema/project/ui-rda/util';

const fromVersion = '0.0.0';
const toVersion = '0.0.1';

async function noMigration(bs: BuildSystem, hash: string) {
  return hash;
}

// project 中 0.3.19 -> 0.3.25 uiTree的改动
// 主要做了以下几件事：
// 1, 添加“布局”属性: layoutOrder:1,layout:noneLayout
// 2, 新增“裁剪”属性: clipsDescendants:false；删除没用的oderType
// 3, 文本框添加 autoWordWrap: false,textLineHeight: 1.2
// 4, 屏幕添加zIndex:1
async function uiTreeMigration(bs: BuildSystem, hash: string) {
  const uiTree: UITree = await bs.retrieveJSON(hash);

  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const noneLayout: UILayoutType = {
      type: 'none',
      data: undefined,
    };

    if (isUIElement(treeNode.value)) {
      //layout
      if (treeNode.value.data.data.layout === undefined) {
        treeNode.value.data.data.layout = noneLayout;
      }
      // layoutOrder
      if (treeNode.value.data.data.layoutOrder === undefined) {
        treeNode.value.data.data.layoutOrder = 1;
      }
      // clipsDescendants
      if (treeNode.value.data.data.clipsDescendants === undefined) {
        treeNode.value.data.data.clipsDescendants = false;
      }

      // 文本框添加 autoWordWrap: false,textLineHeight: 1.2
      if (isUITextElement(treeNode.value.data)) {
        if (treeNode.value.data.data.autoWordWrap === undefined) {
          treeNode.value.data.data.autoWordWrap = false;
        }
        if (treeNode.value.data.data.textLineHeight === undefined) {
          treeNode.value.data.data.textLineHeight = 1.2;
        }
      }
    } else if (isUIScreen(treeNode.value)) {
      // 屏幕添加layout
      if (treeNode.value.data.layout === undefined) {
        treeNode.value.data.layout = noneLayout;
      }
      // 屏幕添加zIndex
      if (treeNode.value.data.zIndex === undefined) {
        treeNode.value.data.zIndex = 1;
      }
    }

    const autoLayout = pickAutoLayoutProp(treeNode.value);

    // 删除没用的oderType
    if (autoLayout) {
      delete autoLayout.data['orderType'];
    }
  });

  return bs.storeJSON(uiTree);
}

export const UiTree_001 = {
  name: 'uiTree',
  fromVersion,
  toVersion,
  migration: uiTreeMigration,
};

export const AudioAssets_001 = {
  name: 'audioAssets',
  fromVersion,
  toVersion,
  migration: noMigration,
};
