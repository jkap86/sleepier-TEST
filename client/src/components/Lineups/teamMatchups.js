import TableMain from "../Home/tableMain"
import { useSelector, useDispatch } from 'react-redux';
import { setState, syncLeague } from "../../actions/actions";

const TeamMatchups = ({
    league_id,
    roster_id,
    playoff_week_start
}) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);
    const { projectionDict } = useSelector(state => state.main);
    const { includeTaxi, includeLocked, syncing, recordType } = useSelector(state => state.lineups)

    const handleSync = (league_id, week) => {
        dispatch(setState({ syncing: { league_id: league_id, week: week } }, 'LINEUPS'))
        dispatch(syncLeague(league_id, user.user_id, user.username, week))
    }

    const hash = `${includeTaxi}-${includeLocked}`;

    console.log(projectionDict[hash])

    const headers = [
        [
            {
                text: 'W',
                colSpan: 1
            },
            {
                text: 'Opponent',
                colSpan: 3
            },
            {
                text: 'PF',
                colSpan: 2
            },
            {
                text: 'PA',
                colSpan: 2
            },
            {
                text: 'Median',
                colSpan: 2
            },
            {
                text: 'W/L',
                colSpan: 1
            }
        ]]

    const getMedian = (projectionDict_week_league) => {
        const standings = Object.keys(projectionDict_week_league)
            .sort((a, b) => projectionDict_week_league[b]?.[recordType]?.fpts - projectionDict_week_league[a]?.[recordType]?.fpts)

        const middleIndex = Math.floor(standings.length / 2);

        if (standings.length % 2 === 0) {
            return (projectionDict_week_league[standings[middleIndex - 1]]?.[recordType]?.fpts + projectionDict_week_league[standings[middleIndex]]?.[recordType]?.fpts) / 2;
        } else {
            return projectionDict_week_league[standings[middleIndex]]?.[recordType]?.fpts;
        }
    }

    const body = Object.keys(projectionDict[hash] || {})
        .map(week => {
            const m = projectionDict[hash][week]?.[league_id]?.[roster_id]

            return {
                id: week,
                list: [
                    {
                        text: week,
                        colSpan: 1
                    },
                    {
                        text: m?.oppLineup?.username || '-',
                        colSpan: 3,
                        className: m?.oppLineup && 'left',
                        image: m?.oppLineup && {
                            src: m?.oppLineup?.avatar,
                            alt: m?.oppLineup?.usernamename,
                            type: 'user'
                        }
                    },
                    {
                        text: m?.userLineup
                            ? m?.[recordType]?.fpts?.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
                            : '-',
                        colSpan: 2
                    },
                    {
                        text: m?.userLineup
                            ? m?.[recordType]?.fpts_against?.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
                            : '-',
                        colSpan: 2
                    },
                    {
                        text: m?.userLineup
                            ? getMedian(projectionDict[hash][week]?.[league_id])?.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
                            : '-',
                        colSpan: 2
                    },
                    {
                        text: <>
                            {
                                m?.userLineup ?
                                    (m?.[recordType]?.fpts > m?.[recordType]?.fpts_against ? 'W'
                                        : m?.[recordType]?.fpts < m?.[recordType]?.fpts_against ? 'L'
                                            : 'T')
                                    : parseInt(week) < playoff_week_start
                                        ? <button
                                            className={`sync ${syncing?.week === week ? 'rotate' : 'click'}`}
                                            onClick={syncing ? null : () => handleSync(league_id, week)}
                                        >
                                            <i className={`fa-solid fa-arrows-rotate ${syncing ? 'rotate' : ''}`}></i>
                                        </button>
                                        : '-'
                            }
                            {
                                m?.[recordType]?.median_wins && <i className="fa-solid fa-trophy"></i>
                            }
                        </>,
                        colSpan: 1,
                        className: (m?.[recordType]?.fpts > m?.[recordType]?.fpts_against)
                            ? 'greenb'
                            : (m?.[recordType]?.fpts < m?.[recordType]?.fpts_against)
                                ? 'redb'
                                : ''
                    }
                ]
            }
        })


    return <>
        <TableMain
            type={'tertiary'}
            headers={headers}
            body={body}
        />
    </>
}

export default TeamMatchups;