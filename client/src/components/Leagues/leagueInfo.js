import { useState, useEffect } from "react";
import TableMain from "../Home/tableMain";
import { default_scoring_settings, scoring_settings_display } from '../../functions/misc';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStats } from "../../actions/actions";
import ktcLogo from '../../images/KTClogo.png';
import fantasycalcLogo from '../../images/fantasycalclogo.png';

const LeagueInfo = ({
    league,
    scoring_settings,
    getPlayerScore,
    type,
    snapPercentageMin,
    snapPercentageMax,
    standings,
    trendStats,
    allplayers
}) => {
    const dispatch = useDispatch();
    const { allplayers: stateAllPlayers } = useSelector(state => state.main)
    const { trendDateStart, trendDateEnd } = useSelector(state => state.user);
    const [itemActive, setItemActive] = useState('');
    const [secondaryContent, setSecondaryContent] = useState('Lineup')




    useEffect(() => {
        const roster = league.rosters.find(x => x.roster_id === itemActive)
        if (roster) {
            dispatch(fetchStats(trendDateStart, trendDateEnd, roster?.players, true))
        }
    }, [dispatch, itemActive])

    const active_roster = league.rosters.find(x => x.roster_id === itemActive)

    const standings_headers = [
        [
            {
                text: 'Manager',
                colSpan: 5,
            },
            {
                text: 'Record',
                colSpan: 2,
            },
            {
                text: 'FP',
                colSpan: 3
            }
        ]
    ]

    const standings_body = league.rosters
        .sort(
            (a, b) => standings
                && (standings[b.roster_id].wins - standings[a.roster_id].wins || standings[b.roster_id].fpts - standings[a.roster_id].fpts)
                || (b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)
        )
        .map((team, index) => {
            return {
                id: team.roster_id,
                list: [
                    {
                        text: team.username || 'Orphan',
                        colSpan: 5,
                        className: 'left',
                        image: {
                            src: team.avatar,
                            alt: 'user avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: (standings
                            && standings[team.roster_id]?.wins +
                            '-' + standings[team.roster_id]?.losses +
                            (standings[team.roster_id]?.ties > 0 ? '-' + standings[team.roster_id]?.ties : '')
                        )
                            || team.settings.wins + '-' + team.settings.losses + (team.settings.ties > 0 ? '-' + team.settings.ties : ''),
                        colSpan: 2
                    },
                    {
                        text: (standings
                            && standings[team.roster_id]?.fpts
                            || parseFloat(team.settings.fpts + '.' + (team.settings.fpts_decimal || '00'))
                        ).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
                        colSpan: 3
                    }
                ]
            }
        })

    const leagueInfo_headers = !active_roster ? [] : [
        [
            {
                text: 'Slot',
                colSpan: 5
            },
            {
                text: 'Player',
                colSpan: 12
            },
            {
                text: trendStats ? 'PPG' : 'Age',
                colSpan: 5
            }
        ]
    ]

    const position_abbrev = {
        'QB': 'QB',
        'RB': 'RB',
        'WR': 'WR',
        'TE': 'TE',
        'SUPER_FLEX': 'SF',
        'FLEX': 'WRT',
        'WRRB_FLEX': 'W R',
        'WRRB_WRT': 'W R',
        'REC_FLEX': 'W T'
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

    const display = active_roster?.players ?
        secondaryContent === 'Lineup' ? [...active_roster?.starters, ...active_roster?.players?.filter(p => !active_roster?.starters?.includes(p))] || []
            : secondaryContent === 'QBs' ? active_roster?.players?.filter(x => (allplayers || stateAllPlayers)[x]?.position === 'QB') || []
                : secondaryContent === 'RBs' ? active_roster?.players?.filter(x => (allplayers || stateAllPlayers)[x]?.position === 'RB') || []
                    : secondaryContent === 'WRs' ? active_roster?.players?.filter(x => (allplayers || stateAllPlayers)[x]?.position === 'WR') || []
                        : secondaryContent === 'TEs' ? active_roster?.players?.filter(x => (allplayers || stateAllPlayers)[x]?.position === 'TE') || []
                            : []
        : []

    const picks_body = active_roster?.draft_picks
        ?.sort((a, b) => a.season - b.season || a.round - b.round || a.order - b.order)
        ?.map(pick => {
            return {
                id: `${pick.season}_${pick.round}_${pick.original_user.user_id}`,
                list: [
                    {
                        text: <span>&nbsp;&nbsp;{`${pick.season} Round ${pick.round}${(pick.order && parseInt(league.season) === pick.season) ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : pick.original_user.user_id === active_roster?.user_id ? '' : `(${pick.original_user?.username || 'Orphan'})`}`.toString()}</span>,
                        colSpan: 22,
                        className: 'left'
                    }
                ]

            }
        })

    const players_body = display.map((starter, index) => {

        const trend_games = trendStats?.[starter]
            ?.filter(
                s =>
                    s.stats.tm_off_snp > 0
                    && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 >= snapPercentageMin)
                    && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 <= snapPercentageMax)

            )
        const player_score = getPlayerScore && getPlayerScore(trend_games, scoring_settings)
            || 1



        return {
            id: starter,
            list: [
                {
                    text: secondaryContent === 'Lineup' ? (position_abbrev[league.roster_positions[index]] || 'BN')
                        : (allplayers || stateAllPlayers)[starter]?.position,
                    colSpan: 5
                },
                {
                    text: (allplayers || stateAllPlayers)[starter]?.full_name || 'Empty',
                    colSpan: 12,
                    className: 'left',
                    image: {
                        src: starter,
                        alt: 'player headshot',
                        type: 'player'
                    }
                },
                {
                    text: <span >
                        {

                            trendStats
                                ? (
                                    trend_games?.length > 0
                                    && (Object.keys(player_score || {})
                                        .reduce(
                                            (acc, cur) => acc + player_score[cur].points, 0
                                        ) / trend_games.length
                                    )
                                        .toFixed(1) || '-'
                                ) : (
                                    (allplayers || stateAllPlayers)[starter]?.age
                                )
                        }
                    </span>,
                    colSpan: 5
                }
            ]
        }
    })

    const leagueInfo_body = active_roster && secondaryContent !== 'Picks' ?
        players_body
        : active_roster && secondaryContent === 'Picks' ?
            picks_body
            : [
                {
                    id: 'Type',
                    list: [
                        {
                            text: league.settings['type'] === 2 ? 'Dynasty'
                                : league.settings['type'] === 1 ? 'Keeper'
                                    : 'Redraft',
                            colSpan: 11
                        },
                        {
                            text: league.settings['best_ball'] === 1 ? 'Bestball' : 'Standard',
                            colSpan: 11
                        },
                    ]
                }, (league.userRoster && {
                    id: 'Trade Deadline',
                    list: [
                        {
                            text: 'Trade Deadline',
                            colSpan: 11
                        },
                        {
                            text: 'Week ' + league.settings['trade_deadline'],
                            colSpan: 11
                        }
                    ]
                }),
                (league.userRoster && {
                    id: 'Daily Waivers',
                    list: [
                        {
                            text: 'Waivers',
                            colSpan: 11
                        },
                        {
                            text: `${days[league.settings['waiver_day_of_week']]} 
                                ${league.settings['daily_waivers_hour'] > 12 ? (league.settings['daily_waivers_hour'] - 12) + ' pm' : (league.settings['daily_waivers_hour'] || '12') + 'am'} `,
                            colSpan: 11
                        }
                    ]
                }),
                ...(scoring_settings
                    && Object.keys(scoring_settings)
                        .filter(setting => (scoring_settings[setting] !== default_scoring_settings[setting] || scoring_settings_display.includes(setting)))
                        .map(setting => {
                            return {
                                id: setting,
                                list: [
                                    {
                                        text: setting,
                                        colSpan: 11
                                    },
                                    {
                                        text: scoring_settings[setting].toLocaleString(),
                                        colSpan: 11
                                    }
                                ]
                            }
                        })
                )
            ]

    return <>
        <div className={`${type || 'secondary'} nav`}>

            <div>
                {
                    active_roster ?
                        <>
                            <button
                                className={secondaryContent === 'Lineup' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('Lineup')}
                            >
                                Lineup
                            </button>
                            <button
                                className={secondaryContent === 'QBs' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('QBs')}
                            >
                                QBs
                            </button>
                            <button
                                className={secondaryContent === 'RBs' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('RBs')}
                            >
                                RBs
                            </button>
                            <button
                                className={secondaryContent === 'WRs' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('WRs')}
                            >
                                WRs
                            </button>
                            <button
                                className={secondaryContent === 'TEs' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('TEs')}
                            >
                                TEs
                            </button>
                            <button
                                className={secondaryContent === 'Picks' ? 'active click' : 'click'}
                                onClick={() => setSecondaryContent('Picks')}
                            >
                                Picks
                            </button>
                        </>
                        :
                        <>

                            <img src={ktcLogo} alt="ktclogo" onClick={() => {
                                window.open(`https://keeptradecut.com/dynasty/power-rankings/league?leagueId=${league.league_id}&platform=Sleeper`)
                            }} />
                            <img src={fantasycalcLogo} alt="fantasycalclogo" onClick={() => {
                                window.open(`https://fantasycalc.com/league/dashboard?leagueId=${league.league_id}&site=sleeper`)
                            }} />
                            <button className="active">
                                Settings
                            </button>
                        </>
                }
            </div>
        </div>
        <TableMain
            type={`${type || 'secondary'} subs`}
            headers={standings_headers}
            body={standings_body}
            itemActive={itemActive}
            setItemActive={setItemActive}
        />
        <TableMain
            type={`${type || 'secondary'} lineup`}
            headers={leagueInfo_headers}
            body={leagueInfo_body}
        />
    </>
}

export default LeagueInfo;