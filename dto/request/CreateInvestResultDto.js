/**
 * duration eg. {startDate: new Date('2022-01-01'), endDate: new Date('2022-12-31')} (기간)
 * investAmounts eg. 1_000_000 (원)
 * itemCodes eg. ["000080", "000100", "000120"] (종목 코드)
 * weights eg. [0.3, 0.3, 0.4] (비중)
 */
class CreateInvestResultDto {
    constructor(duration, investAmounts, itemCodes, weights) {
        this.duration = duration;
        this.investAmounts = investAmounts;
        this.itemCodes = itemCodes;
        this.weights = weights;
    }

    static fromRequest(req) {
        return new CreateInvestResultDto(
            req.body.duration,
            req.body.investAmounts,
            req.body.itemCodes,
            req.body.weights
        );
    }
}

module.exports = CreateInvestResultDto;