const express = require('express');
const router = express.Router();
const Portfolio = require('../model/Portfolio');
const StockItem = require('../model/StockItem');
const StockPrice = require('../model/StockPrice');
const {getInvestResult} = require('../sevices/portfolio/portfolio-service');
const {authenticate} = require('./user');
const CreateInvestResultDto = require('../dto/request/CreateInvestResultDto');
const CreatePortfolioDto = require('../dto/request/CreatePortfolioDto');

const CODE_KODEX200 = "069500";

router.use(authenticate, function(req, res, next) {
    next();
});

/**
 * 포트폴리오 구성 및 수익률 계산
 * POST /portfolios
 * <request>    
 * {
 *     "name": "My Portfolio",
 *     "duration": {
 *         "startDate": "2022-01-01",
 *         "endDate": "2022-12-31"
 *     },
 *     "investAmount": 1000000,
 *     "itemCodes": ["000080", "000100", "000120"],
 *     "weights": [0.3, 0.3, 0.4]
 * }
 * <response>
 * {
 *     _id: "65d80657b4b09c5c00e690b4",
 *     name: "My Portfolio",
 *     stockItems: [
 *         {
 *             item: "65d4857362d0c49dc9cd20d9",
 *             weight: {
 *                 "$numberDecimal": "0.3",
 *             },
 *             _id: ~
 *         },
 *         ...
 *     ],
 *     totalReturnRates: [
 *         {
 *             date: "2022-01-01",
 *             rate: {
 *             "$numberDecimal": "0.0",
 *             },
 *         },
 *         ...
 *     ],
 *     evaluationAmount: {
 *         "$numberDecimal": "1000000",
 *     }
 *     duration: {
 *         startDate: "2022-01-01",
 *         endDate: "2022-12-31"
 *     },
 *     createdAt: "2022-01-01T00:00:00.000Z",
 *     updatedAt: "2022-01-01T00:00:00.000Z",
 * }
 */
router.post('/', async function(req, res, next) {
    try {
        const createInvestResultDto = CreateInvestResultDto.fromRequest(req);
        const result = await getInvestResult(createInvestResultDto);

        const createPortfolioDto = CreatePortfolioDto.fromRequest(req, result);
        const portfolio = await Portfolio.create(createPortfolioDto);
        res.json(portfolio);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/', async function(req, res, next) {
    try {
        const portfolios = await Portfolio.find({user: req.user});
        res.json(portfolios);
    } catch (err) {
        console.error(err);
        next(err);
    }
}); 

router.get('/portnames', async function(req, res, next) {
    try {
        const portfolios = await Portfolio.find({user: req.user});
        res.json(portfolios.map(portfolio => {
            return {
                _id: portfolio._id,
                name: portfolio.name
            }
        }));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:portfolioId', async function(req, res, next) {
    try {
        const portfolio = await Portfolio.findById(req.params.portfolioId);

        if (portfolio._doc.user.toString() !== req.user._id) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw(error);
        }
        res.json(portfolio);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:portfolioId/kospi-index', async function(req, res, next) {
    try {
        const portfolio = await Portfolio.findById(req.params.portfolioId);
        const KODEX200 = await StockItem.findOne({
            code: CODE_KODEX200,
        });
        const stockPrices = await StockPrice.find({
            stockItem: KODEX200._id,
            date: {
                $gte: portfolio.duration.startDate,
                $lte: portfolio.duration.endDate
            }
        }).sort({date: 1});
        res.json(stockPrices);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/:portfolioId', async function(req, res, next) {
    try {
        const portfolio = await Portfolio.findById(req.params.portfolioId);
        console.log(portfolio._doc.user, req.user._id);
        if (portfolio._doc.user.toString() !== req.user._id) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw(error);
        }
        await Portfolio.findByIdAndDelete(req.params.portfolioId);
        res.json({message: "success"});
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;