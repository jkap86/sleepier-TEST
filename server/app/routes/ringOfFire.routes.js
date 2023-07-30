'use strict'

module.exports = (app) => {
    const rof = require('../controllers/ringOfFire.controller.js')

    var router = require("express").Router();

    router.get('/home', async (req, res) => {
        rof.home(req, res, app)
    })

    router.post('/standings', rof.standings)

    app.use('/rof', router);
}