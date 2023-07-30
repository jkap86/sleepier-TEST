import { combineReducers } from 'redux';
import userReducer from './userReducer';
import mainReducer from './mainReducer';
import filteredDataReducer from './filteredDataReducer';
import leaguesReducer from './leaguesReducer';
import playersReducer from './playersReducer';
import statsReducer from './statsReducer';
import dynastyValuesReducer from './dynastyValuesReducer';
import tradesReducer from './tradesReducer';
import leaguematesReducer from './leaguematesReducer';
import lineupsReducer from './lineupsReducer';

const rootReducer = combineReducers({
    user: userReducer,
    main: mainReducer,
    filteredData: filteredDataReducer,
    leagues: leaguesReducer,
    players: playersReducer,
    stats: statsReducer,
    dynastyValues: dynastyValuesReducer,
    trades: tradesReducer,
    leaguemates: leaguematesReducer,
    lineups: lineupsReducer
});

export default rootReducer;