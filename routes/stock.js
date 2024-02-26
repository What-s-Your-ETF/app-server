const express = require('express');
const router = express.Router();
const {get10StockThemes} = require('../sevices/stock/stock-service');

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

module.exports = router;