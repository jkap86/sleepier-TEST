import { forwardRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "../../actions/actions";

const TrendModal = forwardRef(({

}, modalRef) => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);


    useEffect(() => {
        // Disable scroll when the component mounts
        document.body.style.overflow = 'hidden';

        // Enable scroll when the component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);


    const handleMaxMinChange = (type, value) => {

        switch (type) {
            case 'minsnappct':
                players.snapPercentageMin > players.snapPercentageMax && dispatch(setState({ snapPercentageMin: value }, 'PLAYERS'));
                break;
            case 'maxsnappct':
                players.snapPercentageMin > players.snapPercentageMax && dispatch(setState({ snapPercentageMax: value }, 'PLAYERS'));
                break;
            case 'mintrend':
                players.trendDateStart > players.trendDateEnd && dispatch(setState({ trendDateEnd: value }, 'PLAYERS'))
                break;
            case 'maxtrend':
                players.trendDateStart > players.trendDateEnd && dispatch(setState({ trendDateStart: value }, 'PLAYERS'))
                break;
            default:
                break
        }
    }

    return <>
        <div className="modal" >
            <div className="modal-grid" ref={modalRef}>
                <button className="close" onClick={() => dispatch(setState({ modalVisible: { ...players.modalVisible, options: false } }, 'PLAYERS'))}>X</button>
                <div className="modal-grid-item">
                    <div className="modal-grid-content header"><strong>Trend Range</strong>
                    </div>
                    <div className="modal-grid-content one">

                        <input
                            type={'date'}
                            value={players.trendDateStart}
                            onChange={(e) => e.target.value && dispatch(setState({ trendDateStart: new Date(e.target.value).toISOString().split('T')[0] }, 'PLAYERS'))}
                            onBlur={(e) => handleMaxMinChange('mintrend', e.target.value)}
                            onMouseLeave={(e) => handleMaxMinChange('mintrend', e.target.value)}
                            onMouseEnter={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                        />

                    </div>
                    <div className="modal-grid-content three">

                        <input
                            type={'date'}
                            value={players.trendDateEnd}
                            onChange={(e) => e.target.value && dispatch(setState({ trendDateEnd: new Date(e.target.value).toISOString().split('T')[0] }, 'PLAYERS'))}
                            onBlur={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                            onMouseLeave={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                            onMouseEnter={(e) => handleMaxMinChange('mintrend', e.target.value)}
                        />

                    </div>
                </div>
                <div className="modal-grid-item">
                    <div className="modal-grid-content header">
                        <strong>Game Filters</strong>
                    </div>
                </div>
                <div className="modal-grid-item">
                    <div className="modal-grid-content one">
                        <strong>Snap %</strong>
                    </div>
                    <div className="modal-grid-content two">
                        Min <input
                            type={'number'}
                            min={'0'}
                            max={'100'}
                            value={players.snapPercentageMin}
                            onChange={(e) => dispatch(setState({ snapPercentageMin: e.target.value }, 'PLAYERS'))}
                        /> %
                    </div>
                    <div className="modal-grid-content three">
                        Max <input
                            type={'number'}
                            min={'0'}
                            max={'100'}
                            value={players.snapPercentageMax}
                            onChange={(e) => dispatch(setState({ snapPercentageMax: e.target.value }, 'PLAYERS'))}
                        /> %
                    </div>
                </div>
            </div>
        </div >
    </>
})

export default TrendModal;