const initialState = {
    trendDateStart: new Date(new Date() - 365 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    trendDateEnd: new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    itemActive: '',
    itemActive2: '',
    page: 1,
    page2: 1,
    searched: '',
    sortBy: 'Owned',
    filters: {
        position: 'W/R/T/Q',
        team: 'All',
        draftClass: 'All'
    },
    statType1: 'SF Dynasty (KTC)',
    statType2: 'SF Trend Dynasty (KTC)',
    snapPercentageMin: 0,
    snapPercentageMax: 100,
    modalVisible: {
        options: false,
        player: false,
        player2: false
    },
    tab: {
        secondary: 'Owned'
    }
};

const playersReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATE_PLAYERS':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state
    }
}

export default playersReducer;