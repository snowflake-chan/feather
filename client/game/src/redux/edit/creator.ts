import { ModelType } from '@box/apis';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CreateTabEnum,
  HierarchyPanelEnum,
  LeftNavModeEnum,
  CenterPanelEnum,
} from 'src/views/edit/defs';
/**
 * VOXA - 创作模式
 * 0 - 自由创作(默认)；普通模式
 * 1 - 定向创作-人物装扮;皮肤模式
 */
export enum EditType {
  Normal,
  Skin,
}

type VoxaConfigProps = {
  modelId: number;
  modelType: ModelType;
  editType: EditType;
  projectSkinName?: string;
  projectModelName?: string;
  projectModelPath?: string;
  saveToProject?: boolean;
};

export type VoxaDataType =
  | { isShow: false }
  | ({ isShow: true } & VoxaConfigProps);

export type PanelState = {
  /** 记录当前选中的编辑模式: 搭建Create、脚本Script、界面UI、空 */
  navMode: LeftNavModeEnum;
  /** 记录当前选中的搭建面板Tab: 地形Terrain、模型Models、场景Scene */
  createTab: CreateTabEnum;
  /** 记录当前打开的居中面板: 文件管理、设置、发布、商城 */
  centerPanel: CenterPanelEnum;
  /** 记录当前选中的导览列表: 模型列表、UI列表 */
  hierarchyPanel: HierarchyPanelEnum;
  /** 记录地形画笔是否激活 */
  isTerrainPenActive: boolean;
  /** 记录协作者面板是否打开 */
  isCollaboratorOpen: boolean;
  isShowDebugLogPanel: boolean;
  isShowRightPanel: boolean;
  /** 记录左侧AI面板是否展开 */
  isShowLeftAiPanel: boolean;
  /** 左侧AI面板的宽度（像素） */
  leftAiPanelWidth: number;
  voxaData: VoxaDataType;
};

const initialState: PanelState = {
  navMode: LeftNavModeEnum.Create,
  createTab: CreateTabEnum.Terrain,
  centerPanel: CenterPanelEnum.None,
  hierarchyPanel: HierarchyPanelEnum.Model,
  isTerrainPenActive: false,
  isCollaboratorOpen: false,
  isShowDebugLogPanel: false,
  isShowRightPanel: false,
  /** 左侧AI面板默认展开 */
  isShowLeftAiPanel: true,
  /** 左侧AI面板默认宽度为350px */
  leftAiPanelWidth: 350,
  voxaData: {
    isShow: false,
  },
};

export const creatorSlice = createSlice({
  name: 'creator',
  initialState,
  reducers: {
    setNavMode: (state, action: PayloadAction<LeftNavModeEnum>) => {
      state.navMode = action.payload;
      return state;
    },
    setCreateTab: (state, action: PayloadAction<CreateTabEnum>) => {
      state.createTab = action.payload;
      return state;
    },
    setCenterPanel: (state, action: PayloadAction<CenterPanelEnum>) => {
      state.centerPanel = action.payload;
      return state;
    },
    setHierarchyPanel: (state, action: PayloadAction<HierarchyPanelEnum>) => {
      state.hierarchyPanel = action.payload;
      return state;
    },
    setIsTerrainPenActive: (state, action: PayloadAction<boolean>) => {
      state.isTerrainPenActive = action.payload;
      return state;
    },
    setIsCollaboratorOpen: (state, action: PayloadAction<boolean>) => {
      state.isCollaboratorOpen = action.payload;
      return state;
    },
    setIsShowDebugLogPanel: (state, action: PayloadAction<boolean>) => {
      state.isShowDebugLogPanel = action.payload;
      return state;
    },
    setIsShowRightPanel: (state, action: PayloadAction<boolean>) => {
      state.isShowRightPanel = action.payload;
      return state;
    },
    /** 控制左侧AI面板的显示/隐藏 */
    setIsShowLeftAIPanel: (state, action: PayloadAction<boolean>) => {
      state.isShowLeftAiPanel = action.payload;
      return state;
    },
    /** 设置左侧AI面板的宽度 */
    setLeftAIPanelWidth: (state, action: PayloadAction<number>) => {
      state.leftAiPanelWidth = action.payload;
      return state;
    },
    setVoxaData: (state, action: PayloadAction<VoxaDataType>) => {
      state.voxaData = action.payload;
      return state;
    },
  },
});

export const {
  setNavMode,
  setCenterPanel,
  setHierarchyPanel,
  setCreateTab,
  setIsTerrainPenActive,
  setIsCollaboratorOpen,
  setIsShowDebugLogPanel,
  setIsShowRightPanel,
  setIsShowLeftAIPanel,
  setLeftAIPanelWidth,
  setVoxaData,
} = creatorSlice.actions;
