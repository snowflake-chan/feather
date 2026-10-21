import { MuClient } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import {
  ProtocolPerfSchema,
  compareMessage,
  MessagePerfSchema,
  MessageRankSchema,
} from './perf-client-schema';

let prevFrame = 0;

export function tickPerf(state: GameClientState, client: MuClient) {
  const perf = state.perf;
  const sessionId = client.sessionId;
  const bandwidth = client.bandwidth;

  // frametime
  const now = Date.now();
  if (prevFrame) {
    perf.frametime = now - prevFrame;
  }
  prevFrame = now;

  // clear message queue
  MessageRankSchema.assign(perf.sentMessages, MessageRankSchema.identity);
  MessageRankSchema.assign(perf.recvMessages, MessageRankSchema.identity);

  // upBandwidth/downBandwidth
  let upBandwidth = 0;
  let downBandwidth = 0;
  let upCount = 0;
  let downCount = 0;
  for (let i = 0; i < bandwidth.length; ++i) {
    const protocolName = client.protocols[i].schema.name || `protocol${i}`;
    const protocolStats = bandwidth[i][sessionId];
    const protocolReport =
      perf.protocolBandwidth[protocolName] ||
      (perf.protocolBandwidth[protocolName] = ProtocolPerfSchema.alloc());
    {
      let protocolUpBandwidth = 0;
      let protocolUpCount = 0;
      const sentMessages = Object.keys(protocolStats.sent);
      for (let j = 0; j < sentMessages.length; ++j) {
        const messageName = sentMessages[j];
        const messageBandwidth = protocolStats.sent[messageName];
        if (!(messageName in protocolReport.sent)) {
          const messageReport = MessagePerfSchema.alloc();
          messageReport.name = protocolName + '.' + messageName;
          messageReport.bandwidth = messageReport.totalBandwidth =
            messageBandwidth.bytes;
          messageReport.count = messageReport.totalCount =
            messageBandwidth.count;
          protocolReport.sent[messageName] = messageReport;
          perf.sentMessages.push(MessagePerfSchema.clone(messageReport));
        } else {
          const messageReport = protocolReport.sent[messageName];
          messageReport.bandwidth =
            messageBandwidth.bytes - messageReport.totalBandwidth;
          messageReport.totalBandwidth = messageBandwidth.bytes;
          messageReport.count =
            messageBandwidth.count - messageReport.totalCount;
          messageReport.totalCount = messageBandwidth.count;
          perf.sentMessages.push(MessagePerfSchema.clone(messageReport));
        }
        protocolUpBandwidth += messageBandwidth.bytes;
        protocolUpCount += messageBandwidth.count;
      }
      protocolReport.upBandwidth =
        protocolUpBandwidth - protocolReport.totalUpBandwidth;
      protocolReport.totalUpBandwidth = protocolUpBandwidth;
      upBandwidth += protocolUpBandwidth;
      protocolReport.upCount = protocolUpCount - protocolReport.totalUpCount;
      protocolReport.totalUpCount = protocolUpCount;
      upCount += protocolUpCount;
    }
    {
      let protocolDownBandwidth = 0;
      let protocolDownCount = 0;
      const recvMessages = Object.keys(protocolStats.received);
      for (let j = 0; j < recvMessages.length; ++j) {
        const messageName = recvMessages[j];
        const messageBandwidth = protocolStats.received[messageName];
        if (!(messageName in protocolReport.recv)) {
          const messageReport = MessagePerfSchema.alloc();
          messageReport.name = protocolName + '.' + messageName;
          messageReport.bandwidth = messageReport.totalBandwidth =
            messageBandwidth.bytes;
          messageReport.count = messageReport.totalCount =
            messageBandwidth.count;
          protocolReport.recv[messageName] = messageReport;
          perf.recvMessages.push(MessagePerfSchema.clone(messageReport));
        } else {
          const messageReport = protocolReport.recv[messageName];
          messageReport.bandwidth =
            messageBandwidth.bytes - messageReport.totalBandwidth;
          messageReport.totalBandwidth = messageBandwidth.bytes;
          messageReport.count =
            messageBandwidth.count - messageReport.totalCount;
          messageReport.totalCount = messageBandwidth.count;
          perf.recvMessages.push(MessagePerfSchema.clone(messageReport));
        }
        protocolDownBandwidth += messageBandwidth.bytes;
        protocolDownCount += messageBandwidth.count;
      }
      protocolReport.downBandwidth =
        protocolDownBandwidth - protocolReport.totalDownBandwidth;
      protocolReport.totalDownBandwidth = protocolDownBandwidth;
      downBandwidth += protocolDownBandwidth;
      protocolReport.downCount =
        protocolDownCount - protocolReport.totalDownCount;
      protocolReport.totalDownCount = protocolDownCount;
      downCount += protocolDownCount;
    }
  }

  // update global bandwidth counters
  perf.upBandwidth = upBandwidth - perf.totalUpBandwidth;
  perf.downBandwidth = downBandwidth - perf.totalDownBandwidth;
  perf.upCount = upCount - perf.totalUpCount;
  perf.downCount = downCount - perf.totalDownCount;
  perf.totalUpBandwidth = upBandwidth;
  perf.totalDownBandwidth = downBandwidth;
  perf.totalUpCount = upCount;
  perf.totalDownCount = downCount;

  // sort message queues
  perf.sentMessages.sort(compareMessage);
  perf.recvMessages.sort(compareMessage);

  // numObjects
  perf.numObjects = state.bodies.length;
}
