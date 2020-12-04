const RequestValidator = require('./validator.js');
const db = require('../models/db.js');



async function execute_trade(req, res, next){
    /* Validate the request (RequestValidator)
        refine the request for correct data types
        Logic to perform different validation checks whether request can proceed 
        (according to request type is "buy" or "sell" we have different logic)
        call database function to update/save into database */

    let data = req.body;
    let validator = RequestValidator.execute_trade(data);

    if(validator.status !== 200){
        return res.status(400).send(validator);
    }

    let ticker = data.ticker.toUpperCase();
    let trade_data = {
        order_type : data.type.toLowerCase(),
        quantity : parseInt(data.quantity),
        price : parseFloat(data.price)
    };


    let stock = await db.getStockByTicker(ticker);

    if(trade_data.order_type === "sell"){
        if(!stock || stock.available === 0){
            return res.status(400).send({status : 400, msg : "No stock availabe in demat account"});
        }

        else if(parseInt(stock.available) < trade_data.quantity)
            return res.status(400).send({status : 400, msg : `Cannot complete transaction, Available Quantity ${stock.available}`});

        else{
            let new_available = parseInt(stock.available) - trade_data.quantity;
            let new_average = stock.average_price;

            if(new_available === 0)
                new_average = 0;
            

            let result = await db.addTrade(ticker, new_available, new_average, trade_data);
            return res.status(result.status).send(result);

        }
    
    } 
    
    
    else{ // trade_data.order_type === "buy"

        if(!stock){
            let new_stock = {
                ticker_symbol : ticker,
                available : trade_data.quantity,
                average_price : trade_data.price,
                trade_history : [trade_data]
            }

            let result = await db.addFirstTrade(new_stock);
           
            return res.status(result.status).send(result);
        }

        else{

            let new_available = parseInt(stock.available) + trade_data.quantity;
            let new_average = (parseInt(stock.available)*parseFloat(stock.average_price) + trade_data.quantity*trade_data.price)/new_available;
            let result = await db.addTrade(ticker, new_available, new_average, trade_data);

            return res.status(result.status).send(result);
        }
    
    }
    

}

async function update_trade(req, res, next){
    /* Validate the request (RequestValidator)
        refine the request for correct data types
        Logic to perform different validation checks whether request can proceed
        1. Check whether request is valid (quantity not going into negative etc. )
        2. loop over all the trades in (trade_history) of particlar security and calculate new quantity available, new average and other parametrs

        call database function to update/save the information into database */


    let data = req.body;
    let validator = RequestValidator.update_trade(data);

    if(validator.status !== 200){
        return res.status(400).send(validator);
    }

    let trade_id = data.trade_id;
    let ticker = data.ticker.toUpperCase();
    let updated_trade = {order_type : data.type.toLowerCase(), 
                        quantity : parseInt(data.quantity),
                        price : parseFloat(data.price)};

    let stock = await db.getStockByTicker(ticker);

    if(!stock)
        return res.status(404).send({status : 404, msg : `No stocks found for ticker symbol ${ticker}` });

    let trade_history = stock.trade_history;
    let update_index = -1;

    let new_value = 0;
    let new_quantity = 0;
    let buy_quantity = 0;

    for(let i=0; i<trade_history.length; ++i){

        if(trade_history[i]._id.toString() === data.trade_id){
            update_index = i;
            updated_trade._id = stock.trade_history[update_index]._id;
            trade_history[i] = updated_trade;
        }

        if(trade_history[i].order_type === 'buy'){
            new_quantity += trade_history[i].quantity;
            new_value += trade_history[i].quantity * trade_history[i].price;
            buy_quantity += trade_history[i].quantity
        }

        else{ // order_type === 'sell'
            new_quantity -= trade_history[i].quantity;
            // new_value -= trade_history[i].quantity * trade_history[i].price;
        }
    
    }

    if(update_index === -1)
        return res.status(400).send({status : 400, msg : `No trade_id ${trade_id} found for ticker symbol ${ticker}`});

    let new_average = new_value/buy_quantity;

    if(new_quantity === 0)
        new_average = 0;

    if(new_quantity < 0 || new_value < 0){
        return res.status(400).send({status : 400, msg : "Cannot update changes, quantity going into negative"});

    }

    else{
        let result = await db.updateSingleTrade(stock, new_quantity, new_average, update_index, updated_trade);
        return res.status(result.status).send(result);
    }

    
    // let old_type = trade_history[update_index].order_type;
    // let old_price = trade_history[update_index].price;
    // let old_quantity = trade_history[update_index].quantity;
    // let old_value = old_price*old_quantity;

    // let new_value = updated_trade.quantity * updated_trade.price;

    // let new_available = 0;
    // let new_average = 0;

    // if(old_type === 'buy'){ // sell that trade to reverse the effect
    //     new_available = stock.available - old_quantity;
    //     new_average = stock.average_price;
    // }

    // else{ // buy that trade
    //     new_available = stock.available + old_quantity;
    //     new_average = (stock.average_price*stock.available + old_value)/new_available;
    // }


    // if(updated_trade.order_type === 'buy'){
    //     new_average = (new_average*new_available + updated_trade.quantity*updated_trade.price)/(new_available + updated_trade.quantity);
    //     new_available = new_available +  updated_trade.quantity;

    // }

    // else{ // update_trade.order_type === 'sell'
    //     new_available = new_available -  updated_trade.quantity;

    // }

    // if(new_available < 0 || new_average < 0){
    //     return res.status(400).send({status : 400, msg : "Cannot update changes, quantity going into negative"});

    // }

    // else{
    //     let result = await db.updateSingleTrade(stock, new_available, new_average, update_index, updated_trade);
    //     return res.status(result.status).send(result);

    // }

        

}

