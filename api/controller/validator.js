/* RequestValidator validate that incoming request have correct format
check all fields are present and their types

execute_trade() -> called from trades.execute_trade()
remove_trade() -> called from trades.remove_trade()
update_trade() -> called from trades.update_request()
*/

class RequestValidator {

    static execute_trade(data){

        if(data.type && data.quantity && data.price && data.ticker){
            let is_valid = true;
            
            let regex = new RegExp(/^[0-9a-zA-Z]+$/);
            if(!regex.test(data.ticker))
                is_valid = false;

            if(!(data.type.toLowerCase() == "buy" || data.type.toLowerCase() == "sell"))
                is_valid = false;


            if(!(parseFloat(data.price) > 0))
                is_valid = false;

            if(!(parseInt(data.quantity) > 0))
                is_valid = false;

            if(is_valid)
                return {status : 200};
            else
                return {status : 400, msg : "Invalid request, check all fields are present with correct values"}


        }

        return {status : 400, msg : "Invalid request, all required fields are not present"};
    }

    static remove_trade(data){
        
        if(data.trade_id && data.ticker){
            let regex = new RegExp(/^[0-9a-zA-Z]+$/)
            if(regex.test(data.trade_id) && regex.test(data.ticker_symbol))
                return {status : 200};
            
            else
                return {status : 400, msg : "trade_id and ticker symbol must be alpha numeric"};
        }

        else{
            return {status : 400, msg : "'trade_id' and 'ticker' must be present"};
        }
        
    }

    static update_trade(data){
        /* An additional trade_id field is required for update */

        if(data.trade_id){
            return this.execute_trade(data)
        }
        
        else{
            return {status : 400, msg : "Invalid request, 'trade_id' is not present"};
        }
    }

}

module.exports = RequestValidator;