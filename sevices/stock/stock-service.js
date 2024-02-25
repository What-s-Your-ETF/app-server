const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const StockItem = require('../../model/StockItem');

const ENCODING = 'euc-kr';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FETCH_STOCK_THEMES_URL = 'https://finance.naver.com/sise/theme.naver';
const codeToName = new Map();

/**
 * 네이버페이 증권의 테마별 시세를 크롤링하여 상위 10개 종목을 반환하는 함수
 * @returns {Promise<{lead1: any, lead2: any, name: *, volatility: *}[]>}
 */
async function getTop10StockThemes() {
    const service = getAxiosInstance();

    const response = await service.get('');
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

module.exports = {getTop10StockThemes};
