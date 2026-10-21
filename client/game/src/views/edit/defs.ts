/** 导航栏-左侧-模式 互斥*/
export enum LeftNavModeEnum {
  NoneMode = 'NoneMode',
  /** 搭建面板 */
  Create = 'GameEditor',
  /** 编码面板 */
  Script = 'ScriptEditor',
  /** UI面板 */
  UI = 'UIEditor',
  /** 模型面板 */
  Model = 'Model',
}

/** 导航栏-右侧-全局控制功能  */
export enum RightNavCtrlEnum {
  /** 游客申请编辑 */
  Guest = 'Guest',
  /** 右侧列表 */
  RightPanel = 'RightPanel',
  /** 聊天 */
  Chat = 'Chat',
  /** 全屏切换 */
  FullScreen = 'FullScreen',
  /** 调试台 */
  DebugLog = 'DebugLog',
  /** 运行按钮 */
  Run = 'Run',
  /** 协作者面板 */
  Collaborator = 'Collaborator',
}

/** 导航栏-居中面板 互斥 */
export enum CenterPanelEnum {
  None = 'None',
  /** 文件管理-弹窗 */
  FileSystem = 'FileSystem',
  /** 设置-弹窗 */
  Setting = 'Setting',
  /** 发布-弹窗 */
  Publish = 'Publish',
  /** 商城-弹窗 */
  StoreSettings = 'StoreSettings',
  /** 地图隐私管理面板 */
  MapPrivacy = 'MapPrivacy',
  /** 玩家模块-弹窗 */
  PlayerModule = 'PlayerModule',
}

/** 搭建面板Tab 互斥 */
export enum CreateTabEnum {
  /** 地形-面板 */
  Terrain = 'Terrain',
  /** 场景-面板 */
  Scene = 'Environment',
}

/** 右侧面板-导览列表  互斥*/
export enum HierarchyPanelEnum {
  /** 模型列表 */
  Model = 'MODEL',
  /** UI列表 */
  GameUI = 'GAME_UI',
}

export type MouseRectType = {
  show: boolean;
  width: number;
  height: number;
  top: number;
  left: number;
};
