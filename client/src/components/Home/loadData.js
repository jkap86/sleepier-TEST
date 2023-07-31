import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useCallback, useRef } from "react";
import { resetState, fetchUser, fetchMain, setState, fetchLeagues } from "../../actions/actions";
import { openDB } from '../../functions/indexedDB';
import { fetchFilteredData, fetchLmTrades, fetchPriceCheckTrades, fetchStats, fetchValues, fetchFilteredLmTrades } from "../../actions/actions";
import { getRecordDict } from "../../functions/getRecordDict";


const LoadData = ({ tab, player_ids }) => {
    const params = useParams();
    const dispatch = useDispatch();
    const { user, leagues } = useSelector((state) => state.user);
    const { state, projectionDict, isLoadingProjectionDict, projections, schedule, allplayers } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { trendDateStart, trendDateEnd } = useSelector(state => state.players);
    const { stats } = useSelector(state => state.stats);
    const { dynastyValues } = useSelector(state => state.dynastyValues);
    const trades = useSelector(state => state.trades);
    const { rankings, includeTaxi, includeLocked, week, syncing } = useSelector(state => state.lineups)

    const hash = `${includeTaxi}-${includeLocked}`;

    useEffect(() => {
        try {
            if (params.username !== user.username) {
                console.log(params.username)
                dispatch(resetState());
                dispatch(fetchUser(params.username));
            }
        } catch (error) {
            console.log(error)
        }
    }, [params.username])

    useEffect(() => {
        if (user?.user_id && leagues.length === 0) {
            dispatch(fetchLeagues(user.user_id))
        }
    }, [user])

    useEffect(() => {
        openDB('allplayers', () => dispatch(fetchMain('allplayers')), (value) => dispatch(setState({ allplayers: value }, 'MAIN')));
        openDB('schedule', () => dispatch(fetchMain('schedule')), (value) => dispatch(setState({ schedule: value }, 'MAIN')));


        openDB('projections', () => dispatch(fetchMain('projections')), (value) => dispatch(setState({ projections: value }, 'MAIN')));

    }, [])

    const handleFetchFilteredData = useCallback(() => {
        dispatch(fetchFilteredData(leagues, tab, state.league_season));
    }, [dispatch, leagues, tab, state])

    useEffect(() => {
        if (user.user_id && leagues.length > 0) {
            handleFetchFilteredData();
        }
    }, [user, leagues, handleFetchFilteredData])


    //  PLAYERS

    useEffect(() => {
        if (tab === 'players' && filteredData.players?.length > 0) {

            if (!(
                new Date(stats.date1).getTime() === new Date(trendDateStart).getTime()
                && new Date(stats.date2).getTime() === new Date(trendDateEnd).getTime()
            )) {
                dispatch(fetchStats(trendDateStart, trendDateEnd))
            }

            dispatch(fetchValues(trendDateStart, trendDateEnd, false, player_ids))

        }
    }, [trendDateStart, trendDateEnd, filteredData, dispatch])


    //  TRADES

    useEffect(() => {
        if (tab === 'lmTrades' && (trades.lmTrades.searched_player.id || trades.lmTrades.searched_manager.id) && !trades.lmTrades.searches.find(s => s.player === trades.lmTrades.searched_player.id && s.manager === trades.lmTrades.searched_manager.id)) {

            dispatch(fetchFilteredLmTrades(trades.lmTrades.searched_player.id, trades.lmTrades.searched_manager.id, state.league_season, 0, 125))
        }
    }, [trades.lmTrades.searched_player, trades.lmTrades.searched_manager, dispatch])


    useEffect(() => {
        let page = trades.lmTrades.page;

        const dates = trades.lmTrades.trades.slice((page - 1) * 25, ((page - 1) * 25) + 25).map(trade => new Date(parseInt(trade.status_updated) - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0])

        if (tab === 'lmTrades' && trades) {

            dispatch(fetchValues(null, null, [...dates, new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]]))
        }

    }, [trades.lmTrades.trades, trades.lmTrades.page])

    useEffect(() => {
        if (user.user_id && leagues.length > 0 && tab === 'lmTrades' && trades.lmTrades.trades.length === 0) {
            dispatch(fetchLmTrades(user.user_id, leagues, state.league_season, 0, 125))

        }
    }, [user, leagues, tab, dispatch])

    useEffect(() => {
        if (
            tab === 'pcTrades'
            && trades.pricecheckTrades.pricecheck_player.id
            && !trades.pricecheckTrades.searches
                .find(
                    pc => pc.pricecheck_player === trades.pricecheckTrades.pricecheck_player.id
                        && (!trades.pricecheckTrades.pricecheck_player2?.id
                            || pc.pricecheck_player2 === trades.pricecheckTrades.pricecheck_player2.id)
                )
        ) {
            dispatch(fetchPriceCheckTrades(trades.pricecheckTrades.pricecheck_player.id, trades.pricecheckTrades.pricecheck_player2.id, 0, 125))
        }
    }, [trades.pricecheckTrades.pricecheck_player, trades.pricecheckTrades.pricecheck_player2, dispatch])


    //  LINEUPS

    useEffect(() => {
        if (projections[week]) {

            if (user?.user_id && leagues.length > 0 && (
                (week !== 'All' && (!projectionDict[hash]?.[week] || projections[week]?.edited))
            ) && !isLoadingProjectionDict) {
                dispatch(setState({ isLoadingProjectionDict: true }, 'MAIN'));

                setTimeout(() => {
                    const w = week;

                    const result = getRecordDict(
                        user,
                        leagues,
                        w,
                        includeTaxi,
                        includeLocked,
                        projections,
                        allplayers,
                        schedule,
                        rankings,
                        projectionDict,
                        syncing
                    )
                    if (w === 'All') {
                        dispatch(
                            setState({
                                projectionDict: {
                                    ...projectionDict,
                                    [hash]: {
                                        ...projectionDict[hash],
                                        ...result
                                    }
                                }
                            }, 'MAIN')
                        );
                    } else {
                        dispatch(
                            setState({
                                projectionDict: {
                                    ...projectionDict,
                                    [hash]: {
                                        ...projectionDict[hash],
                                        [result.week]: result.data
                                    }
                                },
                                projections: {
                                    ...projections,
                                    [week]: {
                                        ...projections[week],
                                        edited: false
                                    }
                                }
                            }, 'MAIN')
                        );
                    }
                    dispatch(setState({ isLoadingProjectionDict: false }, 'MAIN'));
                }, 100)

            } else if (week === 'All' && Object.keys(projectionDict[hash])?.length < 18 && !isLoadingProjectionDict) {
                const worker = new Worker('/getRecordDictWeekWorker.js');

                console.log('Getting Projection Dict for week ' + week)

                dispatch(setState({ isLoadingProjectionDict: true }, 'MAIN'));
                const weeks = Object.keys(projections)
                    .filter(key => !Object.keys(projectionDict[hash] || {}).includes(key));
                worker.postMessage({
                    user,
                    leagues,
                    weeks,
                    includeTaxi,
                    includeLocked,
                    projections,
                    allplayers,
                    schedule,
                    rankings,
                    projectionDict
                });
                const result_dict = {};

                worker.onmessage = (e) => {

                    const result = e.data;

                    result_dict[result.week] = result.data
                    dispatch(
                        setState({
                            projectionDict: {
                                ...projectionDict,
                                [hash]: {
                                    ...projectionDict[hash],
                                    ...result_dict
                                },
                                edited: false
                            }
                        }, 'MAIN')
                    );

                    if (!(result.week < 18)) {
                        dispatch(setState({ isLoadingProjectionDict: false }, 'MAIN'));

                        return () => worker.terminate();
                    }
                };
            } else if (syncing?.week && !isLoadingProjectionDict) {
                dispatch(setState({ isLoadingProjectionDict: true }, 'MAIN'));

                const w = 'Sync';

                const result = getRecordDict(
                    user,
                    leagues,
                    w,
                    includeTaxi,
                    includeLocked,
                    projections,
                    allplayers,
                    schedule,
                    rankings,
                    projectionDict,
                    syncing
                )

                dispatch(
                    setState({
                        projectionDict: {
                            ...projectionDict,
                            [hash]: {
                                ...projectionDict[hash],
                                [result.week]: {
                                    ...projectionDict[hash][result.week],
                                    ...result.data
                                }
                            }
                        }
                    }, 'MAIN')
                );

                dispatch(setState({ isLoadingProjectionDict: false }, 'MAIN'));
                dispatch(setState({ syncing: false }, 'LINEUPS'))

            }
        }
    }, [
        user,
        leagues,
        projections,
        allplayers,
        schedule,
        rankings,
        includeTaxi,
        includeLocked,
        projectionDict,
        week,
        dispatch
    ])


    return <></>
}

export default LoadData;