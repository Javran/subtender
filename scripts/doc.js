/* eslint-disable no-console */
const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')
const docdown = require('docdown')
const recursiveReaddirSync = require('recursive-readdir-sync')

const allFiles = recursiveReaddirSync('src')
const jsFiles = allFiles.filter(x => /.+\.js$/.test(x))

const urlBase = 'https://github.com/Javran/subtender/tree/master'

const genDoc = srcFile => {
  const dstFile = srcFile.replace(/^src\//,'doc/').replace(/\.js$/,'.md')
  const url = `${urlBase}/${srcFile}`
  const content = docdown({url,path: srcFile})
  const dstDir = path.dirname(dstFile)
  fsExtra.ensureDirSync(dstDir)
  fs.writeFileSync(dstFile, content)
}

jsFiles.map(genDoc)
