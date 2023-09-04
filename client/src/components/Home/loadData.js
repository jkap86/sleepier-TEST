import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useCallback, useRef } from "react";
import { resetState, fetchUser, fetchMain, setState, fetchLeagues } from "../../actions/actions";
import { openDB } from '../../functions/indexedDB';
import { fetchFilteredData, fetchLmTrades, fetchPriceCheckTrades, fetchStats, fetchValues, fetchFilteredLmTrades } from "../../actions/actions";
import { getRecordDict } from "../../functions/getRecordDict";
import axios from 'axios';

const LoadData = ({ tab, player_ids }) => {
    const params = useParams();
    const dispatch = useDispatch();
    const { user, leagues, errorUser } = useSelector((state) => state.user);
    const { state, projectionDict, isLoadingProjectionDict, projections, schedule, allplayers } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { trendDateStart, trendDateEnd } = useSelector(state => state.players);
    const { stats } = useSelector(state => state.stats);
    const { dynastyValues } = useSelector(state => state.dynastyValues);
    const trades = useSelector(state => state.trades);
    const { rankings, includeTaxi, includeLocked, week, syncing } = useSelector(state => state.lineups)

    const hash = `${includeTaxi}-${includeLocked}`;

    console.log(tab)

    useEffect(() => {
        try {
            if (params.username.toLowerCase() !== user.username?.toLowerCase() && !errorUser) {
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
            //  dispatch(fetchLeagues(user.user_id))
            openDB(user.user_id, ['leagues'], () => dispatch(fetchLeagues(user.user_id)), (item, value) => dispatch(setState({ leagues: value }, 'USER')));

            const fetchLmPlayerShares = async (user_id) => {
                const lmplayershares = await axios.get('/user/lmplayershares', {
                    params: { user_id: user_id }
                });

                console.log({ lmplayershares: lmplayershares.data.sort((a, b) => a.username > b.username ? 1 : -1) })

                dispatch(setState({ lmplayershares: lmplayershares.data }, 'USER'));

            }
            fetchLmPlayerShares(user.user_id)
        }
    }, [user])

    useEffect(() => {
        openDB('main', ['allplayers', 'schedule', 'projections'], (item) => dispatch(fetchMain('main', item)), (item, value) => dispatch(setState({ [item]: value }, 'MAIN')));


        //  openDB('main', 'schedule', () => dispatch(fetchMain('main', 'allplayers')), (value) => dispatch(setState({ schedule: value }, 'MAIN')));

        //  openDB('main', 'projections', () => dispatch(fetchMain('main', 'allplayers')), (value) => dispatch(setState({ projections: value }, 'MAIN')));

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
        if (user.user_id && leagues.length > 0 && tab === 'lmTrades' && trades.lmTrades.count > 0) {
            let page = trades.lmTrades.page;

            const dates = trades.lmTrades.trades.slice((page - 1) * 25, ((page - 1) * 25) + 25).map(trade => new Date(parseInt(trade.status_updated) - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0])

            if (dates) {

                dispatch(fetchValues(null, null, [...dates, new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]], null))
            }
        } else if (user.user_id && leagues.length > 0 && tab === 'pcTrades') {
            let page = trades.pricecheckTrades.page;
            const pcTrades = trades.pricecheckTrades.searches
                .find(
                    pc => pc.pricecheck_player === trades.pricecheckTrades.pricecheck_player.id
                        && (!trades.pricecheckTrades.pricecheck_player2?.id
                            || pc.pricecheck_player2 === trades.pricecheckTrades.pricecheck_player2.id)
                )
            const dates = pcTrades?.trades?.slice((page - 1) * 25, ((page - 1) * 25) + 25).map(trade => new Date(parseInt(trade.status_updated) - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0])

            if (dates) {

                dispatch(fetchValues(null, null, [...dates, new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]], null))
            }
        }
    }, [tab, trades.lmTrades.trades, trades.lmTrades.page, trades.pricecheckTrades.searches, trades.pricecheckTrades.page])

    useEffect(() => {
        if (user.user_id && leagues.length > 0 && tab === 'lmTrades' && trades.lmTrades.count === '') {
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
        if (projections[week] || week === 'All') {

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