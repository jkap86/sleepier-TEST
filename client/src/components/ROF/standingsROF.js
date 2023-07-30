import TableMain from '../Home/tableMain';
import { useState } from 'react';
import LeagueInfo from '../Leagues/leagueInfo';


const StandingsROF = ({
    stateAllPlayers,
    stateStandings
}) => {
    const [searched, setSearched] = useState('')
    const [page, setPage] = useState(1)
    const [itemActive, setItemActive] = useState('');

    const headers = [
        [
            {
                text: 'Rank',
                colSpan: 1
            },
            {
                text: 'Manager',
                colSpan: 4
            },
            {
                text: 'League',
                colSpan: 5
            },
            {
                text: 'Record',
                colSpan: 2
            },
            {
                text: 'FP',
                colSpan: 2
            },
            {
                text: 'FPA',
                colSpan: 2
            }
        ]
    ]

    const standingsBody = (stateStandings || [])
        .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.fpts - a.fpts)
        .map((team, index) => {
            return {
                id: team.league_name + '_' + team.roster_id,
                search: {
                    text: team.username,
                    image: {
                        src: team.user_avatar,
                        alt: team.username,
                        type: 'user'
                    }
                },
                list: [
                    {
                        text: (index + 1).toString(),
                        colSpan: 1
                    },
                    {
                        text: team.username,
                        image: {
                            src: team.user_avatar,
                            alt: team.username,
                            type: 'user'
                        },
                        className: 'left',
                        colSpan: 4
                    },
                    {
                        text: team.league_name,
                        image: {
                            src: team.league_avatar,
                            alt: team.league_name,
                            type: 'user'
                        },
                        className: 'left',
                        colSpan: 5
                    },
                    {
                        text: `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
                        colSpan: 2
                    },
                    {
                        text: team.fpts.toString(),
                        colSpan: 2
                    },
                    {
                        text: team.fpts_against.toString(),
                        colSpan: 2
                    }
                ],
                secondary_table: <LeagueInfo
                    league={team}
                    scoring_settings={team.scoring_settings}
                    allplayers={stateAllPlayers}
                />
            }
        })


    return <>
        <TableMain
            id={'managers'}
            type={'primary'}
            headers={headers}
            body={standingsBody}
            searched={searched}
            setSearched={setSearched}
            search={true}
            page={page}
            setPage={setPage}
            itemActive={itemActive}
            setItemActive={setItemActive}
        />
    </>
}

export default StandingsROF;