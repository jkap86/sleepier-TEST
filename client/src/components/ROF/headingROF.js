import volcano from '../../images/volcano.png';
import shark from '../../images/shark.jpg';

const HeadingROF = ({
    stateState,
    stateSeason,
    setStateSeason,
    pool,
    title,
    startSeason
}) => {


    const seasons = <select
        className="nav click"
        value={stateSeason}
        onChange={(e) => setStateSeason(e.target.value)}
    >
        {
            Array.from(
                Array(
                    parseInt(stateState?.league_season || new Date().getFullYear()) - parseInt(startSeason - 1)
                ).keys()
            )
                .map(key =>
                    <option>{key + startSeason}</option>
                )
        }

    </select>


    return <>
        {seasons}
        <h1>
            <p className="image">
                <img
                    src={pool === 'osr' ? shark
                        : pool === 'rof' ? volcano
                            : null}
                    alt="volcano"
                    className='pool'
                />
                <strong className='pool'>
                    {title}
                </strong>
            </p>
        </h1>
    </>
}

export default HeadingROF;