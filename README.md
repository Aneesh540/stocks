# Files overview 

* ```/api/routes.js``` -> route different request to their corresponding functions


### ```/api/models``` Operations which require interaction with database

1 ```/api/models/tradeModels.js``` -> defining Schema for different securities
```
ticker -> unique symbol of particular security
average_price -> average prices for share 
available -> total shares present in portfolio
trade_history -> history of all the buy and sell orders for that particular security

For each security/share this schema is created to easily access all the information without 
traversing full database

```

2 ```/api/db.js``` -> CRUD operations related to database
```
Read -> getStockByTicker() & getAllStocks()
Create -> addFirstTrade() & addTrade()
Update -> updateSingleTrade()
Delete -> deleteSingleTrade()
```

###  ```/api/controller``` Controller part perform all business logic then calls database method to update states of secutities 

1 ``` /api/validator.js ``` Checks that incoming request have all the required information & with correct format
```
Data validation for execute_trade (POST) remove_trade(DELETE) update_trade(PUT)
```
2 ```/api/trades.js``` Perform all the business logic of updating different fields before 

```
execute_trade -> logic for BUY & SELL of security
update_trade -> logic for updation of trade in a particular security (checks if update is possible)
remove_trade -> logic for deleting trade in particular security (checks if deletion is possible)
fetch_returns -> P&L of portfolio
fetch_portfolio -> returns all the security details (quantity avaialble, average price)
```
