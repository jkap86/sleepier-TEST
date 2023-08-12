const initialState = {
    itemActive: '',
    page: 1,
    searched: '',
    secondaryContent: 'Leagues',
    itemActive_leagues: '',
    page_leagues: 1,
    itemActive_players: '',
    page_players_c: 1,
    page_players_a: 1,
    searched_players: '',
    sortBy: 'Leaguemate'

};

const leaguematesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATE_LEAGUEMATES':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state
    }
}

export default leaguematesReducer;