"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chineseHolidayHash = chineseHolidayHash;
const http_1 = __importDefault(require("http"));
function httpRequest(url) {
    return new Promise((resolve, reject) => {
        const request = http_1.default.request(url, (res) => {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (e) {
                        resolve(data);
                        // reject(e);
                    }
                }
                else {
                    reject(`status code: ${res.statusCode}, request options: ${url}, result: ${data}`);
                }
            });
        });
        request.on('error', (e) => reject(e));
        request.end();
    });
}
const genChineseHoliday = (year) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchUrl = `http://xxgk.www.gov.cn/search-zhengce/?&mode=smart&sort=relevant&page_index=1&page_size=10&title=${year || ''}%E5%B9%B4%E9%83%A8%E5%88%86%E8%8A%82%E5%81%87%E6%97%A5%E5%AE%89%E6%8E%92%E7%9A%84%E9%80%9A%E7%9F%A5`;
        const res = yield httpRequest(searchUrl);
        const detailUrl = res.data[0].url;
        const page = yield httpRequest(detailUrl);
        const match = page.match(/<\/span>([0-9]|，|。|、|（|）|[\u4E00-\u62FF]|[\u6300-\u77FF]|[\u7800-\u8CFF]|[\u8D00-\u9FFF])+<\/p>/g);
        let realYear = 0;
        const holidayArr = [];
        const workdayArr = [];
        for (let i = 0; i < match.length; i++) {
            const [holidayStr, workdayStr] = match[i].slice(7, -4).split('。');
            const holidayNumArr = holidayStr.split('放假')[0].match(/\d+/g);
            if (!i) {
                realYear = Number(holidayNumArr.shift());
            }
            const startMonth = Number(holidayNumArr[0]);
            const startDate = Number(holidayNumArr[1]);
            let endMonth = startMonth;
            let endDate = startDate;
            if (holidayNumArr.length === 3) {
                endMonth = Number(holidayNumArr[0]);
                endDate = Number(holidayNumArr[2]);
            }
            else if (holidayNumArr.length === 4) {
                endMonth = Number(holidayNumArr[2]);
                endDate = Number(holidayNumArr[3]);
            }
            else {
            }
            const startDay = new Date(`${realYear}-${('0' + startMonth).slice(-2)}-${('0' + startDate).slice(-2)}T00:00:00.000Z`);
            const endDay = new Date(`${realYear}-${('0' + endMonth).slice(-2)}-${('0' + endDate).slice(-2)}T00:00:00.000Z`);
            let p = startDay;
            while (Number(p) <= Number(endDay)) {
                holidayArr.push(p);
                p = new Date(Number(p) + 86400 * 1000);
            }
            if (workdayStr) {
                const workdayNumArr = workdayStr.match(/\d+/g);
                for (let j = 0; j < workdayNumArr.length - 1; j += 2) {
                    workdayArr.push(new Date(`${realYear}-${('0' + workdayNumArr[j]).slice(-2)}-${('0' + workdayNumArr[j + 1]).slice(-2)}T00:00:00.000Z`));
                }
            }
        }
        return {
            holidayArr,
            workdayArr,
        };
    }
    catch (e) {
        return {
            holidayArr: [
                '2021-01-01T00:00:00.000Z',
                '2021-01-02T00:00:00.000Z',
                '2021-01-03T00:00:00.000Z',
                '2021-02-11T00:00:00.000Z',
                '2021-02-12T00:00:00.000Z',
                '2021-02-13T00:00:00.000Z',
                '2021-02-14T00:00:00.000Z',
                '2021-02-15T00:00:00.000Z',
                '2021-02-16T00:00:00.000Z',
                '2021-02-17T00:00:00.000Z',
                '2021-04-03T00:00:00.000Z',
                '2021-04-04T00:00:00.000Z',
                '2021-04-05T00:00:00.000Z',
                '2021-05-01T00:00:00.000Z',
                '2021-05-02T00:00:00.000Z',
                '2021-05-03T00:00:00.000Z',
                '2021-05-04T00:00:00.000Z',
                '2021-05-05T00:00:00.000Z',
                '2021-06-12T00:00:00.000Z',
                '2021-06-13T00:00:00.000Z',
                '2021-06-14T00:00:00.000Z',
                '2021-09-19T00:00:00.000Z',
                '2021-09-20T00:00:00.000Z',
                '2021-09-21T00:00:00.000Z',
                '2021-10-01T00:00:00.000Z',
                '2021-10-02T00:00:00.000Z',
                '2021-10-03T00:00:00.000Z',
                '2021-10-04T00:00:00.000Z',
                '2021-10-05T00:00:00.000Z',
                '2021-10-06T00:00:00.000Z',
                '2021-10-07T00:00:00.000Z',
            ],
            workdayArr: [
                '2021-02-07T00:00:00.000Z',
                '2021-02-20T00:00:00.000Z',
                '2021-04-25T00:00:00.000Z',
                '2021-05-08T00:00:00.000Z',
                '2021-09-18T00:00:00.000Z',
                '2021-09-26T00:00:00.000Z',
                '2021-10-09T00:00:00.000Z',
            ],
        };
    }
});
function chineseHolidayHash(bs, year) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bs.storeJSON(yield genChineseHoliday(year));
    });
}
//# sourceMappingURL=chinese-holiday.js.map