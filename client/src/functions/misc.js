import user_avatar from '../images/user_avatar.jpeg';
import league_avatar from '../images/league_avatar.png';
import player_avatar from '../images/headshot.png';
import sleeperlogo from '../images/sleeper_icon.png';



export const avatar = (avatar_id, alt, type) => {
    let source;
    let onError = null
    switch (type) {
        case 'league':
            source = avatar_id ? `https://sleepercdn.com/avatars/${avatar_id}` : league_avatar
            break;
        case 'user':
            source = avatar_id ? `https://sleepercdn.com/avatars/${avatar_id}` : user_avatar
            break;
        case 'player':
            source = `https://sleepercdn.com/content/nfl/players/thumb/${avatar_id}.jpg`
            onError = (e) => { return e.target.src = player_avatar }
            break;
        default:
            source = avatar_id ? `https://sleepercdn.com/avatars/${avatar_id}` : league_avatar
            break;
    }
    const image = <img
        alt={alt}
        src={source}
        onError={onError}
        className="thumbnail"
    />
    return image
}

export const loadingIcon = (
    <div className='loading'>
        <img
            className="loading"
            src={sleeperlogo}
            alt={'logo'}
        />
        <div className='z_one'>
            Z
        </div>
        <div className='z_two'>
            Z
        </div>
        <div className='z_three'>
            Z
        </div>
    </div>
)

export const default_scoring_settings = {
    "pass_2pt": 2,
    "pass_int": -1,
    "fgmiss": -1,
    "rec_yd": 0.1,
    "xpmiss": -1,
    "fgm_30_39": 3,
    "blk_kick": 2,
    "pts_allow_7_13": 4,
    "bonus_rush_yd_100": 1,
    "ff": 1,
    "fgm_20_29": 3,
    "fgm_40_49": 4,
    "pts_allow_1_6": 7,
    "st_fum_rec": 1,
    "pass_sack": 0,
    "def_st_ff": 1,
    "st_ff": 1,
    "pass_td_40p": 0,
    "bonus_rec_te": 0,
    "pts_allow_28_34": -1,
    "fgm_50p": 5,
    "fum_rec": 2,
    "def_td": 6,
    "fgm_0_19": 3,
    "rush_fd": 0,
    "bonus_pass_yd_300": 1,
    "int": 2,
    "pts_allow_0": 10,
    "pts_allow_21_27": 0,
    "rec_2pt": 0,
    "rec": 1,
    "xpm": 1,
    "st_td": 6,
    "def_st_fum_rec": 1,
    "def_st_td": 6,
    "sack": 1,
    "fum_rec_td": 6,
    "rush_att": 0,
    "rush_2pt": 2,
    "rec_td": 6,
    "pts_allow_35p": -4,
    "pts_allow_14_20": 1,
    "rush_yd": 0.1,
    "pass_int_td": 0,
    "pass_yd": 0.04,
    "pass_td": 4,
    "rush_td": 6,
    "bonus_rec_yd_100": 1,
    "fum_lost": -2,
    "fum": -1,
    "safe": 2,
    "rec_fd": 0
}

export const scoring_settings_display = [
    "pass_yd",
    "pass_td",
    "pass_2pt",
    "int",
    "rush_yd",
    "rush_td",
    "rush_2pt",
    "rec",
    "bonus_rec_te",
    "rec_yd",
    "rec_td",
    "rec_2pt"
]

export const getTrendColor = (trend, adjustment) => {
    return trend > 0
        ? {
            color: `rgb(${255 - trend / adjustment}, 255, ${255 - trend / adjustment})`,

        }
        : trend < 0
            ? {
                color: `rgb(255, ${255 + trend / adjustment}, ${255 + trend / adjustment})`
            }
            : {}
}

export const matchTeam = (team) => {
    const team_abbrev = {
        SFO: 'SF',
        JAC: 'JAX',
        KCC: 'KC',
        TBB: 'TB',
        GBP: 'GB',
        NEP: 'NE',
        LVR: 'LV',
        NOS: 'NO'
    }
    return team_abbrev[team] || team
}

