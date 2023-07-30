import LoadData from "../Home/loadData";
import Heading from "../Home/heading";
import { useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import TableMain from "../Home/tableMain";
import { filterLeagues } from '../../functions/filterLeagues';
import { category_dropdown, loadingIcon, ppr_scoring_settings, getTrendColor } from "../../functions/misc";
import { setState } from "../../actions/actions";
import { getPlayerScore } from "../../functions/getPlayerScore";
import '../../css/css/players.css';
import headshot from '../../images/headshot.png';
import { positionFilterIcon, teamFilterIcon, draftClassFilterIcon } from "../../functions/filterIcons";
import PlayerLeagues from '../Players/playerLeagues';
import TrendModal from './trendModal';
import PlayerModal from "./playerModal";

const Players = () => {
    const dispatch = useDispatch();
    const { user, leagues } = useSelector(state => state.user);
    const { type1, type2, allplayers, state } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { modalVisible, statType1, statType2, page, searched, itemActive, trendDateStart, trendDateEnd, filters, sortBy, snapPercentageMin, snapPercentageMax } = useSelector(state => state.players);
    const { stats } = useSelector(state => state.stats);
    const { dynastyValues } = useSelector(state => state.dynastyValues);
    const modalRef = useRef(null);
    const playerModalRef = useRef(null);

    const filteredLeagueCount = filterLeagues((leagues || []), type1, type2)?.length



    const playerShares_headers = [
        [
            {
                text: 'Player',
                colSpan: 10,

            },
            {
                text: 'Owned',
                colSpan: 5,
            },
            {
                text: category_dropdown(statType1, (statType) => dispatch(setState({ statType1: statType }, 'PLAYERS')), leagues, statType1, statType2),
                colSpan: 3,
                className: 'small'
            },
            {
                text: category_dropdown(statType2, (statType) => dispatch(setState({ statType2: statType }, 'PLAYERS')), leagues, statType1, statType2),
                colSpan: 3,
                className: 'small'
            },
            {
                text: 'GP',
                colSpan: 2
            },
            {
                text: 'PPG',
                colSpan: 2,
            }
        ]
    ]

    const getPlayerSharesBody = useCallback((dynastyValues, trendDateStart, trendDateEnd, type1, type2, statType1, statType2, filteredLeagueCount) => {
        return (filteredData?.players || [])
            ?.map(player => {
                let pick_name;
                let ktc_name;
                let cur_value;
                let prev_value;
                let stat_trend1;
                let stat_trend2;
                let trend_games;
                if (player.id?.includes('_')) {
                    const pick_split = player.id.split('_')
                    pick_name = `${pick_split[0]} ${pick_split[1]}.${pick_split[2].toLocaleString("en-US", { minimumIntegerDigits: 2 })}`
                    ktc_name = `${pick_split[0]} ${parseInt(pick_split[2]) <= 4 ? 'Early' : parseInt(pick_split[2]) >= 9 ? 'Late' : 'Mid'} ${pick_split[1]}`


                    cur_value = dynastyValues
                        ?.find(dr => new Date(dr.date).getTime() === new Date(trendDateEnd).getTime())
                        ?.values[ktc_name]



                    prev_value = dynastyValues
                        ?.find(dr => new Date(dr.date).getTime() === new Date(trendDateStart).getTime())
                        ?.values[ktc_name]


                } else {
                    cur_value = dynastyValues
                        ?.find(dr => new Date(dr.date).getTime() === new Date(trendDateEnd).getTime())
                        ?.values[player.id]


                    prev_value = dynastyValues
                        ?.find(dr => new Date(dr.date).getTime() === new Date(trendDateStart).getTime())
                        ?.values[player.id]

                    trend_games = stats.stats?.[player.id]
                        ?.filter(
                            s =>
                                s.stats.tm_off_snp > 0
                                && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 >= snapPercentageMin)
                                && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 <= snapPercentageMax)

                        ) || []


                }
                switch (statType1) {
                    case 'SF Dynasty (KTC)':
                        stat_trend1 = cur_value?.sf || '-'
                        break;
                    case 'SF Dynasty (FC)':
                        stat_trend1 = cur_value?.sf_dynasty_fc || '-'
                        break;
                    case 'SF Redraft (FC)':
                        stat_trend1 = cur_value?.sf_redraft_fc || '-'
                        break;
                    case '1QB Dynasty (KTC)':
                        stat_trend1 = cur_value?.oneqb || '-'
                        break;
                    case '1QB Dynasty (FC)':
                        stat_trend1 = cur_value?.oneqb_dynasty_fc || '-'
                        break;
                    case '1QB Redraft (FC)':
                        stat_trend1 = cur_value?.oneqb_redraft_fc || '-'
                        break;
                    case 'SF Trend Dynasty (KTC)':
                        stat_trend1 = (cur_value?.sf && prev_value?.sf && cur_value?.sf - prev_value?.sf) || '-'
                        break;
                    case 'SF Trend Dynasty (FC)':
                        stat_trend1 = (cur_value?.sf_dynasty_fc && prev_value?.sf_dynasty_fc && cur_value?.sf_dynasty_fc - prev_value?.sf_dynasty_fc) || '-'
                        break;
                    case 'SF Trend Redraft (FC)':
                        stat_trend1 = (cur_value?.sf_redraft_fc && prev_value?.sf_redraft_fc && cur_value?.sf_redraft_fc - prev_value?.sf_redraft_fc) || '-'
                        break;
                    case '1QB Trend Dynasty (KTC)':
                        stat_trend1 = (cur_value?.oneqb && prev_value?.oneqb && cur_value?.oneqb - prev_value?.oneqb) || '-'
                        break;
                    case '1QB Trend Dynasty (FC)':
                        stat_trend1 = (cur_value?.oneqb_dynasty_fc && prev_value?.oneqb_dynasty_fc && cur_value?.oneqb_dynasty_fc - prev_value?.oneqb_dynasty_fc) || '-'
                        break;
                    case '1QB Trend Redraft (FC)':
                        stat_trend1 = (cur_value?.oneqb_redraft_fc && prev_value?.oneqb_redraft_fc && cur_value?.oneqb_redraft_fc - prev_value?.oneqb_redraft_fc) || '-'
                        break;
                    default:
                        stat_trend1 = trend_games?.length > 0
                            && (trend_games?.reduce((acc, cur) => acc + (cur.stats?.[statType1] || 0), 0) / trend_games?.length)?.toFixed(1)
                            || '-'
                        break;
                }

                switch (statType2) {
                    case 'SF Dynasty (KTC)':
                        stat_trend2 = cur_value?.sf || '-'
                        break;
                    case 'SF Dynasty (FC)':
                        stat_trend2 = cur_value?.sf_dynasty_fc || '-'
                        break;
                    case 'SF Redraft (FC)':
                        stat_trend2 = cur_value?.sf_redraft_fc || '-'
                        break;
                    case '1QB Dynasty (KTC)':
                        stat_trend2 = cur_value?.oneqb || '-'
                        break;
                    case '1QB Dynasty (FC)':
                        stat_trend2 = cur_value?.oneqb_dynasty_fc || '-'
                        break;
                    case '1QB Redraft (FC)':
                        stat_trend2 = cur_value?.oneqb_redraft_fc || '-'
                        break;
                    case 'SF Trend Dynasty (KTC)':
                        stat_trend2 = (cur_value?.sf && prev_value?.sf && cur_value?.sf - prev_value?.sf) || '-'
                        break;
                    case 'SF Trend Dynasty (FC)':
                        stat_trend2 = (cur_value?.sf_dynasty_fc && prev_value?.sf_dynasty_fc && cur_value?.sf_dynasty_fc - prev_value?.sf_dynasty_fc) || '-'
                        break;
                    case 'SF Trend Redraft (FC)':
                        stat_trend2 = (cur_value?.sf_redraft_fc && prev_value?.sf_redraft_fc && cur_value?.sf_redraft_fc - prev_value?.sf_redraft_fc) || '-'
                        break;
                    case '1QB Trend Dynasty (KTC)':
                        stat_trend2 = (cur_value?.oneqb && prev_value?.oneqb && cur_value?.oneqb - prev_value?.oneqb) || '-'
                        break;
                    case '1QB Trend Dynasty (FC)':
                        stat_trend2 = (cur_value?.oneqb_dynasty_fc && prev_value?.oneqb_dynasty_fc && cur_value?.oneqb_dynasty_fc - prev_value?.oneqb_dynasty_fc) || '-'
                        break;
                    case '1QB Trend Redraft (FC)':
                        stat_trend2 = (cur_value?.oneqb_redraft_fc && prev_value?.oneqb_redraft_fc && cur_value?.oneqb_redraft_fc - prev_value?.oneqb_redraft_fc) || '-'
                        break;
                    default:
                        stat_trend2 = trend_games?.length > 0
                            && (trend_games?.reduce((acc, cur) => acc + (cur.stats?.[statType1] || 0), 0) / trend_games?.length)?.toFixed(1)
                            || '-'
                        break;
                }

                const leagues_owned = filterLeagues(player.leagues_owned, type1, type2);
                const leagues_taken = filterLeagues(player.leagues_taken, type1, type2);
                const leagues_available = filterLeagues(player.leagues_available, type1, type2);


                return {
                    id: ktc_name || player.id,
                    search: {
                        text: allplayers[player.id] && `${allplayers[player.id]?.full_name} ${allplayers[player.id]?.position} ${allplayers[player.id]?.team || 'FA'}` || pick_name,
                        image: {
                            src: player.id,
                            alt: 'player photo',
                            type: 'player'
                        }
                    },
                    list: [
                        {
                            text: player.id?.includes('_') ? pick_name : `${allplayers[player.id]?.position} ${allplayers[player.id]?.full_name} ${player.id?.includes('_') ? '' : allplayers[player.id]?.team || 'FA'}` || `INACTIVE PLAYER`,
                            colSpan: 10,
                            className: 'left',
                            image: {
                                src: allplayers[player.id] ? player.id : headshot,
                                alt: allplayers[player.id]?.full_name || player.id,
                                type: 'player'
                            }
                        },

                        {
                            text: leagues_owned?.length.toString(),
                            colSpan: 2
                        },
                        {
                            text: < em >
                                {((leagues_owned?.length / filteredLeagueCount) * 100).toFixed(1) + '%'}
                            </em >,
                            colSpan: 3
                        },
                        {
                            text: <p
                                className={statType1.includes('Trend') && (stat_trend1 > 0 ? ' green stat' : stat_trend1 < 0 ? ' red stat' : 'stat') || 'stat'}
                                style={statType1.includes('Trend') && getTrendColor(stat_trend1, 1.5) || {}}
                            >
                                {(statType1.includes('Trend') && stat_trend1 > 0 ? '+' : '') + stat_trend1}
                            </p>,
                            colSpan: 3,

                        },
                        {
                            text: <p
                                className={statType2.includes('Trend') && (stat_trend2 > 0 ? 'green stat' : stat_trend2 < 0 ? 'red stat' : 'stat') || 'stat'}
                                style={statType2.includes('Trend') && getTrendColor(stat_trend2, 1.5) || {}}
                            >
                                {(statType2.includes('Trend') && stat_trend2 > 0 ? '+' : '') + stat_trend2}
                            </p>,
                            colSpan: 3,
                            className: "stat"

                        },
                        {
                            text: <p className="stat">{trend_games?.length || '-'}</p>,
                            colSpan: 2,
                            className: "stat"
                        },
                        {
                            text: <span
                                className="player_score"
                                onClick={
                                    (e) => {
                                        e.stopPropagation()
                                        dispatch(setState({
                                            itemActive: player.id,
                                            modalVisible: {
                                                options: false,
                                                player: {
                                                    ...allplayers[player.id],
                                                    trend_games: trend_games,
                                                    scoring_settings: ppr_scoring_settings
                                                },
                                                player2: false
                                            }
                                        }, 'PLAYERS'))
                                    }
                                }

                            >
                                {
                                    trend_games?.length > 0
                                    && (trend_games?.reduce((acc, cur) => acc + cur.stats.pts_ppr, 0) / trend_games?.length)?.toFixed(1)
                                    || '-'
                                }
                            </span>,
                            colSpan: 2,
                            className: "stat"

                        }
                    ],
                    secondary_table: (
                        <PlayerLeagues
                            leagues_owned={leagues_owned}
                            leagues_taken={leagues_taken}
                            leagues_available={leagues_available}
                            stateStats={stats}
                            trend_games={trend_games}
                            player_id={player.id}
                            playerModalVisible={modalVisible.player}
                            setPlayerModalVisible={(value) => dispatch(setState({ modalVisible: { ...modalVisible, player: value } }, 'PLAYERS'))}
                        />
                    )
                }
            }
            )

    }, [filteredData, filterLeagues, stats, allplayers])

    const playerShares_body = getPlayerSharesBody(dynastyValues, trendDateStart, trendDateEnd, type1, type2, statType1, statType2, filteredLeagueCount)
        ?.filter(x => x
            &&
            (
                x.id.includes(' ') || allplayers[x.id]
            ) && (
                !searched?.id || searched?.id === x.id
            ) && (
                filters.position === allplayers[x.id]?.position
                || filters.position.split('/').includes(allplayers[x.id]?.position?.slice(0, 1))
                || (
                    filters.position === 'Picks' && x.id?.includes(' ')
                )
            ) && (
                filters.team === 'All' || allplayers[x.id]?.team === filters.team
            ) && (
                filters.draftClass === 'All' || parseInt(filters.draftClass) === (state.league_season - allplayers[parseInt(x.id)]?.years_exp)
            )
        )
        .sort(
            (a, b) => (sortBy === statType1.replace(/_/g, ' ')
                ? (parseFloat(b.list[3].text.props.children) || 0) - (parseFloat(a.list[3].text.props.children) || 0)
                : sortBy === statType2.replace(/_/g, ' ')
                    ? (parseFloat(b.list[4].text.props.children) || 0) - (parseFloat(a.list[4].text.props.children) || 0)
                    : sortBy === 'PPG'
                        ? (parseFloat(b.list[5].text.props.children[1]) || 0) - (parseFloat(a.list[5].text.props.children[1]) || 0)
                        : sortBy === 'GP'
                            ? (parseInt(b.list[6].text.props.children) || 0) - (parseInt(a.list[6].text.props.children) || 0)

                            : (parseInt(b.list[1].text) || 0) - (parseInt(a.list[1].text) || 0)

            ) || parseInt(a.id.split('_')[0]) - parseInt(b.id.split('_')[0])
                || parseInt(a.id.split('_')[1]) - parseInt(b.id.split('_')[1])
                || parseInt(a.id.split('_')[2]) - parseInt(b.id.split('_')[2])
        )


    const teamFilter = teamFilterIcon(filters.team, (team) => dispatch(setState({ filters: { ...filters, team: team } }, 'PLAYERS')))

    const positionFilter = positionFilterIcon(filters.position, (pos) => dispatch(setState({ filters: { ...filters, position: pos } }, 'PLAYERS')), true)

    const player_ids = filteredData.players?.filter(p => parseInt(allplayers[p.id]?.years_exp) >= 0)?.map(p => parseInt(p.id))

    const draftClassYears = Array.from(
        new Set(
            player_ids
                ?.map(player_id => state.league_season - allplayers[player_id]?.years_exp)
        )
    )?.sort((a, b) => b - a)

    const draftClassFilter = draftClassFilterIcon(filters.draftClass, (dc) => dispatch(setState({ filters: { ...filters, draftClass: dc } }, 'PLAYERS')), draftClassYears)
    return <>
        <LoadData tab={'players'} player_ids={player_ids} />
        <Heading tab={'players'} />
        {
            !filteredData.players ? loadingIcon :
                <>
                    {
                        modalVisible.options ?
                            <TrendModal
                                modalRef={modalRef}
                            />
                            :
                            null
                    }
                    <div className="trend-range">
                        <label className="sort">
                            <i class="fa-solid fa-beat fa-sort click"></i>
                            <select
                                className="hidden_behind click"
                                onChange={(e) => dispatch(setState({ sortBy: e.target.value }, 'PLAYERS'))}
                                value={sortBy}
                            >
                                <option>OWNED</option>
                                <option>{statType1.replace(/_/g, ' ')}</option>
                                <option>{statType2.replace(/_/g, ' ')}</option>
                                <option>PPG</option>
                                <option>GP</option>
                            </select>
                        </label>
                        &nbsp;
                        {new Date(new Date(trendDateStart).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' })}
                        &nbsp;-&nbsp;
                        {new Date(new Date(trendDateEnd).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' })}
                        &nbsp;<label className="sort">
                            <i
                                className="fa-solid fa-filter fa-beat click"
                                onClick={async () => dispatch(setState({ modalVisible: { options: true, player: false, player2: false } }, 'PLAYERS'))}
                            >
                            </i>
                        </label>
                    </div>
                    {
                        !modalVisible.player ?
                            null
                            :
                            <div className="modal"  >
                                <PlayerModal
                                    setPlayerModalVisible={(value) => dispatch(setState({ modalVisible: { options: false, player: value, player2: false } }, 'PLAYERS'))}
                                    player={modalVisible.player}
                                    getPlayerScore={getPlayerScore}
                                    ref={playerModalRef}
                                />
                            </div>
                    }
                    <TableMain
                        id={'Players'}
                        type={'primary'}
                        headers={playerShares_headers}
                        body={playerShares_body}
                        page={page}
                        setPage={(page) => dispatch(setState({ page: page }, 'PLAYERS'))}
                        itemActive={itemActive}
                        setItemActive={(item) => dispatch(setState({ itemActive: item }, 'PLAYERS'))}
                        search={true}
                        searched={searched}
                        setSearched={(searched) => dispatch(setState({ searched: searched }, 'PLAYERS'))}
                        options1={[teamFilter]}
                        options2={[positionFilter, draftClassFilter]}
                    />
                </>
        }
    </>
}

export default Players;