import TableMain from "../Home/tableMain";
import { useMemo, useRef, useEffect } from "react";
//  import LeagueInfo from "../Leagues/leagueInfo";
import { useSelector, useDispatch } from 'react-redux';
import LeagueInfo from "../Leagues/leagueInfo";
import { setState } from "../../actions/actions";
import PlayerModal from "./playerModal";
import { getPlayerScore } from '../../functions/getPlayerScore';
import { getTrendColor } from "../../functions/misc";

const PlayerLeagues = ({
    leagues_owned,
    leagues_taken,
    leagues_available,
    trend_games,
    snapPercentageMin,
    snapPercentageMax,
    player_id
}) => {
    const dispatch = useDispatch();
    const { lmplayershares } = useSelector(state => state.user);
    const { modalVisible, tab, itemActive2, page2 } = useSelector(state => state.players)
    const { allplayers: stateAllPlayers, type1, type2 } = useSelector(state => state.main)
    const { stats: stateStats } = useSelector(state => state.stats)
    const playerModalRef = useRef(null)


    const most_owned = useMemo(() => {
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
        }


        const most_owned = lmplayershares
            .filter(lm => lm?.user_id && lm?.playershares?.[player_id])
            .map(lm => {
                return {
                    user_id: lm.user_id,
                    username: lm.username,
                    avatar: lm.avatar,
                    count: keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0], 0),
                    percentage: (
                        keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0], 0)
                        / keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[1], 0)
                        * 100
                    ).toFixed(1)

                }
            })

        return most_owned;
    }, [type1, type2, lmplayershares])


    useEffect(() => {
        if (playerModalRef.current) {
            playerModalRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [modalVisible.player2])



    let player_leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Rank',
                colSpan: 1
            },
            {
                text: 'PPG',
                colSpan: 1
            }
        ]
    ]

    if (tab.secondary === 'Taken') {
        player_leagues_headers[0].push(
            {
                text: 'Manager',
                colSpan: 2,
                className: 'half'
            }
        )
    }

    const leagues_display = tab.secondary === 'Owned' ? leagues_owned :
        tab.secondary === 'Taken' ? leagues_taken :
            tab.secondary === 'Available' ? leagues_available :
                []

    const player_leagues_body = leagues_display.map(lo => {
        const player_score = getPlayerScore(trend_games, lo.scoring_settings)
        return {
            id: lo.league_id,
            list: [
                {
                    text: lo.name,
                    colSpan: 3,
                    className: 'left',
                    image: {
                        src: lo.avatar,
                        alt: lo.name,
                        type: 'league'
                    }
                },
                {
                    text: <p
                        className={(lo.userRoster?.rank / lo.rosters.length) < .5 ? 'green stat' :
                            (lo.userRoster?.rank / lo.rosters.length) > .5 ? 'red stat' :
                                'stat'}
                        style={getTrendColor(- ((lo.userRoster.rank / lo.rosters.length) - .5), .0025)
                        }
                    >
                        {lo.userRoster?.rank}
                    </p>,
                    colSpan: 1,
                    className: lo.userRoster?.rank / lo.rosters.length <= .25 ? 'green' :
                        lo.userRoster?.rank / lo.rosters.length >= .75 ? 'red' :
                            null
                },
                {
                    text: <span
                        className="player_score"
                        onClick={
                            (e) => {
                                e.stopPropagation()
                                dispatch(setState({
                                    modalVisible: {
                                        options: false,
                                        player: false,
                                        player2: {
                                            ...stateAllPlayers[player_id],
                                            trend_games: trend_games,
                                            scoring_settings: lo.scoring_settings,
                                            league: lo
                                        }
                                    }
                                }, 'PLAYERS'))
                            }
                        }
                    >
                        {
                            trend_games?.length > 0
                            && (Object.keys(player_score || {})
                                .reduce(
                                    (acc, cur) => acc + player_score[cur].points, 0) / trend_games.length)
                                .toFixed(1)
                            || '-'
                        }
                    </span>,
                    colSpan: 1
                },
                tab.secondary === 'Taken' ?
                    {
                        text: lo.lmRoster?.username || 'Orphan',
                        colSpan: 2,
                        className: 'left end',
                        image: {
                            src: lo.lmRoster?.avatar,
                            alt: lo.lmRoster?.username,
                            type: 'user'
                        }
                    }
                    : ''

            ],
            secondary_table: (
                <LeagueInfo
                    stateAllPlayers={stateAllPlayers}
                    scoring_settings={lo.scoring_settings}
                    league={lo}
                    trendStats={stateStats}
                    getPlayerScore={getPlayerScore}
                    snapPercentageMin={snapPercentageMin}
                    snapPercentageMax={snapPercentageMax}
                    setPlayerModalVisible2={(value) => {
                        dispatch(setState({
                            modalVisible: {
                                options: false,
                                player: false,
                                player2: value
                            }
                        }, 'PLAYERS'))
                    }}
                    type='tertiary'

                />
            )
        }
    })

    const leaguemate_shares_body_count = most_owned
        ?.sort((a, b) => b.count - a.count)
        .slice(0, 25)
        ?.map(lm => {

            return {
                id: lm.user_id,
                list: [
                    {
                        text: lm.username,
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: 'avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: lm.count,
                        colSpan: 1
                    },
                    {
                        text: lm.percentage + '%',
                        colSpan: 1
                    }
                ]
            }
        })

    const leaguemate_shares_body_percentage = most_owned
        ?.sort((a, b) => b.percentage - a.percentage)
        .slice(0, 25)
        ?.map(lm => {

            return {
                id: lm.user_id,
                list: [
                    {
                        text: lm.username,
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: 'avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: lm.count,
                        colSpan: 1
                    },
                    {
                        text: lm.percentage + '%',
                        colSpan: 1
                    }
                ]
            }
        })

    return <>

        <div className="secondary nav">
            <button
                className={tab.secondary === 'Owned' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Owned' } }, 'PLAYERS'))}
            >
                Owned
            </button>
            <button
                className={tab.secondary === 'Taken' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Taken' } }, 'PLAYERS'))}
            >
                Taken
            </button>
            <button
                className={tab.secondary === 'Available' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Available' } }, 'PLAYERS'))}
            >
                Available
            </button>
            <button
                className={tab.secondary === 'Leaguemate Shares' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Leaguemate Shares' } }, 'PLAYERS'))}
            >
                Leaguemate Shares
            </button>
        </div>
        {
            tab.secondary === 'Leaguemate Shares'
                ? <>
                    <TableMain
                        type={'secondary subs'}
                        headers={[]}
                        body={leaguemate_shares_body_count}
                    />
                    <TableMain
                        type={'secondary lineup'}
                        headers={[]}
                        body={leaguemate_shares_body_percentage}
                    />
                </>
                : <div className="relative">
                    {
                        !modalVisible.player2 ?
                            null
                            :
                            <div className="modal" ref={playerModalRef} >
                                <PlayerModal
                                    setPlayerModalVisible={(value) => dispatch(setState({ modalVisible: { ...modalVisible, player2: value } }, 'PLAYERS'))}
                                    player={{
                                        ...stateAllPlayers[player_id],
                                        ...modalVisible.player2
                                    }}
                                    getPlayerScore={getPlayerScore}
                                    league={modalVisible.player2?.league}
                                />
                            </div>
                    }
                    <TableMain
                        type={'secondary'}
                        headers={player_leagues_headers}
                        body={player_leagues_body}
                        itemActive={itemActive2}
                        setItemActive={(item) => dispatch(setState({ itemActive2: item }, 'PLAYERS'))}
                        page={page2}
                        setPage={(page) => dispatch(setState({ page2: page }, 'PLAYERS'))}
                    />
                </div>
        }
    </>
}

export default PlayerLeagues;