'use strict';

const crypto = require('crypto');
const { normalizeMapIdentity } = require('./map-identity');

const roomIdPattern = /^[A-Za-z0-9_-]{16,128}$/;

function roomError(code, message, statusCode = 400) {
    return Object.assign(new Error(message), { code, statusCode });
}

function positiveInteger(value, fallback, maximum) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

function mapIdentity(map) {
    if (!map || typeof map.id !== 'string' || !map.id) {
        throw roomError('MAP_NOT_FOUND', '地图不存在', 404);
    }
    const groupId = String(
        map.permanentMapGroupId ||
            map.manifest?.permanentMapGroupId ||
            map.mapGroupId ||
            map.manifest?.mapGroupId ||
            map.mainProjectId ||
            map.manifest?.mainProjectId ||
            '',
    );
    if (!groupId) {
        throw roomError('MAP_GROUP_MISSING', '地图缺少地图组身份', 409);
    }
    const permanentMapId = normalizeMapIdentity(map.permanentMapId || map.manifest?.permanentMapId);
    if (!permanentMapId) {
        throw roomError('MAP_ID_MISSING', '地图缺少有效且不可变的永久地图 ID', 409);
    }
    return { id: map.id, permanentMapId, groupId };
}

function normalizedSubjects(subjectIds) {
    if (!Array.isArray(subjectIds) || subjectIds.length === 0 || subjectIds.length > 50) {
        throw roomError('INVALID_PLAYERS', '传送玩家数量无效');
    }
    const subjects = [...new Set(subjectIds.map((value) => String(value || '').trim()))];
    if (subjects.some((value) => !value || value.length > 128)) {
        throw roomError('INVALID_PLAYERS', '传送玩家身份无效');
    }
    return subjects;
}

function tokenMatches(actual, expected) {
    const left = Buffer.from(String(actual || ''));
    const right = Buffer.from(String(expected || ''));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function readJSONBody(req, maximumBytes = 64 * 1024) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > maximumBytes) {
            throw roomError('REQUEST_TOO_LARGE', '传送请求过大', 413);
        }
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
        throw roomError('INVALID_REQUEST', '传送请求格式无效');
    }
}

function createTeleportControlHandler({ manager, internalToken }) {
    if (!internalToken) {
        throw new Error('Teleport control requires an internal token');
    }
    return async function handleTeleportControlRequest(req, res) {
        const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
        if (!pathname.startsWith('/__local_teleport/')) {
            return false;
        }
        res.setHeader('cache-control', 'no-store');
        res.setHeader('content-type', 'application/json; charset=utf-8');
        if (
            req.method !== 'POST' ||
            !tokenMatches(req.headers['x-box-teleport-token'], internalToken)
        ) {
            res.writeHead(req.method === 'POST' ? 403 : 405);
            res.end(JSON.stringify({ code: 'ACCESS_DENIED', message: '拒绝访问' }));
            return true;
        }
        try {
            const body = await readJSONBody(req);
            if (pathname === '/__local_teleport/allocate') {
                const result = await manager.allocate(body);
                res.writeHead(200);
                res.end(JSON.stringify(result));
                return true;
            }
            if (pathname === '/__local_teleport/authorize') {
                const room = manager.authorize(body);
                res.writeHead(200);
                res.end(
                    JSON.stringify({
                        authorized: true,
                        serverId: room.id,
                        targetMapId: room.targetMapId,
                    }),
                );
                return true;
            }
            res.writeHead(404);
            res.end(JSON.stringify({ code: 'NOT_FOUND', message: '接口不存在' }));
        } catch (error) {
            res.writeHead(error.statusCode || 500);
            res.end(
                JSON.stringify({
                    code: error.code || 'UNKNOWN',
                    message: error.message || '传送服务异常',
                }),
            );
        }
        return true;
    };
}

