import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TableMain from '../Home/tableMain';
import Trade from './trade';
import LoadData from "../Home/loadData";
import TradeInfo from './tradeInfo';
import { setState, fetchLmTrades, fetchFilteredLmTrades, fetchValues } from '../../actions/actions';
import Search from '../Home/search';

const LmTrades = ({
    trades_headers,
    players_list,
    tradeCount
}) => {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.trades);
    const { state: stateState } = useSelector(state => state.main);
    const { user, leagues } = useSelector(state => state.user);


    const tradesDisplay = (!trades.lmTrades.searched_player?.id && !trades.lmTrades.searched_manager?.id)
        ? trades.lmTrades.trades
        : (
            trades.lmTrades.searches?.find(s => s.player === trades.lmTrades.searched_player.id && s.manager === trades.lmTrades.searched_manager.id)?.trades
            || []
        )


    const trades_body = tradesDisplay
        ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
        ?.map(trade => {
            return {
                id: trade.transaction_id,
                list: [

                    {
                        text: <Trade trade={trade} />,
                        colSpan: 10,
                        className: `small `
                    }

                ],
                secondary_table: (
                    <TradeInfo
                        trade={trade}
                    />
                )
            }
        }) || []

    const loadMore = async () => {
        console.log('LOADING MORE')

        if (trades.lmTrades.searched_player === '' && trades.lmTrades.searched_manager === '') {
            dispatch(fetchLmTrades(user.user_id, leagues, stateState.league_season, trades.lmTrades.trades.length, 125))
        } else {
            dispatch(fetchFilteredLmTrades(trades.lmTrades.searched_player.id, trades.lmTrades.searched_manager.id, stateState.league_season, tradesDisplay.length, 125))
        }
    }



    const managers_list = []

    leagues
        .forEach(league => {
            league.rosters
                .filter(r => parseInt(r.user_id) > 0)
                .forEach(roster => {
                    if (!managers_list.find(m => m.id === roster.user_id)) {
                        managers_list.push({
                            id: roster.user_id,
                            text: roster.username,
                            image: {
                                src: roster.avatar,
                                alt: 'user avatar',
                                type: 'user'
                            }
                        })
                    }
                })
        })

    return <>
        <LoadData tab={'lmTrades'} />

        <div className="trade_search_wrapper">
            <Search
                id={'By Player'}
                placeholder={`Player`}
                list={players_list}
                searched={trades.lmTrades.searched_player}
                setSearched={(searched) => dispatch(setState({ lmTrades: { ...trades.lmTrades, searched_player: searched } }, 'TRADES'))}
            />
            <Search
                id={'By Manager'}
                placeholder={`Manager`}
                list={managers_list}
                searched={trades.lmTrades.searched_manager}
                setSearched={(searched) => dispatch(setState({ lmTrades: { ...trades.lmTrades, searched_manager: searched } }, 'TRADES'))}
            />
        </div>
        <TableMain
            id={'trades'}
            type={'primary'}
            headers={trades_headers}
            body={trades_body}
            itemActive={trades.lmTrades.itemActive}
            setItemActive={(item) => dispatch(setState({ lmTrades: { ...trades.lmTrades, itemActive: item } }, 'TRADES'))}
            page={trades.lmTrades.page}
            setPage={(page) => dispatch(setState({ lmTrades: { ...trades.lmTrades, page: page } }, 'TRADES'))}
            partial={tradesDisplay?.length < tradeCount ? true : false}
            loadMore={loadMore}
            isLoading={trades.isLoading}
        />

    </>
}

export default LmTrades;