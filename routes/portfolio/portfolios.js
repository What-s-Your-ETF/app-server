const express = require('express');
const router = express.Router();
const StockItem = require('../../model/StockItem');
const {getInvestResult} = require('../../sevices/portfolio/PortfolioService');

/**
 * 포트폴리오 구성 및 수익률 계산
 * POST /portfolios
 * {
 *     duration: {
 *         startDate: "2022-01-01",
 *         endDate: "2022-12-31"
 *     },
 *     investAmount: 1000000,
 *     itemCodes: ["000080", "000100", "000120"],
 *     weights: [0.3, 0.3, 0.4]
 * }
 */
router.post('/', async function(req, res, next) {
    getInvestResult()
        .then(result => {
            res.json(result);
        }).catch(err => {
        console.error(err);
    })
});