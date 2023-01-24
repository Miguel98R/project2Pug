const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
let {
    convertirHTMLaPug,
    movePugFiles,
    deletePugFiles,
    replacePathsInPugFiles,
    removePugFromFileRoutes,
    CreateFoldersInPug_out,
    indentHTML
} = require('../htmlToPugConverter')

router.post('/convert/', async function (req, res) {
    let {in_directori, out_directori} = req.body

    try {

        indentHTML(in_directori)
        convertirHTMLaPug(in_directori, in_directori, out_directori)


        res.status(200).json({
            success: true, message: 'convirtiendo archivos'

        })


    } catch (e) {
        console.error(e)
        res.status(500).json({
            success: false, message: 'error al convertir archivos'
        })
        return
    }

})

router.post('/mover_convertidos/', async function (req, res) {
    let {in_directori, out_directori} = req.body

    try {

        movePugFiles(out_directori)

        fs.appendFileSync(out_directori + "/viewEngine/routes.js", `module.exports = router \n`);

        if (fs.existsSync(in_directori + "/viewEngine")) {
            fs.remove(in_directori + "/viewEngine");
            deletePugFiles(in_directori);
            replacePathsInPugFiles(out_directori)
            removePugFromFileRoutes(out_directori + "/viewEngine/routes.js")
            CreateFoldersInPug_out(out_directori)


        }


        res.status(200).json({
            success: true,
            message: 'Archivos convertidos con exito'
        })

    } catch (e) {
        console.error(e)
        res.status(500).json({
            success: false, message: 'error al convertir archivos'
        })
        return
    }

})


module.exports = router