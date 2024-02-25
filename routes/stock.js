const express = require('express');
const router = express.Router();
const {getTop10StockThemes} = require('../sevices/stock/stock-service');

router.get('/rank', async (req, res, next) => {
    try {
        const response = await getTop10StockThemes();
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(400).json({message: "fail"});
        next(err);
    }
});

module.exports = router;