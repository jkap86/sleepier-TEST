'use strict'
const db = require("../models");
const User = db.users;
const axios = require('../api/axiosInstance');

exports.create = async (req, res, app) => {
    console.log(`***SEARCHING FOR ${req.query.username}***`)

    // check if user exists in Sleeper.  Update info if exists, send error message if not.
    let user;
    let retries = 0;
    try {
        user = await axios.get(`http://api.sleeper.app/v1/user/${req.query.username}`)
    } catch (error) {
        if (retries <= 3) {
            retries += 1
            setTimeout(async () => {
                user = await axios.get(`http://api.sleeper.app/v1/user/${req.query.username}`)
            }, 2000)
        }
    }


    if (user.data?.user_id) {
        const data = await User.upsert({
            user_id: user.data.user_id,
            username: user.data.display_name,
            avatar: user.data.avatar,
            type: 'S', // S = 'Searched'
            updatedAt: new Date()

        })

        req.userData = data[0].dataValues;
        res.send({
            user: req.userData,
            state: app.get('state')
        })
    } else {
        res.send({ error: 'User not found' })
    }
}