function createTeleportRoomManager({
    resolveMap,
    ensureRuntime = async () => undefined,
    stopRuntime = async () => undefined,
    isRoomActive = () => false,
    randomRoomId = () => crypto.randomBytes(24).toString('base64url'),
    now = Date.now,
    roomIdleTimeoutMs = 15 * 60_000,
    maxRooms = 64,
    roomIdleTimeoutForMap,
    maxRoomsForMap,
}) {
    const rooms = new Map();
    const idleAfter = positiveInteger(roomIdleTimeoutMs, 15 * 60_000, 7 * 24 * 60 * 60_000);
    const maximum = positiveInteger(maxRooms, 64, 1024);
    const idleAfterFor = (mapId) =>
        positiveInteger(roomIdleTimeoutForMap?.(mapId), idleAfter, 7 * 24 * 60 * 60_000);
    const maximumFor = (mapId) => positiveInteger(maxRoomsForMap?.(mapId), maximum, 10_000);

    function resolve(reference) {
        const normalized = normalizeMapIdentity(reference);
        if (!normalized) {
            throw roomError(
                'MAP_ID_REQUIRED',
                'world.teleport() 的 mapId 必须填写目标地图不可变的永久地图 ID',
            );
        }
        const map = resolveMap(normalized);
        const identity = mapIdentity(map);
        if (identity.permanentMapId !== normalized) {
            throw roomError('MAP_ID_MISMATCH', '永久地图 ID 不匹配', 409);
        }
        return map;
    }

    function resolveInternalReference(reference) {
        const normalized = String(reference || '').trim();
        const map = resolveMap(normalized);
        if (!map) {
            throw roomError('MAP_NOT_FOUND', '地图不存在', 404);
        }
        return map;
    }

    function touch(room) {
        room.lastAccessAt = now();
        return room;
    }

    async function collectIdle() {
        const timestamp = now();
        const expired = [...rooms.values()]
            .filter(
                (room) =>
                    !isRoomActive(room.id) &&
                    timestamp - room.lastAccessAt >=
                        (room.idleTimeoutMs || idleAfterFor(room.targetMapId)),
            )
            .map((room) => room.id);
        for (const roomId of expired) {
            rooms.delete(roomId);
            await stopRuntime(roomId);
        }
        return expired;
    }

    async function allocate({
        sourceMapId,
        targetMapId,
        subjectIds,
        serverId = '',
        mode = 'play',
    }) {
        const source = resolve(sourceMapId);
        const target = resolve(targetMapId);
        const sourceIdentity = mapIdentity(source);
        const targetIdentity = mapIdentity(target);
        if (sourceIdentity.groupId !== targetIdentity.groupId) {
            throw roomError('MAP_GROUP_MISMATCH', '只能传送到同一地图组内的地图', 403);
        }
        const subjects = normalizedSubjects(subjectIds);

        if (mode === 'edit') {
            return { playHash: targetIdentity.id, serverId: targetIdentity.permanentMapId };
        }
        if (serverId === 'public' || serverId === targetIdentity.permanentMapId) {
            return { playHash: targetIdentity.id, serverId: targetIdentity.permanentMapId };
        }

        let room;
        let createdRoom = false;
        if (serverId) {
            if (!roomIdPattern.test(serverId)) {
                throw roomError('INVALID_ROOM_ID', '房间 ID 无效');
            }
            room = rooms.get(serverId);
            if (!room) {
                throw roomError('ROOM_NOT_FOUND', '传送房间不存在或已回收', 404);
            }
            if (
                room.targetMapId !== targetIdentity.permanentMapId ||
                room.mapGroupId !== targetIdentity.groupId
            ) {
                throw roomError('ROOM_TARGET_MISMATCH', '传送房间与目标地图不匹配', 403);
            }
        } else {
            await collectIdle();
            const roomLimit = maximumFor(targetIdentity.permanentMapId);
            const roomCount = [...rooms.values()].filter(
                (candidate) => candidate.targetMapId === targetIdentity.permanentMapId,
            ).length;
            if (roomCount >= roomLimit) {
                throw roomError(
                    'ROOM_CAPACITY_REACHED',
                    `私有房间数量已达上限（${roomLimit}）`,
                    503,
                );
            }
            const roomId = randomRoomId();
            if (!roomIdPattern.test(roomId) || rooms.has(roomId)) {
                throw roomError('ROOM_ID_GENERATION_FAILED', '无法生成唯一房间 ID', 500);
            }
            room = {
                id: roomId,
                targetMapId: targetIdentity.permanentMapId,
                mapGroupId: targetIdentity.groupId,
                subjects: new Set(),
                createdAt: now(),
                lastAccessAt: now(),
                idleTimeoutMs: idleAfterFor(targetIdentity.permanentMapId),
            };
            rooms.set(room.id, room);
            createdRoom = true;
        }

        for (const subject of subjects) {
            room.subjects.add(subject);
        }
        touch(room);
        try {
            await ensureRuntime(target, room.id);
        } catch (error) {
            if (createdRoom) {
                rooms.delete(room.id);
            }
            throw error;
        }
        return { playHash: targetIdentity.id, serverId: room.id };
    }

    function resolveRoom({ targetMapId, targetMapReference, serverId }, shouldTouch = true) {
        if (!roomIdPattern.test(String(serverId || ''))) {
            throw roomError('INVALID_ROOM_ID', '房间 ID 无效');
        }
        // world.teleport() remains permanent-ID-only, but after a successful allocation
        // the client reconnects with playHash, which is the target world's local
        // runtime route. Only the token-protected internal authorization path may
        // resolve that route; the room's stored map/group identity checks below still
        // prevent it from authorizing a different map.
        const target = targetMapReference
            ? resolveInternalReference(targetMapReference)
            : resolve(targetMapId);
        const targetIdentity = mapIdentity(target);
        const room = rooms.get(serverId);
        if (!room) {
            throw roomError('ROOM_NOT_FOUND', '传送房间不存在或已回收', 404);
        }
        if (
            room.targetMapId !== targetIdentity.permanentMapId ||
            room.mapGroupId !== targetIdentity.groupId
        ) {
            throw roomError('ROOM_TARGET_MISMATCH', '传送房间与目标地图不匹配', 403);
        }
        return { room: shouldTouch ? touch(room) : room, target };
    }

    function listRooms(targetMapId) {
        return [...rooms.values()]
            .filter((room) => room.targetMapId === targetMapId)
            .map((room) => ({
                roomId: room.id,
                active: isRoomActive(room.id),
                createdAt: room.createdAt,
                lastAccessAt: room.lastAccessAt,
            }));
    }

    async function destroyRoom(roomId) {
        const room = rooms.get(roomId);
        if (!room) {
            return false;
        }
        rooms.delete(roomId);
        await stopRuntime(roomId);
        return true;
    }

    function authorize({ targetMapId, targetMapReference, serverId, subjectId }) {
        const { room } = resolveRoom({ targetMapId, targetMapReference, serverId }, false);
        const subject = String(subjectId || '').trim();
        if (!subject || !room.subjects.has(subject)) {
            throw roomError('ROOM_ACCESS_DENIED', '玩家未被传送到该私有房间', 403);
        }
        return touch(room);
    }

    return {
        allocate,
        authorize,
        resolveRoom,
        listRooms,
        destroyRoom,
        collectIdle,
        maximum,
        idleAfter,
    };
}

module.exports = {
    createTeleportControlHandler,
    createTeleportRoomManager,
    roomError,
    roomIdPattern,
};
