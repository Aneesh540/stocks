const router = require('express').Router();
const trades = require('./controller/trades');


router.post('/execute_trade', trades.execute_trade);
    
router.put('/update_trade', trades.update_trade);
router.delete('/remove_trade', trades.remove_trade);

router.get('/fetch_portfolio', trades.fetch_portfolio);
router.get('/fetch_all_trades', trades.fetch_all_trades);
router.get('/fetch_returns', trades.fetch_returns);

router.all('/*', (req, res) => {
    res.status(404).send({status : 404, msg : "Incorrect URI"})
});



module.exports = router;