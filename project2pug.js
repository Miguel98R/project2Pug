const path = require('path');
const html2pug = require('html2pug')
const minify = require('html-minifier').minify;
const fs = require('fs-extra')
const {spawn} = require('child_process');

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
                let rutaPug = `${ruta}/${file.name.replace(".html", ".pug")}`;


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
                                res.render("${rutaPug.replace(original_path + "/", "")}");
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

let movePugFiles = function (pug_salida) {

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
        if (path.extname(file) == '.pug') {
            // mover el archivo a la carpeta views
            fs.renameSync(filePath, path.join(pug_salida, 'views', file));
            console.log("moviendo")
        } else if (fs.lstatSync(filePath).isDirectory()) {


            if (file=="webfonts" || file == "vendor" || file == "owl-carousel" || file == "fontAwesome" || file == "font-awesome" || file === 'assets' || file === 'css' || file === 'js' || file === 'img' || file === 'images' || file === 'core' || file === 'fonts' || file == 'icon' || file == 'plugins' || file == 'scss'|| file == 'sass' || file == 'media') {
                // mover la carpeta a la carpeta public
                fs.renameSync(filePath, path.join(pug_salida, 'public', file));

            } else if (file !== 'viewEngine') {
                fs.renameSync(filePath, path.join(pug_salida, 'views', file));
            }


        }
    });


}

