import TableMain from "../Home/tableMain";
import { setState } from "../../actions/actions";
import LeaguemateLeagues from './leaguemateLeagues'
import { useSelector, useDispatch } from 'react-redux';
import { filterLeagues } from '../../functions/filterLeagues';
import LoadData from "../Home/loadData";
import Heading from "../Home/heading";


const Leaguemates = ({ }) => {
    const dispatch = useDispatch();
    const { itemActive, page, searched } = useSelector(state => state.leaguemates);
    const { user: state_user } = useSelector(state => state.user)
    const { filteredData } = useSelector(state => state.filteredData)
    const { type1, type2 } = useSelector(state => state.main);

    const stateLeaguemates = filteredData.leaguemates || []

    const leaguemates_headers = [
        [
            {
                text: 'Leaguemate',
                colSpan: 3,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: '#',
                colSpan: 1,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: 'Leaguemate',
                colSpan: 4,
                className: 'half'
            },
            {
                text: state_user.username,
                colSpan: 4,
                className: 'half'
            }
        ],
        [
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Fpts',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Fpts',
                colSpan: 2,
                className: 'half'
            }

        ]
    ]


    const leaguemates_body = (stateLeaguemates || [])
        ?.filter(x => x.username !== state_user.username && (!searched?.id || searched.id === x.user_id))
        ?.sort((a, b) => filterLeagues(b.leagues, type1, type2)?.length - filterLeagues(a.leagues, type1, type2)?.length)
        ?.map(lm => {
            const lm_leagues = filterLeagues(lm.leagues, type1, type2)
            return {
                id: lm.user_id,
                search: {
                    text: lm.username,
                    image: {
                        src: lm.avatar,
                        alt: 'user avatar',
                        type: 'user'
                    }
                },
                list: [
                    {
                        text: lm.username || 'Orphan',
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: lm.username,
                            type: 'user'
                        }
                    },
                    {
                        text: lm_leagues?.length.toString(),
                        colSpan: 1
                    },
                    {
                        text: (
                            lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings?.wins, 0) +
                            "-" +
                            lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings?.losses, 0) +
                            (
                                lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings.ties, 0) > 0 ?
                                    `-${lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings.ties, 0)}` :
                                    ''
                            )
                        ),
                        colSpan: 2,
                        className: "red"
                    },
                    {
                        text: lm.leagues?.reduce(
                            (acc, cur) =>
                                acc +
                                parseFloat(
                                    cur.lmRoster.settings?.fpts +
                                    '.' +
                                    cur.lmRoster.settings?.fpts_decimal
                                )
                            , 0)?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
                        colSpan: 2,
                        className: "red"
                    },
                    {
                        text: (
                            lm.leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.wins, 0) +
                            "-" +
                            lm.leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.losses, 0) +
                            (
                                lm.leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.ties, 0) > 0 ?
                                    `${lm.leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.ties, 0)}` :
                                    ''
                            )
                        ),
                        colSpan: 2,
                        className: "green"
                    },
                    {
                        text: lm.leagues?.reduce(
                            (acc, cur) =>
                                acc +
                                parseFloat(
                                    cur.userRoster.settings?.fpts +
                                    '.' +
                                    cur.userRoster.settings?.fpts_decimal
                                )
                            , 0)?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
                        colSpan: 2,
                        className: "green"
                    }
                ],
                secondary_table: (
                    <LeaguemateLeagues
                        leaguemate={lm}
                    />
                )
            }
        })

    return <>
        <LoadData tab={'leaguemates'} />
        <Heading tab={'leaguemates'} />

        <TableMain
            id={'Leaguemates'}
            type={'primary'}
            headers={leaguemates_headers}
            body={leaguemates_body}
            page={page}
            setPage={(page) => dispatch(setState({ page: page }, 'LEAGUEMATES'))}
            itemActive={itemActive}
            setItemActive={(item) => dispatch(setState({ itemActive: item }, 'LEAGUEMATES'))}
            search={true}
            searched={searched}
            setSearched={(searched) => dispatch(setState({ searched: searched }, 'LEAGUEMATES'))}
        />
    </>
}

export default Leaguemates;