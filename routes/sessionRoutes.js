const express = require('express')
const router = express.Router()

const {
    logonShow,
    logOff,
    registerDo,
    registerShow
} = require('../controllers/sessionController');

router.route('/register').get(registerShow).post(registerDo)
router.route('/logon').get(logonShow)
    .post(
        // passport.authenticate("local", {
        //   successRedirect: "/",
        //   failureRedirect: "/sessions/logon",
        //   failureFlash: true,
        // })
        (req, res) => {
            res.send("Not yet implemented.");
        }
    )
router.route('/logoff').post(logOff)

module.exports = router;