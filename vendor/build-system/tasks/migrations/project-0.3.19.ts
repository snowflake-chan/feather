import {
  ROOT_ID,
  ROOT_NAME,
  TreeNodeType,
} from '@box/schema/project/murda-tree';
import {
  DEFAULT_SCREEN_NAME,
  DEFAULT_SCREEN_ID,
} from '@box/schema/project/ui-rda/defs';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.18';
export const toVersion = '0.3.19';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = toVersion;
  project.prevHash = hash;

  const uiTree = {
    [ROOT_ID]: {
      id: ROOT_ID,
      name: ROOT_NAME,
      type: TreeNodeType.root,
      parentId: '',
      childrenIds: [DEFAULT_SCREEN_ID],
      value: undefined,
    },
    /**
     * 默认有一个屏幕
     */
    [DEFAULT_SCREEN_ID]: {
      id: DEFAULT_SCREEN_ID,
      name: DEFAULT_SCREEN_NAME,
      type: TreeNodeType.node,
      parentId: ROOT_ID,
      childrenIds: [],
      value: {
        type: 'screen',
        data: {
          enable: true,
        },
      },
    },
  };

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
