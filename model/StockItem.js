const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
    code: { // 종목코드
        type: String,
        required: true
    },
    name: { // 종목명
        type: String,
        required: true
    },
    market: { // 시장
        type: String,
        required: true
    }
});

stockItemSchema.statics.findByCode = function (code) {
    return this.findOne({code: code});
}

module.exports = mongoose.model('StockItem', stockItemSchema);