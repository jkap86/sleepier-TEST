module.exports = async (app) => {
    const db = require('../models');
    const User = db.users;
    const League = db.leagues;
    const Sequelize = db.Sequelize;

    const getTopUsers = async () => {
        try {
            const users = await User.findAll({
                attributes: [
                    'username',
                    'avatar',
                    [Sequelize.fn('COUNT', Sequelize.col('leagues.league_id')), 'leaguesCount']
                ],
                include: [{
                    model: League,
                    where: {
                        [Sequelize.Op.and]: [
                            {
                                rosters: {
                                    [Sequelize.Op.not]: {
                                        [Sequelize.Op.contains]: { players: null }
                                    }
                                }
                            }
                        ]
                    },
                    attributes: [],
                    through: {
                        attributes: []
                    },
                    required: true
                }],
                raw: true,
                order: [['leaguesCount', 'DESC']],
                group: ['user.user_id']
            })

            app.set('top_users', users.slice(0, 100))
        } catch (err) {
            console.log(err)
        }
    }

    setTimeout(() => {
        getTopUsers()
    }, 2000)

    setInterval(() => {
        getTopUsers()
    }, 24 * 60 * 60 * 1000)

} 