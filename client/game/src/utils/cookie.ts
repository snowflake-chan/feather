import Cookies from 'js-cookie';

export const setCookies = (
  key: string,
  value: string,
  option?: Cookies.CookieAttributes | undefined,
) => {
  return Cookies.set(key, value, option);
};
