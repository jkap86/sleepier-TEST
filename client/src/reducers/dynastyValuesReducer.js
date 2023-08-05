
const initialState = {
    isLoading: false,
    dynastyValues: [],
    error: null
};

const dynastyValuesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_DYNASTY_VALUES_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_DYNASTY_VALUES_SUCCESS':
            console.log({ payload: action.payload })
            const values_object = action.payload.dates ? action.payload.data : action.payload.data
                .map(date_values_object => {
                    return {
                        date: date_values_object.date,
                        values: Object.fromEntries(date_values_object.values.map(obj => {
                            return [obj.player_id, obj]
                        }))
                    }

                })

            console.log({ values_object: values_object })
            return {
                ...state,
                isLoading: false,
                dynastyValues: values_object,
                error: null
            };
        case 'FETCH_DYNASTY_VALUES_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default dynastyValuesReducer;