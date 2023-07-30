'use strict'
const db = require("../models");
const User = db.users;
const Trade = db.trades;
const League = db.leagues;
const Op = db.Sequelize.Op
const sequelize = db.sequelize
const NodeCache = require('node-cache');
const cache_trades = new NodeCache()

exports.leaguemate = async (req, res) => {
    const trades_cache = cache_trades.get(`${req.body.user_id}_${req.body.manager}_${req.body.player}_${req.body.offset}_${req.body.limit}`)

    if (trades_cache) {
        console.log('trades from cache...')
        res.send(trades_cache)
    } else {
        let filters = [];

        if (req.body.manager) {
            filters.push({
                managers: {
                    [Op.contains]: [req.body.manager]
                }
            })
        }

        if (req.body.player) {
            if (req.body.player.includes('.')) {
                const pick_split = req.body.player.split(' ')
                const season = pick_split[0]
                const round = parseInt(pick_split[1]?.split('.')[0])
                const order = parseInt(season) === parseInt(new Date().getFullYear()) ? parseInt(pick_split[1]?.split('.')[1]) : null

                filters.push({
                    players: {
                        [Op.contains]: [`${season} ${round}.${order}`]
                    }

                })
            } else {
                filters.push({
                    players: {
                        [Op.contains]: [req.body.player]
                    }

                })
            }
        }

        let lmTrades;

        try {
            lmTrades = await Trade.findAndCountAll({
                order: [['status_updated', 'DESC']],
                offset: req.body.offset,
                limit: req.body.limit,
                where: { [Op.and]: filters },
                attributes: ['transaction_id', 'status_updated', 'rosters', 'managers', 'adds', 'drops', 'draft_picks', 'leagueLeagueId'],
                include: [
                    {
                        model: League,
                        attributes: ['league_id', 'name', 'avatar', 'roster_positions', 'scoring_settings', 'settings'],
                    },
                    {
                        model: User,
                        attributes: [],
                        through: { attributes: [] },
                        include: {
                            model: League,
                            attributes: [],
                            through: { attributes: [] },
                            include: {
                                model: User,
                                attributes: [],
                                through: { attributes: [] },
                                where: {
                                    user_id: req.body.user_id
                                },
                                duplicating: false,
                                subQuery: true
                            },
                            duplicating: false,
                            required: true,
                            subQuery: true

                        },
                        duplicating: false,
                        required: true
                    }
                ],
                group: ['trade.transaction_id', 'league.league_id'],
                raw: true
            })
        } catch (error) {
            console.log(error)
        }

        const trades_to_send = {
            rows: JSON.stringify(lmTrades.rows),
            count: lmTrades?.count?.length
        }

        cache_trades.set(`${req.body.user_id}_${req.body.manager}_${req.body.player}_${req.body.offset}_${req.body.limit}`, trades_to_send, 1800)

        res.send(trades_to_send)
    }
}

exports.pricecheck = async (req, res) => {
    const trades_cache = cache_trades.get(`price_check_${req.body.player}_${req.body.player2}`)

    if (trades_cache) {
        console.log('trades from cache...')
        res.send(trades_cache)
    } else {
        console.log('trades from db...')
        let filters = [];

        if (req.body.player.includes('.')) {
            const pick_split = req.body.player.split(' ')
            const season = pick_split[0]
            const round = parseInt(pick_split[1]?.split('.')[0])
            const order = parseInt(pick_split[1]?.split('.')[1])

            filters.push({
                price_check: {
                    [Op.contains]: [`${season} ${round}.${order}`]
                }
            })
        } else {
            filters.push({
                price_check: {
                    [Op.contains]: [req.body.player]
                }

            })
        }

        if (req.body.player2) {
            if (req.body.player2.includes('.')) {
                const pick_split = req.body.player2.split(' ')
                const season = pick_split[0]
                const round = parseInt(pick_split[1]?.split('.')[0])
                const order = parseInt(pick_split[1]?.split('.')[1])

                filters.push({
                    players: {
                        [Op.contains]: [`${season} ${round}.${order}`]
                    }
                })
            } else {
                filters.push({
                    players: {
                        [Op.contains]: [req.body.player2]
                    }
                })
            }


        }


        let pcTrades;
        let players2;

        try {
            pcTrades = await Trade.findAndCountAll({
                order: [['status_updated', 'DESC']],
                offset: req.body.offset,
                limit: req.body.limit,
                where: {
                    [Op.and]: filters
                },
                attributes: ['transaction_id', 'status_updated', 'rosters', 'managers', 'adds', 'drops', 'draft_picks', 'leagueLeagueId'],
                include: {
                    model: League,
                    attributes: ['name', 'avatar', 'scoring_settings', 'roster_positions', 'settings']
                },
                raw: true
            })


        } catch (error) {
            console.log(error)
        }

        cache_trades.set(`price_check_${req.body.player}_${req.body.player2}`, pcTrades, 1800)

        res.send(pcTrades)
    }
}
