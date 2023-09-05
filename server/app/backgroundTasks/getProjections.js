'use strict'

module.exports = async (app) => {
    const axios = require('../api/axiosInstance');
    const fs = require('fs');

    const getProjections = async (season, week) => {
        console.log('Update Projections...')

        const getPlayerScore = (stats_array, scoring_settings, total = false) => {

            let total_breakdown = {};

            stats_array?.map(stats_game => {
                Object.keys(stats_game?.stats || {})
                    .filter(x => Object.keys(scoring_settings).includes(x))
                    .map(key => {
                        if (!total_breakdown[key]) {
                            total_breakdown[key] = {
                                stats: 0,
                                points: 0
                            }
                        }
                        total_breakdown[key] = {
                            stats: total_breakdown[key].stats + stats_game.stats[key],
                            points: total_breakdown[key].points + (stats_game.stats[key] * scoring_settings[key])
                        }
                    })
            })

            return total
                ? Object.keys(total_breakdown).reduce((acc, cur) => acc + total_breakdown[cur].points, 0)
                : total_breakdown;
        }

        const projections = []

        for (let i = week; i < 19; i++) {
            for (const position of ['QB', 'RB', 'WR', 'TE']) {
                const projections_week = await axios.get(`https://api.sleeper.com/projections/nfl/${season}/${i}?season_type=regular&position[]=${position}&order_by=ppr`)

                const ppr_scoring_settings = {
                    'pass_yd': 0.04,
                    'pass_td': 4,
                    'pass_2pt': 2,
                    'pass_int': -1,
                    'rush_yd': 0.1,
                    'rush_2pt': 2,
                    'rush_td': 6,
                    'rec': 1,
                    'rec_yd': 0.1,
                    'rec_2pt': 2,
                    'rec_td': 6,
                    'fum_lost': -2
                }

                const projections_totals = projections_week.data
                    .filter(p => p.stats.pts_ppr || p.player.injury_status)
                    .map(p => {
                        const ppr_score = getPlayerScore([p], ppr_scoring_settings, true)
                        return {
                            week: i,
                            player_id: p.player_id,
                            injury_status: p.player.injury_status,
                            stats: {
                                ...p.stats,
                                pts_ppr: ppr_score
                            }
                        }
                    })

                projections.push(...projections_totals)

            }
            console.log(`Projections updated for Week ${i}`)
        }
        console.log('Projections Update Complete')
        fs.writeFileSync('./projections.json', JSON.stringify(projections))
    }

    if (process.env.DATABASE_URL) {
        setTimeout(async () => {
            const month = new Date().getMonth()
            const state = app.get('state')
            if (month > 5) {
                try {
                    await getProjections(state.league_season, state.display_week)
                } catch (error) {
                    console.log(error)
                }
            }
        }, 5000)

        setInterval(async () => {
            const month = new Date().getMonth();
            const state = app.get('state')
            if (month > 5) {
                await getProjections(state.league_season, state.display_week)
            }
        }, 15 * 60 * 1000)
    }
}