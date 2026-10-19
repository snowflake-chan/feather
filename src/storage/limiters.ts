import { RateLimiter } from 'limiter';
import { DBFetchType } from './storage-protocol';

type KeyLimiter = {
  key: string;
  limiter: RateLimiter;
};

export class StorageLimiters {
  private _maxArrLength = 3000;
  private _playersNum = 70;
  private _setLimitSize = 1024 * 1024 * 4; // 4m/minute set大小限制;
  private _getLimitSize = 1024 * 1024 * 25; // 25m/minute get大小限制
  public setRateLimiter: RateLimiter;
  public getRateLimiter: RateLimiter;
  public setSizeLimiters: KeyLimiter[] = [];
  public getSizeLimiters: KeyLimiter[] = [];

  constructor() {
    const { setLimiter, getLimiter } = this._createLimiters();
    this.setRateLimiter = setLimiter;
    this.getRateLimiter = getLimiter;
  }

  private _createLimiters() {
    const setLimiter = new RateLimiter({
      tokensPerInterval: 60 + this._playersNum * 10,
      interval: 'minute',
      fireImmediately: true,
    });
    const getLimiter = new RateLimiter({
      tokensPerInterval: 10000,
      interval: 'minute',
      fireImmediately: true,
    });

    return { setLimiter, getLimiter };
  }

  public check(
    type: DBFetchType,
    dbKey: string,
    key: string,
    valueSize: number,
  ) {
    // get limit
    if (type === 'get' || type === 'list') {
      const rateChecked = this.getRateLimiter.tryRemoveTokens(1);
      return (
        rateChecked &&
        this._checkKeySize(
          this.getSizeLimiters,
          this._getLimitSize,
          dbKey + key,
          valueSize,
        )
      );
    } else {
      const rateChecked = this.setRateLimiter.tryRemoveTokens(1);
      return (
        rateChecked &&
        this._checkKeySize(
          this.setSizeLimiters,
          this._setLimitSize,
          dbKey + key,
          valueSize,
        )
      );
    }
  }

  // 单个key的大小限流
  private _checkKeySize(
    limiters: KeyLimiter[],
    sizeLimit: number,
    key: string,
    size: number,
  ) {
    let bucket = limiters.find((item) => item.key === key);
    if (!bucket) {
      if (limiters.length >= this._maxArrLength) {
        limiters.splice(0, 100);
      }
      bucket = {
        key,
        limiter: new RateLimiter({
          tokensPerInterval: sizeLimit,
          interval: 'minute',
        }),
      };
      limiters.push(bucket);
      return true;
    }
    return bucket.limiter.tryRemoveTokens(size);
  }

  public reset() {
    const { setLimiter, getLimiter } = this._createLimiters();
    this.setRateLimiter = setLimiter;
    this.getRateLimiter = getLimiter;
    this.setSizeLimiters = [];
    this.getSizeLimiters = [];
  }
}
