'use strict'
const db = require("../models");
const User = db.users;
const axios = require('../api/axiosInstance');

exports.create = async (req, res, next, app, user_cache) => {
    console.log(`***SEARCHING FOR ${req.query.username}***`)

    const user_from_cache = user_cache.get(req.query.username.toLowerCase())

    if (user_from_cache) {
        console.log('user/leagues from cache...');

        req.data = JSON.parse(user_from_cache)
        next()
    } else {
        // check if user exists in Sleeper.  Update info if exists, send error message if not.

        const user = await axios.get(`http://api.sleeper.app/v1/user/${req.query.username}`)

        if (user.data?.user_id) {
            const data = await User.upsert({
                user_id: user.data.user_id,
                username: user.data.display_name,
                avatar: user.data.avatar,
                type: 'S', // S = 'Searched'
                updatedAt: new Date()

            })

            req.userData = data[0].dataValues;
            next();
        } else {
            res.send({ error: 'User not found' })
        }
    }
}
