"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyframeEaseMode = exports.AnimationPlaybackMode = void 0;
var AnimationPlaybackMode;
(function (AnimationPlaybackMode) {
    AnimationPlaybackMode[AnimationPlaybackMode["FORWARD"] = 0] = "FORWARD";
    AnimationPlaybackMode[AnimationPlaybackMode["REVERSE"] = 1] = "REVERSE";
    AnimationPlaybackMode[AnimationPlaybackMode["MIRROR"] = 2] = "MIRROR";
    AnimationPlaybackMode[AnimationPlaybackMode["MIRROR_REVERSE"] = 3] = "MIRROR_REVERSE";
    AnimationPlaybackMode[AnimationPlaybackMode["WRAP"] = 4] = "WRAP";
    AnimationPlaybackMode[AnimationPlaybackMode["WRAP_REVERSE"] = 5] = "WRAP_REVERSE";
})(AnimationPlaybackMode || (exports.AnimationPlaybackMode = AnimationPlaybackMode = {}));
var KeyframeEaseMode;
(function (KeyframeEaseMode) {
    KeyframeEaseMode[KeyframeEaseMode["NONE"] = 0] = "NONE";
    KeyframeEaseMode[KeyframeEaseMode["LINEAR"] = 1] = "LINEAR";
    KeyframeEaseMode[KeyframeEaseMode["QUADRATIC"] = 2] = "QUADRATIC";
    KeyframeEaseMode[KeyframeEaseMode["SINE"] = 3] = "SINE";
    KeyframeEaseMode[KeyframeEaseMode["EXP"] = 4] = "EXP";
    KeyframeEaseMode[KeyframeEaseMode["BACK"] = 5] = "BACK";
    KeyframeEaseMode[KeyframeEaseMode["ELASTIC"] = 6] = "ELASTIC";
    KeyframeEaseMode[KeyframeEaseMode["BOUNCE"] = 7] = "BOUNCE";
    KeyframeEaseMode[KeyframeEaseMode["CIRCLE"] = 8] = "CIRCLE";
})(KeyframeEaseMode || (exports.KeyframeEaseMode = KeyframeEaseMode = {}));
//# sourceMappingURL=type.js.map