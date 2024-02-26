const mongoose = require('mongoose');

const stockPriceSchema = new mongoose.Schema({
        stockItem: { // 종목
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StockItem',
            required: true
        },
        startPrice: { // 시가
            type: Number,
        },
        endPrice: { // 종가
            type: Number,
        },
        highPrice: { // 고가
            type: Number,
        },
        lowPrice: { // 저가
            type: Number,
        },
        volume: { // 거래량
            type: mongoose.Types.Decimal128,
        },
        volatility: { // 변동률
            type: mongoose.Types.Decimal128,
        },
        date: { // 날짜
            type: Date,
            required: true
        }
    }, {
        timeseries: {
            timeField: 'date',
            metaField: 'stockItem',
            granularity: 'daily'
        }
    }
);

module.exports = mongoose.model('StockPrice', stockPriceSchema);
