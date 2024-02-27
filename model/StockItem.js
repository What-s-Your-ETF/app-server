const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    },
    isKospi200: {
        type: Boolean,
        default: false
    }
});

stockItemSchema.plugin(mongoosePaginate);

stockItemSchema.statics.findByCode = function (code) {
    return this.findOne({code: code});
}

module.exports = mongoose.model('StockItem', stockItemSchema);