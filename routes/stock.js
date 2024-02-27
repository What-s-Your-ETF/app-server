const express = require('express');
const router = express.Router();
const StockItem = require('../model/StockItem');
const {get10StockThemes, getReturnTrend} = require('../sevices/stock/stock-service');

router.get('/themes/rank', async (req, res, next) => {
    try {
        const response = await get10StockThemes(req.query.ordering ? req.query.ordering : 'desc');
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(400).json({message: "fail"});
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
    }

    try {
        const stockItems = await StockItem.paginate({
                isKospi200: req.query.isKospi200 || false,
                name: req.query.name || ''
            },
            options);
        res.json(stockItems);
    } catch (err) {
        console.error(err);
        res.status(400).json({message: "fail"});
        next(err);
    }
});

router.post('/return-trend', async (req, res, next) => {
    const duration = {
        startDate: new Date(req.body.duration.startDate),
        endDate: new Date(req.body.duration.endDate)
    }
    try {
        const response = await getReturnTrend(req.body.stockItems, duration);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(400).json({message: "fail"});
        next(err);
    }
});

module.exports = router;