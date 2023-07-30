import { avatar } from '../../functions/misc';
import { forwardRef, useEffect } from 'react';

const PlayerModal = forwardRef(({
    getPlayerScore,
    setPlayerModalVisible,
    player,
    league
}, ref) => {
    useEffect(() => {
        // Disable scroll when the component mounts
        document.body.style.overflow = 'hidden';

        // Enable scroll when the component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const player_score = getPlayerScore(player.trend_games, player.scoring_settings)

    return <>


        <div className="modal-grid" ref={ref}>
            <button className="close" onClick={(e) => {
                e.stopPropagation()
                setPlayerModalVisible(false)
            }}>X</button>
            <table className="modal">
                <caption>
                    <strong>
                        {avatar(player?.player_id, 'player', 'player')}
                        {player?.full_name}
                    </strong>
                    <p className='small'>{league && avatar(league?.avatar, 'league', 'league')}<span>{league?.name}</span></p>
                </caption>
                <thead>
                    <tr>
                        <th colSpan={3}>
                            Scoring Setting
                        </th>
                        <th>
                            Stats
                        </th>
                        <th>
                            Pts
                        </th>
                        <th>
                            %
                        </th>
                    </tr>
                    {
                        Object.keys(player_score)
                            .map(ss => {
                                const total_score = Object.keys(player_score || {}).reduce((acc, cur) => acc + player_score[cur].points, 0) / player.trend_games.length
                                return <tr key={ss}>
                                    <th colSpan={2} className="left">
                                        <p>{ss.replace('_', ' ')}</p>
                                    </th>
                                    <td>
                                        {player.scoring_settings[ss].toFixed(1)}
                                    </td>
                                    <td>
                                        {
                                            (player_score[ss].stats / player.trend_games.length).toFixed(1) || '-'
                                        }
                                    </td>
                                    <td>
                                        {
                                            (player_score[ss].points / player.trend_games.length).toFixed(1) || '-'
                                        }
                                    </td>
                                    <td>
                                        {
                                            ((player_score[ss].points / player.trend_games.length) / total_score * 100).toFixed(1)
                                        } %
                                    </td>
                                </tr>
                            })
                    }

                </thead>
            </table>


        </div>
    </>
})

export default PlayerModal;