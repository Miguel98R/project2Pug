const express = require('express')
const router = express.Router()

router.get("/", async (req, res) => {

    res.render('home', {
        title: 'project2pug || Home ',
    })
})

module.exports = router
