import { DB } from '@box/schema/backend/database-type';
import { PlayerSkinHashSchema } from '@box/schema/player/player-schema';
import {
  GameSessionData,
  GameSessionDataSchema,
  UserDetail,
  UserDetailSchema,
} from '@box/schema/session/schema';
import { GameSessionInterface } from '@box/schema/session/type';
import { Logger } from '@box/utils/logger';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { createHash } from 'crypto';
import { createDefaultAvatarSkin } from '../player/default-avatar-skin';
import type { RuntimeRedisStore } from '../redis/runtime-redis';

// TODO Polish getting data from backend
// * Timeouts for all requests
// * Loading indicator on client
// * Try to do sensible things on error or timeout

export class GameSession implements GameSessionInterface {
  private readonly sessionData = new Map<
    string,
    { data: GameSessionData; expiresAt: number }
  >();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;
  private readonly sessionAttempts = new Map<
    string,
    { count: number; resetAt: number }
  >();
  private readonly redisBackedSessions = new Set<string>();
  private lastRedisWarningAt = 0;

  public constructor(
    private logger: Logger,
    private readonly offline = false,
    private readonly sessionTtlMs = 60_000,
    private readonly redis?: RuntimeRedisStore,
    private readonly redisNamespace = 'global',
  ) {
    this.cleanupTimer = setInterval(
      () => this.removeExpiredSessions(),
      Math.max(5_000, Math.min(30_000, this.sessionTtlMs)),
    );
    this.cleanupTimer.unref();
  }

  private sessionKey(sessionId: string) {
    return `box-local:${this.redisNamespace}:session:${sessionId}`;
  }

  private rateLimitKey(ipAddress: string) {
    const identity = createHash('sha256').update(ipAddress).digest('hex');
    return `box-local:${this.redisNamespace}:session-rate:${identity}`;
  }

  private warnRedis(error: unknown, operation: string) {
    const now = Date.now();
    if (now - this.lastRedisWarningAt < 30_000) return;
    this.lastRedisWarningAt = now;
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(
      `Redis ${operation} failed; using in-memory fallback: ${message}`,
    );
  }

  private serialize(data: GameSessionData) {
    const stream = new MuWriteStream(1024);
    try {
      GameSessionDataSchema.diff(GameSessionDataSchema.identity, data, stream);
      return Buffer.from(stream.bytes()).toString('base64');
    } finally {
      stream.destroy();
    }
  }

  private deserialize(value: string) {
    return GameSessionDataSchema.patch(
      GameSessionDataSchema.identity,
      new MuReadStream(Buffer.from(value, 'base64')),
    );
  }

  private deleteSession(sessionId: string) {
    const record = this.sessionData.get(sessionId);
    this.redisBackedSessions.delete(sessionId);
    if (!record) return;
    this.sessionData.delete(sessionId);
    GameSessionDataSchema.free(record.data);
  }

  private removeExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, record] of this.sessionData) {
      if (record.expiresAt <= now) this.deleteSession(sessionId);
    }
  }

  /**
   *
   * @sideEffect
   * @returns
   */
  public async bindUserSession(
    userDetail: UserDetail,
    ipAddress: string,
    sessionId: string,
    referer: string,
    fingerPrint: string,
    region: string,
    deviceHash?: string,
  ) {
    const data = GameSessionDataSchema.alloc();
    UserDetailSchema.assign(data.user, userDetail);
    data.url = referer;
    data.sessionId = sessionId;
    data.name = userDetail.displayname;
    data.tag = userDetail.tag;
    data.ipAddress = ipAddress;
    data.isAdmin = !!(userDetail.permission & DB.UserPermission.gameAdmin);
    data.blocklist = userDetail.blocklist || [];
    data.fingerPrint = fingerPrint;
    data.region = region;
    data.deviceHash = deviceHash || "";

    data.avatarSkin = userDetail.wearing_skins && Object.values(userDetail.wearing_skins).some(Boolean)
      ? userDetail.wearing_skins
      : createDefaultAvatarSkin();

    data.ipAddress = ipAddress;
    this.sessionData.set(sessionId, {
      data,
      expiresAt: Date.now() + Math.max(5_000, this.sessionTtlMs),
    });
    if (this.redis) {
      try {
        await this.redis.setex(
          this.sessionKey(sessionId),
          Math.max(5, Math.ceil(this.sessionTtlMs / 1000)),
          this.serialize(data),
        );
        this.redisBackedSessions.add(sessionId);
      } catch (error) {
        this.warnRedis(error, 'session write');
      }
    }
    return data;
  }

  public async getSessionData(
    sessionId: string,
  ): Promise<GameSessionData | undefined> {
    if (this.redis) {
      try {
        const value = await this.redis.consume(this.sessionKey(sessionId));
        if (value !== undefined) {
          this.deleteSession(sessionId);
          this.redisBackedSessions.delete(sessionId);
          return this.deserialize(value);
        }
        if (this.redisBackedSessions.delete(sessionId)) {
          // Redis successfully stored this local session, so a missing key
          // means it expired or another runtime already consumed it.
          this.deleteSession(sessionId);
          return undefined;
        }
      } catch (error) {
        this.warnRedis(error, 'session consume');
      }
    }
    const record = this.sessionData.get(sessionId);
    if (!record) return undefined;
    const data = record.expiresAt > Date.now()
      ? GameSessionDataSchema.clone(record.data)
      : undefined;
    // A session authorizes one WebSocket connection and cannot be replayed.
    this.deleteSession(sessionId);
    return data;
  }

  public async allowSessionAttempt(ipAddress: string, limit: number) {
    const safeLimit = Math.max(1, limit);
    if (this.redis) {
      try {
        const count = await this.redis.incrementWindow(
          this.rateLimitKey(ipAddress),
          60_000,
        );
        return count <= safeLimit;
      } catch (error) {
        this.warnRedis(error, 'rate limit');
      }
    }

    const now = Date.now();
    const current = this.sessionAttempts.get(ipAddress);
    if (!current || current.resetAt <= now) {
      this.sessionAttempts.set(ipAddress, {
        count: 1,
        resetAt: now + 60_000,
      });
      return true;
    }
    current.count += 1;
    if (this.sessionAttempts.size > 10_000) {
      for (const [key, value] of this.sessionAttempts) {
        if (value.resetAt <= now) this.sessionAttempts.delete(key);
      }
    }
    return current.count <= safeLimit;
  }
}
