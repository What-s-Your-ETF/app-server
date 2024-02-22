const express = require('express');
const router = express.Router();
const StockItem = require('../../model/StockItem');
const {getInvestResult} = require('../../service/portfolio/PortfolioService');

router.get('/', async function(req, res, next) {
    getInvestResult()
        .then(result => {

    })
}