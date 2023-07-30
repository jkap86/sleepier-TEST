'use strict'

module.exports = (app, user_cache) => {
    const users = require("../controllers/user.controller.js");
    const leagues = require("../controllers/league.controller.js");
    const { logMemUsage } = require('../helpers/logMemUsage.js');
    var router = require("express").Router();


    router.get("/create",
        (req, res, next) => {
            users.create(req, res, next, app, user_cache)
        },
        logMemUsage,
        (req, res, next) => {
            leagues.find(req, res, next, app, user_cache)
        },
        logMemUsage
    )


    app.use('/user', router);
}