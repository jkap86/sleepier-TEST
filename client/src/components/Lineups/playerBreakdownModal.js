import { useSelector, useDispatch } from "react-redux";
import { avatar, ppr_scoring_settings } from '../../functions/misc';
import { setState } from "../../actions/actions";
import { forwardRef, useMemo, useState, useEffect, useRef } from "react";
import { getPlayerScore } from '../../functions/getPlayerScore';

const PlayerBreakdownModal = forwardRef(({
    player_id
}, playerBreakdownRef) => {
    const dispatch = useDispatch();
    const { leagues } = useSelector(state => state.user);
    const { allplayers, projections, projectionDict } = useSelector(state => state.main);
    const { playerBreakdownModal, week } = useSelector(state => state.lineups);
    const [projectionEdits, setProjectionEdits] = useState({});
    const [tab, setTab] = useState('Categories');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const projectionPercentageRef = useRef(null);

    useEffect(() => {
        // Disable scroll when the component mounts
        document.body.style.overflow = 'hidden';

        // Enable scroll when the component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        setShowAllCategories(false)
    }, [tab])

    const updatePPRScore = useMemo(() => {
        return getPlayerScore([{ stats: { ...projections[week][player_id].stats, ...projectionEdits } }], ppr_scoring_settings, true)
    }, [projections, projectionEdits])

    const closeModal = (e) => {

        dispatch(setState({
            projections: {
                ...projections,
                [week]: {
                    ...projections[week],
                    [player_id]: {
                        ...projections[week][player_id],
                        stats: {
                            ...projections[week][player_id].stats,
                            ...projectionEdits,
                            pts_ppr_update: updatePPRScore + 0.00000001
                        }
                    },
                    edited: true
                }
            }
        }, 'MAIN'))
        dispatch(setState({ playerBreakdownModal: false }, 'LINEUPS'))
    }



    useEffect(() => {
        if (playerBreakdownRef.current) {
            playerBreakdownRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [playerBreakdownModal, playerBreakdownRef])

    const clearCategories = (player_id, percentage) => {
        projectionPercentageRef.current.value = percentage
        const keys = Object.keys({ ...projectionEdits, ...projections[week][player_id].stats } || {})

        const edits = Object.fromEntries(
            keys
                .filter(key => !['pts_ppr', 'pts_ppr_update'].includes(key))
                .map(
                    key => {
                        const key_split = key.split('_');

                        const threshold = parseInt(key_split.find(x => parseInt(x)));

                        let new_value;

                        if (key_split.includes('bonus') && threshold) {
                            const category_to_check = key_split
                                .filter(x => !['bonus', threshold.toString()].includes(x))
                                .join('_')

                            console.log({ category_to_check: category_to_check })
                            if ((projections[week][player_id].stats[category_to_check] * percentage / 100) >= threshold) {
                                new_value = 1
                            } else {
                                new_value = 0
                            }
                        } else {
                            new_value = (projections[week][player_id].stats[key] * percentage / 100)?.toFixed(1)
                        }

                        return [key, new_value]
                    }
                )
        )


        setProjectionEdits(edits)
    }

    const stat_categories = useMemo(() => {
        return Array.from(
            new Set(leagues
                .flatMap(league =>
                    Object.keys(league.scoring_settings || {})
                        .filter(
                            setting => (
                                setting.startsWith('pass')
                                || setting.startsWith('rush')
                                || setting.startsWith('rec')
                                || setting.startsWith('bonus')
                                || setting.startsWith('fum')
                            )
                        )
                )
            )
        )
            .sort((a, b) => {
                const value1 = a.startsWith('pass') ? 1 : a.startsWith('rush') ? 2 : a.startsWith('rec') ? 3 : 4;
                const value2 = b.startsWith('pass') ? 1 : b.startsWith('rush') ? 2 : b.startsWith('rec') ? 3 : 4;

                if (value1 !== value2) {
                    return value1 - value2
                } else {
                    return b.localeCompare(a);
                }
            })
    }, [leagues])



    return <div className="modal" >
        <div className="modal-grid" ref={playerBreakdownRef}>
            <button className="close" onClick={closeModal}>X</button>
            <table className="modal">
                <caption>
                    <strong>
                        {avatar(player_id, 'player', 'player')}
                        {allplayers[player_id]?.full_name}
                        &nbsp;
                        <em className="updated_ppr_score">{updatePPRScore?.toFixed(1)} pts</em>
                    </strong>
                    <div className="player_breakdown_nav">
                        <button
                            className={tab === 'Categories' ? 'active' : 'click'}
                            onClick={() => setTab('Categories')}
                        >
                            Categories
                        </button>
                        <button
                            className={tab === 'Percentage' ? 'active' : 'click'}
                            onClick={() => setTab('Percentage')}
                        >
                            Percentage
                        </button>
                    </div>
                </caption>
                {
                    tab === 'Categories'
                        ? <>
                            <thead>
                                <tr>
                                    <th colSpan={2}>
                                        Scoring Setting
                                    </th>
                                    <th>
                                        Stats
                                        <i
                                            className="fa-solid fa-eraser click"></i>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    [
                                        ...stat_categories
                                            .filter(
                                                category => Object.keys(projections[week][player_id].stats)
                                                    .includes(category)
                                                    || (projectionEdits[category] && Object.keys(projectionEdits).includes(category))

                                            ),
                                        ...(
                                            showAllCategories
                                            && stat_categories
                                                .filter(
                                                    category => !(
                                                        Object.keys(projections[week][player_id].stats)
                                                            .includes(category)
                                                        || (projectionEdits[category] && Object.keys(projectionEdits).includes(category))
                                                    )
                                                )
                                            || []
                                        )

                                    ]
                                        .map(category =>
                                            <tr key={category}>
                                                <td colSpan={2}>
                                                    {category.replace(/_/g, ' ')}
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="editRank"

                                                        value={
                                                            projectionEdits[category] !== undefined
                                                                ? projectionEdits[category]
                                                                : parseFloat(projections[week][player_id].stats[category])?.toFixed(1)
                                                        }
                                                        onChange={(e) => setProjectionEdits(prevState => {
                                                            return {
                                                                ...prevState,
                                                                [category]: e.target.value
                                                            }
                                                        })}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                }
                            </tbody>
                            {
                                !showAllCategories && <tfoot>
                                    <tr>
                                        <td colSpan={3}>
                                            <button className="show_more click" onClick={() => setShowAllCategories(true)}>
                                                Show More
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>}
                        </>
                        : <thead>
                            <tr>
                                <th colSpan={3}>

                                    <input
                                        ref={projectionPercentageRef}
                                        type="number"
                                        className="projection_percentage"
                                        defaultValue={''}
                                        placeholder="% of Projection"
                                    /> %
                                    <br />
                                    <button
                                        className="calculate"
                                        onClick={(e) => clearCategories(player_id, projectionPercentageRef.current.value)}
                                    >
                                        Calculate
                                    </button>
                                </th>
                            </tr>
                        </thead>
                }
            </table>
        </div>
    </div>
})

export default PlayerBreakdownModal;