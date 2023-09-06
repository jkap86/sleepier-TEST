

const initialState = {
    rankings: null,
    notMatched: [],
    filename: '',
    error: null,
    playerBreakdownModal: false,
    includeTaxi: true,
    includeLocked: true,
    projectedRecordDictAll: {},
    week: 1,
    recordType: 'optimal_proj',
    column1: 'Suboptimal',
    column2: 'Early/Late Flex',
    column3: 'Out',
    column4: 'Open Taxi',
    syncing: false
}

const lineupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPLOAD_RANKINGS':
            return {
                ...state,
                rankings: action.payload.rankings,
                notMatched: action.payload.notMatched,
                filename: action.payload.filename,
                error: action.payload.error
            };
        case 'RESET_STATE':
            return {
                ...initialState
            };
        case 'SET_STATE_LINEUPS':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default lineupsReducer;