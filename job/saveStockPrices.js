const StockPrice = require('../model/StockPrice');
const StockItem = require('../model/StockItem');
const FileReader = require('./fileReader');
const {preprocessStockPrice} = require('./preprocessData');
const path = require('path');
const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'});

const MONGO_HOST = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
mongoose.connect(MONGO_HOST, {
    retryWrites: true,
    w: 'majority',
});

const baseUrl = "/Users/jinhyeon/KJH/dev/wy-etf/data/kospi200";
const fileReader = new FileReader(baseUrl);
const files = fileReader.readDir();
(async () => {
    for (const file of files) {
        const data = new FileReader(path.join(baseUrl, file)).read();
        const stockPrices = preprocessStockPrice(data);
        const code = file.split(' ')[0].trim();
        const stockItem = await StockItem.find({code: code});
        const prices = [];
        for (const stockPrice of stockPrices) {
            stockPrice.stockItem = stockItem[0]._id;
            prices.push(stockPrice);
        }
        await StockPrice.insertMany(prices)
            .then((stockPrices) => {
            }).catch((err) => {
                console.error(err);
            });
    }
})();