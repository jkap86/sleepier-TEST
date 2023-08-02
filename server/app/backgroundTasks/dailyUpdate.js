'use strict'

const { getAllPlayers, getState, getSchedule } = require('../helpers/getMain');
const fs = require('fs');
const axios = require('axios');

module.exports = async (app) => {
    getAllPlayers();

    getState(app);

    getSchedule();

    const getLeaguesROF = async () => {
        const leaguesOSR = {
            ['2023']: []
        };

        const league_ids_osr = [
            "930325852280164352",
            "930325132374065152",
            "930324974538248192",
            "930324676855922688",
            "928122592064544768",
            "930324845496315904"
        ];

        for (const league_id of league_ids_osr) {
            leaguesOSR['2023'].push(league_id)

            let league = await axios.get(`https://api.sleeper.app/v1/league/${league_id}`)

            let prev_id = league.data.previous_league_id;

            while (prev_id) {
                const prev_league = await axios.get(`https://api.sleeper.app/v1/league/${prev_id}`)
                const season = prev_league.data.season

                if (!leaguesOSR[season]) {
                    leaguesOSR[season] = []
                }

                leaguesOSR[season].push(prev_id)



                prev_id = prev_league.data.previous_league_id

            }
        }



        fs.writeFileSync('./osr.json', JSON.stringify(leaguesOSR))
    }

    //  getLeaguesROF()
}