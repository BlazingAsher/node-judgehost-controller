const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')
const md5 = require('md5')

const scripts = {};

let ScriptPacker = {}

const getDirectories = source =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

// ScriptPacker.packageScripts = function() {
//     let oldWorking = __dirname;
//     let packageList = getDirectories('./scripts/unpacked');
//     for(let pack of packageList){
//         process.chdir(path.join(oldWorking, '../scripts/unpacked', pack));
//
//         let zip = new AdmZip();
//
//         let files = fs.readdirSync('.')
//
//         for(let file of files){
//             zip.addLocalFile(file);
//         }
//
//         zip.writeZip(path.join(oldWorking, '../scripts/assembled', pack + ".zip"), ()=>{});
//
//     }
//
//     process.chdir(oldWorking);
// }

ScriptPacker.loadScripts = function(){
    let scriptBundles = fs.readdirSync('./scripts/assembled');

    for(let pack of scriptBundles){
        let zipBuffer = fs.readFileSync(path.join('./scripts/assembled', pack));
        scripts[pack.substring(0, pack.lastIndexOf("."))] = {
            "md5": md5(zipBuffer),
            "base64": zipBuffer.toString('base64')
        }
    }


}

ScriptPacker.fetchScript = function(name){
    return scripts[name];
}


module.exports = ScriptPacker;