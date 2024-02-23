class CreatePortfolioDto {
    constructor(name, stockItems, user, returnRates, evaluationAmount, duration) {
        this.name = name;
        this.stockItems = stockItems;
        this.user = user;
        this.returnRates = returnRates;
        this.evaluationAmount = evaluationAmount;
        this.duration = duration;
    }

    static fromRequest(req, investResult) {
        const name = req.body.name;
        const user = req.user;
        const duration = req.body.duration;

        const stockItems = investResult.stockItems;
        const returnRates = investResult.totalReturnRates;
        const evaluationAmount = investResult.evaluationAmount;

        return new CreatePortfolioDto(
            name,
            stockItems,
            user,
            returnRates,
            evaluationAmount,
            duration
        );
    }
}

module.exports = CreatePortfolioDto;