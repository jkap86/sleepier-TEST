import taxi from '../images/taxi.png'
import lock from '../images/locked.png';
import unlock from '../images/unlocked.png';


export const teamFilterIcon = (filterTeam, setFilterTeam) => {
    const nfl_teams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN',
        'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
    ]
    return <span className="team">
        <label>
            <img
                className={'icon'}
                src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${filterTeam}.png`}
                onError={(e) => { return e.target.src = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png` }}
            />
            <select
                className="hidden_behind click"
                onChange={(e) => setFilterTeam(e.target.value)}
                value={filterTeam}
            >
                <option>All</option>
                {nfl_teams.map(team =>
                    <option key={team}>{team}</option>
                )}
            </select>
        </label>
    </span>
}

export const positionFilterIcon = (filterPosition, setFilterPosition, picks) => {
    return <span className="team">
        <label>
            <div className={filterPosition === 'Picks' ? 'position_square1' : `position_square${filterPosition.split('/').length}`}>
                {filterPosition.split('/').includes('W') || filterPosition === 'WR' ? <div className="wr">{filterPosition === 'WR' ? 'WR' : 'W'}</div> : null}
                {filterPosition.split('/').includes('R') || filterPosition === 'RB' ? <div className="rb">{filterPosition === 'RB' ? 'RB' : 'R'}</div> : null}
                {filterPosition.split('/').includes('T') || filterPosition === 'TE' ? <div className="te">{filterPosition === 'TE' ? 'TE' : 'T'}</div> : null}
                {filterPosition.split('/').includes('Q') || filterPosition === 'QB' ? <div className="qb">{filterPosition === 'QB' ? 'QB' : 'Q'}</div> : null}
                {filterPosition === 'Picks' ? <div className="picks">Picks</div> : null}
            </div>
            <select
                className="hidden_behind click"
                onChange={(e) => setFilterPosition(e.target.value)}
                value={filterPosition}
            >
                <option>W/R/T/Q</option>
                <option>W/R/T</option>
                <option>W/R</option>
                <option>W/T</option>
                <option>QB</option>
                <option>RB</option>
                <option>WR</option>
                <option>TE</option>
                {picks ? <option>Picks</option> : null}
            </select>
        </label>
    </span>
}



export const draftClassFilterIcon = (filterDraftClass, setFilterDraftClass, draftClassYears) => {


    return <span className="team">
        <label>
            {
                <>
                    <i className="fa-solid fa-graduation-cap icon"></i>
                    <strong className="draft-year"><em>{filterDraftClass !== 'All' && filterDraftClass}</em></strong>
                </>
            }
            <select
                className="hidden_behind click"
                onChange={(e) => setFilterDraftClass(e.target.value)}
                value={filterDraftClass}
            >
                <option>All</option>
                {
                    draftClassYears.map(year =>
                        <option>{year}</option>
                    )
                }
            </select>
        </label>
    </span>
}

export const includeTaxiIcon = (includeTaxi, setIncludeTaxi) => {
    return <div className='relative click' onClick={() => setIncludeTaxi(!includeTaxi)}>
        <img
            src={taxi}
            className='thumbnail'

        />
        {!includeTaxi && <i className="fa-solid fa-ban"></i>}
    </div>
}

export const includeLockedIcon = (includeLocked, setIncludeLocked) => {
    return <div className='relative click' onClick={() => setIncludeLocked(!includeLocked)}>
        <img
            src={includeLocked && lock || unlock}
            className='thumbnail'

        />

    </div>
}