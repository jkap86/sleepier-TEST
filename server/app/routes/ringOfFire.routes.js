'use strict'

module.exports = (app) => {
    const rof = require('../controllers/ringOfFire.controller.js')
    const rof_leagues = require('../../rof.json');
    const osr_leagues = require('../../osr.json');

    var router = require("express").Router();

    router.get('/home', async (req, res) => {
        rof.home(req, res, app)
    })

    router.post('/rof', (req, res) => {
        rof.standings(req, res, rof_leagues[req.body.season], 'rof');
    })

    router.post('/osr', (req, res) => {
        rof.standings(req, res, osr_leagues[req.body.season], 'osr');
    })

    app.use('/pools', router);
}