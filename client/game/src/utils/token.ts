import { getQueryParam } from 'src/utils/url-helpers';
import { WebsiteStorage } from 'src/utils/storage/website';

/**
 * 在内存中存放 token，防止 localStorage 内的数据泄漏
 * 后续的 token 应当优先选择使用后端种的 Cookie，其次使用这里的值
 * 当用户禁用 Cookie 时，将不会为它存储登录态
 */
let token: string | undefined;

/**
 * @deprecated 尽量不要使用这里的 token，而是从 cookie 中取值
 * @returns
 */
export function getToken() {
  return token;
}

export function setToken() {
  const _token = getQueryParam('token');
  if (_token) {
    token = _token;
    // 维持原有逻辑，以防存在直接找 Storage 取值的情况
    WebsiteStorage.put('Authorization', token);
    removeURLToken();
  }
}

/**
 * 防止 token 暴露在 url 中
 */
export function removeURLToken() {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.delete('token');
  const newSearch = searchParams.toString();
  url.search = newSearch;
  // 如果有 history，需要把用过的token从url中去掉
  // 非浏览器环境下没有 history 则不管
  window.history?.replaceState(null, '', url.toString());
}
