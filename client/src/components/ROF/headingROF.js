import volcano from '../../images/volcano.png';

const HeadingROF = ({
    stateState,
    stateSeason,
    setStateSeason
}) => {

    const seasons = <select
        className="nav click"
        value={stateSeason}
        onChange={(e) => setStateSeason(e.target.value)}
    >
        {
            Array.from(
                Array(
                    parseInt(stateState?.league_season || new Date().getFullYear()) - 2020
                ).keys()
            )
                .map(key =>
                    <option>{key + 2021}</option>
                )
        }

    </select>


    return <>
        {seasons}
        <h1>
            <p className="image">
                <img
                    src={volcano}
                    alt="volcano"
                />
                <strong>
                    Ring of Fire
                </strong>
            </p>
        </h1>
    </>
}

export default HeadingROF;