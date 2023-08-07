const initialState = {
    isLoading: false,
    lmTrades: {
        count: '',
        trades: [],
        itemActive: '',
        page: 1,
        searched_player: '',
        searched_manager: '',
        searches: []
    },
    pricecheckTrades: {
        searches: [],
        itemActive: '',
        page: 1,
        pricecheck_player: '',
        pricecheck_player2: ''
    },
    error: null,
    tab: {
        primary: 'Leaguemate Trades'
    }
};

const tradesReducer = (state = initialState, action) => {
    let existing_trades, new_trades, updated_search;
    switch (action.type) {
        case 'FETCH_TRADES_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_LMTRADES_SUCCESS':

            new_trades = action.payload.trades.filter(new_trade => !state.lmTrades.trades.find(old_trade => new_trade.transaction_id === old_trade.transaction_id))

            return {
                ...state,
                lmTrades: {
                    ...state.lmTrades,
                    count: action.payload.count,
                    trades: [...state.lmTrades.trades, ...new_trades]
                },
                isLoading: false
            };
        case 'FETCH_FILTERED_LMTRADES_SUCCESS':
            existing_trades = state.lmTrades.searches.find(s => s.player === action.payload.player && s.manager === action.payload.manager)?.trades || []

            new_trades = action.payload.trades.filter(new_trade => !existing_trades.find(old_trade => new_trade.transaction_id === old_trade.transaction_id))

            updated_search = {
                player: action.payload.player,
                manager: action.payload.manager,
                count: action.payload.count,
                trades: [...existing_trades, ...new_trades]
            }

            return {
                ...state,
                isLoading: false,
                lmTrades: {
                    ...state.lmTrades,
                    searches: [...state.lmTrades.searches.filter(s => !(s.player === action.payload.player && s.manager === action.payload.manager)), updated_search]
                }
            };
        case 'FETCH_PRICECHECKTRADES_SUCCESS':
            existing_trades = state.pricecheckTrades.searches.find(s => s.pricecheck_player === action.payload.pricecheck_player && s.pricecheck_player2 === action.payload.pricecheck_player2)?.trades || []

            new_trades = action.payload.trades.filter(new_trade => !existing_trades.find(old_trade => new_trade.transaction_id === old_trade.transaction_id))

            updated_search = {
                pricecheck_player: action.payload.pricecheck_player,
                pricecheck_player2: action.payload.pricecheck_player2,
                count: action.payload.count,
                trades: [...existing_trades, ...new_trades]
            }

            return {
                ...state,
                isLoading: false,
                pricecheckTrades: {
                    ...state.pricecheckTrades,
                    searches: [...state.pricecheckTrades.searches.filter(s => !(s.pricecheck_player === action.payload.pricecheck_player && s.pricecheck_player2 === action.payload.pricecheck_player2)), updated_search]
                }
            };
        case 'FETCH_TRADES_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        case 'SET_STATE_TRADES':
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
}

export default tradesReducer;