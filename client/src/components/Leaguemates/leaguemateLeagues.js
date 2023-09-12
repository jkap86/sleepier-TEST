import TableMain from "../Home/tableMain";
import { memo, useRef, useEffect, useMemo } from "react"
import LeaguematePlayersLeagues from "./leaguematePlayersLeagues"
import TradeTipRosters from "../Trades/tradeTipRosters";
import { useSelector, useDispatch } from 'react-redux';
import { setState } from "../../actions/actions";
import { filterLeagues } from '../../functions/filterLeagues';
import { getTrendColor } from "../../functions/misc";

const LeaguemateLeagues = ({ leaguemate }) => {
    const dispatch = useDispatch();
    const { user: state_user, lmplayershares } = useSelector(state => state.user)
    const { allplayers: stateAllPlayers, type1, type2 } = useSelector(state => state.main)
    const leaguemates = useSelector(state => state.leaguemates);
    const initialLoadRef = useRef(null);



    useEffect(() => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true
        } else {
            dispatch(setState({ page_players_c: 1 }, 'LEAGUEMATES'))
            dispatch(setState({ page_players_a: 1 }, 'LEAGUEMATES'))
        }
    }, [leaguemates.searched_players, dispatch]);


    const playersCount = useMemo(() => {
        const players_all = []

        filterLeagues(leaguemate.leagues, type1, type2).map(league => {
            return league.lmRoster.players.map(player => {
                return players_all.push({
                    id: player,
                    league: league,
                    type: 'lm',
                    wins: league.lmRoster.settings.wins,
                    losses: league.lmRoster.settings.losses,
                    ties: league.lmRoster.settings.ties
                })
            }) &&
                league.userRoster.players.map(player => {
                    return players_all.push({
                        id: player,
                        league: league,
                        type: 'user',
                        wins: league.userRoster.settings.wins,
                        losses: league.userRoster.settings.losses,
                        ties: league.userRoster.settings.ties
                    })
                })
        })

        const players_count = []

        players_all.map(player => {
            const index = players_count.findIndex(obj => {
                return obj.id === player.id
            })
            if (index === -1) {
                let leagues_lm = players_all.filter(x => x.id === player.id && x.type === 'lm')
                let leagues_user = players_all.filter(x => x.id === player.id && x.type === 'user')

                const lm_record = leagues_lm.reduce((acc, cur) => {
                    return {
                        wins: acc.wins + cur.wins,
                        losses: acc.losses + cur.losses,
                        ties: acc.ties + cur.ties
                    }
                }, {
                    wins: 0,
                    losses: 0,
                    ties: 0
                })

                const user_record = leagues_user.reduce((acc, cur) => {
                    return {
                        wins: acc.wins + cur.wins,
                        losses: acc.losses + cur.losses,
                        ties: acc.ties + cur.ties
                    }
                }, {
                    wins: 0,
                    losses: 0,
                    ties: 0
                })

                players_count.push({
                    id: player.id,
                    leagues_lm: leagues_lm,
                    lm_record: lm_record,
                    leagues_user: leagues_user,
                    user_record: user_record
                })
            }
        })

        return players_count;

    }, [leaguemate, type1, type2])

    let keys;

    switch (`${type1}-${type2}`) {
        case 'All-All':
            keys = ['all']
            break;
        case 'Redraft-All':
            keys = ['r_b', 'r_s'];

            break;
        case 'Dynasty-All':
            keys = ['d_b', 'd_s'];

            break;
        case 'All-Bestball':
            keys = ['r_b', 'd_b'];

            break;
        case 'All-Standard':
            keys = ['r_s', 'd_s'];

            break;
        default:
            break;
    };

    const userPlayerShares = lmplayershares.find(l => l.user_id === state_user.user_id)?.playershares || {}

    const lmPlayerShares = lmplayershares.find(l => l.user_id === leaguemate.user_id)?.playershares || {}

    const lmplayershares_header = [
        [
            {
                text: 'Player',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: leaguemate.username,
                colSpan: 3,
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
                className: 'half'
            },
            {
                text: state_user.username,
                colSpan: 3,
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
                className: 'half'
            }
        ],
        [
            {
                text: 'Count',
                colSpan: 1,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
            },
            {
                text: '%',
                colSpan: 2,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
            },
            {
                text: 'Count',
                colSpan: 1,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
            },
            {
                text: '%',
                colSpan: 2,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
            }
        ]
    ];

    const lmPlayerShares_body = Object.keys(stateAllPlayers)
        .filter(player_id => stateAllPlayers[player_id]?.full_name && (!leaguemates.searched_players.id || player_id === leaguemates.searched_players.id))
        .sort((a, b) => leaguemates.sortBy === 'Leaguemate'
            ? keys?.reduce((acc, cur) => acc + (lmPlayerShares[b]?.[cur][0] || 0), 0) - keys?.reduce((acc, cur) => acc + (lmPlayerShares[a]?.[cur][0] || 0), 0)
            : keys?.reduce((acc, cur) => acc + (userPlayerShares[b]?.[cur][0] || 0), 0) - keys?.reduce((acc, cur) => acc + (userPlayerShares[a]?.[cur][0] || 0), 0)
        )
        .map(player_id => {

            return {
                id: player_id,
                search: {
                    text: stateAllPlayers[player_id]?.full_name,
                    image: {
                        src: player_id,
                        alt: 'player headshot',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: stateAllPlayers[player_id]?.full_name || '-',
                        colSpan: 4,
                        className: 'left',
                        image: {
                            src: player_id,
                            alt: 'player',
                            type: 'player'
                        }
                    },
                    {
                        text: keys?.reduce((acc, cur) => acc + (lmPlayerShares[player_id]?.[cur][0] || 0), 0) || '0',
                        colSpan: 1
                    },
                    {
                        text: keys?.reduce((acc, cur) => acc + (lmPlayerShares[player_id]?.[cur][1] || 0), 0) > 0
                            ? (
                                keys?.reduce((acc, cur) => acc + (lmPlayerShares[player_id]?.[cur][0] || 0), 0)
                                / keys?.reduce((acc, cur) => acc + (lmPlayerShares[player_id]?.[cur][1] || 0), 0)
                                * 100
                            ).toFixed(1)
                            : '-',
                        colSpan: 2
                    },
                    {
                        text: keys?.reduce((acc, cur) => acc + (userPlayerShares[player_id]?.[cur][0] || 0), 0) || '0',
                        colSpan: 1
                    },
                    {
                        text: keys?.reduce((acc, cur) => acc + (userPlayerShares[player_id]?.[cur][1] || 0), 0) > 0
                            ? (
                                keys?.reduce((acc, cur) => acc + (userPlayerShares[player_id]?.[cur][0] || 0), 0)
                                / keys?.reduce((acc, cur) => acc + (userPlayerShares[player_id]?.[cur][1] || 0), 0)
                                * 100
                            ).toFixed(1)
                            : '-',
                        colSpan: 2
                    }
                ]
            }
        });

    console.log(Object.keys(lmplayershares))



    const leaguemateLeagues_headers = [
        [
            {
                text: 'League',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: leaguemate.username,
                colSpan: 4,
                className: 'half'
            },
            {
                text: state_user.username,
                colSpan: 4,
                className: 'half'
            }
        ],
        [
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Rank',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Rank',
                colSpan: 2,
                className: 'half'
            }
        ]
    ]

    const leaguemateLeagues_body = filterLeagues(leaguemate.leagues, type1, type2).map((lm_league) => {
        return {
            id: lm_league.league_id,
            list: [
                {
                    text: lm_league.name,
                    colSpan: 4,
                    className: 'left',
                    image: {
                        src: lm_league.avatar,
                        alt: 'avatar',
                        type: 'league'
                    }
                },
                {
                    text: `${lm_league.lmRoster.settings.wins}-${lm_league.lmRoster.settings.losses}${lm_league.lmRoster.ties > 0 ? `-${lm_league.lmRoster.ties}` : ''}`,
                    colSpan: 2

                },
                {
                    text: <p
                        className={(lm_league.lmRoster?.rank / lm_league.rosters.length) < .5 ? 'green stat' :
                            (lm_league.lmRoster?.rank / lm_league.rosters.length) > .5 ? 'red stat' :
                                'stat'}
                        style={getTrendColor(- ((lm_league.lmRoster.rank / lm_league.rosters.length) - .5), .0025)
                        }
                    >
                        {lm_league.lmRoster.rank}
                    </p>,
                    colSpan: 2,
                    className: lm_league.lmRoster.rank / lm_league.rosters.length <= .25 ? 'green' :
                        lm_league.lmRoster.rank / lm_league.rosters.length >= .75 ? 'red' :
                            null
                },
                {
                    text: `${lm_league.userRoster.settings.wins}-${lm_league.userRoster.settings.losses}${lm_league.userRoster.ties > 0 ? `-${lm_league.userRoster.ties}` : ''}`,
                    colSpan: 2
                },
                {
                    text: <p
                        className={(lm_league.userRoster?.rank / lm_league.rosters.length) < .5 ? 'green stat' :
                            (lm_league.userRoster?.rank / lm_league.rosters.length) > .5 ? 'red stat' :
                                'stat'}
                        style={getTrendColor(- ((lm_league.userRoster.rank / lm_league.rosters.length) - .5), .0025)
                        }
                    >
                        {lm_league.userRoster.rank}
                    </p>,
                    colSpan: 2,
                    className: lm_league.userRoster.rank / lm_league.rosters.length <= .25 ? 'green' :
                        lm_league.userRoster.rank / lm_league.rosters.length >= .75 ? 'red' :
                            null
                }
            ],
            secondary_table: (
                <TradeTipRosters
                    userRoster={lm_league.userRoster}
                    lmRoster={lm_league.lmRoster}
                    roster_positions={lm_league.roster_positions}
                />
            )
        }
    })

    const leaguematePlayers_headers = [
        [
            {
                text: 'Player',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: leaguemate.username,
                colSpan: 4,
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
                className: 'half'
            },
            {
                text: state_user.username,
                colSpan: 4,
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
                className: 'half'
            }
        ],
        [
            {
                text: 'Count',
                colSpan: 1,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
            },
            {
                text: 'Record',
                colSpan: 3,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'Leaguemate' }, 'LEAGUEMATES')),
            },
            {
                text: 'Count',
                colSpan: 1,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
            },
            {
                text: 'Record',
                colSpan: 3,
                className: 'small half',
                onClick: () => dispatch(setState({ sortBy: 'User' }, 'LEAGUEMATES')),
            }
        ]
    ]

    const leaguematePlayers_body = playersCount
        .filter(player => !leaguemates.searched_players.id || player.id === leaguemates.searched_players.id)
        .sort((a, b) => leaguemates.sortBy === 'Leaguemate'
            ? b.leagues_lm?.length - a.leagues_lm?.length
            : b.leagues_user?.length - a.leagues_user?.length
        )
        .map(player => {
            const lm_wins = player.lm_record.wins;
            const lm_losses = player.lm_record.losses;
            const lm_ties = player.lm_record.ties;

            const user_wins = player.user_record.wins;
            const user_losses = player.user_record.losses;
            const user_ties = player.user_record.ties;

            return {
                id: player.id,
                search: {
                    text: stateAllPlayers[player.id]?.full_name,
                    image: {
                        src: player.id,
                        alt: 'player headshot',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: stateAllPlayers[player.id]?.full_name,
                        colSpan: 4,
                        className: 'left',
                        image: {
                            src: player.id,
                            alt: 'player headshot',
                            type: 'player'
                        }
                    },
                    {
                        text: stateAllPlayers[player.id] && player.leagues_lm.length || '0',
                        colSpan: 1
                    },
                    {
                        text: stateAllPlayers[player.id] && (lm_wins + '-' + lm_losses + (lm_ties > 0 ? `-${lm_ties}` : '')),
                        colSpan: 3
                    },
                    {
                        text: stateAllPlayers[player.id] && player.leagues_user.length || '0',
                        colSpan: 1
                    },
                    {
                        text: stateAllPlayers[player.id] && (user_wins + '-' + user_losses + (user_ties > 0 ? `-${user_ties}` : '')),
                        colSpan: 3
                    }
                ],
                secondary_table: (
                    <LeaguematePlayersLeagues
                        leagues_lm={player.leagues_lm}
                        leagues_user={player.leagues_user}
                        leaguemate={leaguemate}
                    />
                )

            }
        })

    const headers = leaguemates.secondaryContent === 'Leagues'
        ? leaguemateLeagues_headers
        : leaguemates.secondaryContent === 'Players-common'
            ? leaguematePlayers_headers
            : lmplayershares_header


    const body = leaguemates.secondaryContent === 'Leagues'
        ? leaguemateLeagues_body
        : leaguemates.secondaryContent === 'Players-common'
            ? leaguematePlayers_body
            : lmPlayerShares_body


    return <>
        <div className="secondary nav">
            <div>
                <button
                    className={leaguemates.secondaryContent === 'Leagues' ? 'active click' : 'click'}
                    onClick={() => dispatch(setState({ secondaryContent: 'Leagues' }, 'LEAGUEMATES'))}
                >
                    Leagues
                </button>
                <button
                    className={leaguemates.secondaryContent === 'Players-common' ? 'active click' : 'click'}
                    onClick={() => dispatch(setState({ secondaryContent: 'Players-common' }, 'LEAGUEMATES'))}
                >
                    Players <em className="small">(common leagues)</em>
                </button>
                <button
                    className={leaguemates.secondaryContent === 'Players-all' ? 'active click' : 'click'}
                    onClick={() => dispatch(setState({ secondaryContent: 'Players-all' }, 'LEAGUEMATES'))}
                >
                    Players <em className="small">(all leagues)</em>
                </button>
            </div>
        </div>
        <TableMain
            id={'Players'}
            type={'secondary'}
            headers={headers}
            body={body}
            page={leaguemates.secondaryContent === 'Leagues' ? leaguemates.page_leagues : leaguemates.secondaryContent === 'Players-common' ? leaguemates.page_players_c : leaguemates.page_players_a}
            setPage={(page) => leaguemates.secondaryContent === 'Leagues' ? dispatch(setState({ page_leagues: page }, 'LEAGUEMATES')) : leaguemates.secondaryContent === 'Players-common' ? dispatch(setState({ page_players_c: page }, 'LEAGUEMATES')) : dispatch(setState({ page_players_a: page }, 'LEAGUEMATES'))}
            itemActive={leaguemates.secondaryContent === 'Leagues' ? leaguemates.itemActive_leagues : leaguemates.secondaryContent === 'Players-common' ? leaguemates.itemActive_players : null}
            setItemActive={(itemActive) => leaguemates.secondaryContent === 'Leagues' ? dispatch(setState({ itemActive_leagues: itemActive }, 'LEAGUEMATES')) : dispatch(setState({ itemActive_players: itemActive }, 'LEAGUEMATES'))}
            search={leaguemates.secondaryContent.includes('Players') ? true : false}
            searched={leaguemates.searched_players}
            setSearched={(searched) => dispatch(setState({ searched_players: searched }, 'LEAGUEMATES'))}
        />
    </>
}


export default memo(LeaguemateLeagues, (prevLm, nextLm) => {
    return prevLm.leaguemate.user_id === nextLm.leaguemate.user_id
});
