import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeadingROF from './headingROF';
import StandingsROF from "./standingsROF";


const MainROF = () => {
    const [stateState, setStateState] = useState({});
    const [stateAllPlayers, setStateAllPlayers] = useState([]);
    const [stateStandings, setStateStandings] = useState()
    const [stateSeason, setStateSeason] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchData = async () => {
            const home_data = await axios.get('/rof/home')


            setStateState(home_data.data.state)
            setStateAllPlayers(home_data.data.allplayers)

        }

        fetchData()
    }, [])

    useEffect(() => {
        const fetchStandings = async () => {
            const standings = await axios.post('/rof/standings', {
                season: stateSeason
            })
            setStateStandings(standings.data)
        }
        fetchStandings()
    }, [stateSeason])


    return <>
        <Link to={'/'} className='home' target={'_blank'}>
            Home
        </Link>
        <HeadingROF
            state={stateState}
            stateSeason={stateSeason}
            setStateSeason={setStateSeason}
        />
        <StandingsROF
            stateAllPlayers={stateAllPlayers}
            stateStandings={stateStandings}
        />
    </>
}

export default MainROF;
