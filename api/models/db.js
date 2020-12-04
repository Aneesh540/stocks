const mongoose = require('mongoose');
const StockDetails = require('./tradesModel.js');


async function getStockByTicker(ticker_symbol){

    let stock =  await StockDetails.findOne({ticker_symbol : ticker_symbol});
    return stock;

}


async function addFirstTrade(trade_details){
    /* when new entry for a security/stock a new StockSchema object is created
    for subsequent entries (buy or sell orders) a new TradeSchema object is created
    and addTrade() function will be called

    Referenced by : api/controller/validator/execute_trade
    
    
    */

    let obj = new StockDetails(trade_details);

    return obj.save()
    .then((result) => {
        return {status : 201, msg : "New stock added", data : result};
    })
    .catch((error) => {
        return {status : 400, msg : "Cannot add to database", error : error};
    });

}

async function addTrade(ticker, new_available, new_average, trade_details){
    /** Add a new TradeSchema object in trade_history array. See StockSchema model for more info.
     * new_available -> new quantity avaialable after buying and selling of security (min = 0)
     * new_average -> new average of security; "sell" doesn't change average price, "buy" changes average price
     * trade_details -> new TradeSchema
     */

    try{
        let stock = await StockDetails.findOne({ticker_symbol : ticker});
        stock.available = new_available;
        stock.average_price = new_average;
        stock.trade_history.push(trade_details);
        let result = await stock.save();
        return {status : 201, msg : "New trade added to database", data : result};
    }
    catch(error){
        return {status : 400, msg : `Cannot add new trade to ${ticker}`, error : error};
    }

}


async function deleteSingleTrade(stock, new_available, new_average_price, delete_index){
    /* delete that particular TradeSchema from trade_history array
    all validation checks & different changes are calculated in trades.delete_trade()
    here only updated valus are passed to update from database */

    stock.available = new_available;
    stock.average_price = new_average_price;
    stock.trade_history.splice(delete_index, 1);

    return stock.save()
    .then((result) => {
        return {status : 201, msg : "Trade deleted", data : result};
    })
    .catch((error) => {
        return {status : 500, msg : "Cannot delete from database", error : error};
    });

}


async function updateSingleTrade(stock, new_available, new_average_price, update_index, updated_obj){
    stock.available = new_available;
    stock.average_price = new_average_price;

    updated_obj._id = stock.trade_history[update_index]._id;

    stock.trade_history[update_index] = updated_obj;

    return stock.save()
    .then((result) => {
        return {status : 201, msg : "Trade updated", data : result};
    })
    .catch((error) => {
        return {status : 500, msg : "Cannot update to database", error : error};
    });

}


async function getAllStocks(){
    /** Simply fetching all the available information from database */
    
    try{
        let stock_list = await StockDetails.find({});
        return {status : 200, data : stock_list};
    } 
    catch(error){
        return {status : 500, msg : "Cannot retrieve stock list", error: error};
    }

}

module.exports = {
    getStockByTicker,
    addFirstTrade,
    addTrade,
    deleteSingleTrade,
    updateSingleTrade,
    getAllStocks

}
