'use strict'

module.exports = (app) => {
    var router = require("express").Router();

    router.get('/allplayers', (req, res) => {
        const allplayers = require('../../allplayers.json');

        res.send(allplayers)
    })


    router.get('/schedule', (req, res) => {
        const schedule = require('../../schedule.json');

        res.send(schedule)
    })

    router.get('/projections', (req, res) => {
        const projections = require('../../projections.json');

        res.send(projections)
    })

    app.use('/main', router);
}

