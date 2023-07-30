import { useState, useEffect, useRef } from "react";
import TableMain from "../Home/tableMain";
import { importRankings } from '../../functions/importRankings';
import { matchTeam } from '../../functions/misc';
import { getNewRank } from "../../functions/getNewRank";
import { utils, writeFile } from 'xlsx';
import { positionFilterIcon, teamFilterIcon } from "../../functions/filterIcons";
import { useSelector, useDispatch } from 'react-redux';
import { uploadRankings, updateSleeperRankings, setState } from "../../actions/actions";
import PlayerBreakdownModal from "./playerBreakdownModal";

const WeeklyRankings = ({
    tab,
    setTab
}) => {
    const dispatch = useDispatch();
    const { allplayers: stateAllPlayers, state: stateState, schedule: stateNflSchedule, projections } = useSelector(state => state.main)
    const [errorVisible, setErrorVisible] = useState(false);
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [edit, setEdit] = useState(false)
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const [filterTeam, setFilterTeam] = useState('All')
    const tooltipRef = useRef(null);
    const { rankings, notMatched, filename, error, playerBreakdownModal, week } = useSelector(state => state.lineups)
    const playerBreakdownRef = useRef(null);
    const initialLoadRef = useRef(null);



    console.log({ projections: projections })
    useEffect(() => {

        if (!initialLoadRef.current) {
            initialLoadRef.current = true
        } else {
            setPage(1)
        }
    }, [searched, dispatch])


    const weekly_rankings_headers = [
        [
            {
                text: '',
                colSpan: 1
            },
            {
                text: 'Player',
                colSpan: 6
            },
            {
                text: 'Pos',
                colSpan: 2
            },
            {
                text: 'Team',
                colSpan: 2
            },
            {
                text: 'Opp',
                colSpan: 2
            },
            {
                text: 'Kickoff',
                colSpan: 4
            },
            {
                text: edit
                    ? <span
                        className="icon"
                        onClick={() => setEdit(false)}
                    >
                        <i
                            className={'fa fa-trash click'}
                        >
                        </i>
                        <p>{rankings ? 'Rank' : 'PPR'}</p>
                    </span>
                    : <span
                        className="icon"
                        onClick={() => setEdit(true)}
                    >
                        <i
                            className={'fa fa-edit click'}
                        >
                        </i>
                        <p>{rankings ? 'Rank' : 'PPR'}</p>
                    </span>,
                colSpan: 2
            },
            edit && {
                text: <span
                    className="icon"
                    onClick={() => handleRankSave(false)}
                >

                    <i
                        className={'fa fa-save click'}
                    >
                    </i>
                    <p>Update</p>
                </span>,
                colSpan: 4
            }
        ]
    ]

    const weekly_rankings_body = (rankings && Object.keys(rankings) || Object.keys(projections[week] || {}))
        ?.filter(x => (
            !searched?.id || searched.id === x
        ) && (
                filterPosition === stateAllPlayers[x]?.position
                || filterPosition.split('/').includes(stateAllPlayers[x]?.position?.slice(0, 1))
            ) && (
                filterTeam === 'All' || filterTeam === stateAllPlayers[x]?.team
            )
        )
        ?.sort((a, b) => rankings && rankings[a].prevRank - rankings[b].prevRank || projections[week] && projections[week][b].stats.pts_ppr - projections[week][a].stats.pts_ppr)
        ?.map((player_id, index) => {
            const offset = new Date().getTimezoneOffset()
            const kickoff = stateNflSchedule[week]
                ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === stateAllPlayers[player_id]?.team))
                ?.kickoff
            const kickoff_formatted = kickoff && new Date(parseInt(kickoff * 1000)) || '-'
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            return {
                id: player_id,
                search: {
                    text: `${stateAllPlayers[player_id]?.full_name} ${stateAllPlayers[player_id]?.position} ${stateAllPlayers[player_id]?.team || 'FA'}`,
                    image: {
                        src: player_id,
                        alt: 'player headshot',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: index + 1,
                        colSpan: 1
                    },
                    {
                        text: stateAllPlayers[player_id]?.full_name,
                        colSpan: 6,
                        className: 'left',
                        image: {
                            src: player_id,
                            alt: 'player headshot',
                            type: 'player'
                        }
                    },
                    {
                        text: stateAllPlayers[player_id]?.position,
                        colSpan: 2
                    },
                    {
                        text: stateAllPlayers[player_id]?.team || 'FA',
                        colSpan: 2
                    },
                    {
                        text: matchTeam(stateNflSchedule[week]
                            ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === stateAllPlayers[player_id]?.team))
                            ?.team
                            ?.find(team => matchTeam(team.id) !== stateAllPlayers[player_id]?.team)
                            ?.id) || 'FA'
                        ,
                        colSpan: 2
                    },
                    {
                        text: kickoff_formatted?.toLocaleString("en-US", { weekday: 'short', hour: 'numeric', minute: 'numeric', timeZone: timezone }),
                        colSpan: 4
                    },
                    {
                        text: rankings && rankings[player_id].prevRank || parseFloat(projections[week][player_id].stats.pts_ppr)?.toFixed(1),
                        colSpan: 2
                    },
                    edit && {
                        text: <input
                            value={rankings && rankings[player_id].newRank || parseFloat(projections[week] && projections[week][player_id].stats.pts_ppr_update || projections[week][player_id].stats.pts_ppr)?.toFixed(1)}
                            className={'editRank'}
                            onChange={(e) => rankings && handleRankChange([{ rank: e.target.value, player_id: player_id }])}
                            onClick={(e) => {
                                if (!rankings && !playerBreakdownModal) {
                                    e.stopPropagation()
                                    dispatch(setState({ playerBreakdownModal: player_id }, 'LINEUPS'))
                                }
                            }}
                            type={!rankings && "button"}
                        />,
                        colSpan: 4
                    }
                ]
            }
        })

    const handleRankChange = (players_to_update) => {

        let r = rankings || projections[week]

        players_to_update.map(player_to_update => {
            const prevRank = parseInt(r[player_to_update.player_id].newRank)
            const newRank = parseInt(player_to_update.rank) || ' '

            console.log({
                prevRank: prevRank,
                newRank: newRank
            })


            Object.keys(r)
                .map((player, index) => {
                    if (player !== player_to_update.player_id) {
                        let incrementedRank = getNewRank(prevRank, newRank, r[player].newRank)
                        r[player].newRank = incrementedRank
                    } else {
                        r[player].newRank = newRank
                    }
                })

        })
        rankings
            && dispatch(uploadRankings({
                rankings: r
            }))
            || dispatch(updateSleeperRankings(r))

    }

    const handleRankSave = () => {
        if (rankings) {
            let r = rankings

            Object.keys(r || {}).map(player_id => {
                return r[player_id].prevRank = !parseInt(r[player_id].newRank) ? 999 : r[player_id].newRank
            })
            dispatch(uploadRankings({
                rankings: r
            }))
        } else {
            let p = { ...projections[week] }

            Object.keys(p)
                .filter(player_id => player_id !== 'edited' && p[player_id].stats.pts_ppr_update && p[player_id].stats.pts_ppr_update !== p[player_id].stats.pts_ppr)
                .forEach(player_id => {
                    p[player_id].stats.pts_ppr = p[player_id].stats.pts_ppr_update
                })

            dispatch(updateSleeperRankings(p))
        }
        setEdit(false)

    }

    const downloadFile = () => {
        const workbook = utils.book_new()
        const data = Object.keys(rankings || {}).map(player_id => {
            return {
                name: stateAllPlayers[player_id]?.full_name,
                position: stateAllPlayers[player_id]?.position,
                team: stateAllPlayers[player_id]?.team || 'FA',
                rank: rankings[player_id].prevRank
            }
        }).sort((a, b) => a.rank - b.rank)
        const worksheet = utils.json_to_sheet(data)
        utils.book_append_sheet(workbook, worksheet, `Week ${stateState.display_week} Rankings`)
        writeFile(workbook, `SleepierWeek${stateState.display_week}Rankings.xlsx`)
    }

    useEffect(() => {
        const handleExitTooltip = (event) => {

            if (!tooltipRef.current || !tooltipRef.current.contains(event.target)) {

                setErrorVisible(false)
            }
        };

        document.addEventListener('mousedown', handleExitTooltip)
        document.addEventListener('touchstart', handleExitTooltip)

        return () => {
            document.removeEventListener('mousedown', handleExitTooltip);
            document.removeEventListener('touchstart', handleExitTooltip);
        };
    }, [])

    const positionFilter = positionFilterIcon(filterPosition, setFilterPosition)

    const teamFilter = teamFilterIcon(filterTeam, setFilterTeam)

    return <>
        <h1>
            {
                filename ?
                    <i
                        onClick={() => downloadFile()}
                        className="fa-solid fa-download click"></i>
                    :
                    <>
                        Sleeper Rankings From Projections
                        <label className='upload'>
                            <i
                                className={'fa fa-upload click right'}
                            >
                            </i>
                            <input
                                type={'file'}
                                onChange={(e) => importRankings(e, stateAllPlayers, (uploadedRankings) => {
                                    dispatch(uploadRankings(uploadedRankings))
                                })}
                            />
                        </label>
                    </>
            }
            {filename}
            &nbsp;
            {
                rankings && <button className="close" onClick={() => {
                    dispatch(setState({
                        rankings: null,
                        notMatched: [],
                        filename: '',
                        error: null,
                        playerBreakdownModal: false
                    }, 'LINEUPS'))
                }}>
                    X
                </button>
            }
            {
                error || notMatched?.length > 0 ?
                    <>

                        <i
                            onClick={() => {
                                setErrorVisible(true)
                                tooltipRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                })
                            }}
                            className={`fa-solid fa-circle-exclamation tooltip`} >
                            <div
                                onMouseLeave={() => setErrorVisible(false)}
                                ref={tooltipRef}>
                                <div
                                    className={`${errorVisible ? 'tooltip_content' : 'hidden'}`}>
                                    {
                                        error ||
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan={6}>NOT MATCHED</th>
                                                </tr>
                                                <tr>
                                                    <th colSpan={3}>Player Name</th>
                                                    <th >Rank</th>
                                                    <th>Pos</th>
                                                    <th>Team</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    notMatched.map((nm, index) =>
                                                        <tr key={`${nm.name}_${index}`}>
                                                            <td colSpan={3} className='left'><p><span>{nm.name}</span></p></td>
                                                            <td>{nm.rank}</td>
                                                            <td>{nm.position}</td>
                                                            <td>{nm.team}</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    }
                                </div>
                            </div>
                        </i>



                    </>
                    : null
            }
        </h1>

        {
            !playerBreakdownModal
                ? null
                : <PlayerBreakdownModal
                    player_id={playerBreakdownModal}
                    ref={playerBreakdownRef}
                />
        }

        <TableMain
            id={'Rankings'}
            type={'primary'}
            headers={weekly_rankings_headers}
            body={weekly_rankings_body}
            page={page}
            setPage={setPage}
            search={true}
            searched={searched}
            setSearched={setSearched}
            options1={[teamFilter]}
            options2={[positionFilter]}
        />

    </>
}

export default WeeklyRankings;