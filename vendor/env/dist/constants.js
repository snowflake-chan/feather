'use strict';

exports.FeatureFlag = void 0;
(function(FeatureFlag) {
    FeatureFlag["Vobi"] = "vobi";
    FeatureFlag["StorageJava"] = "dataStorageJava";
    // Play端能否启用WebGPU
    FeatureFlag["WebGPU"] = "WebGPU";
    // Edit端能否启用WebGPU
    FeatureFlag["WebGPUEdit"] = "WebGPUEdit";
    FeatureFlag["Ai"] = "ai";
    // 是否启用防沉迷（时间限制）功能
    FeatureFlag["TimeRestriction"] = "timeRestriction";
    // 当启用时，使用 silconflow 作为 AI provider（OpenAI 兼容）
    FeatureFlag["SilconFlow"] = "silconFlow";
})(exports.FeatureFlag || (exports.FeatureFlag = {}));
//# sourceMappingURL=constants.js.map
