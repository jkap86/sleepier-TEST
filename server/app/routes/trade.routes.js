'use strict'

module.exports = app => {
    const rateLimit = require('express-rate-limit');
    const trades = require("../controllers/trade.controller.js");
    const { logMemUsage } = require('../helpers/logMemUsage.js');

    const tradeLimiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    })

    var router = require("express").Router();

    router.post('/leaguemate', tradeLimiter, logMemUsage, trades.leaguemate)

    router.post('/pricecheck', tradeLimiter, logMemUsage, trades.pricecheck)

    app.use('/trade', router);
}