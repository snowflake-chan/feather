import { ApiClient } from '@box/apis';

/** Browser client shared by Creator and Play pages on the current origin. */
export const apiClient = new ApiClient({
  defaultErrorMessage: '请求失败，请稍后重试',
});
