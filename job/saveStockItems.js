const StockItem = require('../model/StockItem');
const {preprocessStockItem} = require('./preprocessData');
const FileReader = require("./FileReader");
const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'});

const MONGO_HOST = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
mongoose.connect(MONGO_HOST, {
    retryWrites: true,
    w: 'majority',
});

function save(stockItem) {
    StockItem.create(stockItem)
        .then((stockItem) => {
        }).catch((err) => console.error(err));
}

const fileReader = new FileReader("./data/stock-item.csv");
const data = fileReader.read();

for (const stockItem of preprocessStockItem(data)) {
    save(stockItem);
}