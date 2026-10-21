/**
 * @param date
 * @param withoutTime
 * @param splitChar
 * @return YYYY-MM-DD HH:mm:ss
 */
export function dateToStr(date:Date | string | undefined | null | number, withoutTime = false, splitChar = '-') : string {
    const time = date ? new Date(date) : new Date();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    const dateStr = `${time.getFullYear()}${splitChar}${month >= 10 ? month : ('0' + month)}${splitChar}${day >= 10 ? day : ('0' + day)}`;
    if (withoutTime) { return dateStr; }
    return `${dateStr} ${hour >= 10 ? hour : '0' + hour}:${minute >= 10 ? minute : '0' + minute}:${second >= 10 ? second : '0' + second}`;
}

/**
 * @return HH:mm
 */
export function numberToHourMinute(time:number, limit:number, start?:{ hour:number, minute:number }) : string {
    let hour = Math.floor(time / limit * 24);
    let minute = Math.floor((time - limit / 24 * hour) / (limit / 24) * 60);
    if (start) {
        hour = (hour + start.hour + Math.floor((minute + start.minute) / 60)) % 24;
        minute = (minute + start.minute) % 60;
    }
    return (hour > 9 ? '' : '0') + hour + ':' + (minute > 9 ? '' : '0') + minute;
}

/**
 * @param time format should be HH:mm
 */
export function hourMinuteToNumber(timeString:string, limit:number, start?:{ hour:number, minute:number }) : number {
    const time = timeString.split(':');
    if (time.length !== 2) {
        return 0;
    }
    if (isNaN(+time[0]) || isNaN(+time[1])) {
        return 0;
    }
    let hour = (start ? +time[0] - start.hour : +time[0]) % 24;
    if (hour < 0) {
        hour += 24;
    }
    let minute = (start ? +time[1] - start.minute : +time[1]) % 60;
    if (minute < 0) {
        minute += 60;
    }

    const v = limit / 24 * hour + limit / 24 / 60 * minute;
    if (v > limit) {
        return limit;
    } else if (v < 0) {
        return 0;
    }

    return v;
}

/**
 * @return X minutes/hours/days/month/years
 */
interface DateIntlFormat {
    minute:string;
    minutes:string;
    hours:string;
    hour:string;
    days:string;
    day:string;
    month:string;
    months:string;
    year:string;
    years:string;
}
const IntlFormat:{ [local:string]:DateIntlFormat } = {
    'zh-CN': {
        minute: '分钟',
        minutes: '分钟',
        hours: '小时',
        hour: '小时',
        days: '天',
        day: '天',
        month: '个月',
        months: '个月',
        year: '年',
        years: '年',
    },
    'en-US': {
        minute: ' minute',
        minutes: ' minutes',
        hours: ' hours',
        hour: ' hour',
        days: ' days',
        day: ' day',
        month: ' month',
        months: ' months',
        year: ' year',
        years: ' years',
    },
};
IntlFormat['en'] = IntlFormat['en-US'];
IntlFormat['zh'] = IntlFormat['cn'] = IntlFormat['zh-CN'];
export function compareTimeStr(fromTime:number, toTime:number, local:string) {
    const distance = (toTime - fromTime) / 1000;
    return timeDistanceStr(distance, local);
}
/**
 * @param distance in seconds
 * @param local ''zh-CN' or 'en-US'
 */
export function timeDistanceStr(_distance:number, local:string) {
    const distance = Math.abs(_distance);
    const intlFormat = IntlFormat[local];
    if (distance < 3600) {
        const value = Math.ceil(distance / 60);
        return value === 1 ? value + intlFormat.minute : value + intlFormat.minutes;
    } else if (distance < 3600 * 24) {
        const value = Math.ceil(distance / 3600);
        return value === 1 ? value + intlFormat.hour : value + intlFormat.hours;
    } else if (distance < 3600 * 24 * 31) {
        const value = Math.ceil(distance / 3600 / 24);
        return value === 1 ? value + intlFormat.day : value + intlFormat.days;
    } else if (distance < 3600 * 24 * 365) {
        const value = Math.ceil(distance / 3600 / 24 / 31);
        return value === 1 ? value + intlFormat.month : value + intlFormat.months;
    } else {
        const value = Math.ceil(distance / 3600 / 24 / 365);
        return value === 1 ? value + intlFormat.year : value + intlFormat.years;
    }
}

/**
 *
 * @param time
 * @param fmt :format   such as : yyyy-MM-dd hh:mm
 * @returns formatted string 2020-01-01 12:01
 */
export const formatTime = (time:Date | string, fmt:string) => {
    let t:Date;
    let res:string = fmt;
    t = new Date(time);
    const o = {
        'M+': t.getMonth() + 1,                 //month
        'd+': t.getDate(),                    //day
        'h+': t.getHours(),                   //hour
        'm+': t.getMinutes(),                 //minutes
        's+': t.getSeconds(),                 // second
        'q+': Math.floor((t.getMonth() + 3) / 3), //season
        'S': t.getMilliseconds(),             // millisecond
    };
    if (/(y+)/.test(res)) {
        res = res.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            res = res.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return res;
};
