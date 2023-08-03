import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeadingROF from './headingROF';
import StandingsROF from "./standingsROF";
import { openDB } from "../../functions/indexedDB";
import { fetchMain, setState } from "../../actions/actions";

const MainROF = ({ pool, title, startSeason }) => {
    const dispatch = useDispatch();
    const [stateState, setStateState] = useState({});
    const [stateAllPlayers, setStateAllPlayers] = useState([]);
    const [stateStandings, setStateStandings] = useState()
    const [stateSeason, setStateSeason] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchData = async () => {
            const home_data = await axios.get('/pools/home')


            setStateState(home_data.data.state)

        }

        fetchData()
        openDB('allplayers', () => dispatch(fetchMain('allplayers')), (value) => dispatch(setState({ allplayers: value }, 'MAIN')));
    }, [])

    useEffect(() => {
        const fetchStandings = async () => {
            const standings = await axios.post(`/pools/${pool}`, {
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
            title={title}
            startSeason={startSeason}
            pool={pool}
        />
        <StandingsROF
            stateAllPlayers={stateAllPlayers}
            stateStandings={stateStandings}
        />
    </>
}

export default MainROF;
