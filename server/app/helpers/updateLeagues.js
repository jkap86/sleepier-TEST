'use strict'
const axios = require('axios');

const updateBatchedLeagues = async (leagues, display_week, sync) => {
    const updated_leagues = [];

    const batchSize = 10;

    for (let i = 0; i < leagues.length; i += batchSize) {
        const batch = leagues.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async league => {
                const result = await updatedLeague(league, display_week, sync);

                return result;
            })
        )

        updated_leagues.push(...batchResults);
    }
    const results = await Promise.all(updated_leagues);

    return results;
}

const updatedLeague = async (league_to_update, display_week, sync) => {
    try {
        const league = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}`)
        const users = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/users`)
        const rosters = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/rosters`)
        const drafts = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/drafts`)
        const traded_picks = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/traded_picks`)



        //  update current week matchup for existing leagues, get all season matchups through current weekk for new leagues

        let matchups = Object.fromEntries(
            Object.keys(league_to_update)
                .filter(key => key.startsWith('matchups_'))
                .map(key => [key, league_to_update[key]])
        )

        if (sync) {
            try {

                const matchup_prev = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/matchups/${sync}`)

                matchups[`matchups_${sync}`] = (league.data.settings.playoff_week_start < 1 || sync < league.data.settings.playoff_week_start) ? matchup_prev.data : []



            } catch (error) {
                console.log(error)
            }
        } else if (league.data.status === 'in_season') {
            try {
                const matchup_week = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/matchups/${Math.max(display_week, 1)}`)
                matchups[`matchups_${Math.max(display_week, 1)}`] = matchup_week.data

                /*
                if (new_league) {


                    await Promise.all(Array.from(Array(18).keys())
                        .filter(key => key + 1 !== Math.max(display_week, 1))
                        .map(async week => {
                            const matchup_prev = await axios.get(`https://api.sleeper.app/v1/league/${league_to_update.league_id}/matchups/${week + 1}`)

                            matchups[`matchups_${week + 1}`] = (league.data.settings.playoff_week_start < 1 || week + 1 < league.data.settings.playoff_week_start) ? matchup_prev.data : []

                        }))
                }
                */

            } catch (error) {
                console.log(error)
            }
        } else {
            matchups[`matchups_${Math.max(display_week, 1)}`] = []
        }



        const draft_picks = (
            rosters.data.find(roster => roster.players?.length > 0)
            && league.data.settings.type === 2
        )
            && getDraftPicks(traded_picks.data, rosters.data, users.data, drafts.data, league.data)
            || []

        const drafts_array = []

        for (const draft of drafts.data) {
            drafts_array.push({
                draft_id: draft.draft_id,
                status: draft.status,
                rounds: draft.settings.rounds,
                draft_order: draft.draft_order
            })
        }


        const rosters_username = rosters.data
            ?.sort(
                (a, b) =>
                    (b.settings?.wins ?? 0) - (a.settings?.wins ?? 0)
                    || (b.settings?.fpts ?? 0) - (a.settings?.fpts ?? 0)
            );

        for (const [index, roster] of rosters_username.entries()) {
            const user = users.data.find(u => u.user_id === roster.owner_id);
            const co_owners = roster.co_owners?.map(co => {
                const co_user = users.data.find(u => u.user_id === co);
                return {
                    user_id: co_user?.user_id,
                    username: co_user?.display_name,
                    avatar: co_user?.avatar
                };
            });
            rosters_username[index] = {
                rank: index + 1,
                taxi: roster.taxi,
                starters: roster.starters,
                settings: roster.settings,
                roster_id: roster.roster_id,
                reserve: roster.reserve,
                players: roster.players,
                user_id: roster.owner_id,
                username: user?.display_name,
                avatar: user?.avatar,
                co_owners,
                draft_picks: draft_picks[roster.roster_id]
            };
        }

        const {
            type,
            best_ball,
            trade_deadline,
            waiver_day_of_week,
            daily_waivers_hour,
            league_average_match,
            playoff_week_start
        } = league.data.settings || {}

        const settings = {
            type,
            best_ball,
            trade_deadline,
            waiver_day_of_week,
            daily_waivers_hour,
            league_average_match,
            playoff_week_start,
            status: league.data.status
        }

        const users_w_rosters = users.data
            ?.filter(user =>
                rosters.data
                    ?.find(roster =>
                        roster.owner_id === user.user_id
                        || roster.co_owners?.find(co => co === user.user_id)
                    )
            )



        return {
            league_id: league_to_update.league_id,
            name: league.data.name,
            avatar: league.data.avatar,
            season: league.data.season,
            settings: settings,
            scoring_settings: league.data.scoring_settings,
            roster_positions: league.data.roster_positions,
            rosters: rosters_username,
            drafts: drafts_array,
            ...matchups,
            updatedAt: Date.now(),
            users: users_w_rosters
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getDraftPicks = (traded_picks, rosters, users, drafts, league) => {
    let draft_season;
    if (drafts.find(x => x.status !== 'complete' && x.settings.rounds === league.settings.draft_rounds)) {
        draft_season = parseInt(league.season)
    } else {
        draft_season = parseInt(league.season) + 1
    }

    const draft_order = drafts.find(x => x.status !== 'complete' && x.settings.rounds === league.settings.draft_rounds)?.draft_order

    let original_picks = {}

    for (let i = 0; i < rosters.length; i++) {
        original_picks[rosters[i].roster_id] = []

        for (let j = parseInt(draft_season); j <= parseInt(draft_season) + 2; j++) {

            for (let k = 1; k <= league.settings.draft_rounds; k++) {
                const original_user = users.find(u => u.user_id === rosters[i].owner_id)

                if (!traded_picks.find(pick => parseInt(pick.season) === j && pick.round === k && pick.roster_id === rosters[i].roster_id)) {
                    original_picks[rosters[i].roster_id].push({
                        season: j,
                        round: k,
                        roster_id: rosters[i].roster_id,
                        original_user: {
                            avatar: original_user?.avatar || null,
                            user_id: original_user?.user_id || '0',
                            username: original_user?.display_name || 'Orphan'
                        },
                        order: draft_order && draft_order[original_user?.user_id]
                    })
                }
            }
        }

        traded_picks.filter(x => x.owner_id === rosters[i].roster_id && parseInt(x.season) >= draft_season)
            .forEach(pick => {
                const original_user = users.find(u => rosters.find(r => r.roster_id === pick.roster_id)?.owner_id === u.user_id)
                original_picks[rosters[i].roster_id].push({
                    season: parseInt(pick.season),
                    round: pick.round,
                    roster_id: pick.roster_id,
                    original_user: {
                        avatar: original_user?.avatar || null,
                        user_id: original_user?.user_id || '0',
                        username: original_user?.display_name || 'Orphan'
                    },
                    order: draft_order && draft_order[original_user?.user_id]
                })
            })

        traded_picks.filter(x => x.previous_owner_id === rosters[i].roster_id)
            .forEach(pick => {
                const index = original_picks[rosters[i].roster_id].findIndex(obj => {
                    return obj.season === pick.season && obj.round === pick.round && obj.roster_id === pick.roster_id
                })

                if (index !== -1) {
                    original_picks[rosters[i].roster_id].splice(index, 1)
                }
            })
    }



    return original_picks
}

module.exports = {
    updateBatchedLeagues: updateBatchedLeagues,
    updatedLeague: updatedLeague,
    getDraftPicks: getDraftPicks
}