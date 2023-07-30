import TableMain from "../Home/tableMain";
import Trade from "./trade";
import LoadData from "../Home/loadData";
import Search from "../Home/search";
import { useSelector, useDispatch } from "react-redux";
import TradeInfo from "./tradeInfo";
import { fetchPriceCheckTrades, setState } from "../../actions/actions";

const PcTrades = ({
    trades_headers,
    players_list,
    tradeCount
}) => {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.trades)

    console.log({ pcplayer: trades.pricecheckTrades })



    const tradesDisplay = trades.pricecheckTrades.searches.find(pcTrade => pcTrade.pricecheck_player === trades.pricecheckTrades.pricecheck_player.id && pcTrade.pricecheck_player2 === trades.pricecheckTrades.pricecheck_player2.id)?.trades || []


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

        dispatch(fetchPriceCheckTrades(trades.pricecheckTrades.pricecheck_player.id, trades.pricecheckTrades.pricecheck_player2.id, tradesDisplay.length, 125))
    }

    return <>
        <LoadData tab={'pcTrades'} />

        <div className="trade_search_wrapper">
            <Search
                id={'By Player'}
                placeholder={`Player`}
                list={players_list}
                searched={trades.pricecheckTrades.pricecheck_player}
                setSearched={(searched) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, pricecheck_player: searched } }, 'TRADES'))}
            />
            {
                trades.pricecheckTrades.pricecheck_player === '' ? null :
                    <>
                        <Search
                            id={'By Player'}
                            placeholder={`Player`}
                            list={players_list}
                            searched={trades.pricecheckTrades.pricecheck_player2}
                            setSearched={(searched) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, pricecheck_player2: searched } }, 'TRADES'))}
                        />
                    </>
            }
        </div>
        <TableMain
            id={'trades'}
            type={'primary'}
            headers={trades_headers}
            body={trades_body}
            itemActive={trades.pricecheckTrades.itemActive}
            setItemActive={(item) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, itemActive: item } }, 'TRADES'))}
            page={trades.pricecheckTrades.page}
            setPage={(page) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, page: page } }, 'TRADES'))}
            partial={tradesDisplay?.length < tradeCount ? true : false}
            loadMore={loadMore}
            isLoading={trades.isLoading}

        />
    </>
}

export default PcTrades;