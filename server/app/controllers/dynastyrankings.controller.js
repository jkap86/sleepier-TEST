'use strict'
const db = require("../models");
const DynastyRankings = db.dynastyrankings;
const Op = db.Sequelize.Op;
const NodeCache = require('node-cache');
const cache = new NodeCache();
const zlib = require('zlib');

exports.find = async (req, res) => {
    const values_cache = cache.get(`${req.query.date1}_${req.query.date2}`)

    if (values_cache) {
        console.log('values from cache...')
        res.send(JSON.parse(values_cache))
    } else {
        console.log('values from db...')
        const values = await DynastyRankings.findAll({
            where: {
                [Op.or]: [
                    {
                        date: req.query.date1
                    },
                    {
                        date: req.query.date2
                    }
                ]
            },
            raw: true
        })

        const values_array = values.map(v => {
            const values_date_array = Object.keys(v.values).map(player_id => {
                return {
                    ...v.values[player_id],
                    player_id: player_id
                }
            })

            return {
                date: v.date,
                values: values_date_array
            }
        })

        cache.set(`${req.query.date1}_${req.query.date2}`, JSON.stringify(values_array), 1800)

        res.send(values_array)
    }
}

exports.findrange = async (req, res) => {
    const values = await DynastyRankings.findAll({
        where: {
            date: req.query.dates
        },
        raw: true
    })

    res.send(values)
}

exports.stats = async (req, res) => {
    const stats_cache = cache.get(`stats_${req.query.date1}_${req.query.date2}`)

    if (stats_cache) {
        console.log('stats from cache...')

        res.send(JSON.parse(stats_cache));
    } else {
        const stats = require('../../stats.json');

        const stats_data = stats
            .filter(s =>
                (new Date(s.date).getTime() + 1 * 24 * 60 * 60 * 1000) > new Date(req.query.date1).getTime()
                && (new Date(s.date).getTime() - 1 * 24 * 60 * 60 * 1000) < new Date(req.query.date2).getTime()
                && s.stats.pts_ppr
            )
        cache.set(`stats_${req.query.date1}_${req.query.date2}`, JSON.stringify(stats_data), 1800)

        res.send(stats_data)

    }
}

