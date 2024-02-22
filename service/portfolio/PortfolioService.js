const StockPrice = require('../../model/StockPrice');
const StockItem = require('../../model/StockItem');

/**
 * 투자 결과를 계산하는 함수
 * @param duration eg. {startDate: new Date('2022-01-01'), endDate: new Date('2022-12-31')} (기간)
 * @param investAmounts eg. 1_000_000 (원)
 * @param itemCodes eg. ["000080", "000100", "000120"] (종목 코드)
 * @param weights eg. [0.3, 0.3, 0.4] (비중)
 * @returns {Promise<{evaluationAmount: number, dailyRates: *[]}>}
 */
async function getInvestResult(duration, investAmounts, itemCodes, weights) {
    const startDate = duration.startDate;
    const endDate = duration.endDate;

    const stockItems = [];
    Promise.all(
        itemCodes.map(code =>
            StockItem.findByCode(code)
                .then(stockItem => {
                    stockItems.push(stockItem);
                }).catch(err => {
                console.error(err);
            })
        )).then(async () => {
        const eachRates = await calculateEachRates(stockItems, startDate, endDate); //accumulate_Return
        const totalRates = calculateTotalRates(eachRates, weights);
        console.log(totalRates);
    });

    return {
        evaluationAmount: 0,
        totalRates: [],
    }
}

/**
 * 각 종목의 수익률을 계산하는 함수
 * @param stockItems
 * @returns {Promise<*[][]>}
 */
async function calculateEachRates(stockItems) {
    const rates = [[], [], []];
    return Promise.all(
        stockItems.map((stockItem, index) =>
            StockPrice.find({
                stockItem: stockItem._id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
                .then(prices => {
                    const criteria = prices[0].endPrice;
                    for (let i = 1; i < prices.length; i++) {
                        rates[index].push((prices[i].endPrice - criteria) / criteria);
                    }
                })
                .catch(err => {
                    console.error(err);
                })
        )).then(() => {
            return rates;
        }
    );
}

/**
 * 종목별 수익률을 가중치에 따라 합산하는 함수
 * @param rates
 * @param weights
 * @returns {*[]}
 */
function calculateTotalRates(rates, weights) {
    const dailyRates = [];
    for (let i = 0; i < rates[0].length; i++) {
        let totalRate = 0;
        for (let j = 0; j < rates.length; j++) {
            totalRate += rates[j][i] * weights[j];
        }
        dailyRates.push(totalRate);
    }
    return dailyRates;
}

module.exports = {getInvestResult};