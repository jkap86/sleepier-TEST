import { useNavigate, useParams, Link } from 'react-router-dom';
import { avatar } from '../../functions/misc';
import { useSelector, useDispatch } from 'react-redux';
import { filterLeagues } from '../../functions/filterLeagues';
import { setState } from '../../actions/actions';
import '../../css/css/heading.css';

const Heading = ({ tab }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { user, leagues } = useSelector(state => state.user);
    const { state, type1, type2, } = useSelector(state => state.main);



    const filteredLeagueCount = filterLeagues((leagues || []), type1, type2)?.length


    return !user?.user_id ? '' : <>
        <Link to="/" className="home">
            Home
        </Link>
        <div className="heading">

            <h1>
                {state.league_season}
            </h1>
            <h1>
                <p className="image">
                    {
                        user.avatar && avatar(user.avatar, user.display_name, 'user')
                    }
                    <strong>
                        {user.username}
                    </strong>
                </p>
            </h1>
            <div className="navbar">
                <p className='select'>
                    {tab}&nbsp;<i className="fa-solid fa-caret-down"></i>
                </p>
                <select
                    className="nav active click"
                    value={tab}
                    onChange={(e) => navigate(`/${params.username}/${e.target.value}`)}
                >
                    <option>players</option>
                    <option>trades</option>
                    <option>leagues</option>
                    <option>leaguemates</option>
                    <option>lineups</option>
                </select>

            </div>
            {
                tab === 'trades' ? null :
                    <div className="switch_wrapper">
                        <div className="switch">
                            <button className={type1 === 'Redraft' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'Redraft' }, 'MAIN'))}>Redraft</button>
                            <button className={type1 === 'All' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'All' }, 'MAIN'))}>All</button>
                            <button className={type1 === 'Dynasty' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'Dynasty' }, 'MAIN'))}>Dynasty</button>
                        </div>
                        <div className="switch">
                            <button className={type2 === 'Bestball' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'Bestball' }, 'MAIN'))}>Bestball</button>
                            <button className={type2 === 'All' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'All' }, 'MAIN'))}>All</button>
                            <button className={type2 === 'Standard' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'Standard' }, 'MAIN'))}>Standard</button>
                        </div>
                    </div>
            }
            <h2>
                {tab === 'trades' ? null : `${filteredLeagueCount} Leagues`}
            </h2>
        </div>
    </>
}

export default Heading;