let deletePugFiles = function (folder) {
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

let replacePathsInPugFiles = function (rootDir) {
    // Obtener todos los archivos .pug en la raiz y subcarpetas
    const pugFiles = getAllFilesInDir(rootDir, '.pug');

    // Recorrer cada archivo .pug y reemplazar los paths de js y css
    pugFiles.forEach(file => {
        let fileContent = fs.readFileSync(file, 'utf8');
        fileContent = fileContent.replace(/='js\//g, "='/public/js/");
        fileContent = fileContent.replace(/='css\//g, "='/public/css/");
        fileContent = fileContent.replace(/='img\//g, "='/public/img/");
        fileContent = fileContent.replace(/='images\//g, "='/public/images/");

        fileContent = fileContent.replace(/='scss\//g, "='/public/scss/");
        fileContent = fileContent.replace(/='plugins\//g, "='/public/plugins/");
        fileContent = fileContent.replace(/='icon\//g, "='/public/icon/");
        fileContent = fileContent.replace(/='fonts\//g, "='/public/fonts/");

        fileContent = fileContent.replace(/='assets\//g, "='/public/");

        fileContent = fileContent.replace(/\.html/g, ' ');

        fs.writeFileSync(file, fileContent, 'utf8');
    });

}

let getAllFilesInDir = function (dir, ext) {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            files = files.concat(getAllFilesInDir(filePath, ext));
        } else if (path.extname(file) === ext) {
            files.push(filePath);
        }
    });
    return files;
}

let removePugFromFileRoutes = function (filepath) {
    // Leer el contenido del archivo
    let fileContent = fs.readFileSync(filepath, 'utf8');

    // Reemplazar todas las ocurrencias de ".pug" con una cadena vacía
    fileContent = fileContent.replace(/\.pug/g, '');

    // Escribir el contenido modificado en el archivo
    fs.writeFileSync(filepath, fileContent);
}

let CreateFoldersInPug_out = function (filepath) {
    // Crear la carpeta controllers si no existe
    if (!fs.existsSync(filepath + "/controllers")) {
        fs.mkdirSync(filepath + "/controllers");
    }

    // Crear la carpeta modelos si no existe
    if (!fs.existsSync(filepath + "/models")) {
        fs.mkdirSync(filepath + "/models");
    }

    // Crear la carpeta helpers si no existe
    if (!fs.existsSync(filepath + "/helpers")) {
        fs.mkdirSync(filepath + "/helpers");
    }
    // Crear la carpeta middleware si no existe
    if (!fs.existsSync(filepath + "/middleware")) {
        fs.mkdirSync(filepath + "/middleware");
    }
    // Crear la carpeta routes si no existe
    if (!fs.existsSync(filepath + "/routes")) {
        fs.mkdirSync(filepath + "/routes");
    }

    let text = "const express = require ('express')\n" +
        "const morgan = require('morgan')\n" +
        "const path = require('path')\n" +
        "const bodyParser = require('body-parser')\n" +
        "\n" +
        "const db = require('./db')\n" +
        "const app = express()\n" +
        "\n" +
        "//configuraciones \n" +
        "\n" +
        "app.set('port',3055)\n" +
        "app.set('appName','HtmlToPugTemplate')\n" +
        "\n" +
        "app.set('views', path.join(__dirname, 'views'))\n" +
        "\n" +
        "app.set('view engine', 'pug')\n" +
        "\n" +
        "// parse application/x-www-form-urlencoded\n" +
        "app.use(bodyParser.urlencoded({extended: false}))\n" +
        "// parse application/json\n" +
        "app.use(bodyParser.json())\n" +
        "\n" +
        "app.use(morgan('dev'))\n" +
        "\n" +
        "app.use('/public', express.static(path.join(__dirname, 'public')))\n" +
        "\n" +
        "//rutas\n" +
        "app.use(require('./viewEngine/routes'))\n" +
        "app.use('/api', require('./routes/_api'))\n" +
        "\n" +
        "//Inicializando el servidor\n" +
        "app.listen(app.get('port'), () => {\n" +
        "    console.log(app.get('appName'))\n" +
        "    console.log(\"Server port:\", app.get('port'))\n" +

        "\n" +
        "})\n"

    fs.writeFile(filepath + '/' + 'index.js', text, 'utf8', (err) => {
        if (err) throw err;
        console.log('Archivo index.js creado exitosamente!');
    });


    text = '{\n' +
        '  "name": "HtmlToPugTemplate",\n' +
        '  "version": "1.0.0",\n' +
        '   "description": "Template generated by HtmlToPug-Converter",\n' +
        '  "main": "index.js",\n' +
        '  "scripts": {\n' +
        '    "test": "echo \\"Error: no test specified\\" && exit 1",\n' +
        '    "dev": "nodemon index.js"\n' +
        '  },\n' +
        '  "author": "Jose Miguel Rosas Jimenez",\n' +
        '  "license": "ISC",\n' +
        '  "dependencies": {\n' +
        '    "body-parser": "^1.20.1",\n' +
        '    "express": "^4.18.2",\n' +
        '    "morgan": "^1.10.0",\n' +
        '    "mongoose": "^6.6.5",\n' +
        '    "pug": "^3.0.2"\n' +
        '  },\n' +
        '  "devDependencies": {\n' +
        '    "nodemon": "^2.0.20"\n' +
        '  }\n' +
        '}\n'

    fs.writeFile(filepath + '/' + 'package.json', text, 'utf8', (err) => {
        if (err) throw err;
        console.log('Archivo package.json creado exitosamente!');
    });


    text = "const mongoose = require('mongoose');\n" +
        "\n" +
        "\n" +
        "mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true}).then(() => {\n" +

        " console.log('connected to the database')\n" +

        "}).catch((e) => {\n" +
        "    console.error('error connecting', e)\n" +
        "\n" +
        "});\n"

    fs.writeFile(filepath + '/' + 'db.js', text, 'utf8', (err) => {
        if (err) throw err;
        console.log('Archivo db.js creado  exitosamente!');
    });

    text = "const express = require('express')\n" +
        "    const router = express.Router() \n" +
        "module.exports = router"


    fs.writeFile(filepath + '/routes/' + '_api.js', text, 'utf8', (err) => {
        if (err) throw err;
        console.log('Archivo  _api.js creado exitosamente!');
    });

    replaceIndex(filepath + '/viewEngine/routes.js')
}
function replaceIndex(filePath) {
    // Leer el archivo
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            return;
        }

        // Reemplazar la primera ocurrencia de "index" con "newword"
        var newData = data.replace(/index/i, "");

        // Escribir los cambios en el archivo
        fs.writeFile(filePath, newData, 'utf8', function(err) {
            if (err) {
                console.log(err);
            } else {

                let text = "router.get(\"/index\", (req, res) => {\n" +
                    "        res.render(\"index\");\n " +
                    "    });module.exports = router \n"

                fs.appendFileSync(filePath, text);


            }
        });
    });

}

function minifyHTML(dir) {
    // Leer todos los archivos en la carpeta y subcarpetas
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        // Si el archivo es una carpeta, llamar recursivamente a la función
        if (fs.lstatSync(fullPath).isDirectory()) {
            minifyHTML(fullPath);
        }
        // Si el archivo es un archivo HTML, minificarlo
        else if (path.extname(fullPath) === '.html') {
            // Leer el contenido del archivo HTML
            let html = fs.readFileSync(fullPath, 'utf8');

            // Configurar las opciones de minificación
            let options = {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            };

            // Minificar el contenido del archivo HTML
            let minifiedHTML = minify(html, options);

            // Sobrescribir el archivo original con el HTML minificado
            fs.writeFileSync(fullPath, minifiedHTML);
        }
    });
}

let init_npm = function () {
    console.log("-------install loading...----------")
    const install = spawn('npm', ['install']);
    install.stdout.on('data', data => console.log("i", data.toString()));
    install.stderr.on('data', data => console.error("i error:", data.toString()));
}

let start_npm  = function () {
    console.log("-------start...----------")
    const dev = spawn('npm', ['run', 'dev']);
    dev.stdout.on('data', data => console.log("run", data.toString()));
    dev.stderr.on('data', data => console.error("run error:", data.toString()));
}

module.exports = {
    convertirHTMLaPug,
    movePugFiles,
    deletePugFiles,
    replacePathsInPugFiles,
    removePugFromFileRoutes,
    CreateFoldersInPug_out,
    minifyHTML,
    start_npm
    ,init_npm,

};
