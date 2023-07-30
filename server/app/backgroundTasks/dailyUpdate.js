'use strict'

const { getAllPlayers, getState, getSchedule } = require('../helpers/getMain');


module.exports = async (app) => {
    getAllPlayers();

    getState(app);

    getSchedule();

}