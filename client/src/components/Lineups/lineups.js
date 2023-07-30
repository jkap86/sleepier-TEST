import { useState, useMemo, useEffect } from "react";
import WeeklyRankings from "./weekly_rankings";
import LineupCheck from "./lineup_check";
import { useSelector, useDispatch } from 'react-redux';
import '../../css/css/lineups.css';
import { setState, fetchProjections } from "../../actions/actions";
import Heading from '../Home/heading';
import LoadData from '../Home/loadData';

const Lineups = ({
}) => {
    const dispatch = useDispatch();
    const [tab, setTab] = useState('Lineup Check');
    const { week } = useSelector(state => state.lineups)



    const display = tab === 'Weekly Rankings' ?
        <WeeklyRankings
            tab={tab}
            setTab={setTab}
        />
        :
        <LineupCheck
            tab={tab}
            setTab={setTab}

        />

    return <>
        <LoadData tab={'lineups'} />
        <Heading tab={'lineups'} />
        <div className='navbar'>
            <p className='select click'>
                {tab}&nbsp;<i class="fa-solid fa-caret-down"></i>
            </p>

            <select
                className='trades click'
                onChange={(e) => setTab(e.target.value)}
                value={tab}

            >
                <option>Weekly Rankings</option>
                <option>Lineup Check</option>
            </select>
        </div>
        <h1>
            Week <select
                value={week}
                onChange={(e) => dispatch(setState({ week: e.target.value }, 'LINEUPS'))}
            >
                {
                    Array.from(Array(18).keys()).map(key =>
                        <option key={key + 1}>{key + 1}</option>
                    )
                }
                <option>All</option>
            </select>

        </h1>
        {display}
    </>
}

export default Lineups;