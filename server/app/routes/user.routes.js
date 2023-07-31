module.exports = (app, user_cache) => {
    const users = require("../controllers/user.controller.js");
    var router = require("express").Router();


    router.get(
        "/create",
        (req, res, next) => {
            users.create(req, res, app, user_cache)
        }
    )



    app.use('/user', router);
}