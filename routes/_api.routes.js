const express = require('express')
const router = express.Router()
const path = require('path');
const html2pug = require('html2pug')
const fs = require('fs-extra')

let convertirHTMLaPug = function (ruta, original_path, out_directori) {
    fs.readdirSync(ruta, {withFileTypes: true}).forEach(file => {


        if (ruta == original_path) {

            // Crear la carpeta viewEngine si no existe
            if (!fs.existsSync(ruta + "/viewEngine")) {
                fs.mkdirSync(ruta + "/viewEngine");
            }

            // Crear el archivo Routes si no existe
            if (!fs.existsSync(ruta + "/viewEngine/routes.js")) {
                fs.writeFileSync(ruta + "/viewEngine/routes.js", "");
                fs.appendFileSync(ruta + "/viewEngine/routes.js", `const express = require('express')
                    const router = express.Router()    \n`);
            }
        }


        if (file.isDirectory()) {
            // es una carpeta, se recursa
            convertirHTMLaPug(`${ruta}/${file.name}`, original_path);
        } else if (file.isFile()) {
            // es un archivo, se verifica su extensión
            if (file.name.endsWith(".html")) {

                // es un archivo html, se convierte a pug
                let rutaHTML = `${ruta}/${file.name}`;
                let rutaPug = `${ruta}/${ file.name.replace(".html", ".pug") }`;


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
                        fs.appendFileSync(original_path + "/viewEngine/routes.js", `router.get("${rutaPug.replace(original_path, "")}", (req, res) => {
                                res.render("${rutaPug.replace(original_path, "")}");
                            });\n`);
                    });

                    //enviar a la carpeta de salida
                    fs.copy(ruta, out_directori, {filter: file => !file.endsWith('.html')}, (err) => {

                            console.log('Archivos enviados a la salida!');

                    });


                });


            }


        }
    });

}

function movePugFiles(pug_salida) {

    // obtener todos los archivos y carpetas en la raíz
    let files = fs.readdirSync(pug_salida);

    // crear una nueva carpeta llamada views si no existe
    if (!fs.existsSync(path.join(pug_salida, 'views'))) {
        fs.mkdirSync(path.join(pug_salida, 'views'));
    }

    // crear una nueva carpeta llamada public si no existe
    if (!fs.existsSync(path.join(pug_salida, 'public'))) {
        fs.mkdirSync(path.join(pug_salida, 'public'));
    }

    // recorrer todos los archivos y carpetas
    files.forEach(file => {
        // obtener la ruta completa del archivo/carpeta
        const filePath = path.join(pug_salida, file);

        // si el archivo tiene extensión .pug
        if (path.extname(file) === '.pug') {
            // mover el archivo a la carpeta views
            fs.renameSync(filePath, path.join(pug_salida, 'views', file));

        } else if (fs.lstatSync(filePath).isDirectory()) { // si es una carpeta
            if (file === 'viewEngine' || file === 'views' ) return; // Si es la carpeta viewEngine o views se omite

            // mover la carpeta a la carpeta public
            fs.renameSync(filePath, path.join(pug_salida, 'public', file));
        }
    });


}

router.post('/convert/', async function (req, res) {
    let {in_directori, out_directori} = req.body

    try {

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


function deletePugFiles(folder) {
    fs.readdir(folder, (err, files) => {
        if (err) return console.error(err);

        files.forEach(file => {
            const filePath = path.join(folder, file);

            fs.stat(filePath, (err, stat) => {
                if (err) return console.error(err);

                if (stat.isDirectory()) {
                    deletePugFiles(filePath);
                } else if (path.extname(filePath) === '.pug') {
                    fs.unlink(filePath, err => {
                        if (err) return console.error(err);
                        console.log(`Deleted ${filePath}`);
                    });
                }
            });
        });
    });
}

router.post('/mover_convertidos/', async function (req, res) {
    let {in_directori, out_directori} = req.body

    try {

        movePugFiles(out_directori)

        fs.appendFileSync(out_directori + "/viewEngine/routes.js", `module.exports = router \n`);

        if (fs.existsSync(in_directori + "/viewEngine")) {
            fs.remove(in_directori + "/viewEngine");
            deletePugFiles(in_directori);
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