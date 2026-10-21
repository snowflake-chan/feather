"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRTC = exports.GameRTCChannel = void 0;
class GameRTCChannel {
    constructor(add, remove, unpublish, publishMicrophone, getPlayers, destroy, getVolume, setVolume, getMicrophonePermission) {
        this.add = add;
        this.remove = remove;
        this.unpublish = unpublish;
        this.publishMicrophone = publishMicrophone;
        this.getPlayers = getPlayers;
        this.destroy = destroy;
        this.getVolume = getVolume;
        this.setVolume = setVolume;
        this.getMicrophonePermission = getMicrophonePermission;
    }
}
exports.GameRTCChannel = GameRTCChannel;
class GameRTC {
    constructor(createChannel) {
        this.createChannel = createChannel;
    }
}
exports.GameRTC = GameRTC;
//# sourceMappingURL=rtc.js.map