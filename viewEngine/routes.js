const express = require('express')
const router = express.Router()

router.get("/", async (req, res) => {

    res.render('home', {
        title: 'Html to pug app | Home ',
    })
})

module.exports = router
