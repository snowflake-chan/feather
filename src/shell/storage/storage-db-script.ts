import {
  GameDataStorage,
  ListPageOptions,
  JSONValue,
  ReturnValue,
  QueryList,
  DB_ERROR_STATUS,
  ListReturnValue,
} from '@box/schema/api/js/storage';
import { CommonError } from '@box/schema/api/js/error';
import { MuClientProtocol } from '@box/mudb/client';
import { StorageProtocol, DBType } from './storage-protocol';
import { Logger } from '@box/utils/logger';
import { PromiseWrapper } from '../utils/script-promise';
// isolate-vm 环境没有Buffer，故使用non-secure
import { nanoid } from 'nanoid/non-secure';

const MAX_KEY_BYTES = 1024;
const MAX_VALUE_BYTES = 4 * 1024 * 1024;

export type ErrorType = CommonError<DB_ERROR_STATUS>;

const errorMsgList: { [k in DB_ERROR_STATUS]: ErrorType } = {
  // 存储空间名为空，或不满足限制要求。
  DB_NAME_INVALID: {
    status: 'DB_NAME_INVALID',
    code: 400,
    msg: 'Invalid data storage name.',
  },
  // 数据key不合法
  KEY_INVALID: {
    status: 'KEY_INVALID',
    code: 400,
    msg: 'Invalid data key.',
  },
  // 数据值不合法
  VALUE_INVALID: {
    status: 'VALUE_INVALID',
    code: 400,
    msg: 'Invalid data value.',
  },
  // 递增值不是数字类型
  INCREMENT_INVALID: {
    status: 'INCREMENT_INVALID',
    code: 400,
    msg: 'The increment value should be a numeric type.',
  },
  // 参数不合法
  PARAMS_INVALID: {
    status: 'PARAMS_INVALID',
    code: 400,
    msg: 'Invalid parameters.',
  },
  // 服务由于网络原因请求失败
  SERVER_FETCH_ERROR: {
    status: 'SERVER_FETCH_ERROR',
    code: 500,
    msg: 'Server network error.',
  },
  // 请求被限流
  REQUEST_THROTTLED: {
    status: 'REQUEST_THROTTLED',
    code: 429,
    msg: 'Too Many Requests.',
  },
  // 未知的服务器错误
  UNKNOWN: {
    status: 'UNKNOWN',
    code: 500,
    msg: 'Unknown server error.',
  },
  // 约束条件的层级超过5层
  CONSTRAINT_TARGET_INVALID: {
    status: 'CONSTRAINT_TARGET_INVALID',
    code: 500,
    msg: 'Invalid constraintTarget.',
  },
};

function getErrorMsg(key: DB_ERROR_STATUS, errorMsg?: string) {
  let msgObject = errorMsgList[key] || errorMsgList['UNKNOWN'];
  if (errorMsg) {
    msgObject.msg = errorMsg;
  }
  return JSON.stringify(msgObject);
}

export class QueryListWrapper {
  public queryList: QueryList;
  public result: ReturnValue[] = [];

  constructor(
    result,
    public pointer: number,
    private list: (pointer) => Promise<ListReturnValue>,
  ) {
    const { items, isLastPage } = result;
    this.result = items.slice();
    this.queryList = new QueryList(this.getCurrentPage, this.nextPage);
    this.queryList.isLastPage = isLastPage;
  }

  public getCurrentPage = () => {
    return this.result;
  };

  // nextPage即cursor + 1，然后请求list
  public nextPage = async () => {
    this.pointer++;
    const result = await this.list(this.pointer);
    const { items, isLastPage } = result;

    if (items.length > 0) {
      this.result = items.slice();
    }
    this.queryList.isLastPage = isLastPage;
  };
}

export class StorageScriptDB {
  public wrappers: { [key: number]: PromiseWrapper<any> } = {};
  public storage: GameDataStorage;
  private handleCounter = 0;

  constructor(
    public type: DBType,
    private name: string,
    private protocol: MuClientProtocol<typeof StorageProtocol>,
    public logger: Logger,
    public schedule: (event: () => void) => void,
  ) {
    if (!name || name.length > 50) {
      throw new Error(getErrorMsg('DB_NAME_INVALID'));
    }

    this._prepareTable();
    this.storage = new GameDataStorage(
      name,
      this.set,
      this.update,
      this.get,
      this.increment,
      this.list,
      this.remove,
      this.drop,
    );
  }

  drop = async () => {
    const wrapper = new PromiseWrapper<void>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;
    this.protocol.server.message.dbFetch({
      handle,
      type: 'drop',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify(''),
    });
    return wrapper.query;
  };

  private _prepareTable = async () => {
    const wrapper = new PromiseWrapper<void>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;
    this.protocol.server.message.dbFetch({
      handle,
      type: 'createTable',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify(''),
    });
    return wrapper.query;
  };

  private _checkKey(key: string) {
    return typeof key === 'string' && key && key.length <= MAX_KEY_BYTES;
  }

  private _checkValue(value: JSONValue) {
    try {
      return (
        typeof value !== 'undefined' &&
        JSON.stringify(value).length <= MAX_VALUE_BYTES
      );
    } catch (error) {
      return false;
    }
  }

  // set value
  public set = (key: string, value: JSONValue) => {
    if (!this._checkKey(key)) {
      throw new Error(getErrorMsg('KEY_INVALID'));
    }
    if (!this._checkValue(value)) {
      throw new Error(getErrorMsg('VALUE_INVALID'));
    }
    const wrapper = new PromiseWrapper<void>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;

    this.protocol.server.message.dbFetch({
      handle,
      type: 'set',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify({
        key,
        value: value,
      }),
    });

    return wrapper.query;
  };

