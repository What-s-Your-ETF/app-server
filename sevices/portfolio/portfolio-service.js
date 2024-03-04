const StockPrice = require('../../model/StockPrice');
const StockItem = require('../../model/StockItem');

/**
 * 투자 결과를 계산하는 함수
 * @param dto
 * @returns {Promise<{stockItems: {item: *, name: *, weight: *}[], totalReturnRates: *[], evaluationAmount: number}>}
 */
async function getInvestResult(dto) {
    const {duration, investAmounts, itemCodes, weights} = dto;
    const startDate = duration.startDate;
    const endDate = duration.endDate;

    const stockItems = [];
    let evaluationAmount;
    let totalReturnRates;
    for (const code of itemCodes) {
        await StockItem.findByCode(code)
            .then(stockItem => {
                stockItems.push(stockItem);
            }).catch(err => {
                console.error(err);
            });
    }

    const eachRates = [];
    for (const stockItem of stockItems) {
        eachRates.push(await accumulateEachReturnRates(stockItem, startDate, endDate));
    }
    totalReturnRates = accumulateTotalReturnRates(eachRates, weights, startDate, endDate);
    evaluationAmount = investAmounts * (1 + totalReturnRates[totalReturnRates.length - 1].rate);
    return {
        stockItems: stockItems.map((stockItem, index) => {
            return {
                item: stockItem._id,
                name: stockItem.name,
                weight: weights[index]
            }
        }),
        evaluationAmount: evaluationAmount,
        totalReturnRates: totalReturnRates,
    }
}

/**
 * 각 종목의 수익률을 계산하는 함수
 * @param stockItem
 * @param startDate
 * @param endDate
 * @returns {Promise<Map<any, any>>}
 */
async function accumulateEachReturnRates(stockItem, startDate, endDate) {
    const rate = new Map();
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
                rate.set(prices[j].date.toDateString(), {
                    date: prices[j].date,
                    rate: (prices[j].endPrice - criteria) / criteria
                });
            }
        })
        .catch(err => {
            console.error(err);
        })
    return rate;
}

/**
 * 종목별 수익률을 가중치에 따라 합산하는 함수
 * @param eachRates
 * @param weights
 * @param startDate
 * @param endDate
 * @returns {*[]}
 */
function accumulateTotalReturnRates(eachRates, weights, startDate, endDate) {
    const totalRates = [];
    const currentDate = startDate;
    while (currentDate <= endDate) {
        if (isWeekend(currentDate)) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        let totalRate = 0;
        for (let i = 0; i < eachRates.length; i++) {
            if (!eachRates[i].has(currentDate.toDateString())) continue;
            totalRate += eachRates[i].get(currentDate.toDateString()).rate * weights[i];
        }
        totalRates.push({
            date: new Date(currentDate),
            rate: totalRate,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(totalRates);
    return totalRates;
}

function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}

module.exports = {getInvestResult, accumulateEachReturnRates};