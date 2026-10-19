import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  createPlayerUserKey,
  signRuntimePlayerIdentity,
  verifyRuntimePlayerIdentity,
} from '@box/utils/local-player-identity';

import { LocalDataStorage } from '../src/storage/local-data-storage';

const {
  resolveMapRuntimeNamespace,
  resolveGroupRuntimeNamespace,
} = require('../../../apps/local-engine/src/runtime-storage-namespace');
const {
  createTeleportRoomManager,
} = require('../../../apps/local-engine/src/teleport-room-manager');

const mainPermanentMapId = '11111111111111111111';
const subPermanentMapId = '22222222222222222222';
const permanentMapGroupId = '33333333333333333333';
const identitySecret = 'teleport-continuity-regression-secret';
const account = {
  subjectId: '0123456789abcdef0123456789abcdef',
  userId: '42',
  username: 'local_player',
  boxId: 'legacy-box-player',
  displayName: '传送测试玩家',
  avatar: 'avatar-hash',
  avatarSkinId: 'explorer',
  creatorAccess: false,
  creatorPermissions: [],
  role: 'player',
  status: 'active',
} as const;

const logger = {
  log() {},
  error() {},
} as any;

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-teleport-continuity-'));
  try {
    const sourceIdentity = verifyRuntimePlayerIdentity(
      signRuntimePlayerIdentity(account, identitySecret, 60_000),
      identitySecret,
    );
    const targetIdentity = verifyRuntimePlayerIdentity(
      signRuntimePlayerIdentity(account, identitySecret, 60_000),
      identitySecret,
    );
    assert.ok(sourceIdentity);
    assert.ok(targetIdentity);

    const sourceUserKey = createPlayerUserKey(sourceIdentity.subjectId, identitySecret);
    const targetUserKey = createPlayerUserKey(targetIdentity.subjectId, identitySecret);
    assert.deepEqual(
      {
        userId: targetIdentity.userId,
        userKey: targetUserKey,
        boxId: targetIdentity.boxId,
      },
      {
        userId: sourceIdentity.userId,
        userKey: sourceUserKey,
        boxId: sourceIdentity.boxId,
      },
    );

    const maps = [
      {
        id: 'main-map',
        permanentMapId: mainPermanentMapId,
        permanentMapGroupId,
      },
      {
        id: 'sub-map',
        permanentMapId: subPermanentMapId,
        permanentMapGroupId,
      },
    ];
    const roomManager = createTeleportRoomManager({
      resolveMap: (reference: string) =>
        maps.find((map) => map.id === reference || map.permanentMapId === reference) || null,
      randomRoomId: () => 'continuity-room-123456',
    });
    const room = await roomManager.allocate({
      sourceMapId: mainPermanentMapId,
      targetMapId: subPermanentMapId,
      subjectIds: [sourceIdentity.subjectId],
    });
    assert.equal(
      roomManager.authorize({
        targetMapReference: room.playHash,
        serverId: room.serverId,
        subjectId: targetIdentity.subjectId,
      }).id,
      room.serverId,
    );

    const groupNamespace = resolveGroupRuntimeNamespace({
      permanentMapGroupId,
      permanentMapId: mainPermanentMapId,
      mapId: 'main-map',
    });
    const sourceStorage = new LocalDataStorage({
      storagePath: root,
      projectNamespace: resolveMapRuntimeNamespace({ permanentMapId: mainPermanentMapId }),
      groupNamespace,
      mode: 'play',
      lockTimeoutMs: 1_000,
      logger,
    });
    const targetStorage = new LocalDataStorage({
      storagePath: root,
      projectNamespace: resolveMapRuntimeNamespace({ permanentMapId: subPermanentMapId }),
      groupNamespace: resolveGroupRuntimeNamespace({
        permanentMapGroupId,
        permanentMapId: subPermanentMapId,
        mapId: 'sub-map',
      }),
      mode: 'play',
      lockTimeoutMs: 1_000,
      logger,
    });
    await Promise.all([sourceStorage.connect(), targetStorage.connect()]);
    try {
      const transferKey = `${room.serverId}:${sourceUserKey}`;
      const transferValue = { checkpoint: 'sub-map-spawn', score: 27 };
      await sourceStorage.set('group', 'teleportTransfer', transferKey, transferValue);
      assert.deepEqual(
        (await targetStorage.get('group', 'teleportTransfer', transferKey))?.value,
        transferValue,
      );

      await sourceStorage.set('project', 'privateState', sourceUserKey, {
        sourceOnly: true,
      });
      assert.equal(
        await targetStorage.get('project', 'privateState', targetUserKey),
        undefined,
      );
    } finally {
      await Promise.all([sourceStorage.close(), targetStorage.close()]);
    }

    console.log('teleport player continuity regression passed');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
