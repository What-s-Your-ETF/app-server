const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "My Portfolio"
    },
    stockItems: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StockItem',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        weight: {
            type: mongoose.Types.Decimal128,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    returnRates: [{
        date: {
            type: Date,
            required: true
        },
        rate: {
            type: mongoose.Types.Decimal128,
            required: true
        }
    }],
    evaluationAmount: {
        type: mongoose.Types.Decimal128
    },
    duration: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
});
portfolioSchema.set('timestamps', true);

module.exports = mongoose.model('Portfolio', portfolioSchema);