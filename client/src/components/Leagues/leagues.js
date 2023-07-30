import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import LoadData from "../Home/loadData";
import TableMain from "../Home/tableMain";
import { filterLeagues } from '../../functions/filterLeagues';
import Heading from "../Home/heading";
import { setState } from "../../actions/actions";
import { loadingIcon } from "../../functions/misc";
import LeagueInfo from './leagueInfo';

const Leagues = () => {
    const dispatch = useDispatch();
    const { leagues } = useSelector(state => state.user);
    const { type1, type2 } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { itemActive, page, searched } = useSelector(state => state.leagues);

    const leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 4
            },
            {
                text: 'Record',
                colSpan: 2
            },
            {
                text: 'Rank',
                colSpan: 1
            }
        ]
    ]

    const leagues_body = filterLeagues((filteredData?.leagues || []), type1, type2)
        ?.filter(l => l.userRoster && (!searched.id || searched.id === l.league_id))
        ?.map(league => {
            const record = {
                wins: league.userRoster.settings.wins || 0,
                losses: league.userRoster.settings.losses || 0,
                ties: league.userRoster.settings.ties || 0
            }
            const total_games = record.wins + record.losses + record.ties

            return {
                id: league.league_id,
                search: {
                    text: league.name,
                    image: {
                        src: league.avatar,
                        alt: 'league avatar',
                        type: 'league'
                    }
                },
                list: [
                    {
                        text: league.name,
                        colSpan: 4,
                        className: 'left',
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    {
                        text: `${record?.wins?.toString() || ''}-${record?.losses?.toString() || ''}`
                            + (league.userRoster.settings.ties > 0 ? `-${league.userRoster.settings.ties}` : ''),
                        colSpan: 1
                    },
                    {
                        text: (total_games > 0 ?
                            (league.userRoster.settings.wins / total_games)
                            :
                            '--'
                        ).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 }).slice(1, 6),
                        colSpan: 1
                    },
                    {
                        text: league.userRoster?.rank || '-',
                        colSpan: 1,
                        className: league.userRoster?.rank / league.rosters.length <= .25 ? 'green' :
                            league.userRoster?.rank / league.rosters.length >= .75 ? 'red' :
                                null
                    }
                ],
                secondary_table: (
                    <LeagueInfo
                        league={league}
                        scoring_settings={league.scoring_settings}

                    />
                )
            }
        })
    const record = filterLeagues((leagues || []), type1, type2)
        ?.reduce(
            (acc, cur) => {
                return {
                    wins: acc.wins + (cur.userRoster?.wins || 0),
                    losses: acc.losses + (cur.userRoster?.losses || 0),
                    ties: acc.ties + (cur.userRoster?.ties || 0),
                    fpts: acc.fpts + parseFloat((cur.userRoster?.settings?.fpts || 0) + '.' + (cur.userRoster?.settings?.fpts_decimal || 0)),
                    fpts_against: acc.fpts_against + parseFloat((cur.userRoster?.settings?.fpts_against || 0) + '.' + (cur.userRoster?.settings?.fpts_against_decimal || 0))
                }
            },
            {
                wins: 0,
                losses: 0,
                ties: 0,
                fpts: 0,
                fpts_against: 0
            }
        )


    return <>
        <LoadData tab={'leagues'} />
        <Heading tab={'leagues'} />
        {!filteredData.leagues ? loadingIcon :
            <>
                <h2>
                    {record?.wins?.toString()}-{record?.losses?.toLocaleString('en-US')}{record?.ties > 0 && `-${record?.ties?.toLocaleString('en-US')}`}
                </h2>
                <h2>
                    {record?.fpts?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    &nbsp;-&nbsp;
                    {record?.fpts_against?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </h2>
                <TableMain
                    id={'Leagues'}
                    type={'primary'}
                    headers={leagues_headers}
                    body={leagues_body}
                    page={page}
                    setPage={(page) => dispatch(setState({ page: page }, 'LEAGUES'))}
                    itemActive={itemActive}
                    setItemActive={(item) => dispatch(setState({ itemActive: item }, 'LEAGUES'))}
                    search={true}
                    searched={searched}
                    setSearched={(searched) => dispatch(setState({ searched: searched }, 'LEAGUES'))}
                />
            </>
        }
    </>
}

export default Leagues;