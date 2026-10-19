import { BuildSystem } from '../../type';
import {
  ImageDisplayMode,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import {
  isUIImageNode,
  isUIInputNode,
  isUITextNode,
} from '@box/schema/project/ui-rda/util';

export const name = 'project';
export const fromVersion = '0.3.27';
export const toVersion = '0.3.28';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.28';
  project.prevHash = hash;

  const uiTree = await bs.retrieveJSON(project.uiTree);

  // UI图片元素新增‘展示方式’
  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    if (isUIImageNode(treeNode.value)) {
      treeNode.value.data.data.imageDisplayMode = ImageDisplayMode.Fill;

      return;
    }

    if (isUITextNode(treeNode.value) || isUIInputNode(treeNode.value)) {
      treeNode.value.data.data.textStrokeColor = [255, 255, 255];
      treeNode.value.data.data.textStrokeOpacity = 1;
      treeNode.value.data.data.textStrokeThickness = 0;

      treeNode.value.data.data.textFontFamily = UITextFontFamily.Default;

      return;
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
