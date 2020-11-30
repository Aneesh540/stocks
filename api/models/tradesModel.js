const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    order_type : {type : String, required : true, enum : ["buy", "sell"]},
    quantity : {type : Number, required : true, min : 1},
    price : {type : Number, required : true}
});

const StockSchema = new mongoose.Schema({
    
    ticker_symbol : {type : String, required : true},
    available : {type : Number, min : 0},
    average_price : {type : Number},
    trade_history : [TradeSchema]

});

module.exports = mongoose.model('StockDetails', StockSchema);