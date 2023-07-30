const initialState = {
    itemActive: '',
    itemActive2: '',
    page: 1,
    page2: 1,
    searched: ''
};

const leaguesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATE_LEAGUES':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state
    }
}

export default leaguesReducer;