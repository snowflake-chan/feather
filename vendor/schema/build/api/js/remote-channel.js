"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerRemoteChannel = void 0;
class ServerRemoteChannel {
    constructor(sendClientEvent, broadcastClientEvent, onServerEvent) {
        this.sendClientEvent = sendClientEvent;
        this.broadcastClientEvent = broadcastClientEvent;
        this.onServerEvent = onServerEvent;
    }
}
exports.ServerRemoteChannel = ServerRemoteChannel;
