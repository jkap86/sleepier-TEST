module.exports = (app, user_cache) => {
    const users = require("../controllers/user.controller.js");
    var router = require("express").Router();
    const rateLimit = require('express-rate-limit');


    const userLimiter = rateLimit({
        windowMs: 5 * 1000,
        max: 2
    })

    router.get("/create", userLimiter, (req, res, next) => {
        users.create(req, res, app, user_cache)
    })

    router.get("/findmostleagues", (req, res) => {
        const users = app.get('top_users')
        res.send(users || [])
    })

    app.use('/user', router);
}