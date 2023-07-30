import TableMain from "../Home/tableMain";
import { useState, useRef, useEffect } from "react";
//  import LeagueInfo from "../Leagues/leagueInfo";
import { useSelector, useDispatch } from 'react-redux';
import LeagueInfo from "../Leagues/leagueInfo";
import { setState } from "../../actions/actions";
import PlayerModal from "./playerModal";
import { getPlayerScore } from '../../functions/getPlayerScore';

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
    const { modalVisible, tab, itemActive2, page2 } = useSelector(state => state.players)
    const { allplayers: stateAllPlayers } = useSelector(state => state.main)
    const { stats: stateStats } = useSelector(state => state.stats)
    const playerModalRef = useRef(null)


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
                null

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
                    text: lo.userRoster?.rank,
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
        </div>
        <div className="relative">
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
    </>
}

export default PlayerLeagues;