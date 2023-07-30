
const initialState = {
    isLoading: false,
    stats: {},
    teamStats: {},
    error: null
};

const statsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_STATS_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_STATS_SUCCESS':
            const stats_object = action.payload.stats
                .reduce((result, stats_object) => {
                    if (!result[stats_object.player_id]) {
                        result[stats_object.player_id] = [];
                    }
                    result[stats_object.player_id].push(stats_object);
                    return result;
                }, {});


            return {
                ...state,
                isLoading: false,
                stats: {
                    ...action.payload,
                    stats: stats_object
                },
                error: null
            }

        case 'FETCH_STATS_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default statsReducer;