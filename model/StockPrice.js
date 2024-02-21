const mongoose = require('mongoose');

const stockPriceSchema = new mongoose.Schema({
    stockItem: { // 종목
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockItem',
        required: true
    },
    startPrice: { // 시가
        type: Number,
        required: true
    },
    endPrice: { // 종가
        type: Number,
        required: true
    },
    highPrice: { // 고가
        type: Number,
        required: true
    },
    lowPrice: { // 저가
        type: Number,
        required: true
    },
    volume: { // 거래량
        type: mongoose.Types.Decimal128,
    },
    volatility: { // 변동률
        type: mongoose.Types.Decimal128,
        required: true
    },
    date: { // 날짜
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('StockPrice', stockPriceSchema);
