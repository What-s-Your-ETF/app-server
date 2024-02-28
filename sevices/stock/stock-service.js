const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const StockItem = require('../../model/StockItem');
const StockPrice = require('../../model/StockPrice');

const ENCODING = 'euc-kr';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FETCH_STOCK_THEMES_URL = 'https://finance.naver.com/sise/theme.naver';
const codeToName = new Map();
const LIMIT_DATE = new Date('2017-01-01');

/**
 * 네이버페이 증권의 테마별 시세를 크롤링하여 상위/하위 10개 종목을 반환하는 함수
 * @returns {Promise<{lead1: any, lead2: any, name: *, volatility: *}[]>}
 * @param ordering
 */
async function get10StockThemes(ordering = 'desc') {
    const service = getAxiosInstance();

    const params = {filed: "change_rate", ordering: ordering};
    const response = await service.get('', {params});
    const content = iconv.decode(response.data, ENCODING);

    let $ = cheerio.load(content);

    const top10StockThemes = await parseResult($);

    return top10StockThemes.map((info) => {
        return {
            name: info.name,
            volatility: info.volatility,
            lead1: codeToName.get(info.lead1),
            lead2: codeToName.get(info.lead2)
        }
    });

}

/**
 * 개별 종목 수익률 추이를 반환하는 함수 (1개월, 3개월, 6개월, 1년)
 * @returns {Promise<*[]>}
 * @param stockItems
 * @param duration
 */
async function getReturnTrend(stockItems, duration) {
    const endDate = duration.endDate;
    const oneYearAgo = getOneYearAgo(endDate);

    const result = [];
    for (const stockItem of stockItems) {
        try {
            const stockPrices = await StockPrice.find({
                stockItem: stockItem._id,
                date: {
                    $gte: oneYearAgo > LIMIT_DATE ? oneYearAgo : LIMIT_DATE,
                    $lte: endDate
                }
            });
            result.push({
                stockItem: {
                    _id: stockItem._id,
                    code: stockItem.code,
                    name: stockItem.name
                },
                endPrice: stockPrices[stockPrices.length - 1]._doc.endPrice,
                returnTrend: calculateReturnTrend(stockPrices)
            });
        } catch (err) {
            console.error(err);
        }
    }
    return result;
}

//== private methods ==//
function getAxiosInstance() {
    return axios.create({
        baseURL: FETCH_STOCK_THEMES_URL,
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
        headers: {
            'User-Agent': USER_AGENT
        }
    });
}

async function parseResult($) {

    const themes = [];
    const codes = [];
    for (let i = 4; i <= 16; i++) {
        if (i === 9 || i === 10 || i === 11) continue;
        const elem = $(`#contentarea_left > table.type_1.theme > tbody > tr:nth-child(${i})`);

        const volatility = $(elem).find('td.number.col_type2 > span').text().trim();
        const lead1Href = $(elem).find('td.ls.col_type5 > a').attr('href');
        const lead2Href = $(elem).find('td.ls.col_type6 > a').attr('href');

        themes.push({
            name: $(elem).find('td.col_type1 > a').text(),
            volatility: parseFloat(volatility.substring(0, volatility.length - 1)),
            lead1: lead1Href.substring(lead1Href.indexOf('=') + 1, lead1Href.length),
            lead2: lead2Href.substring(lead2Href.indexOf('=') + 1, lead2Href.length)
        });

        codes.push(lead1Href.substring(lead1Href.indexOf('=') + 1, lead1Href.length));
        codes.push(lead2Href.substring(lead2Href.indexOf('=') + 1, lead2Href.length));
    }

    await initCodeMap(codes);

    return themes;
}

async function initCodeMap(codes) {
    await StockItem.find({code: {$in: codes}})
        .then((result) => {
            for (const elem of result) {
                codeToName.set(elem._doc.code, elem._doc.name);
            }
        }).catch((err) => {
            console.error(err);
        });
}

function getOneYearAgo(date) {
    const oneYearAgo = new Date(date);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 1); // 1년 전보다 1달 더 빠르게 설정
    return oneYearAgo;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

const isSameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate();
}

function calculateReturnTrend(stockPrices) {

    const endDate = stockPrices[stockPrices.length - 1]._doc.date;
    const periods = [30, 90, 180, 365]; // 1개월, 3개월, 6개월, 1년

    const refPrice = stockPrices[stockPrices.length - 1]._doc.endPrice;
    const returnTrend = [];
    for (const period of periods) {
        const targetDate = new Date(endDate);
        targetDate.setDate(targetDate.getDate() - period);

        let stockPrice;
        while (targetDate >= LIMIT_DATE) {
            if (isWeekend(targetDate)) {
                targetDate.setDate(targetDate.getDate() - 1);
                continue;
            }
            stockPrice = stockPrices.find((price) => isSameDate(price._doc.date, targetDate));
            if (stockPrice) {
                break;
            }
            targetDate.setDate(targetDate.getDate() - 1);
        }

        const rate = (refPrice - stockPrice._doc.endPrice) / stockPrice._doc.endPrice;
        returnTrend.push({
            date: targetDate,
            rate: rate
        });
    }
    return returnTrend;
}

module.exports = {get10StockThemes, getReturnTrend};