export const ppr_scoring_settings = {
    'pass_yd': 0.04,
    'pass_td': 4,
    'pass_2pt': 2,
    'pass_int': -1,
    'rush_yd': 0.1,
    'rush_2pt': 2,
    'rush_td': 6,
    'rec': 1,
    'rec_yd': 0.1,
    'rec_2pt': 2,
    'rec_td': 6,
    'fum_lost': -2
}

export const getPlayerBreakdown = (
    player_id,
    trend_games,
    tooltipVisible,
    setTooltipVisible,
    setPlayerModalVisible,
    allPlayers,
    value,
    scoring_settings,
    league
) => {

    return <span
        className="player_score"
        //onClick={() => setItemActive()}
        onMouseEnter={
            trend_games?.length > 0
                ? (e) => {
                    setTooltipVisible(player_id)
                }
                : null
        }

        onMouseLeave={() => {
            setTooltipVisible(false)
        }}

    >
        {
            tooltipVisible === player_id
                ? <p className='tooltip' onClick={
                    (e) => {
                        console.log(scoring_settings)
                        e.stopPropagation()
                        setPlayerModalVisible({
                            ...(scoring_settings && player_id || allPlayers[player_id]),
                            trend_games: trend_games,
                            scoring_settings: scoring_settings || ppr_scoring_settings,
                            league
                        })
                        setTooltipVisible(false)
                    }
                }>
                    Breakdown
                </p>
                : null
        }
        {
            value
        }
    </span>
}

export const category_dropdown = (statType, setStatType, leagues, statType1, statType2) => {
    const stat_categories = Array.from(
        new Set(leagues
            .flatMap(league =>
                Object.keys(league.scoring_settings || {})
                    .filter(
                        setting => (
                            setting.startsWith('pass')
                            || setting.startsWith('rush')
                            || setting.startsWith('rec')
                            || setting.startsWith('bonus')
                            || setting.startsWith('fum ')
                        ) && (
                                league.scoring_settings[setting] > 0
                            )
                    )
            )
        )
    )

    const otherType = statType === statType1 ? statType2 : statType1

    return <label className="select">
        <p>{statType.replace(/_/g, ' ')}</p>

        <select className="hidden_behind click" value={statType} onChange={(e) => setStatType(e.target.value)}>
            {
                [
                    'SF Dynasty (KTC)', 'SF Dynasty (FC)', 'SF Redraft (FC)', '1QB Dynasty (KTC)', '1QB Dynasty (FC)', '1QB Redraft (FC)',
                    'SF Trend Dynasty (KTC)', 'SF Trend Dynasty (FC)', 'SF Trend Redraft (FC)',
                    '1QB Trend Dynasty (KTC)', '1QB Trend Dynasty (FC)', '1QB Trend Redraft (FC)'
                ]
                    .filter(x => x !== otherType)
                    .map(cat => {
                        return <option key={cat} value={cat}>
                            {cat}
                        </option>
                    })
            }
            {
                stat_categories
                    .filter(x => x.startsWith('pass') && x !== otherType)
                    .sort((a, b) => a.length < b.length ? -1 : 1)
                    .map(cat => {
                        return <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                        </option>
                    })
            }
            {
                stat_categories
                    .filter(x => x.startsWith('rush') && x !== otherType)
                    .sort((a, b) => a.length < b.length ? -1 : 1)
                    .map(cat => {
                        return <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                        </option>
                    })
            }
            {
                stat_categories
                    .filter(x => x.startsWith('rec') && x !== otherType)
                    .sort((a, b) => a.length < b.length ? -1 : 1)
                    .map(cat => {
                        return <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                        </option>
                    })
            }
            {
                stat_categories
                    .filter(x => !x.startsWith('pass') && !x.startsWith('rush') && !x.startsWith('rec') && x !== otherType)
                    .sort((a, b) => a.length < b.length ? -1 : 1)
                    .map(cat => {
                        return <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                        </option>
                    })
            }
        </select>
    </label>
}