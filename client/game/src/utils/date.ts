export function NowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export const formatDate = (
  date: Date,
  language: 'zh' | 'en',
  hideTime = false,
) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  let hour = date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const second =
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  const ampm =
    hour >= 12
      ? language === 'zh'
        ? '下午'
        : 'PM'
      : language === 'zh'
      ? '上午'
      : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const dateText = `${year}/${month}/${day}`;
  if (hideTime) {
    return dateText;
  }

  return `${dateText} ${hour}:${minutes}:${second} ${ampm}`;
};

/**
 * 皮肤活动发放有效期
 * @returns boolean
 */
export const getEventFlag = (): boolean => {
  // todo
  // 链接分享活动有效期，未来会从接口获取活动时间周期
  // fetchActiveValidDateRange
  const GUOQING = ['2021/10/01 00:00:00', '2021/10/10 23:59:59'];
  const currentDate = new Date().getTime();
  const start = new Date(GUOQING[0]).getTime();
  const end = new Date(GUOQING[1]).getTime();
  return currentDate >= start && currentDate <= end;
};

// 构造一个过期时间（以年为单位）
export const createExpires = (year: number) => {
  let expires = new Date();

  expires.setFullYear(expires.getFullYear() + year);

  return new Date(expires);
};

export const convertTimeStrToTimestamp = (timeStr: string) => {
  return new Date(timeStr).getTime();
};