  // update value
  public update = async (
    key: string,
    handler: (prevValue: ReturnValue) => JSONValue,
  ) => {
    if (!this._checkKey(key)) {
      throw new Error(getErrorMsg('KEY_INVALID'));
    }
    // 用来获取 prev value
    const prevWrapper = new PromiseWrapper<ReturnValue>(this.schedule);
    const prevHandle = (prevWrapper.handle = this.handleCounter++);
    this.wrappers[prevHandle] = prevWrapper;
    const ticket = nanoid();
    this.protocol.server.message.dbFetch({
      handle: prevHandle,
      dbType: this.type,
      type: 'get',
      dbKey: this.name,
      params: JSON.stringify({
        key,
        ticket,
      }),
    });

    // 用户执行产生的wrapper
    const wrapper = new PromiseWrapper<void>(this.schedule);
    const updateHandle = (wrapper.handle = this.handleCounter++);
    this.wrappers[updateHandle] = wrapper;

    try {
      const prevValue = await prevWrapper.query;
      const result = handler(prevValue);

      if (!this._checkValue(result)) {
        throw new Error(getErrorMsg('VALUE_INVALID'));
      }
      this.protocol.server.message.dbFetch({
        handle: updateHandle,
        dbType: this.type,
        type: 'set',
        dbKey: this.name,
        params: JSON.stringify({
          key,
          value: result,
          ticket,
        }),
      });
    } catch (error) {
      wrapper.notifyError(error);
    }
    return wrapper.query;
  };

  // increment value
  public increment = async (key: string, value: number = 1) => {
    if (value && typeof value !== 'number') {
      throw new Error(getErrorMsg('INCREMENT_INVALID'));
    }

    const wrapper = new PromiseWrapper<number>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;

    this.protocol.server.message.dbFetch({
      handle,
      type: 'increment',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify({
        key,
        value,
      }),
    });

    return wrapper.query;
  };

  // get a value with key
  public get = (key: string) => {
    if (!this._checkKey(key)) {
      throw new Error(getErrorMsg('KEY_INVALID'));
    }
    const wrapper = new PromiseWrapper<ReturnValue>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;

    this.protocol.server.message.dbFetch({
      handle,
      type: 'get',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify({
        key,
      }),
    });

    return wrapper.query;
  };

  /**
   *
   * @param options: ListPageOptions
   * @returns ListPageOptions
   *
   */
  public list = async (options: ListPageOptions) => {
    const { cursor, pageSize, constraintTarget, max, min, ascending } = options;
    if (
      typeof cursor !== 'number' ||
      !(typeof pageSize === 'undefined' || typeof pageSize === 'number') ||
      !(typeof max === 'undefined' || typeof max === 'number') ||
      !(typeof min === 'undefined' || typeof min === 'number') ||
      !(typeof ascending === 'undefined' || typeof ascending === 'boolean')
    ) {
      throw new Error(getErrorMsg('PARAMS_INVALID'));
    }

    if (constraintTarget && constraintTarget.split('.').length > 5) {
      throw new Error(getErrorMsg('CONSTRAINT_TARGET_INVALID'));
    }

    const optCursor = cursor > 0 ? cursor : 0;
    const optPageSize = pageSize && pageSize > 0 ? pageSize : 100;

    const listPromiseWrapper = new PromiseWrapper<QueryList>(
      this.schedule,
      (value) => {
        // 获取到value后赋值给QueryListWrapper，调用getCurrentPage时返回
        const listWrapper = new QueryListWrapper(value, optCursor, (cursor) => {
          const wrapper = new PromiseWrapper<ListReturnValue>(this.schedule);
          const handle = (wrapper.handle = this.handleCounter++);

          this.wrappers[handle] = wrapper;
          this._getList(handle, {
            ascending,
            constraintTarget,
            max,
            min,
            pageSize: optPageSize,
            cursor,
          });
          return wrapper.query;
        });
        return listWrapper.queryList;
      },
    );

    const listHandle = (listPromiseWrapper.handle = this.handleCounter++);
    this.wrappers[listHandle] = listPromiseWrapper;
    this._getList(listHandle, {
      ascending,
      constraintTarget,
      max,
      min,
      pageSize: optPageSize,
      cursor: optCursor,
    });

    return listPromiseWrapper.query;
  };

  private _getList = (handle, opts: ListPageOptions) => {
    this.protocol.server.message.dbFetch({
      handle: handle,
      type: 'list',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify(opts),
    });
  };

  // remove a value with key
  public remove = (key: string) => {
    const wrapper = new PromiseWrapper<ReturnValue>(this.schedule);
    const handle = (wrapper.handle = this.handleCounter++);
    this.wrappers[handle] = wrapper;

    const ticket = nanoid();
    this.protocol.server.message.dbFetch({
      handle,
      type: 'remove',
      dbType: this.type,
      dbKey: this.name,
      params: JSON.stringify({
        key,
        ticket,
      }),
    });

    return wrapper.query;
  };

  public fetchDone(handle: number, result) {
    if (this.wrappers[handle]) {
      try {
        if (result) {
          result = JSON.parse(result);
        }
        this.wrappers[handle].notifyDone(result);
        delete this.wrappers[handle];
      } catch (error) {
        this.fetchError(handle, error);
      }
    }
  }

  public fetchError(handle: number, err: string) {
    if (this.wrappers[handle]) {
      try {
        const fetchErr = JSON.parse(err);
        const error = getErrorMsg(fetchErr.status, fetchErr.msg);
        this.wrappers[handle].notifyError(error);
      } catch (error) {
        this.wrappers[handle].notifyError(error);
      }
      delete this.wrappers[handle];
    }
  }
}
