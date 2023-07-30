
const initialState = {
    isLoadingData: false,
    filteredData: [],
    filteredLeagueCount: 0
};

const filteredDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_FILTERED_DATA_START':
            return { ...state, isLoadingData: true };
        case 'FETCH_FILTERED_DATA_SUCCESS':
            return {
                ...state,
                filteredData: action.payload.filteredData,
                filteredLeagueCount: action.payload.filteredLeagueCount,
                isLoadingData: false
            };
        case 'FETCH_FILTERED_DATA_FAILURE':
            return { ...state, isLoadingData: false, error: action.payload };
        case 'RESET_STATE':
            console.log('resetting filtereddata')
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default filteredDataReducer;

