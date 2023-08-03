import axios from 'axios';
import { saveToDB } from '../functions/indexedDB';
import { filterData } from '../functions/filterData';
import { getTradeTips } from '../functions/getTradeTips';


export const resetState = () => ({
    type: 'RESET_STATE'
});

export const fetchUser = (username) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_USER_START' });

        try {
            const user = await axios.get('/user/create', {
                params: { username: username }
            });

            console.log(user.data)

            if (!user.data?.error) {
                dispatch({ type: 'FETCH_USER_SUCCESS', payload: user.data.user });

                dispatch({ type: 'SET_STATE_MAIN', payload: { state: user.data.state } })
            } else {
                dispatch({ type: 'FETCH_USER_FAILURE', payload: user.data });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message });
        }
    };
};

export const fetchLeagues = (user_id) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LEAGUES_START' })

        try {
            const response = await fetch(`/league/find?user_id=${encodeURIComponent(user_id)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const reader = response.body.getReader();

                let leagues = ''

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;


                    leagues += new TextDecoder().decode(value);

                    const matches = leagues.match(/"league_id":/g);

                    let count = 0;

                    if (matches && matches.length > 0) {
                        count = matches.length
                    }

                    dispatch({ type: 'SET_STATE_USER', payload: { progress: count } })
                }

                let parsed_leagues;
                try {
                    parsed_leagues = JSON.parse(leagues)
                } catch (error) {
                    console.log(error)
                }
                console.log(parsed_leagues)

                dispatch({ type: 'FETCH_LEAGUES_SUCCESS', payload: parsed_leagues.flat() });

            } else {
                dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: 'Failed to fetch user leagues' });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: error.message });
        }
    }
}

export const fetchMain = (item) => {
    let expiration;

    switch (item) {
        case 'allplayers':
            expiration = 24 * 60 * 60 * 1000;
            break;
        case 'projections':
            expiration = 15 * 60 * 1000;
            break;
        case 'schedule':
            expiration = 24 * 60 * 60 * 1000;
            break;
        default:
            break;
    };

    return async (dispatch) => {
        dispatch({ type: 'FETCH_MAIN_START', payload: { item: item } });

        try {
            const main = await axios.get(`/main/${item}`);

            const data = item !== 'projections' ? main.data[0] : main.data[0].reduce((result, item) => {
                const { week, player_id, ...stats } = item;

                if (!result[week]) {
                    result[week] = {};
                }

                result[week][player_id] = stats;
                return result;
            }, {})

            dispatch({
                type: 'FETCH_MAIN_SUCCESS', payload: {
                    item: item,
                    data: data
                }
            });

            saveToDB(item, {
                timestamp: new Date().getTime() + expiration,
                data: data
            })
        } catch (error) {
            dispatch({ type: 'FETCH_MAIN_FAILURE', payload: error.message });

            console.error(error.message)
        }
    }
}

export const fetchFilteredData = (leagues, type1, type2, tab, season) => async (dispatch) => {
    dispatch({ type: 'FETCH_FILTERED_DATA_START' });

    try {
        const filteredData = filterData(leagues, type1, type2, tab, season);


        dispatch({
            type: 'FETCH_FILTERED_DATA_SUCCESS',
            payload: filteredData
        });
    } catch (error) {
        dispatch({ type: 'FETCH_FILTERED_DATA_FAILURE', payload: error.message });
    }
};

export const setState = (state_obj, tab) => ({
    type: `SET_STATE_${tab}`,
    payload: state_obj
})

export const fetchStats = (trendDateStart, trendDateEnd) => async (dispatch) => {
    dispatch({ type: 'FETCH_STATS_START' })

    try {
        const stats = await axios.get('/dynastyrankings/stats', {
            params: {
                date1: trendDateStart,
                date2: trendDateEnd
            }
        });



        dispatch({
            type: 'FETCH_STATS_SUCCESS', payload: {
                date1: trendDateStart,
                date2: trendDateEnd,
                stats: stats.data
            }
        })
    } catch (error) {
        dispatch({ type: 'FETCH_STATS_FAILURE', payload: error.message })
    }
};

export const fetchValues = (trendDateStart, trendDateEnd, dates, player_ids) => async (dispatch) => {
    dispatch({ type: 'FETCH_DYNASTY_VALUES_START' })

    let dynastyValues;
    try {
        if (dates) {
            dynastyValues = await axios.get('/dynastyrankings/findrange', {
                params: {
                    dates: dates
                }
            })
        } else {
            dynastyValues = await axios.get('/dynastyrankings/find', {
                params: {
                    date1: trendDateStart,
                    date2: trendDateEnd
                }
            });
        }


        dispatch({ type: 'FETCH_DYNASTY_VALUES_SUCCESS', payload: dynastyValues.data })
    } catch (error) {
        dispatch({ type: 'FETCH_DYNASTY_VALUES_FAILURE', payload: error.message })
    }
};

export const fetchLmTrades = (user_id, leagues, season, offset, limit) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_TRADES_START' });

        try {
            const trades = await axios.post('/trade/leaguemate', {
                user_id: user_id,
                offset: offset,
                limit: limit
            })



            const trades_tips = getTradeTips(JSON.parse(trades.data.rows), leagues, season)

            dispatch({
                type: 'FETCH_LMTRADES_SUCCESS', payload: {
                    count: trades.data.count,
                    trades: trades_tips
                }
            });
        } catch (error) {
            dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message })
        }
    }
}

export const fetchFilteredLmTrades = (searchedPlayerId, searchedManagerId, league_season, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_TRADES_START' });

    const state = getState();

    const { user } = state;

    try {
        const trades = await axios.post('/trade/leaguemate', {
            user_id: user.user.user_id,
            player: searchedPlayerId,
            manager: searchedManagerId,
            offset: offset,
            limit: limit,
        });

        const trades_tips = getTradeTips(JSON.parse(trades.data.rows), user.leagues, league_season)

        dispatch({
            type: 'FETCH_FILTERED_LMTRADES_SUCCESS',
            payload: {
                player: searchedPlayerId,
                manager: searchedManagerId,
                trades: trades_tips,
                count: trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message });
    }


};

export const fetchPriceCheckTrades = (pricecheck_player, pricecheck_player2, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_TRADES_START' });

    const state = getState();

    const { user, main } = state;

    try {
        const player_trades = await axios.post('/trade/pricecheck', {
            player: pricecheck_player,
            player2: pricecheck_player2,
            offset: offset,
            limit: limit
        })

        const trades_tips = getTradeTips(player_trades.data.rows, user.leagues, main.state.league_season)

        dispatch({
            type: 'FETCH_PRICECHECKTRADES_SUCCESS',
            payload: {
                pricecheck_player: pricecheck_player,
                pricecheck_player2: pricecheck_player2,
                trades: trades_tips,
                count: player_trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message });
    }

};

export const syncLeague = (league_id, user_id, username, week) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SYNC_LEAGUE_START' });

        const state = getState();
        const { main } = state;

        try {
            const updated_league = await axios.post(`/league/sync`, {
                league_id: league_id,
                username: username,
                week: week
            })

            const userRoster = updated_league.data.rosters
                ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))

            dispatch({
                type: 'SYNC_LEAGUES_SUCCESS',
                payload: {
                    league: {
                        ...updated_league.data,
                        userRoster: userRoster
                    },
                    state: main.state
                }
            })
        } catch (error) {
            console.error(error.message)
            dispatch({ type: 'SYNC_LEAGUES_FAILURE' })
        }

    };
}

export const uploadRankings = (uploadedRankings) => ({
    type: 'UPLOAD_RANKINGS',
    payload: uploadedRankings
})

export const updateSleeperRankings = (updatedRankings) => ({
    type: 'UPDATE_SLEEPER_RANKINGS',
    payload: updatedRankings
})