const express = require('express')
const router = express.Router()

const path = require('path');
const html2pug = require('html2pug')

const fs = require('fs-extra')


let convertirHTMLaPug = async function (ruta, original_path, out_directori) {
    fs.readdirSync(ruta, {withFileTypes: true}).forEach(entrada => {


        if (ruta == original_path) {

            // Crear la carpeta viewEngine si no existe
            if (!fs.existsSync(ruta + "/viewEngine")) {
                fs.mkdirSync(ruta + "/viewEngine");
            }

            // Crear el archivo Routes si no existe
            if (!fs.existsSync(ruta + "/viewEngine/Routes.js")) {
                fs.writeFileSync(ruta + "/viewEngine/Routes.js", "");
            }
        }


        if (entrada.isDirectory()) {
            // es una carpeta, se recursa
            convertirHTMLaPug(`${ruta}/${entrada.name}`, original_path);
        } else if (entrada.isFile()) {
            // es un archivo, se verifica su extensión
            if (entrada.name.endsWith(".html")) {
                // es un archivo html, se convierte a pug
                const rutaHTML = `${ruta}/${entrada.name}`;
                const rutaPug = `${ruta}/${entrada.name.replace(".html", ".pug")}`;


                // Leer el archivo HTML
                fs.readFile(rutaHTML, "utf8", (err, html) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    // Convertir a Pug
                    const pug = html2pug(html);

                    // Escribir el archivo Pug
                    fs.writeFile(rutaPug, pug, err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        // Añadir la ruta al archivo Routes
                        fs.appendFileSync(original_path + "/viewEngine/Routes.js", `app.get("${rutaPug.replace(original_path, "")}", (req, res) => {
                                res.render("${rutaPug.replace(original_path, "")}");
                            });\n`);

                        // Eliminar el archivo HTML


                    });

                    fs.copy(ruta, out_directori, {filter: file => !file.endsWith('.html')}, (err) => {
                        if (err) {

                        } else {
                            console.log('Folder copied!');
                            fs.unlinkSync(rutaPug);

                        }
                    });


                });


            }


        }
    });


}

router.post('/convert/', async function (req, res) {
    let {in_directori, out_directori} = req.body

    try {

        convertirHTMLaPug(in_directori, in_directori, out_directori)




        res.status(200).json({
            success: true,
            message: 'Archivos convertidos con exito'
        })


    } catch (e) {
        console.error(e)
        res.status(500).json({
            success: false,
            message: 'error al convertir archivos'
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