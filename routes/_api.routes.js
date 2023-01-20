const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path');
const html2pug = require('html2pug')


router.post('/convert/',async function(req,res){
    let {in_directori,out_directori} = req.body

    console.log(in_directori)
    console.log(out_directori)
    try {

        const dir = in_directori;
        const outputDir = out_directori;

        //LEE EL DIRECTORIO Y REGRESA LOS ARCHIVOS
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(err);
                return res.status(500).send('No exite el directorio');
            }

            //RECORRER LOS ARCHIVOS DEL DIRECTORIO
            files.forEach(file => {
                fs.readFile(path.join(dir, file), 'utf8', (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error al leer el archivo');
                    }

                    const new_pugArchivo = html2pug(html, { tabs: true })

                    //CREAR ARCHIVO
                    fs.writeFile(path.join(outputDir, `${path.basename(file, '.html')}.pug`), new_pugArchivo, err => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Error al leer el archivo');
                        }

                        console.log('Archivo-->',file , 'convertido a pug en la ruta', outputDir);
                    });
                });
            });


        });

        res.status(200).json({
            success:true,
            message:'Archivos convertidos con exito'
        })


    }catch (e) {
        console.error(e)
        res.status(500).json({
            success:false,
            message:'error al convertir archivos'
        })
        return
    }

})

router.all("*", (req, res) => {
    res.status(404).json({
        code: 404,
        message: 'Not Found',
        error: '404- Not Found',
        data: []

    })
})

module.exports = router