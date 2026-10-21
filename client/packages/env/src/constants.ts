export enum FeatureFlag {
  Vobi = 'vobi',
  StorageJava = 'dataStorageJava',
  // Play端能否启用WebGPU
  WebGPU = 'WebGPU',
  // Edit端能否启用WebGPU
  WebGPUEdit = 'WebGPUEdit',
  Ai = 'ai',
  // 是否启用防沉迷（时间限制）功能
  TimeRestriction = 'timeRestriction',
  // 当启用时，使用 silconflow 作为 AI provider（OpenAI 兼容）
  SilconFlow = 'silconFlow',
}
