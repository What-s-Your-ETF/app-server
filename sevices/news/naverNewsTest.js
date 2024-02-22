const axios = require('axios');
const cheerio = require('cheerio');

// keywordArray = 검색어 배열
// day = 시작날짜이자 끝날짜. 예) 2024.01.01
async function newsCrawling(keywordArray, day) {
    const resultObject = {}; // 결과를 저장할 객체

    for (let keyword of keywordArray) {
        const url = `https://search.naver.com/search.naver?where=news&query=${keyword}&sm=tab_opt&sort=0&photo=0&field=0&pd=3&ds=${day}&de=${day}&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Ar%2Cp%3Afrom20240101to20240101&is_sug_officeid=0&office_category=0&service_area=0`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const result = $('.list_news .bx').map((i, elem) => {
            const press = $(elem).find('a.info.press').text().replace(/ 선정/g, ''); // 문자열 파싱
            const anchor = $(elem).find('a.news_tit');
            const title = anchor.text().trim();
            const url = anchor.prop('href');
            const dsc = $(elem).find('.news_dsc').text().trim();
            const imgTag = $(elem).find('.dsc_thumb img');
            const imgUrl = imgTag.prop('data-lazysrc');
            
            return {
                press: press,
                title: title,
                url: url,
                dsc: dsc,
                imgUrl: imgUrl,
            };
        }).get();

        resultObject[keyword] = result; // 키워드를 키로 사용하여 결과 저장
    }

    return resultObject; // 객체 반환
}

module.exports = newsCrawling;
