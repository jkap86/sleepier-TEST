import TableMain from "../Home/tableMain";
import TeamMatchups from "./teamMatchups";
import { useSelector } from 'react-redux';
import { useState } from "react";

const Standings = ({
    league_id,
    getAttribute,
    rosters
}) => {
    const [itemActive, setItemActive] = useState('');
    const { projectionDict } = useSelector(state => state.main);
    const { rankings, includeTaxi, includeLocked, week, recordType } = useSelector(state => state.lineups)

    console.log(rosters)
    const hash = `${includeTaxi}-${includeLocked}`;

    const headers = [
        [
            {
                text: 'Manager',
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
            }
        ]]

    const body = Object.keys(projectionDict[hash]?.['1']?.[league_id] || {})
        .sort((a, b) => getAttribute('wins', b) - getAttribute('wins', a) || getAttribute('fpts', b) - getAttribute('fpts', a))
        .map(roster_id => {
            const wins = getAttribute('wins', roster_id) + getAttribute('median_wins', roster_id)
            const losses = getAttribute('losses', roster_id) + getAttribute('median_losses', roster_id)
            const ties = getAttribute('ties', roster_id)
            const fpts = getAttribute('fpts', roster_id)
            const fpts_against = getAttribute('fpts_against', roster_id)

            const manager_roster = rosters.find(r => r.roster_id === parseInt(roster_id))

            return {
                id: roster_id,
                search: {
                    text: manager_roster?.username || 'Orphan',
                    image: {
                        src: manager_roster?.avatar,
                        alt: manager_roster?.name,
                        type: 'user'
                    }
                },
                list: [
                    {
                        text: manager_roster?.username || 'Orphan',
                        colSpan: 7,
                        className: 'left',
                        image: {
                            src: manager_roster?.avatar,
                            alt: manager_roster?.name,
                            type: 'user'
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
                    }
                ],
                secondary_table: (
                    <TeamMatchups
                        league_id={league_id}
                        roster_id={roster_id}
                    />
                )
            }
        })

    return <>
        <TableMain
            type={'secondary'}
            headers={headers}
            body={body}
            itemActive={itemActive}
            setItemActive={setItemActive}
        />
    </>
}

export default Standings;