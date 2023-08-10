'use strict';
const db = require("../models");
const User = db.users;
const League = db.leagues;
const axios = require('../api/axiosInstance');
const JSONStream = require('JSONStream');

exports.find = async (req, res, app, user_cache) => {
    const { updateBatchedLeagues } = require('../helpers/updateLeagues');

    const user_id = req.query.user_id;

    // get current user leagues and convert to array of league_ids

    let leagues;
    let retries = 0;



    const splitLeagues = async (leagues) => {
        const cutoff = new Date(new Date() - (24 * 60 * 60 * 1000));

        let leagues_db;

        try {
            leagues_db = await League.findAll({
                order: [['updatedAt', 'DESC']],
                where: {
                    league_id: leagues.map(league => league.league_id)
                },
                raw: true
            })
        } catch (error) {
            console.log(error)
        }

        const index = leagues_db?.findIndex(l_db => l_db.updatedAt < cutoff)

        const leagues_to_add = leagues.filter(l => !leagues_db?.find(l_db => l.league_id === l_db.league_id))
        const leagues_to_update = index >= 0 && leagues_db?.splice(index, leagues_db.length - index) || []
        const leagues_up_to_date = leagues_db || []

        console.log(leagues_to_add.length + ' new leagues')
        console.log(leagues_to_update.length + ' to update leagues')
        console.log(leagues_up_to_date.length + ' up to date leagues')

        return [leagues_to_add, leagues_to_update, leagues_up_to_date]
    }

    const processLeaguesStream = async (leagues, stream) => {
        const [leagues_to_add, leagues_to_update, leagues_up_to_date] = await splitLeagues(leagues)

        const updated_leagues = await updateBatchedLeagues([leagues_to_update, leagues_to_add].flat(), 1)

        const user_data = []
        const user_league_data = []

        updated_leagues
            .filter(league => league !== null)
            .forEach(league => {
                league.users.forEach(user => {
                    if (!user_data.find(u => u.user_id === user.user_id)) {
                        user_data.push({
                            user_id: user.user_id,
                            username: user.display_name,
                            avatar: user.avatar,
                            type: 'LM',
                            updatedAt: new Date(new Date() - 24 * 60 * 60 * 1000)
                        })
                    }

                    user_league_data.push({
                        userUserId: user.user_id,
                        leagueLeagueId: league.league_id
                    })
                })

                delete league.users;
            })

        try {
            await User.bulkCreate(user_data, { updateOnDuplicate: ["type"] });

            await League.bulkCreate(updated_leagues.filter(league => league), {
                updateOnDuplicate: ["name", "avatar", "settings", "scoring_settings", "roster_positions",
                    "rosters", "drafts", `matchups_${1}`, "updatedAt"]
            });

            await db.sequelize.model('userLeagues').bulkCreate(user_league_data, { ignoreDuplicates: true });
        } catch (error) {
            console.log(error)
        }

        const leagues_to_send = [updated_leagues, leagues_up_to_date].flat()
            .filter(league => league && league.rosters.find(roster => roster?.players?.length > 0))
            .sort((a, b) => leagues.findIndex(x => x.league_id === a.league_id) - leagues.findIndex(x => x.league_id === b.league_id))



        const data = leagues_to_send;

        if (updated_leagues.find(league => !league)) {
            data.push({ error: 'Error updating leagues...' })
        }

        try {
            // Stream the JSON data in chunks to the client
            stream.write(data);

        } catch (error) {
            console.log(error);
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = JSONStream.stringify();
    stream.pipe(res);


    const chunkSize = 25;

    try {
        try {
            leagues = await axios.get(`https://api.sleeper.app/v1/user/${user_id}/leagues/nfl/${2023}`)
        } catch (error) {
            console.log(error.message)
        }

        for (let i = 0; i < leagues.data.length; i += chunkSize) {
            const chunk = leagues.data.slice(i, i + chunkSize);
            await processLeaguesStream(chunk, stream)

        }
        const used = process.memoryUsage()

        for (let key in used) {
            console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }

        stream.end();

    } catch (error) {
        console.error(error.message);
    }
}

exports.sync = async (req, res, app, user_cache) => {
    const { updateBatchedLeagues } = require('../helpers/updateLeagues');
    const state = app.get('state')

    const updated_league = await updateBatchedLeagues([{ league_id: req.body.league_id }], state.display_week, req.body.week)

    await League.update({
        ...updated_league[0]
    }, {
        where: {
            league_id: updated_league[0]?.league_id
        }
    })

    let user_from_cache;
    try {
        user_from_cache = user_cache.get(req.body.username.toLowerCase())
    } catch (error) {
        console.log(error)
    }

    if (user_from_cache) {

        const updated_leagues = JSON.parse(user_from_cache.leagues).map(league => {
            if (league.league_id === updated_league[0]?.league_id) {
                return {
                    ...league,
                    ...updated_league[0]
                }
            } else {
                return league
            }
        })

        try {
            user_cache.set(
                req.body.username.toLowerCase(),
                {
                    ...user_from_cache,
                    leagues: JSON.stringify(updated_leagues)
                },
                cache.ttl(req.body.username.toLowerCase()))
        } catch (error) {
            console.log(error)
        }
    }
    res.send(updated_league[0])
}

exports.picktracker = async (req, res) => {
    let active_draft;
    let league;
    let league_drafts;
    try {
        league = await axios.get(`https://api.sleeper.app/v1/league/${req.body.league_id}`)
        league_drafts = await axios.get(`https://api.sleeper.app/v1/league/${req.body.league_id}/drafts`)
        active_draft = league_drafts.data?.find(d => d.settings.slots_k > 0 && d.settings.rounds > league.data.settings.draft_rounds)
    } catch (error) {
        console.log(error)
    }


    if (active_draft) {
        const allplayers = require('../../allplayers.json');
        const draft_picks = await axios.get(`https://api.sleeper.app/v1/draft/${active_draft.draft_id}/picks`)
        const users = await axios.get(`https://api.sleeper.app/v1/league/${req.body.league_id}/users`)
        const teams = Object.keys(active_draft.draft_order).length

        const picktracker = draft_picks.data.filter(pick => pick.metadata.position === "K").map((pick, index) => {
            return {
                pick: Math.floor(index / teams) + 1 + "." + ((index % teams) + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 }),
                player: allplayers[pick.player_id]?.full_name,
                player_id: pick.player_id,
                picked_by: users.data.find(u => u.user_id === pick.picked_by)?.display_name,
                picked_by_avatar: users.data.find(u => u.user_id === pick.picked_by)?.avatar
            }
        })

        res.send({
            league: league.data,
            picks: picktracker
        })

    } else {
        res.send([])
    }
}

