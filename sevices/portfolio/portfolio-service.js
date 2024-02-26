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
    let totalReturnRates;
    return Promise.all(
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
        evaluationAmount = investAmounts * (1 + totalReturnRates[totalReturnRates.length - 1].rate);

        return {
            stockItems: stockItems.map((stockItem, index) => {
                return {
                    item: stockItem._id,
                    weight: weights[index]
                }
            }),
            evaluationAmount: evaluationAmount,
            totalReturnRates: totalReturnRates,
        }
    });
}

/**
 * 각 종목의 수익률을 계산하는 함수
 * @param stockItems
 * @param startDate
 * @param endDate
 * @returns {Promise<*[][]>}
 */
async function accumulateEachReturnRates(stockItems, startDate, endDate) {
    const rates = Array.from({length: stockItems.length}, () => []);
    for (let i = 0; i < stockItems.length; i++) {
        const stockItem = stockItems[i];
        const rate = rates[i];
        await StockPrice.find({
            stockItem: stockItem._id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .sort({date: 1})
            .then(prices => {
                const criteria = prices[0].endPrice;
                for (let j = 1; j < prices.length; j++) {
                    rate.push({
                        date: prices[j].date,
                        rate: (prices[j].endPrice - criteria) / criteria
                    });
                }
            })
            .catch(err => {
                console.error(err);
            })
    }
    return rates;
}

/**
 * 종목별 수익률을 가중치에 따라 합산하는 함수
 * @param eachRates
 * @param weights
 * @returns {*[]}
 */
function accumulateTotalReturnRates(eachRates, weights) {
    const totalRates = [];
    for (let j = 0; j < eachRates[0].length; j++) { // 일별 수익률을 합산
        let totalRate = 0;
        for (let i = 0; i < eachRates.length; i++) { // 종목별 수익률을 가중치에 따라 합산
            totalRate += eachRates[i][j].rate * weights[i];
        }
        totalRates.push({
            date: eachRates[0][j].date,
            rate: totalRate,
        });
    }
    return totalRates;
}

module.exports = {getInvestResult};