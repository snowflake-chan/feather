/**
 * 错误码规范：{status:T; code:number, msg: string}
 * code: 错误码
 * status: 错误类型
 * msg: 错误描述
 */
export type CommonError<T> = {
  status: T;
  code: number;
  msg: string;
};
