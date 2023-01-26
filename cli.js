#! /usr/bin/env node
const {program} = require('commander')
const fs = require('fs-extra')
const path = require('path');
const {spawn} = require('child_process');

let {
    convertirHTMLaPug,
    movePugFiles,
    deletePugFiles,
    replacePathsInPugFiles,
    removePugFromFileRoutes,
    CreateFoldersInPug_out,
    minifyHTML,
    start_npm
    ,init_npm,

} = require('./project2pug')


program.version('1.0.6')
program
    .command('convert')
    .description('html template converter to templates with pug as view engine \n')
    .option('-i, --inDirectory <inDirectory...>', 'location of the folder where the files to be converted are')
    .option('-o, --OutDirectory <OutDirectory...>', 'location of the folder where the converted files will be saved')
    .action(async function ({inDirectory, OutDirectory}) {

        let inPath = inDirectory[0]
        let OutPath = OutDirectory[0]
        inPath = path.join(inPath)
        OutPath = path.join(OutPath)

        let exists = fs.existsSync(inPath);
        if (!exists) {
            console.log(' The input directory does not exist')
            return
        }
        let exists_o = fs.existsSync(OutPath);
        if (!exists_o) {
            console.log('The out directory does not exist')

            return
        }

        minifyHTML(inPath)
        convertirHTMLaPug(inPath, inPath, OutPath)
        console.log(" ** ** ** **  ** ** Converting files ** ** ** ** **")

        setTimeout(function () {

            movePugFiles(OutPath)
            console.log(" ** ** ** **  ** ** modifying the output directory** ** ** ** **")

            fs.appendFileSync(OutPath + "/viewEngine/routes.js", `module.exports = router \n`);

            if (fs.existsSync(inPath + "/viewEngine")) {
                fs.remove(inPath + "/viewEngine");
                deletePugFiles(inPath);
                replacePathsInPugFiles(OutPath)
                removePugFromFileRoutes(OutPath + "/viewEngine/routes.js")
                CreateFoldersInPug_out(OutPath)


                console.log("Files converted correctly")
            }


        }, 1400)
    })


program
    .command('gui')
    .description('Start the server to view the app in the browser and from there convert files')
    .action(() => {

        require('./index.js');

    });

program
    .command('start_dev')
    .description('install node modules and start server ')
    .action(() => {
        console.log("loading...")
        init_npm()
        setTimeout(function (){

            start_npm()

        },8500)


    });


program.parse()