async function remove_trade(req, res, next){
     /* Validate the request (RequestValidator)
        refine the request for correct data types
        Logic to perform different validation checks whether request can proceed
        1. Check whether request is valid (quantity not going into negative etc. )
        2. loop over all the trades in (trade_history) of particlar security and calculate new quantity available, new average and other parametrs
        3. if quantity availabe is going into negative we cannot perform the delete request, hence rejected
        call database function to update/save the information into database */


    let data = req.body;
    let validator = RequestValidator.remove_trade(data);

    if(validator.status !== 200)
        return res.status(validator.status).send(validator);
    
    let ticker = data.ticker.toUpperCase();
    let trade_id = data.trade_id;
    let stock = await db.getStockByTicker(data.ticker);

    if(!stock)
        return res.status(404).send({status : 404, msg : `No stocks found for ticker symbol ${ticker}` });

    let trade_history = stock.trade_history;
    let delete_index = -1;

    let new_value = 0;
    let new_quantity = 0;
    let buy_quantity = 0;

    for(let i=0; i<trade_history.length; ++i){

        if(trade_history[i]._id.toString() === data.trade_id){
            delete_index = i;
        }

        else{

            if(trade_history[i].order_type === 'buy'){
                new_quantity += trade_history[i].quantity;
                new_value += trade_history[i].quantity * trade_history[i].price;
                buy_quantity += trade_history[i].quantity
            }
    
            else{ // order_type === 'sell'
                new_quantity -= trade_history[i].quantity;
            
            }

        }
    }

    if(delete_index === -1)
        return res.status(400).send({status : 400, msg : `No trade_id ${trade_id} found for ticker symbol ${ticker}`});

    if(new_quantity < 0 || new_value < 0){
        return res.status(400).send({status : 400, msg : "Cannot update changes, quantity going into negative"});
    }

    let new_average = new_value/buy_quantity;

    if(new_quantity === 0)
        new_average = 0;

    let result = await db.deleteSingleTrade(stock, new_quantity, new_average, delete_index);
    return res.status(result.status).send(result);
    


}

async function fetch_all_trades(req, res, next){
    let result = await db.getAllStocks();

    if(result.status !== 200)
        res.status(result.status).send(result);

    else{
        for(let i=0; i<result.data.length; ++i){
            result.data[i].average_price = parseFloat(result.data[i].average_price);
        }

        res.status(200).send({status: 200, data : result.data});
    }

}

async function fetch_portfolio(req, res, next){

        let result = await db.getAllStocks();
        
        if(result.status !== 200)
            res.status(result.status).send(result);
        else{
            let portfolio = [];
            let data = result.data;
            for(let index=0; index < data.length; ++index){

                if(data[index].available > 0)
                    portfolio.push({ticker : data[index].ticker_symbol,
                                    price : parseFloat(data[index].average_price),
                                    quntity : data[index].available,
                                    });
            }

            res.status(200).send({status : 200, data : portfolio});
        
        }
    
}

async function fetch_returns(req, res, next){
    const current_price = 100;

    let result = await db.getAllStocks();

    if(result.status !== 200)
        res.status(result.status).send(result);
    
    else{

        total_returns = 0;
        result.data.forEach((stock) => {
            total_returns += (current_price - parseFloat(stock.average_price))*parseInt(stock.available);
        })

        res.status(200).send({status : 200, total_returns : total_returns});
    }
    

}



module.exports = {
    execute_trade,
    fetch_portfolio,
    fetch_all_trades,
    fetch_returns,
    update_trade,
    remove_trade
}