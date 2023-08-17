'use strict'

module.exports = app => {
    const rateLimit = require('express-rate-limit');
    const dynastyrankings = require("../controllers/dynastyrankings.controller.js");


    const dynastyrankingsLimiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    })

    var router = require("express").Router();

    router.get("/stats", dynastyrankings.stats)

    router.get("/find", dynastyrankings.find)

    router.get("/findrange", dynastyrankings.findrange)

    app.use('/dynastyrankings', router);
}