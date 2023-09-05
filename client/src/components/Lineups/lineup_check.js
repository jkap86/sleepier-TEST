import TableMain from "../Home/tableMain";
import { useState, useEffect, useMemo } from "react";
import Lineup from "./lineup";
import { useSelector, useDispatch } from 'react-redux';
import { includeTaxiIcon, includeLockedIcon } from '../../functions/filterIcons';
import { filterLeagues } from '../../functions/filterLeagues';
import { setState } from "../../actions/actions";
import { loadingIcon, getTrendColor } from '../../functions/misc';
import Standings from "./standings";

const LineupCheck = ({
    tab,
    setTab,
    syncLeague
}) => {
    const dispatch = useDispatch();
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const { user: state_user } = useSelector(state => state.user)
    const { type1, type2, allPlayers: stateAllPlayers, state: stateState, nflSchedule: stateNflSchedule, projectionDict, isLoadingProjectionDict, projections } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData)
    const { includeTaxi, includeLocked, week, recordType, column1, column2, column3, column4 } = useSelector(state => state.lineups)



    const columnOptions = [
        'Suboptimal',
        'Early/Late Flex',
        'Non QB in SF',
        'Open Roster',
        'Open IR',
        'Open Taxi',
        'Out',
        'Doubtful',
        'Ques',
        'IR',
        'Sus'
    ];

    const hash = `${includeTaxi}-${includeLocked}`;

    const stateLeagues = filteredData?.lineups

    useEffect(() => {
        setPage(1)
    }, [searched, type1, type2])

    const getColumnValue = (header, matchup, lineup_check, league) => {
        switch (header) {
            case 'Suboptimal':
                return {
                    text: !matchup?.matchup_id || !lineup_check ? '-' : lineup_check.filter(x => x.notInOptimal).length > 0 ?
                        lineup_check.filter(x => x.notInOptimal).length :
                        '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check ? '' : lineup_check.filter(x => x.notInOptimal).length > 0 ?
                        'red' : 'green'
                }
            case 'Early/Late Flex':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length > 0
                            ? lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length > 0
                            ? 'red'
                            : 'green'
                }
            case 'Open Taxi':
                return {
                    text: league.settings.taxi_slots > 0
                        ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0) > 0
                            ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0)
                            : '√'
                        : '-',
                    colSpan: 2,
                    className: league.settings.taxi_slots > 0
                        ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0) > 0
                            ? 'red'
                            : 'green'
                        : ''
                }
            case 'Non QB in SF':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => x.nonQBinSF).length > 0
                            ? lineup_check.filter(x => x.nonQBinSF).length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => x.nonQBinSF).length > 0
                            ? 'red'
                            : 'green'
                }
            case 'Open Roster':
                return {
                    text: league.roster_positions.length !== league.userRoster.players?.length
                        ? ((league.userRoster.players?.length > league.roster_positions.length ? '+' : '') + (league.userRoster.players?.length - league.roster_positions.length))
                        : '√',
                    colSpan: 2,
                    className: league.roster_positions.length !== league.userRoster.players?.length
                        ? 'red'
                        : 'green',
                }
            case 'Open IR':
                const total_ir = league.settings.reserve_slots
                const used_ir = league.userRoster?.reserve?.length || 0
                const open_ir = total_ir - used_ir;
                const eligible_ir = league.userRoster.players?.filter(player_id => !league.userRoster.reserve?.includes(player_id)
                    && (
                        (league.settings.reserve_allow_sus === 1 && projections[week][player_id]?.injury_status === 'Sus')
                        || (league.settings.reserve_allow_doubtful === 1 && projections[week][player_id]?.injury_status === 'Doubtful')
                        || (league.settings.reserve_allow_out === 1 && projections[week][player_id]?.injury_status === 'Out')
                        || projections[week][player_id]?.injury_status === 'IR'
                    )
                ).length
                return {
                    text: (open_ir > 0 && eligible_ir > 0)
                        ? Math.min(eligible_ir, open_ir)
                        : '√',
                    colSpan: 2,
                    className: (open_ir > 0 && eligible_ir > 0)
                        ? 'red'
                        : 'green',
                }
            case 'Out':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length > 0
                            ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length > 0
                            ? 'red'
                            : 'green'
                }
            case 'Doubtful':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length > 0
                            ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length > 0
                            ? 'red'
                            : 'green'
                }
            case 'Ques':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length > 0
                            ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length > 0
                            ? 'red'
                            : 'green'
                }
            case 'IR':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length > 0
                            ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length > 0
                            ? 'red'
                            : 'green'
                }
            case 'Sus':
                return {
                    text: !matchup?.matchup_id || !lineup_check
                        ? '-'
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length > 0
                            ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length
                            : '√',
                    colSpan: 2,
                    className: !matchup?.matchup_id || !lineup_check
                        ? ''
                        : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length > 0
                            ? 'red'
                            : 'green'
                }
            default:
                return {
                    text: '-',
                    colSpan: 2
                }
        }
    }

    const lineups_headers = [
        [
            {
                text: 'League',
                colSpan: 6,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: <>Pts<br />Rnk</ >,
                className: 'half small',
                colSpan: 1,
                rowSpan: 2
            },
            {
                text: 'Proj',
                className: 'half',
                colSpan: 1,
                rowSpan: 2
            },
            {
                text: '#Slots',
                colSpan: 8,
                className: 'half'
            }

        ],
        [
            {
                text: <label className="select">
                    <p>{column1}</p>
                    <select
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ column1: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => ![column2, column3, column4].includes(column))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select>
                </label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{column2}</p><select
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ column2: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => ![column1, column3, column4].includes(column))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{column3}</p> <select
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ column3: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => ![column1, column2, column4].includes(column))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{column4}</p><select
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ column4: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => ![column1, column2, column3].includes(column))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half'
            }
        ]
    ]


    const lineups_body = filterLeagues((stateLeagues || []), type1, type2)
        ?.filter(l => !searched.id || searched.id === l.league_id)
        ?.flatMap(league => {
            const matchups = league[`matchups_${week}`]

            const matchup = matchups?.find(m => m.roster_id === league.userRoster.roster_id)
            const opponentMatchup = matchups?.find(m => m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id)



            const opponentRoster = league.rosters.find(r => r?.roster_id === opponentMatchup?.roster_id)
            let opponent = {
                roster: opponentRoster,
                matchup: opponentMatchup
            }

            const userLineup = projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.userLineup;
            const oppLineup = projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.oppLineup;

            const optimal_lineup = userLineup?.optimal_lineup
            const lineup_check = userLineup?.lineup_check
            const starting_slots = userLineup?.starting_slots
            const players_points = { ...userLineup?.players_points, ...oppLineup?.players_points }
            const players_projections = { ...userLineup?.players_projections, ...oppLineup?.players_projections }

            const rank = Object.keys(projectionDict[hash]?.[week]?.[league.league_id] || {})
                .sort((a, b) => projectionDict[hash]?.[week]?.[league.league_id][b][recordType]?.fpts - projectionDict[hash]?.[week]?.[league.league_id][a][recordType]?.fpts)
                .indexOf(league.userRoster.roster_id.toString())


            return {
                id: league.league_id,
                search: {
                    text: league.name,
                    image: {
                        src: league.avatar,
                        alt: league.name,
                        type: 'league'
                    }
                },
                list: [
                    {
                        text: league.name,
                        colSpan: 6,
                        className: 'left',
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    {
                        text: <p
                            className={matchup?.matchup_id > 0 ? ((rank + 1) / league.rosters.length) < .5 ? ' green stat' : ((rank + 1) / league.rosters.length) > .5 ? ' red stat' : 'stat' : 'stat'}
                            style={matchup?.matchup_id ? getTrendColor(-(((rank + 1) / league.rosters.length) - .5), .0025) : null}
                        >
                            {matchup?.matchup_id ? rank + 1 : '-'}
                        </p>,
                        colSpan: 1
                    },
                    {
                        text: <>
                            {
                                projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.wins ? 'W'
                                    : projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.losses ? 'L'
                                        : projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.ties ? 'T'
                                            : '-'
                            }
                            {
                                projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.median_wins
                                && <i className="fa-solid fa-trophy"></i>
                            }
                        </>,
                        colSpan: 1,
                        className: projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.wins ? 'greenb'
                            : projectionDict[hash]?.[week]?.[league.league_id]?.[league.userRoster.roster_id]?.[recordType]?.losses ? 'redb'
                                : ''
                    },
                    {
                        ...getColumnValue(column1, matchup, lineup_check, league)
                    },
                    {
                        ...getColumnValue(column2, matchup, lineup_check, league)
                    },
                    {
                        ...getColumnValue(column3, matchup, lineup_check, league)
                    },
                    {
                        ...getColumnValue(column4, matchup, lineup_check, league)
                    }

                ],
                secondary_table: (
                    <Lineup
                        matchup={matchup}
                        opponent={opponent}
                        starting_slots={starting_slots}
                        league={league}
                        optimal_lineup={optimal_lineup}
                        players_points={players_points}
                        players_projections={players_projections}
                        stateAllPlayers={stateAllPlayers}
                        state_user={state_user}
                        lineup_check={lineup_check}
                        syncLeague={syncLeague}
                        searched={searched}
                        setSearched={setSearched}
                        stateState={stateState}
                        stateNflSchedule={stateNflSchedule}
                        recordType={recordType}
                    />
                )
            }

        })

    const season_total_headers = [
        [
            {
                text: 'League',
                colSpan: 7
            },
            {
                text: 'Record',
                colSpan: 3
            },
            {
                text: 'PF',
                colSpan: 4
            },
            {
                text: 'PA',
                colSpan: 4
            },
            {
                text: 'Rank',
                colSpan: 2
            }
        ]]

    const season_total_body = filterLeagues((stateLeagues || []), type1, type2)
        ?.filter(l => !searched.id || searched.id === l.league_id)
        ?.flatMap(league => {
            const getAttribute = (attr, roster_id) => {
                return Object.keys(projectionDict?.[hash] || {}).reduce((acc, cur) => acc + (projectionDict[hash][cur]?.[league.league_id]?.[roster_id]?.[recordType]?.[attr] || 0), 0)
            }
            const wins = getAttribute('wins', league.userRoster.roster_id) + getAttribute('median_wins', league.userRoster.roster_id)
            const losses = getAttribute('losses', league.userRoster.roster_id) + getAttribute('median_losses', league.userRoster.roster_id)
            const ties = getAttribute('ties', league.userRoster.roster_id)
            const fpts = getAttribute('fpts', league.userRoster.roster_id)
            const fpts_against = getAttribute('fpts_against', league.userRoster.roster_id)


            const rank = Object.keys(projectionDict[hash]?.['1']?.[league.league_id] || {})
                .sort((a, b) => (getAttribute('wins', b) + getAttribute('median_wins', b)) - (getAttribute('wins', a) + getAttribute('median_wins', a)) || getAttribute('fpts', b) - getAttribute('fpts', a))
                .indexOf(league.userRoster.roster_id.toString())


            return {
                id: league.league_id,
                search: {
                    text: league.name,
                    image: {
                        src: league.avatar,
                        alt: league.name,
                        type: 'league'
                    }
                },
                list: [
                    {
                        text: league.name,
                        colSpan: 7,
                        className: 'left',
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    {
                        text: wins + '-' + losses + (ties > 0 ? `-${ties}` : ''),
                        colSpan: 3
                    },
                    {
                        text: fpts.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
                        colSpan: 4
                    },
                    {
                        text: fpts_against.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
                        colSpan: 4
                    },
                    {
                        text: <p
                            className={wins + losses + ties > 0 ? ((rank + 1) / league.rosters.length) < .5 ? ' green stat' : ((rank + 1) / league.rosters.length) > .5 ? ' red stat' : 'stat' : 'stat'}
                            style={wins + losses + ties > 0 ? getTrendColor(-(((rank + 1) / league.rosters.length) - .5), .0025) : null}
                        >
                            {wins + losses + ties > 0 ? rank + 1 : '-'}
                        </p>,
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <Standings
                        getAttribute={getAttribute}
                        league_id={league.league_id}
                        rosters={league.rosters}
                        playoff_week_start={league.settings.playoff_week_start}
                    />
                )
            }

        })

    const projectedRecord = filterLeagues((stateLeagues || []), type1, type2)
        .reduce((acc, cur) => {
            return {
                wins: acc.wins + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].wins || 0) + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].median_wins || 0),
                losses: acc.losses + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].losses || 0) + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].median_losses || 0),
                ties: acc.ties + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].ties || 0),
                fpts: acc.fpts + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].fpts || 0),
                fpts_against: acc.fpts_against + (projectionDict[hash]?.[week]?.[cur.league_id]?.[cur.userRoster.roster_id][recordType].fpts_against || 0),
            }
        }, {
            wins: 0,
            losses: 0,
            ties: 0,
            fpts: 0,
            fpts_against: 0
        })

    const loadingWeeks = Object.keys(projections).filter(key => parseInt(key) && !Object.keys(projectionDict[hash] || {})?.includes(key));

    return !(projectionDict[hash]?.[week] || week === 'All')
        ? loadingIcon
        : <>

            {
                (isLoadingProjectionDict && week === 'All')
                    ? <h2><em>{`Loading Weeks ${loadingWeeks} ...`}</em></h2>
                    : ''
            }
            <h2>
                <table className="summary">
                    <tbody>
                        <tr>
                            <th>Type</th>
                            <td>
                                <select
                                    className={'record_type'}
                                    value={recordType}
                                    onChange={(e) => dispatch(setState({ recordType: e.target.value }, 'LINEUPS'))}
                                >
                                    <option value={'starters_proj'}>Starters Proj</option>
                                    <option value={'optimal_proj'}>Optimal Proj</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Record</th>
                            <td>{projectedRecord.wins}-{projectedRecord.losses}</td>
                        </tr>
                        <tr>
                            <th>Points For</th>
                            <td>{projectedRecord.fpts.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <th>Points Against</th>
                            <td>{projectedRecord.fpts_against.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>


            </h2>
            <TableMain
                id={'Lineups'}
                type={'primary'}
                headers={week === 'All' ? season_total_headers : lineups_headers}
                body={week === 'All' ? season_total_body : lineups_body}
                page={page}
                setPage={setPage}
                itemActive={itemActive}
                setItemActive={setItemActive}
                search={true}
                searched={searched}
                setSearched={setSearched}
                options2={[includeLockedIcon(includeLocked, isLoadingProjectionDict ? console.log : (value) => dispatch(setState({ includeLocked: value }, 'LINEUPS')))]}
                options1={[includeTaxiIcon(includeTaxi, isLoadingProjectionDict ? console.log : (value) => dispatch(setState({ includeTaxi: value }, 'LINEUPS')))]}
            />
        </>
}

export default LineupCheck;