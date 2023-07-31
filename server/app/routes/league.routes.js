'use strict'

module.exports = (app, user_cache) => {
    const leagues = require("../controllers/league.controller.js");

    const router = require("express").Router();

    router.get('/find', (req, res) => {
        leagues.find(req, res, app, user_cache)
    });

    router.post('/matchups', (req, res) => {
        leagues.matchups(req, res, user_cache)
    });

    router.post('/sync', (req, res) => {
        leagues.sync(req, res, app, user_cache)
    })

    router.post("/draft", async (req, res) => {
        leagues.picktracker(req, res, app)
    })

    app.use('/league', router);
}