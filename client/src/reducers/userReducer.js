import { saveToDB } from "../functions/indexedDB";

const initialState = {
    isLoadingUser: false,
    user: {},
    isLoadingLeagues: false,
    leagues: [],
    progress: 0,
    errorUser: null,
    errorLeagues: null,
    syncing: false,
    errorSyncing: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_USER_START':
            return { ...state, isLoadingUser: true, errorUser: null };
        case 'FETCH_USER_SUCCESS':
            const user = action.payload;
            return {
                ...state,
                isLoadingUser: false,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    avatar: user.avatar
                }


            };
        case 'FETCH_USER_FAILURE':
            return { ...state, isLoadingUser: false, errorUser: action.payload };
        case 'FETCH_LEAGUES_START':
            return {
                ...state,
                isLoadingLeagues: true,
                errorLeagues: null
            };
        case 'FETCH_LEAGUES_SUCCESS':
            const leagues = action.payload.filter(league => league.rosters
                ?.find(r => r.user_id === state.user.user_id || r.co_owners?.find(co => co?.user_id === state.user.user_id))
            )
                .map(league => {
                    const userRoster = league.rosters
                        ?.find(r => r.user_id === state.user.user_id || r.co_owners?.find(co => co?.user_id === state.user.user_id))

                    return {
                        ...league,
                        userRoster: userRoster,
                    }

                })
            return {
                ...state,
                isLoadingLeagues: false,
                leagues: leagues
            };
        case 'FETCH_LEAGUES_FAILURE':
            return {
                ...state,
                isLoadingLeagues: false,
                errorLeagues: action.payload
            };
        case 'SYNC_LEAGUES_START':
            return { ...state, errorSyncing: null };
        case 'SYNC_LEAGUES_SUCCESS':
            const updated_leagues = state.leagues.map(l => {
                if (l.league_id === action.payload.league.league_id) {
                    return {
                        ...l,
                        ...action.payload.league
                    }
                }
                return l
            })

            saveToDB(state.user.username.toLowerCase(), {
                timestamp: new Date().getTime() + 15 * 60 * 1000,
                data: {
                    user: state.user,
                    leagues: updated_leagues,
                    state: action.payload.state
                }
            })


            return {
                ...state,

                leagues: updated_leagues,

                syncing: false
            }
        case 'SYNC_LEAGUES_FAILURE':
            return { ...state, syncing: false, errorSyncing: action.payload }
        case 'SET_STATE_USER':
            return {
                ...state,
                ...action.payload
            };
        case 'RESET_STATE':
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default userReducer;
