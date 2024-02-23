const StockPrice = require('../../model/StockPrice');
const StockItem = require('../../model/StockItem');

/**
 * 투자 결과를 계산하는 함수
 * @param dto
 * @returns {Promise<{totalReturnRates: *[], evaluationAmount: number}>}
 */
async function getInvestResult(dto) {
    const {duration, investAmounts, itemCodes, weights} = dto;
    const startDate = duration.startDate;
    const endDate = duration.endDate;

    const stockItems = [];
    let evaluationAmount;
    let totalReturnRates = [];
    Promise.all(
        itemCodes.map(code =>
            StockItem.findByCode(code)
                .then(stockItem => {
                    stockItems.push(stockItem);
                }).catch(err => {
                console.error(err);
            })
        )).then(async () => {
        const eachRates = await accumulateEachReturnRates(stockItems, startDate, endDate);
        totalReturnRates = accumulateTotalReturnRates(eachRates, weights);
        evaluationAmount = investAmounts * (1 + totalReturnRates[totalReturnRates.length - 1]);
    });

    return {
        evaluationAmount: evaluationAmount,
        totalReturnRates: totalReturnRates,
    }
}

/**
 * 각 종목의 수익률을 계산하는 함수
 * @param stockItems
 * @param startDate
 * @param endDate
 * @returns {Promise<*[][]>}
 */
async function accumulateEachReturnRates(stockItems, startDate, endDate) {
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
function accumulateTotalReturnRates(rates, weights) {
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