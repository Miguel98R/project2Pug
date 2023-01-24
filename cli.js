const {program} = require('commander')
const fs = require('fs-extra')
let {
    convertirHTMLaPug,
    movePugFiles,
    deletePugFiles,
    replacePathsInPugFiles,
    removePugFromFileRoutes,
    CreateFoldersInPug_out,
    indentHTML
} = require('htmlToPugConverter')


program.version('1.0.0')
program
    .command('htmlToPug')
    .description('html template converter to templates with pug as view engine \n')
    .option('-i, --inDirectory <inDirectory...>', 'location of the folder where the files to be converted are')
    .option('-o, --OutDirectory <OutDirectory...>', 'location of the folder where the converted files will be saved')
    .action(async function ({inDirectory, OutDirectory}) {

        let inPath = inDirectory[0]
        let OutPath = OutDirectory[0]

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

        indentHTML(in_directori)
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


program.parse()