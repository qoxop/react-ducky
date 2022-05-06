const fs = require('fs');
const del = require('del');
const yazl = require('yazl');
const path = require('path');
const { spawnSync } = require('child_process');

const cwd = path.resolve(__dirname, '../websites/document');
const distPath = path.resolve(__dirname, '../websites/document/build');
const tempPath = path.resolve(__dirname, '../temp');
const zipFileName = path.resolve(tempPath, `react-ducky-doc.zip`)

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath)
}

function fileIterator(absoluteDir, relativeDir, callback) {
  const files = fs.readdirSync(absoluteDir, { withFileTypes: true }) || [];
  files.forEach((item) => {
    const absolute = path.join(absoluteDir, item.name);
    const relative = path.join(relativeDir, item.name);
    if (item.isFile()) {
      const buff = fs.readFileSync(path.join(absoluteDir, item.name));
      return callback({ absolute, relative }, buff);
    }
    if (item.isDirectory()) {
      fileIterator(absolute, relative, callback);
    }
  });
}
const doZip = () => new Promise((resolve, reject) => {
  const zipFile = new yazl.ZipFile();
  zipFile
    .outputStream
    .pipe(fs.createWriteStream(zipFileName))
    .on('close', () => {
      resolve()
      console.log('打包成功🍺～')
    })
    .on('error', () => {
      reject();
      console.log('打包失败💀～')
    });

  fileIterator(distPath, '', ({ relative }, buff) => {
    zipFile.addBuffer(buff, relative);
  });
  zipFile.end();
});


(async function () {
  // update api doc
  spawnSync('pnpm', ['api'], { cwd: process.cwd(), stdio: 'inherit' });
  // build document
  spawnSync('pnpm', ['run', 'build'], { cwd, stdio: 'inherit' });
  await doZip();
  // await doUpload();
  del(zipFileName);
})();





// 上传

