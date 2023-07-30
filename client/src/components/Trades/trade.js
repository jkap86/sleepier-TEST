import TableMain from "../Home/tableMain";
import { useSelector } from "react-redux";
import { avatar, getTrendColor } from '../../functions/misc';

const Trade = ({
    trade
}) => {
    const { state: stateState, allplayers } = useSelector(state => state.main)
    const { dynastyValues: stateDynastyRankings } = useSelector(state => state.dynastyValues)

    const eastern_time = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

    return <TableMain
        type={'trade_summary'}
        headers={[]}
        body={
            [
                {
                    id: 'title',
                    list: [
                        {
                            text: new Date(parseInt(trade.status_updated)).toLocaleDateString('en-US') + ' ' + new Date(parseInt(trade.status_updated)).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" }),
                            colSpan: 4,
                            className: 'small'
                        },
                        {
                            text: trade['league.name'],
                            colSpan: 9,

                            image: {
                                src: trade?.['league.avatar'],
                                alt: 'league avatar',
                                type: 'league'
                            }
                        },
                    ]
                },
                ...trade.managers.map(rid => {
                    const roster = trade.rosters?.find(r => r.user_id === rid)

                    const cur_values = stateDynastyRankings
                        .find(x => x.date === new Date(eastern_time).toISOString().split('T')[0])?.values || {}



                    const trans_values = stateDynastyRankings
                        .find(x => x.date === new Date(parseInt(trade.status_updated) - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0])?.values


                    const superflex = trade['league.roster_positions']?.filter(p => p === 'QB' || p === 'SUPER_FLEX').length > 1 ? true : false
                    const trans_value = Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id)
                        .reduce((acc, cur) =>
                            acc + parseInt(trans_values?.[cur]?.[superflex ? 'sf' : 'oneqb'] || 0)
                            , 0)
                        +
                        trade.draft_picks.filter(p => p.owner_id === roster?.roster_id)
                            .reduce((acc, cur) =>
                                acc + (trans_values && parseInt(trans_values?.[
                                    `${cur.season} ${`${cur.order <= 4 ? 'Early' : cur.order >= 9 ? 'Late' : 'Mid'}`} ${cur.round}`
                                ]?.[superflex ? 'sf' : 'oneqb'] || 0)) || 0
                                , 0)




                    const cur_value = Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id)
                        .reduce((acc, cur) => acc + parseInt(cur_values?.[cur]?.[superflex ? 'sf' : 'oneqb'] || 0), 0)
                        +
                        trade.draft_picks.filter(p => p.owner_id === roster?.roster_id)
                            .reduce((acc, cur) =>
                                acc + (cur_values && parseInt(cur_values[
                                    `${cur.season} ${`${cur.order <= 4 ? 'Early' : cur.order >= 9 ? 'Late' : 'Mid'}`} ${cur.round}`
                                ]?.[superflex ? 'sf' : 'oneqb'] || 0)) || 0
                                , 0)
                    const trend = cur_value - trans_value

                    return {
                        id: trade.transaction_id,
                        list: [

                            {
                                text: <div className='trade_manager'>
                                    <div>
                                        <p className='value'>
                                            KTC -&nbsp;
                                            {
                                                trans_value.toLocaleString("en-US")
                                            }
                                        </p>
                                        <p
                                            className={(trend > 0 ? 'green trend' : trend < 0 ? 'red trend' : 'trend')}
                                            style={getTrendColor(trend, 1.5)}
                                        >
                                            {
                                                trend > 0 ? '+' : ''
                                            }
                                            {
                                                trend.toString()
                                            }

                                        </p>
                                    </div>
                                    <div>
                                        <p className='left'>
                                            {
                                                avatar(
                                                    roster?.avatar, 'user avatar', 'user'
                                                )
                                            }
                                            <span>{roster?.username || 'Orphan'}</span>
                                        </p>
                                    </div>
                                </div>,
                                colSpan: 4,
                                className: 'left trade_manager'
                            },
                            {
                                text: <table className='trade_info'>
                                    <tbody>
                                        {
                                            Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id).map(player_id => {
                                                const value = trans_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] || '-'
                                                const trend = cur_values?.[player_id] && trans_values?.[player_id] && (cur_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'])
                                                return <tr>
                                                    <td colSpan={11} className={
                                                        `${trade.tips?.trade_away && trade.tips?.trade_away?.find(p => p.player_id === player_id)?.manager.user_id === rid

                                                            ? 'red left'
                                                            : 'left'
                                                        }`
                                                    } ><p><span >+ {allplayers[player_id]?.full_name}</span></p></td>
                                                    <td className='value'
                                                        colSpan={4}>
                                                        {value}
                                                    </td>
                                                    <td
                                                        className={trend > 0 ? 'green stat value' : trend < 0 ? 'red stat value' : 'stat value'}
                                                        style={getTrendColor(trend, 1)}
                                                        colSpan={3}
                                                    >
                                                        {
                                                            trend > 0 ? '+' : ''
                                                        }
                                                        {trend}
                                                    </td>
                                                </tr>
                                            })
                                        }
                                        {
                                            trade.draft_picks
                                                .filter(p => p.owner_id === roster?.roster_id)
                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                .map(pick => {
                                                    const ktc_name = `${pick.season} ${pick.order <= 4 ? 'Early' : pick.order >= 9 ? 'Late' : 'Mid'} ${pick.round}`

                                                    const value = trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] || '-'
                                                    const trend = cur_values?.[ktc_name] && trans_values?.[ktc_name] && ((cur_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'])).toString() || '-'
                                                    return <tr>
                                                        <td
                                                            colSpan={11}
                                                            className={`${trade.tips?.trade_away && trade.tips?.trade_away
                                                                ?.find(p =>
                                                                    p?.player_id?.season === pick.season
                                                                    && p?.player_id?.round === pick.round
                                                                    && p?.player_id?.order === pick.order
                                                                )?.manager?.user_id === rid ? 'red left' : 'left'}`}
                                                        >
                                                            {
                                                                <p><span>{`+ ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`}</span></p>
                                                            }
                                                        </td>
                                                        <td className='value' colSpan={4}>
                                                            {
                                                                value
                                                            }
                                                        </td>
                                                        <td
                                                            className={trend > 0 ? 'green stat value' : trend < 0 ? 'red stat value' : 'stat value'}
                                                            style={getTrendColor(trend, 1.5)}
                                                            colSpan={3}
                                                        >
                                                            {
                                                                cur_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] > 0 ? '+' : ''
                                                            }
                                                            {trend}
                                                        </td>
                                                    </tr>
                                                })
                                        }
                                    </tbody>
                                </table>,
                                colSpan: 5,
                                rowSpan: 2,
                                className: 'small'
                            },
                            {
                                text: <table className='trade_info'>
                                    <tbody>
                                        {
                                            Object.keys(trade.drops || {}).filter(d => trade.drops[d] === roster?.user_id).map(player_id =>

                                                <tr
                                                    className={
                                                        `${trade.tips?.acquire && trade.tips?.acquire?.find(p => p.player_id === player_id)?.manager?.user_id === rid
                                                            ? 'green'
                                                            : ''
                                                        }`
                                                    }
                                                >
                                                    <td className='left end' colSpan={4}>

                                                        <p>
                                                            <span className='end'>
                                                                {
                                                                    (`- ${allplayers[player_id]?.full_name}`).toString()
                                                                }
                                                            </span>
                                                        </p>

                                                    </td>
                                                </tr>

                                            )
                                        }
                                        {
                                            trade.draft_picks
                                                .filter(p => p.previous_owner_id === roster?.roster_id)
                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                .map(pick =>
                                                    <tr
                                                        className={`end ${trade.tips?.acquire && trade.tips?.acquire
                                                            ?.find(p =>
                                                                p?.player_id?.season === pick.season
                                                                && p?.player_id?.round === pick.round
                                                                && p?.player_id?.order === pick.order
                                                            )?.manager?.user_id === rid ? 'green left' : 'left'}`}
                                                    >
                                                        <td colSpan={4} className='left end'>
                                                            <p>
                                                                <span className="end">
                                                                    {
                                                                        (`- ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`).toString()
                                                                    }
                                                                </span>
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )
                                        }
                                    </tbody>
                                </table>,
                                colSpan: 4,
                                rowSpan: 2,
                                className: 'small'
                            }
                        ]

                    }
                })

            ]
        }
    />
}

export default Trade;