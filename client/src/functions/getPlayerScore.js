export const getPlayerScore = (stats_array, scoring_settings, total = false) => {

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